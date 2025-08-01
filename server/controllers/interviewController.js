const fs = require("fs");
const pdfParse = require("pdf-parse");
const { v4: uuidv4 } = require("uuid");
const groqService = require("../services/groqService");

const sessions = {};

exports.uploadResume = async (req, res) => {
  const file = req.file;
  if (!file) return res.status(400).json({ error: "No file uploaded" });

  try {
    const buffer = fs.readFileSync(file.path);
    const data = await pdfParse(buffer);
    const sessionId = uuidv4();

    sessions[sessionId] = {
      resumeText: data.text,
      conversation: [],
    };

    const prompt = `You are an AI HR assistant. Analyze this resume and generate the first interview question.

Resume:
${data.text}`;

    const firstQuestion = await groqService.getChatResponse(prompt);
    sessions[sessionId].conversation.push({ question: firstQuestion, answer: "" });

    res.json({ message: "✅ Resume analyzed", sessionId, firstQuestion });
  } catch (err) {
    console.error("❌ Resume error:", err.message);
    res.status(500).json({ error: "Failed to process resume" });
  }
};

exports.chatWithAI = async (req, res) => {
  const { sessionId, answer } = req.body;
  const session = sessions[sessionId];
  if (!session) return res.status(400).json({ error: "Invalid session" });

  if (answer && session.conversation.length > 0) {
    session.conversation[session.conversation.length - 1].answer = answer;
  }

  const prompt = `You're conducting a technical interview. Analyze this conversation and resume, then generate exactly ONE natural next question.

Resume:
${session.resumeText}

Conversation so far:
${session.conversation.map((c) => `Interviewer: ${c.question}\nCandidate: ${c.answer || "(No answer yet)"}`).join("\n\n")}

Rules:
1. If candidate didn't answer fully, ask a follow-up
2. If answer was good, ask a new relevant question
3. 1-sentence questions only
4. Sound human
5. Focus on resume skills

Next question:`;

  try {
    const nextQuestion = await groqService.getChatResponse(prompt);

    if (nextQuestion) {
      session.conversation.push({ question: nextQuestion, answer: "" });
    }

    res.json({ nextQuestion, conversationLength: session.conversation.length });
  } catch (err) {
    console.error("❌ Chat error:", err.message);
    res.status(500).json({ error: "Chat failed" });
  }
};
