





require("dotenv").config();
const express = require("express");
const multer = require("multer");
const cors = require("cors");
const fs = require("fs");
const pdfParse = require("pdf-parse");
const axios = require("axios");
const { v4: uuidv4 } = require("uuid");
const connectDB = require("./db");
connectDB(); // 🧠 Connect MongoDB first
const app = express();
app.use(express.json());

const sessions = {}; // 🧠 Store per-session resume + conversation

// 🔍 Log incoming requests
app.use((req, res, next) => {
  console.log("🔍 Incoming request from:", req.headers.origin);
  next();
});












// ✅ Enable CORS for frontend
app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"],
  credentials: true,
}));

// ✅ Health Check
app.get("/api/ping", (req, res) => {
  res.send("✅ Backend is alive");
});





const User = require("./databaseModels/User.js");

app.post("/api/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // 🔐 Check for duplicate email
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: "Email already exists" });

    const newUser = new User({ name, email, password, role });
    await newUser.save();

    res.status(201).json({ message: "✅ User registered", user: newUser });
  } catch (err) {
    console.error("❌ Registration error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});







// ✅ Upload Setup
const upload = multer({ dest: "uploads/" });

// ✅ Resume Upload + Session Init
app.post("/api/upload-resume", upload.single("resume"), async (req, res) => {
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

    // ✅ Generate first question
    const prompt = `You are an AI HR assistant. Analyze this resume and generate the first interview question.

Resume:
${data.text}`;

    const groqRes = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama3-70b-8192",
        messages: [{ role: "user", content: prompt }],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const firstQuestion = groqRes.data.choices?.[0]?.message?.content?.trim();
    sessions[sessionId].conversation.push({ question: firstQuestion, answer: "" });

    res.json({
      message: "✅ Resume analyzed, session started",
      sessionId,
      firstQuestion,
    });
  } catch (err) {
    console.error("❌ Resume processing failed:", err.message);
    res.status(500).json({ error: "Failed to process resume" });
  }
});

// ✅ Answer Submission + Feedback + Next Question
app.post("/api/chat", async (req, res) => {
  const { sessionId, answer, interviewDuration, currentTimeElapsed } = req.body;
  const session = sessions[sessionId];
  if (!session) return res.status(400).json({ error: "Invalid session" });

  // Store the answer if provided
  if (answer && session.conversation.length > 0) {
    session.conversation[session.conversation.length - 1].answer = answer;
  }

  // Generate next question based on entire conversation
  const prompt = `You're conducting a technical interview. Analyze this conversation and resume, then generate exactly ONE natural next question.

Resume:
${session.resumeText}

Conversation so far:
${session.conversation.map((c, i) => `Interviewer: ${c.question}\nCandidate: ${c.answer || "(No answer yet)"}`).join("\n\n")}

Rules:
1. If candidate didn't answer fully, ask a follow-up that probes deeper
2. If answer was good, move to a new relevant topic
3. Keep questions concise (1 sentence max)
4. Sound natural like a human conversation
5. Focus on technical skills from resume

Next question:`;

  try {
    const groqRes = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama3-70b-8192",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 100
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const nextQuestion = groqRes.data.choices?.[0]?.message?.content?.trim();
    
    if (nextQuestion) {
      session.conversation.push({ 
        question: nextQuestion, 
        answer: "" 
      });
    }

    res.json({
      nextQuestion: nextQuestion || "Let's move on to another topic...",
      conversationLength: session.conversation.length,
    });

  } catch (err) {
    console.error("❌ Interview question generation failed:", err.message);
    res.status(500).json({ error: "Failed to generate next question" });
  }
}); 

// ✅ Start Server
const PORT = 5050;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});

