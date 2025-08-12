const express = require('express');
const router = express.Router();
const Applicant = require('../databaseModels/Applicant');
const ProjectRecruitmentDrive = require('../databaseModels/ProjectRecruitmentDrive');
const QuestionAnswer = require('../databaseModels/QuestionAnswer');
const mongoose = require('mongoose');
const { Groq } = require('groq-sdk');

// Initialize Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

// Interview session management
const activeSessions = new Map();

// Personality profiles with default fallback
const getInterviewerPersonality = (difficulty) => {
  const personalities = {
    easy: {
      tone: "friendly and encouraging",
      style: "conversational",
      feedback: "constructive with positive reinforcement",
      greeting: "warm and welcoming"
    },
    medium: {
      tone: "professional but approachable",
      style: "balanced between technical and conversational",
      feedback: "detailed with specific suggestions",
      greeting: "professional yet friendly"
    },
    hard: {
      tone: "highly professional and technical",
      style: "focused on depth and precision",
      feedback: "critical with high standards",
      greeting: "formal and rigorous"
    }
  };
  return personalities[difficulty?.toLowerCase()] || personalities.medium;
};

// Test endpoint
router.get('/test', (req, res) => {
  res.json({ 
    status: 'Interview bot is operational',
    available_models: {
      current: "llama3-70b-8192",
      alternatives: ["mixtral-8x7b-32768"]
    }
  });
});

// POST: Start a new interview session
router.post('/start', async (req, res) => {
  try {
    const { applicantId, driveId } = req.body;

    // Validate IDs
    if (!mongoose.Types.ObjectId.isValid(applicantId) || 
        !mongoose.Types.ObjectId.isValid(driveId)) {
      return res.status(400).json({ 
        error: 'Invalid IDs provided',
        details: {
          applicantId: mongoose.Types.ObjectId.isValid(applicantId) ? 'valid' : 'invalid',
          driveId: mongoose.Types.ObjectId.isValid(driveId) ? 'valid' : 'invalid'
        }
      });
    }

    // Fetch applicant and drive data
    const [applicant, drive] = await Promise.all([
      Applicant.findById(applicantId),
      ProjectRecruitmentDrive.findById(driveId)
    ]);

    if (!applicant || !drive) {
      return res.status(404).json({ 
        error: 'Applicant or Drive not found',
        details: {
          applicantExists: !!applicant,
          driveExists: !!drive
        }
      });
    }

    // Initialize personality based on drive difficulty
    const personality = getInterviewerPersonality(drive.DifficultyLevel);

    // Generate introduction and first question in parallel
    const [introMessage, firstQuestion] = await Promise.all([
      generateHumanIntroduction(applicant, drive, personality),
      generateAIQuestion(applicant, drive, [], personality)
    ]);

    // Create session
    const sessionId = new mongoose.Types.ObjectId();
    activeSessions.set(sessionId.toString(), {
      applicantId,
      driveId,
      conversation: [
        { question: introMessage, answer: '' },
        { question: firstQuestion, answer: '' }
      ],
      currentQuestion: firstQuestion,
      skills: drive.TechnicalKeySkills.concat(drive.FunctionalKeySkills),
      difficulty: drive.DifficultyLevel,
      personality: personality,
      createdAt: new Date()
    });

    // Update applicant status
    await Applicant.findByIdAndUpdate(applicantId, { 
      InterviewStatus: 'Scheduled',
      MeetingStartDate: new Date()
    });

    res.status(200).json({ 
      sessionId: sessionId.toString(),
      messages: [
        { 
          type: 'intro', 
          content: introMessage,
          meta: {
            tone: personality.tone,
            difficulty: drive.DifficultyLevel
          }
        },
        { 
          type: 'question', 
          content: firstQuestion,
          meta: {
            skillCategory: drive.TechnicalKeySkills[0] || 'general'
          }
        }
      ],
      message: 'Interview session started successfully',
      nextStep: 'Submit your first answer to /respond endpoint'
    });

  } catch (error) {
    console.error('Error starting interview:', error);
    res.status(500).json({ 
      error: 'Failed to start interview', 
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// POST: Submit answer and get next question
router.post('/respond', async (req, res) => {
  try {
    const { sessionId, answer } = req.body;

    // Validate input
    if (!sessionId || !answer) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['sessionId', 'answer'],
        received: Object.keys(req.body)
      });
    }

    // Validate session
    if (!activeSessions.has(sessionId)) {
      return res.status(404).json({ 
        error: 'Session not found or expired',
        solutions: [
          'Check the sessionId is correct',
          'Sessions expire after 24 hours of inactivity',
          'Start a new session if needed'
        ]
      });
    }

    const session = activeSessions.get(sessionId);

    // Update current question with answer
    const currentQA = session.conversation[session.conversation.length - 1];
    currentQA.answer = answer;

    // Generate human-like response to the answer
    const humanResponse = await generateHumanResponse(
      currentQA.question, 
      answer, 
      session.skills,
      session.personality
    );

    // Store in database
    const qaRecord = new QuestionAnswer({
      InterviewID: new mongoose.Types.ObjectId(sessionId),
      ApplicantID: new mongoose.Types.ObjectId(session.applicantId),
      Question: currentQA.question,
      Answer: answer,
      FeedbackOnAnswer: humanResponse.feedback,
      Score: humanResponse.score,
      Timestamp: new Date()
    });
    
    await qaRecord.save().then(() => {
      console.log("✅ QA saved successfully");
    }).catch(err => {
      console.error("❌ Failed to save QA record:", err);
    });
    
    // Check if interview should continue (max 10 questions)
    if (session.conversation.length >= 5) {
      activeSessions.delete(sessionId);
      await Applicant.findByIdAndUpdate(session.applicantId, { 
        InterviewStatus: 'Completed',
        MeetingEndDate: new Date()
      });
      
      const closingMessage = await generateClosingMessage(session);
      
      return res.status(200).json({ 
        messages: [
          { 
            type: 'feedback', 
            content: humanResponse.feedback,
            score: humanResponse.score
          },
          { 
            type: 'closing', 
            content: closingMessage,
            meta: {
              nextSteps: 'The team will review your responses',
              followUpTimeframe: 'within 3-5 business days'
            }
          }
        ],
        completed: true,
        summary: {
          questionsAsked: session.conversation.length,
          averageScore: calculateAverageScore(session)
        }
      });
    }

    // Generate next question with natural transition
    const nextQuestion = await generateFollowUpQuestion(
      await Applicant.findById(session.applicantId),
      await ProjectRecruitmentDrive.findById(session.driveId),
      session.conversation,
      session.personality
    );

    // Update session
    session.currentQuestion = nextQuestion;
    session.conversation.push({
      question: nextQuestion,
      answer: ''
    });

    res.status(200).json({ 
      messages: [
        { 
          type: 'feedback', 
          content: humanResponse.feedback,
          score: humanResponse.score
        },
        { 
          type: 'question', 
          content: nextQuestion,
          meta: {
            hint: getQuestionHint(nextQuestion)
          }
        }
      ],
      completed: false,
      progress: {
        current: session.conversation.length,
        total: 10
      }
    });

  } catch (error) {
    console.error('Error processing response:', error);
    res.status(500).json({ 
      error: 'Failed to process response', 
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      troubleshooting: 'Ensure your answer is under 5000 characters'
    });
  }
});

// Helper function to calculate average score
function calculateAverageScore(session) {
  const scores = session.conversation
    .filter(qa => qa.answer)
    .map(qa => qa.score || 0); // Default to 0 if no score
  return scores.length > 0 
    ? (scores.reduce((a, b) => a + b, 0) / scores.length) 
    : 0;
}

// Helper function to extract question hint
function getQuestionHint(question) {
  const techKeywords = ['React', 'Node', 'AWS', 'SQL', 'Python'];
  const foundKeyword = techKeywords.find(keyword => 
    question.includes(keyword)
  );
  return foundKeyword 
    ? `Focus on your experience with ${foundKeyword}` 
    : 'Relate to your practical experience';
}

// Generate human-like introduction
async function generateHumanIntroduction(applicant, drive, personality) {
  const prompt = `
    You are an interviewer starting a ${drive.DifficultyLevel} level technical interview.
    Your tone should be ${personality.tone} and ${personality.greeting}.
    Candidate: ${applicant.FirstName || 'Candidate'}, ${applicant.YearsOfExp} years in ${applicant.Education}.
    Position requires: ${drive.TechnicalKeySkills.join(', ')}.
    
    Craft a 2-3 sentence introduction that:
    1. Greets naturally using the candidate's name
    2. Mentions the position and company
    3. Sets a ${personality.tone} tone
    4. Transitions smoothly to first question
    
    Example: "Hi [Name], I'm [YourName]. We're discussing the [Position] role at [Company] today. Let's start by hearing about your experience with [Skill]."
    
    Important: Return only the greeting text, no JSON or code formatting.
  `;

  const response = await groq.chat.completions.create({
    messages: [{ role: "system", content: prompt }],
    model: "llama3-70b-8192",
    temperature: 0.7,
    max_tokens: 120
  });

  return response.choices[0].message.content.trim();
}

// Generate human-like question
async function generateAIQuestion(applicant, drive, conversation = [], personality) {
  const prompt = `
    You are conducting a ${drive.DifficultyLevel} level technical interview.
    Your tone should be ${personality.tone} and style ${personality.style}.
    Candidate: ${applicant.FirstName || 'Candidate'}, ${applicant.YearsOfExp} years in ${applicant.Education}.
    Required skills: ${drive.TechnicalKeySkills.join(', ')}.
    
    ${conversation.length > 0 ? 'Recent discussion:\n' + 
      conversation.slice(-3).map(qa => `Interviewer: ${qa.question}\nCandidate: ${qa.answer}`).join('\n\n') : ''}
    
    Generate one technical question that:
    1. Assesses knowledge in required areas
    2. Fits candidate's experience level
    3. Sounds natural and human-like
    4. Follows a ${personality.tone} tone
    5. ${conversation.length > 0 ? 'Builds on previous discussion' : 'Introduces a key topic'}
    
    Examples:
    - "How would you approach [specific scenario] given your experience with [technology]?"
    - "Based on your answer about [previous topic], how would you handle [related challenge]?"
    - "Let's discuss [skill]. Could you walk me through [specific aspect]?"
    
    Important: Return only the question text, no JSON or additional formatting.
  `;

  const response = await groq.chat.completions.create({
    messages: [{ role: "system", content: prompt }],
    model: "llama3-70b-8192",
    temperature: 0.7,
    max_tokens: 150
  });

  return response.choices[0].message.content.trim();
}

// Generate human-like response to answers
async function generateHumanResponse(question, answer, requiredSkills, personality) {
  // Detect non-answers or "don't know" responses
  const isNonAnswer = answer.toLowerCase().includes("sorry") && 
                     (answer.toLowerCase().includes("don't know") || 
                      answer.toLowerCase().includes("don't recall") ||
                      answer.toLowerCase().includes("not sure") ||
                      answer.toLowerCase().includes("no idea"));

  const prompt = isNonAnswer ? `
    The candidate couldn't answer the question: "${question}"
    Required skills: ${requiredSkills.join(', ')}
    
    Provide interview feedback that:
    1. Acknowledges their honesty professionally
    2. Briefly explains why this knowledge is important for the role
    3. Offers to move on to another question
    4. Maintains a ${personality.tone} tone
    
    Example: "I appreciate your honesty. This concept is important because [brief reason]. Let's try another question about [related topic]."
    
    Return in this exact JSON format:
    {
      "feedback": "Your feedback message",
      "score": 0
    }
  ` : `
    You are conducting a technical interview in a ${personality.tone} manner.
    The candidate was asked: "${question}"
    They responded: "${answer}"
    Required skills: ${requiredSkills.join(', ')}
    
    Craft a human-like response that:
    1. Acknowledges their answer naturally (1 sentence)
    2. Provides ${personality.feedback} feedback (1-2 sentences)
    3. Assigns a score (1-10) based on:
       - Technical accuracy (40%)
       - Depth of explanation (30%) 
       - Relevance to position (20%)
       - Communication clarity (10%)
    4. Maintains a ${personality.tone} tone
    
    Return in this exact JSON format:
    {
      "feedback": "Your combined feedback and acknowledgment",
      "score": 7
    }
    Only valid JSON, no other text.
  `;

  const response = await groq.chat.completions.create({
    messages: [{ role: "system", content: prompt }],
    model: "llama3-70b-8192",
    temperature: 0.6,
    response_format: { type: "json_object" }
  });

  try {
    const result = JSON.parse(response.choices[0].message.content);
    return {
      feedback: result.feedback || "Thank you for that response. Let's continue.",
      score: isNonAnswer ? 0 : Math.min(10, Math.max(1, result.score || 5))
    };
  } catch (error) {
    console.error('Error parsing response:', error);
    return {
      feedback: isNonAnswer ? 
        "I appreciate your honesty. Let's try another question." : 
        "Interesting perspective. Let's explore this further.",
      score: isNonAnswer ? 0 : 5
    };
  }
}

// Generate follow-up question with natural flow
async function generateFollowUpQuestion(applicant, drive, conversation, personality) {
  const prompt = `
    Continuing a ${drive.DifficultyLevel} level technical interview.
    Current tone: ${personality.tone}, style: ${personality.style}.
    Candidate: ${applicant.FirstName || 'Candidate'}, ${applicant.YearsOfExp} years in ${applicant.Education}.
    Recent exchange:
    ${conversation.slice(-2).map(qa => `Interviewer: ${qa.question}\nCandidate: ${qa.answer}`).join('\n\n')}
    
    Generate a follow-up question that:
    1. Builds naturally on the discussion
    2. References the candidate's last answer
    3. Progresses the technical assessment
    4. Sounds completely human and conversational
    5. Maintains ${personality.tone} tone
    
    Examples:
    - "You mentioned [specific point], how would that change if [new constraint]?"
    - "That's an interesting approach. What alternatives did you consider?"
    - "Let's dive deeper into [aspect]. How would you handle [specific challenge]?"
    
    Important: Return only the question text, no additional formatting.
  `;

  const response = await groq.chat.completions.create({
    messages: [{ role: "system", content: prompt }],
    model: "llama3-70b-8192",
    temperature: 0.7,
    max_tokens: 150
  });

  return response.choices[0].message.content.trim();
}

// Generate closing message
async function generateClosingMessage(session) {
  const prompt = `
    You are concluding a ${session.difficulty} level technical interview.
    Tone: ${session.personality.tone}, style: ${session.personality.style}.
    Topics covered: ${session.skills.slice(0, 3).join(', ')}.
    Candidate: ${session.applicantId}.
    
    Craft a natural closing message that:
    1. Thanks the candidate
    2. Mentions 1-2 specific discussion points
    3. Outlines next steps
    4. Maintains ${session.personality.tone} tone
    5. Is 2-3 sentences maximum
    
    Example: "Thank you for discussing [specific topic] today. Your approach to [specific point] was particularly interesting. We'll review all responses and contact you within [timeframe]."
    
    Important: Return only the closing text, no additional formatting.
  `;

  const response = await groq.chat.completions.create({
    messages: [{ role: "system", content: prompt }],
    model: "llama3-70b-8192",
    temperature: 0.6,
    max_tokens: 120
  });

  return response.choices[0].message.content.trim();
}

module.exports = router;