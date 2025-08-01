const express = require("express");
const multer = require("multer");
const { uploadResume, chatWithAI } = require("../controllers/interviewController");

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/upload-resume", upload.single("resume"), uploadResume);
router.post("/chat", chatWithAI);

module.exports = router;
