const { sendInterviewEmail } = require("./services/emailService");

const candidateEmail = "yourtestemail@gmail.com"; // Use your own for now
const interviewLink = "https://yourdomain.com/interview/123456";
const candidateName = "Jayesh Wakle";

sendInterviewEmail(candidateEmail, interviewLink, candidateName)
  .then(() => console.log("✅ Test email sent successfully"))
  .catch((err) => console.error("❌ Failed to send email:", err));
