const express = require("express");
const multer = require("multer");
const fs = require("fs");
const pdfParse = require("pdf-parse");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const { Groq } = require("groq-sdk");

const ProjectRecruitmentDrive = require("../databaseModels/ProjectRecruitmentDrive");
const Applicant = require("../databaseModels/Applicant");

const router = express.Router();
const uploadPath = "uploads";

// Initialize Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// AI-powered resume parser
async function parseResumeWithAI(resumeText) {
  try {
    const prompt = `
      Extract all information from this resume and return in strict JSON format:
      {
        "personalInfo": {
          "firstName": "First name",
          "lastName": "Last name",
          "email": "Valid email (clean without numbers)",
          "phone": "10 digit Indian mobile number",
          "location": "Current location"
        },
        "education": [{
          "degree": "Degree name",
          "institution": "Institution name",
          "year": "Completion year",
          "score": "CGPA/Percentage"
        }],
        "experience": [{
          "position": "Job title",
          "company": "Company name",
          "duration": "Employment period",
          "responsibilities": ["List", "of", "bullet points"]
        }],
        "skills": {
          "technical": ["List", "of", "technical", "skills"],
          "soft": ["List", "of", "soft", "skills"]
        },
        "projects": [{
          "name": "Project name",
          "description": "Brief description",
          "technologies": ["Tech", "stack", "used"]
        }]
      }

      Rules:
      1. Clean email format (remove any numbers before/after)
      2. Indian phone numbers only (10 digits)
      3. Properly split first/last names
      4. Return only valid JSON

      Resume Text:
      ${resumeText.substring(0, 15000)} // Limit to avoid token overflow
    `;

    const response = await groq.chat.completions.create({
      messages: [{
        role: "system",
        content: "You are an expert resume parser. Extract accurate, structured data in JSON format only."
      }, {
        role: "user",
        content: prompt
      }],
      model: "llama3-70b-8192", // or another supported model
      temperature: 0.1, // More deterministic output
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content);
    
    // Validate required fields
    if (!result.personalInfo?.email || !result.personalInfo?.phone) {
      throw new Error("AI failed to extract required fields");
    }

    return result;

  } catch (error) {
    console.error("AI Parsing Error:", error.message);
    throw error;
  }
}

// Main upload endpoint
router.post("/upload", upload.array("resumes"), async (req, res) => {
  if (!req.files?.length) {
    return res.status(400).json({ 
      success: false,
      message: "No files uploaded" 
    });
  }

  try {
    // Parse request body
    const {
      CompanyID,
      ProjectName,
      EducationQualification,
      YearsOfExp,
      ProjectManagerID,
      DifficultyLevel,
      EstimateStartDate,
      EstimateEndDate,
      Link,
      Description,
      DriveLink
    } = req.body;

    // Parse array fields safely
    const parseArray = (str) => {
      try {
        return str ? JSON.parse(str) : [];
      } catch {
        return [];
      }
    };

    const TechnicalKeySkills = parseArray(req.body.TechnicalKeySkills);
    const FunctionalKeySkills = parseArray(req.body.FunctionalKeySkills);
    const Questions = parseArray(req.body.Questions);

    // Create project drive record
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
      ResumeFiles: req.files.map(file => ({
        name: file.originalname,
        path: file.path,
        size: file.size,
        type: file.mimetype
      }))
    });

    const savedDrive = await newDrive.save();

    // Process each resume with AI
    const processingResults = [];
    for (const file of req.files) {
      try {
        const buffer = fs.readFileSync(file.path);
        const { text } = await pdfParse(buffer);
        const parsedData = await parseResumeWithAI(text);

        // Create applicant record
        const applicant = new Applicant({
          ProjectRecruitmentDriveID: savedDrive._id,
          Resume: file.filename,
          FirstName: parsedData.personalInfo.firstName,
          LastName: parsedData.personalInfo.lastName,
          Email: parsedData.personalInfo.email,
          MobileNumber: parsedData.personalInfo.phone,
          Education: parsedData.education?.[0]?.degree || "",
          YearsOfExp: parsedData.experience?.length || 0,
          TechnicalSkills: parsedData.skills?.technical || [],
          PreviousPositions: parsedData.experience?.map(exp => exp.position) || [],
          Referance: "CompanyURL",
          IsApplicable: true,
          InterviewStatus: "Pending",
          MeetingLink: `https://meet.sculptortech.ai/${uuidv4()}`,
          MeetingStartDate: EstimateStartDate,
          MeetingEndDate: EstimateEndDate
        });

        await applicant.save();
        processingResults.push({
          file: file.originalname,
          status: "processed",
          applicantId: applicant._id
        });

      } catch (fileError) {
        console.error(`Error processing ${file.originalname}:`, fileError.message);
        processingResults.push({
          file: file.originalname,
          status: "failed",
          error: fileError.message
        });
      }
    }

    // Final response
    res.status(201).json({
      success: true,
      message: "Resumes processed successfully",
      driveId: savedDrive._id,
      processedCount: processingResults.filter(r => r.status === "processed").length,
      failedCount: processingResults.filter(r => r.status === "failed").length,
      details: processingResults
    });

  } catch (error) {
    console.error("Upload Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
});

module.exports = router;