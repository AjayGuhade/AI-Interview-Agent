const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const pdfParse = require("pdf-parse");
const Applicant = require("../models/Applicant");

const router = express.Router();

// Multer setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  }
});
const upload = multer({ storage });

// 📥 POST /upload-resumes
router.post("/upload-resumes", upload.array("resumes"), async (req, res) => {
  try {
    const files = req.files;
    const { ProjectRecruitmentDriveID } = req.body;

    if (!ProjectRecruitmentDriveID) {
      return res.status(400).json({ error: "ProjectRecruitmentDriveID is required" });
    }

    const results = [];

    for (const file of files) {
      const ext = path.extname(file.originalname).toLowerCase();

      if (ext !== ".pdf") {
        results.push({ file: file.originalname, status: "unsupported format" });
        continue;
      }

      const fileBuffer = fs.readFileSync(file.path);
      const pdfData = await pdfParse(fileBuffer);
      const text = pdfData.text;

      // Basic extraction (enhance later)
      const extractEmail = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,}/)?.[0] || "";
      const extractMobile = text.match(/(?:\+91[-\s]?)?[789]\d{9}/)?.[0] || "";
      const extractDOB = text.match(/\b\d{2}[/-]\d{2}[/-]\d{4}\b/)?.[0] || "";
      const extractName = text.match(/(?<=Name[:\s])([A-Z][a-z]+(?:\s[A-Z][a-z]+)+)/)?.[0] || "";

      const [firstName = "", lastName = ""] = extractName.split(" ");

      const newApplicant = new Applicant({
        ProjectRecruitmentDriveID,
        MobileNumber: extractMobile,
        Email: extractEmail,
        FirstName: firstName,
        MiddleName: "",
        LastName: lastName,
        DOB: extractDOB ? new Date(extractDOB) : undefined,
        Education: "",
        YearsOfExp: 0,
        Resume: file.filename,
        Referance: "Other",
        IsApplicable: true
      });

      await newApplicant.save();
      results.push({ file: file.originalname, status: "saved", email: extractEmail });
    }

    return res.json({ message: "Upload complete", results });

  } catch (err) {
    console.error("Resume upload error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
