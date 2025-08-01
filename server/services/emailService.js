// services/emailService.js
require("dotenv").config();
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendInterviewEmail(toEmail, interviewLink, candidateName) {
  const mailOptions = {
    from: `"SculptorTech AI Recruiter" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: "📩 Your AI Interview Invitation",
    html: `
      <div style="font-family:sans-serif; padding: 20px;">
        <h2>Hello ${candidateName},</h2>
        <p>You’ve been invited to attend an AI-driven interview for your recent application.</p>
        <p><strong>Click the button below to begin your interview:</strong></p>
        <a href="${interviewLink}" target="_blank" style="display: inline-block; margin: 20px 0; padding: 12px 24px; background-color: #007bff; color: #fff; text-decoration: none; border-radius: 6px;">Start Interview</a>
        <p>If the button doesn’t work, copy and paste this link into your browser:</p>
        <p>${interviewLink}</p>
        <br>
        <p>Good luck!<br>The SculptorTech Team</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}

module.exports = { sendInterviewEmail };
