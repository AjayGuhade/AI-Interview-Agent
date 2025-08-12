// routes/generate-report.js
const express = require("express");
const router = express.Router();
const QuestionAnswer = require("../databaseModels/QuestionAnswer"); // Adjust path as needed
const Groq = require("groq-sdk");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Helper to safely extract JSON from Groq response
function extractJSON(text) {
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON found in response");
    return JSON.parse(jsonMatch[0]);
  } catch (err) {
    console.error("JSON parse error:", err.message);
    return null;
  }
}

// Function to create prompt for a chunk of Q&A data
function createPrompt(applicantId, qaData) {
  return `
You are an AI interviewer evaluator.
Analyze the following interview Q&A data and generate a JSON report in exactly this format (and nothing else):

{
  "summary": "string",
  "strengths": ["string", "string"],
  "improvementAreas": ["string", "string"],
  "scoreAnalysis": {
    "averageScore": number,
    "maxScore": number,
    "totalQuestions": number
  },
  "recommendation": "string",
  "fitForRole": true or false
}

The "fitForRole" field should be true if the candidate's average score is above 3.5 and they demonstrate strong core skills. Otherwise, false.

Q&A Data:
${JSON.stringify(qaData)}
`;
}

router.get("/generate-report/:applicantId", async (req, res) => {
  try {
    const { applicantId } = req.params;

    // Fetch all Q&A for applicant
    const answers = await QuestionAnswer.find({ ApplicantID: applicantId }).lean();
    if (!answers.length) {
      return res.status(404).json({ error: "No answers found for this applicant" });
    }

    // Prepare compact Q&A to reduce token usage
    const qaData = answers.map(a => ({
      question: a.Question?.slice(0, 120) || "",
      answer: a.Answer?.slice(0, 120) || "",
      score: a.Score,
      feedback: a.FeedbackOnAnswer?.slice(0, 200) || ""
    }));

    // Break into chunks to avoid token limits
    const chunkSize = 5; // max Q&As per request to Groq
    const chunks = [];
    for (let i = 0; i < qaData.length; i += chunkSize) {
      chunks.push(qaData.slice(i, i + chunkSize));
    }

    const partialReports = [];

    // Process each chunk separately
    for (const chunk of chunks) {
      const prompt = createPrompt(applicantId, chunk);

      const groqResponse = await groq.chat.completions.create({
        model: "llama3-8b-8192",
        messages: [{ role: "user", content: prompt }],
        temperature: 0
      });

      const content = groqResponse.choices[0]?.message?.content || "";
      const parsedJSON = extractJSON(content);

      if (parsedJSON) {
        partialReports.push(parsedJSON);
      }
    }

    // Merge partial reports
    const totalQuestions = partialReports.reduce(
      (sum, r) => sum + (r.scoreAnalysis?.totalQuestions || 0),
      0
    );

    const totalScore = partialReports.reduce(
      (sum, r) =>
        sum +
        ((r.scoreAnalysis?.averageScore || 0) *
          (r.scoreAnalysis?.totalQuestions || 0)),
      0
    );

    const maxScore = partialReports.reduce(
      (max, r) => Math.max(max, r.scoreAnalysis?.maxScore || 0),
      0
    );

    const averageScore =
      totalQuestions > 0
        ? parseFloat((totalScore / totalQuestions).toFixed(2))
        : 0;

    // ✅ Final fitForRole decision
    const fitForRole =
      averageScore > 3.5 &&
      partialReports.some(r => (r.strengths || []).length > 0);

    const mergedReport = {
      summary: partialReports.map(r => r.summary).join(" "),
      strengths: [...new Set(partialReports.flatMap(r => r.strengths || []))],
      improvementAreas: [
        ...new Set(partialReports.flatMap(r => r.improvementAreas || []))
      ],
      scoreAnalysis: {
        averageScore,
        maxScore,
        totalQuestions
      },
      recommendation: partialReports.map(r => r.recommendation).join(" "),
      fitForRole
    };

    res.json({
      applicantId,
      report: mergedReport
    });
  } catch (error) {
    console.error("Error generating report:", error);
    res.status(500).json({ error: "Failed to generate report" });
  }
});

module.exports = router;
