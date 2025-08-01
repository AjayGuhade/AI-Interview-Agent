const express = require('express');
const router = express.Router();
const ProjectRecruitmentDrive = require('../databaseModels/ProjectRecruitmentDrive');
const multer = require('multer');
const path = require('path');

const upload = multer({
  dest: 'uploads/resumes/',
  limits: { fileSize: 5550 * 1024 * 1024 } // 5MB limit
});

// POST - Create a new drive with file uploads
router.post('/project-recruitment', upload.array('resumes'), async (req, res) => {
  try {
    // Process uploaded files
    const resumeFiles = req.files.map(file => ({
      name: file.originalname,
      path: file.path,
      size: file.size,
      type: file.mimetype
    }));

    // Create the drive with all data
    const newDrive = new ProjectRecruitmentDrive({
      CompanyID: req.body.CompanyID,
      ProjectName: req.body.ProjectName,
      TechnicalKeySkills: JSON.parse(req.body.TechnicalKeySkills || '[]'),
      FunctionalKeySkills: JSON.parse(req.body.FunctionalKeySkills || '[]'),
      EducationQualification: req.body.EducationQualification,
      YearsOfExp: Number(req.body.YearsOfExp),
      ProjectManagerID: Number(req.body.ProjectManagerID),
      DifficultyLevel: req.body.DifficultyLevel,
      EstimateStartDate: new Date(req.body.EstimateStartDate),
      EstimateEndDate: new Date(req.body.EstimateEndDate),
      Link: req.body.Link,
      Description: req.body.Description,
      Questions: JSON.parse(req.body.Questions || '[]'),
      ResumeFiles: resumeFiles, // This should now match the schema
      WarningExceedCount: Number(req.body.WarningExceedCount) || 5
    });

    await newDrive.save();
    res.status(201).json({ message: "Drive created successfully", drive: newDrive });
    
  } catch (error) {
    console.error("Error creating drive:", error);
    res.status(500).json({ 
      error: "Internal Server Error",
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// GET - Fetch all drives with new fields
router.get('/project-recruitment', async (req, res) => {
  try {
    const drives = await ProjectRecruitmentDrive.find()
      .select('ProjectName CompanyID DifficultyLevel Questions DriveLink ResumeFolder createdAt')
      .populate('CompanyID', 'companyName');
      
    res.status(200).json(drives);
  } catch (error) {
    console.error("Error fetching drives:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// GET - Fetch a single drive by ID with all details
router.get('/project-recruitment/:id', async (req, res) => {
  try {
    const drive = await ProjectRecruitmentDrive.findById(req.params.id)
      .populate('CompanyID', 'companyName companyEmail');

    if (!drive) {
      return res.status(404).json({ error: 'Drive not found' });
    }

    res.status(200).json(drive);
  } catch (error) {
    console.error("Error fetching drive:", error.message);
    res.status(500).json({ 
      error: "Internal Server Error", 
      message: error.message 
    });
  }
});

// PUT - Update a drive (including new fields)
router.put('/project-recruitment/:id', async (req, res) => {
  try {
    const updates = req.body;
    const drive = await ProjectRecruitmentDrive.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    if (!drive) {
      return res.status(404).json({ error: 'Drive not found' });
    }

    res.status(200).json({ 
      message: "Drive updated successfully", 
      drive 
    });
  } catch (error) {
    console.error("Error updating drive:", error.message);
    res.status(500).json({ 
      error: "Internal Server Error", 
      message: error.message 
    });
  }
});

// POST - Add resume files to a drive
router.post('/project-recruitment/:id/resumes', async (req, res) => {
  try {
    const { files } = req.body; // Array of file objects
    
    const drive = await ProjectRecruitmentDrive.findById(req.params.id);
    if (!drive) {
      return res.status(404).json({ error: 'Drive not found' });
    }

    // Add new files to the ResumeFiles array
    if (files && files.length > 0) {
      drive.ResumeFiles.push(...files);
      await drive.save();
    }

    res.status(200).json({ 
      message: "Resumes added successfully", 
      count: files.length,
      drive 
    });
  } catch (error) {
    console.error("Error adding resumes:", error.message);
    res.status(500).json({ 
      error: "Internal Server Error", 
      message: error.message 
    });
  }
});

module.exports = router;