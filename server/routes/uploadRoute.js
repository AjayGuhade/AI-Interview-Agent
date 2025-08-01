const express = require("express");
const multer = require("multer");
const fs = require("fs");
const pdfParse = require("pdf-parse");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

const ProjectRecruitmentDrive = require("../databaseModels/ProjectRecruitmentDrive");
const Applicant = require("../databaseModels/Applicant");

const router = express.Router();
const uploadPath = "uploads";

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadPath),
  filename: (req, file, cb) => cb(null, Date.now() + "_" + file.originalname),
});
const upload = multer({ storage });

// Helper: extract email and mobile from text
function extractEmail(text) {
  const match = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  return match ? match[0] : "";
}

function extractMobile(text) {
  const match = text.match(/(?:\+91)?[\s-]?[6-9]\d{9}/);
  return match ? match[0].replace(/\D/g, "") : "";
}

// Main route
router.post("/upload", upload.array("resumes"), async (req, res) => {
  try {
    const {
      CompanyID, ProjectName,
      EducationQualification, YearsOfExp,
      ProjectManagerID, DifficultyLevel,
      EstimateStartDate, EstimateEndDate,
      Link, Description, DriveLink
    } = req.body;

    // Parse array fields
    let TechnicalKeySkills = [];
    let FunctionalKeySkills = [];
    let Questions = [];
    try {
      if (req.body.TechnicalKeySkills) TechnicalKeySkills = JSON.parse(req.body.TechnicalKeySkills);
      if (req.body.FunctionalKeySkills) FunctionalKeySkills = JSON.parse(req.body.FunctionalKeySkills);
      if (req.body.Questions) Questions = JSON.parse(req.body.Questions);
    } catch (e) {
      console.warn("Invalid JSON for skills or questions");
    }

    // Save drive
    const resumeData = req.files.map(file => ({
      name: file.originalname,
      path: file.path,
      size: file.size,
      type: file.mimetype,
    }));

    const newDrive = new ProjectRecruitmentDrive({
      CompanyID,
      ProjectName,
      TechnicalKeySkills,
      FunctionalKeySkills,
      EducationQualification,
      YearsOfExp,
      ProjectManagerID,
      DifficultyLevel,
      EstimateStartDate,
      EstimateEndDate,
      Link,
      Description,
      Questions,
      DriveLink,
      ResumeFolder: uploadPath,
      ResumeFiles: resumeData,
    });

    const savedDrive = await newDrive.save();

    // Process resumes
    for (let file of req.files) {
      const buffer = fs.readFileSync(file.path);
      const parsed = await pdfParse(buffer);
      const text = parsed.text;

      const firstName = text.split(" ")[0] || "";
      const lastName = text.split(" ")[1] || "";
      const email = extractEmail(text);
      const mobile = extractMobile(text);

      const applicant = new Applicant({
        ProjectRecruitmentDriveID: savedDrive._id,
        Resume: file.filename,
        FirstName: firstName,
        MiddleName: "",
        LastName: lastName,
        DOB: null,
        Education: "",
        YearsOfExp: 0,
        MobileNumber: mobile,
        Email: email,
        Referance: "CompanyURL",
        IsApplicable: true,

        InterviewStatus: "Pending",
        MeetingLink: `https://meet.sculptortech.ai/${uuidv4()}`,
        MeetingStartDate: EstimateStartDate,
        MeetingEndDate: EstimateEndDate
      });

      await applicant.save();
    }

    res.status(201).json({
      message: "Drive and applicants uploaded successfully.",
      drive: savedDrive
    });
  } catch (err) {
    console.error("Upload Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
