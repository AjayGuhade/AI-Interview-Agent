require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./db");
const bodyParser = require('body-parser');
const multer = require('multer');
const interviewRoutes = require("./routes/interviewRoutes");
const companyRoutes = require('./routes/companyRoutes');
const roleRoutes = require("./routes/roleRoutes");
const userRoutes = require("./routes/UserRoutes");
const projectRecruitmentRoutes = require('./routes/projectRecruitmentRoutes');
const applicantRoutes = require('./routes/applicant'); // Import your route
const InterviewSchedule = require('./routes/InterviewSchedule');
const questionAnswerRoutes = require('./routes/questionAnswerRoutes');
// const cheatingLogRoutes = require('./routes/cheatingLogRoutes.js');
const cheatingLogRoutes = require('../server/routes/cheatingLogRoutes');
// const applicantRoutes = require('./routes/applicant'); // ✅ import route
const uploadRoutes = require("./routes/uploadRoute");
const nodemailer = require("nodemailer");
const Applicant = require('./databaseModels/Applicant'); // Adjust path as needed
const interviewBotRoutes = require('./routes/interviewBotRoutes'); // Add this line

const interviewRouting = require('./routes/interviewRouteing');

const app = express();


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/resumes/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});
// 🛠 Routes
connectDB();

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));
const transporter = nodemailer.createTransport({
  service: 'gmail', // or your email service
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASS || 'your-email-password'
  }
});













app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.json());

app.use("/api", interviewRoutes);
app.use('/api/companies', companyRoutes);
app.use("/api/roles", roleRoutes);
app.use("/api/users", userRoutes);
app.use('/api', projectRecruitmentRoutes);
app.use('/api', applicantRoutes); // All routes prefixed with /api
app.use('/api/interviewSchedule', InterviewSchedule);
app.use('/api/questionAnswers', questionAnswerRoutes);
app.use('/api/cheatingLogs', cheatingLogRoutes);
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
// app.use('/api', applicantRoutes); // ✅ use route
app.use("/api/applicants", applicantRoutes);
app.use("/uploads", express.static("uploads"));
app.use('/api/applicant', interviewRouting);
app.use('/api/interview-bot', interviewBotRoutes); // Add this line for interview bot routes









// Add this new email endpoint
app.post('/api/send-email', async (req, res) => {
  try {
    const { applicantId, emailData } = req.body;
    
    // Validate input
    if (!applicantId || !emailData) {
      return res.status(400).json({ 
        success: false,
        message: 'Missing required fields: applicantId and emailData are required'
      });
    }

    // Find applicant
    const applicant = await Applicant.findById(applicantId);
    if (!applicant) {
      return res.status(404).json({ 
        success: false,
        message: 'Applicant not found' 
      });
    }

    // Generate professional email content
    const emailContent = {
      subject: emailData.subject || `Interview Update: ${applicant.FirstName || 'Candidate'}`,
      html: generateProfessionalEmailTemplate(applicant, emailData),
      text: generateTextVersion(applicant, emailData)
    };

    // Send email
    await transporter.sendMail({
      from: `"Recruitment Team" <${process.env.EMAIL_FROM || 'no-reply@yourdomain.com'}>`,
      to: applicant.Email,
      subject: emailContent.subject,
      text: emailContent.text,
      html: emailContent.html
    });

    // Prepare updates
    const updates = {};
    if (emailData.meetingLink) updates.MeetingLink = emailData.meetingLink;
    if (emailData.status && applicant.schema.path('InterviewStatus').enumValues.includes(emailData.status)) {
      updates.InterviewStatus = emailData.status;
    }

    // Update applicant record
    const updatedApplicant = await Applicant.findByIdAndUpdate(
      applicantId,
      updates,
      { new: true, runValidators: true }
    );

    res.json({ 
      success: true,
      message: 'Email sent successfully',
      data: {
        applicant: updatedApplicant,
        emailPreview: emailContent
      }
    });

  } catch (error) {
    console.error('Email sending error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to send email',
      error: error.message,
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
  }
});

// Helper function to generate professional HTML email
function generateProfessionalEmailTemplate(applicant, emailData) {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${emailData.subject || 'Interview Update'}</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { padding: 20px; background-color: #f9fafb; border-radius: 0 0 8px 8px; }
        .footer { margin-top: 20px; font-size: 12px; color: #6b7280; text-align: center; }
        .button { display: inline-block; padding: 10px 20px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 4px; margin: 10px 0; }
        .details { background-color: white; padding: 15px; border-radius: 4px; margin: 15px 0; border-left: 4px solid #2563eb; }
        .details-item { margin-bottom: 8px; }
        .details-label { font-weight: 600; color: #4b5563; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${emailData.subject || 'Interview Update'}</h1>
      </div>
      <div class="content">
        <p>Dear ${applicant.FirstName || 'Candidate'},</p>
        
        ${emailData.body || `<p>We're pleased to share an update regarding your application.</p>`}
        
        ${emailData.meetingLink || emailData.meetingDate ? `
        <div class="details">
          <h3>Interview Details</h3>
          ${emailData.meetingDate ? `<div class="details-item"><span class="details-label">Date:</span> ${new Date(emailData.meetingDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>` : ''}
          ${emailData.meetingTime ? `<div class="details-item"><span class="details-label">Time:</span> ${emailData.meetingTime}</div>` : ''}
          ${emailData.meetingLink ? `<div class="details-item"><span class="details-label">Meeting Link:</span> <a href="${emailData.meetingLink}">Join Meeting</a></div>` : ''}
        </div>
        ` : ''}
        
        <p>Please don't hesitate to reply to this email if you have any questions or need to reschedule.</p>
        
        <p>Best regards,<br>
        <strong>Recruitment Team</strong></p>
      </div>
      <div class="footer">
        <p>© ${new Date().getFullYear()} Your Company Name. All rights reserved.</p>
      </div>
    </body>
    </html>
  `;
}

// Helper function to generate plain text version
function generateTextVersion(applicant, emailData) {
  let text = `Dear ${applicant.FirstName || 'Candidate'},\n\n`;
  text += emailData.body || "We're pleased to share an update regarding your application.\n\n";
  
  if (emailData.meetingLink || emailData.meetingDate) {
    text += "Interview Details:\n";
    if (emailData.meetingDate) text += `Date: ${new Date(emailData.meetingDate).toLocaleDateString()}\n`;
    if (emailData.meetingTime) text += `Time: ${emailData.meetingTime}\n`;
    if (emailData.meetingLink) text += `Meeting Link: ${emailData.meetingLink}\n`;
    text += "\n";
  }
  
  text += "Please reply to this email if you have any questions.\n\n";
  text += "Best regards,\nRecruitment Team";
  
  return text;
}

// app.post('/api/send-email', async (req, res) => {
//   try {
//     const { applicantId, emailData } = req.body;
    
//     const applicant = await Applicant.findById(applicantId);
//     if (!applicant) {
//       return res.status(404).json({ message: 'Applicant not found' });
//     }

//     const drive = await ProjectRecruitment.findById(applicant.ProjectRecruitmentDriveID);
    
//     // Format meeting details
//     const meetingDetails = {
//       date: emailData.meetingDate ? new Date(emailData.meetingDate).toLocaleDateString('en-US', {
//         weekday: 'long',
//         year: 'numeric',
//         month: 'long',
//         day: 'numeric'
//       }) : null,
//       time: emailData.meetingTime || null,
//       link: emailData.meetingLink || null
//     };

//     // Generate professional email body
//     const emailBody = generateEmailTemplate(applicant, drive, meetingDetails);

//     // Send email
//     await transporter.sendMail({
//       from: `"${drive.CompanyID?.companyName || 'Recruitment Team'}" <${process.env.EMAIL_USER}>`,
//       to: applicant.Email,
//       subject: `Interview Invitation: ${drive.ProjectName} Position`,
//       text: emailBody,
//       html: `
//         <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto;">
//           <p>Dear ${applicant.FirstName?.trim() || 'Candidate'},</p>
          
//           <p>We are pleased to invite you for an interview regarding the <strong>${drive.ProjectName}</strong> position at ${drive.CompanyID?.companyName || 'our company'}.</p>
          
//           <h3 style="color: #2c3e50;">Interview Details:</h3>
//           <ul>
//             <li><strong>Position:</strong> ${drive.ProjectName}</li>
//             <li><strong>Date:</strong> ${meetingDetails.date || 'To be scheduled'}</li>
//             <li><strong>Time:</strong> ${meetingDetails.time || 'To be confirmed'}</li>
//             <li><strong>Meeting Link:</strong> <a href="${meetingDetails.link}">${meetingDetails.link || 'Will be shared prior to interview'}</a></li>
//           </ul>
          
//           <p>Please ensure you:</p>
//           <ol>
//             <li>Join 5 minutes before the scheduled time</li>
//             <li>Have a stable internet connection</li>
//             <li>Prepare any necessary documents</li>
//           </ol>
          
//           <p>Should you need to reschedule or have any questions, please reply to this email.</p>
          
//           <p>We look forward to speaking with you.</p>
          
//           <p>Best regards,<br>
//           <strong>${drive.CompanyID?.companyName || 'The Recruitment Team'}</strong><br>
//           ${drive.CompanyID?.companyName ? 'Human Resources Department' : ''}</p>
//         </div>
//       `
//     });

//     // Update applicant record
//     const updates = {
//       MeetingLink: emailData.meetingLink,
//       InterviewStatus: 'Scheduled' // Make sure this matches your enum
//     };

//     // if (emailData.meetingDate && emailData.meetingTime) {
//     //   updates.MeetingStartDate = new Date(`${emailData.meetingDate}T${emailData.meetingTime}`);
//     // }

//     await Applicant.findByIdAndUpdate(applicantId, updates, { new: true, runValidators: true });

//     res.json({
//       message: 'Email sent successfully',
//       emailPreview: {
//         subject: `Interview Invitation: ${drive.ProjectName} Position`,
//         body: emailBody
//       }
//     });

//   } catch (error) {
//     console.error('Error sending email:', error);
//     res.status(500).json({
//       message: 'Failed to send email',
//       error: error.message,
//       ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
//     });
//   }
// });




// Routes
app.use("/api/drive", uploadRoutes);


// ✅ Health Check
app.get("/api/ping", (req, res) => res.send("✅ Backend is alive"));

const PORT = process.env.PORT || 5050;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
