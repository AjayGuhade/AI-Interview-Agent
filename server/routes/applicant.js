const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const Applicant = require("../databaseModels/Applicant");

// Create uploads/resumes directory if it doesn't exist
const fs = require("fs");
const uploadsDir = "uploads/resumes";
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer setup for storing resume files
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: function (req, file, cb) {
    const allowedTypes = /pdf|doc|docx/;
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.test(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Only .pdf, .doc, .docx files are allowed"));
    }
  },
});

// POST /api/applicants/uploadResume
router.post("/uploadResume", upload.single("resume"), async (req, res) => {
  try {
    const {
      ProjectRecruitmentDriveID,
      MobileNumber,
      Email,
      FirstName,
      MiddleName,
      LastName,
      DOB,
      Education,
      YearsOfExp,
      Referance,
      IsApplicable
    } = req.body;

    const newApplicant = new Applicant({
      ProjectRecruitmentDriveID,
      MobileNumber,
      Email,
      FirstName,
      MiddleName,
      LastName,
      DOB: new Date(DOB),
      Education,
      YearsOfExp,
      Resume: req.file?.filename || "",
      Referance,
      IsApplicable: IsApplicable === 'true'
    });

    const saved = await newApplicant.save();
    res.status(201).json({
      message: "✅ Applicant created successfully",
      applicant: saved,
    });
  } catch (error) {
    console.error("❌ Error creating applicant:", error);
    res.status(500).json({
      message: "Failed to create applicant",
      error: error.message,
    });
  }
});
// GET /api/applicants/byRecruitmentDrive/:projectRecruitmentDriveId
router.get("/byRecruitmentDrive/:projectRecruitmentDriveId", async (req, res) => {
  try {
    const { projectRecruitmentDriveId } = req.params;
    
    const applicants = await Applicant.find({ 
      ProjectRecruitmentDriveID: projectRecruitmentDriveId 
    });
    
    if (!applicants || applicants.length === 0) {
      return res.status(404).json({
        message: "No applicants found for this recruitment drive",
      });
    }
    
    res.status(200).json({
      message: "✅ Applicants retrieved successfully",
      applicants,
    });
  } catch (error) {
    console.error("❌ Error retrieving applicants:", error);
    res.status(500).json({
      message: "Failed to retrieve applicants",
      error: error.message,
    });
  }
});

// GET /api/applicants/:id - Get single applicant by ID
router.get("/:id", async (req, res) => {
  try {
    const applicant = await Applicant.findById(req.params.id);
    
    if (!applicant) {
      return res.status(404).json({
        message: "Applicant not found",
      });
    }
    
    res.status(200).json({
      message: "✅ Applicant retrieved successfully",
      applicant,
    });
  } catch (error) {
    console.error("❌ Error retrieving applicant:", error);
    res.status(500).json({
      message: "Failed to retrieve applicant",
      error: error.message,
    });
  }
});
module.exports = router;
