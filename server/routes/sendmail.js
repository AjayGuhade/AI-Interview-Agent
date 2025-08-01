// // In your Express routes
// const nodemailer = require('nodemailer');
// const Applicant = require('../databaseModels/Applicant');

// router.post('/send-email', async (req, res) => {
//   try {
//     const { applicantId, emailData } = req.body;
    
//     // Fetch applicant details
//     const applicant = await Applicant.findById(applicantId);
//     if (!applicant) {
//       return res.status(404).json({ message: 'Applicant not found' });
//     }

//     // Create transporter (configure with your email service)
//     const transporter = nodemailer.createTransport({
//       service: 'gmail',
//       auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASS
//       }
//     });

//     // Send email
//     await transporter.sendMail({
//       to: applicant.Email,
//       subject: emailData.subject,
//       text: emailData.body
//     });

//     // Update applicant with new meeting details if they changed
//     if (emailData.meetingLink) {
//       applicant.MeetingLink = emailData.meetingLink;
//       applicant.InterviewStatus = 'Scheduled';
      
//       if (emailData.meetingDate && emailData.meetingTime) {
//         applicant.MeetingStartDate = new Date(`${emailData.meetingDate} ${emailData.meetingTime}`);
//       }
      
//       await applicant.save();
//     }

//     res.json({ message: 'Email sent successfully' });
//   } catch (error) {
//     console.error('Email sending error:', error);
//     res.status(500).json({ message: 'Failed to send email', error: error.message });
//   }
// });