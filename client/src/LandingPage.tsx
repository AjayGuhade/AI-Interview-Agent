import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import LoginPopup from "./LoginPopup";
// import LoginPopup from "./LoginPopup";
 
const AiInterviewPage: React.FC = () => {
  const navigate = useNavigate();
  const [showLogin, setShowLogin] = useState(false);
 
  const handleStartClick = () => {
    navigate("/chat");
  };
 
  return (
    <div className="font-inter bg-gradient-to-br from-white via-blue-90 to-blue-700 text-gray-900">
      {/* Navbar */}
      <header className="fixed top-0 w-full z-50 bg-gray-900 shadow-[0_20px_50px_rgba(8,112,184,0.3)] sticky">
        <div className="container mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-0">
            <img
              src="/image1.png"
              alt="Logo"
              className="w-14 h-20 object-contain"
            />
            <span className="text-2xl md:text-3xl font-extrabold tracking-wide text-white mt-4">
              <span className="text-pink-600">culp</span>Trix AI
            </span>
          </div>
          <nav className="flex gap-6 text-sm md:text-base font-medium items-center">
            <a href="#home" className="text-white hover:text-blue-600 transition">Home</a>
            <a href="#about" className="text-white hover:text-blue-600 transition">About</a>
            <a href="#products" className="text-white hover:text-blue-600 transition">Products</a>
            <a href="#report" className="text-white hover:text-blue-600 transition">Report</a>
            <a href="#testimonials" className="text-white hover:text-blue-600 transition">Testimonials</a>
            <a href="#contact" className="text-white hover:text-blue-600 transition">Contact</a>
            {/* <a href="#clients" className="text-white hover:text-blue-600 transition">Clients</a> */}
            <button
              // onClick={() => setShowLogin(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white py-1 px-4 rounded-full transition text-sm">
              Login
            </button>
          </nav>
        </div>
      </header>
     
      {/* Login Popup */}
      {/* {showLogin && (
        <div className="fixed inset-0  bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-sm p-8 rounded-xl shadow-xl relative">
            <button
              onClick={() => setShowLogin(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-black text-2xl font-bold"
            >
              ×
            </button>
            <LoginPopup onClose={() => setShowLogin(false)} />
          </div>
        </div>
      )} */}
   
     {/* Hero Section */}
      <section id="home"
  className="relative min-h-screen flex items-center justify-center text-white bg-black overflow-hidden px-4 md:px-12 py-20">
  {/* Background Effects */}
  <div className="absolute inset-0 z-0">
    <div className="absolute w-full h-full bg-black opacity-60" />
    <div className="stars" />
    <div className="twinkling" />
    <div className="moon-glow" />
  </div>
 
  {/* Main Content */}
  <div className="relative z-10 max-w-6xl w-full grid grid-cols-1 md:grid-cols-2 items-start gap-10">
    {/* Left: Robot Image */}
    <div className="flex justify-center md:justify-start px-2 md:px-0 animate-fade-in-up mt-10">
      <img
        src="img/robot1.png"
        alt="AI Robot"
        className="max-w-[500px] w-full hover:scale-105 transition-transform duration-500"
      />
    </div>
 
    {/* Right: Card with Heading + Compact Form */}
    <div className="w-full max-w-[460px] max-h-[700px] mt-18 px-4 md:px-10">
      <div className="border-l-[6px] border-blue-500 bg-gray-900 backdrop-blur-sm text-white shadow-xl p-5 rounded-xl">
        {/* Heading inside card */}
        <h1 className="text-2xl md:text-2xl font-bold text-center text-white mb-4">
          Welcome to <span className="text-[#1e3a8a]">SculpTrix AI</span>
        </h1>
 
        {/* Compact Form */}
        <form className="space-y-6 text-sm">
          <div className="grid grid-cols-2 gap-5">
            <input
              type="text"
              placeholder="First name"
              className="w-full border border-gray-300 px-3 py-1.5 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="Last name"
              className="w-full border border-gray-300 px-3 py-1.5 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
 
          <input
            type="email"
            placeholder="Email address"
            className="w-full border border-gray-300 px-3 py-1.5 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
 
          <input
            type="password"
            placeholder="Password"
            className="w-full border border-gray-300 px-3 py-1.5 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
 
          <input
            type="password"
            placeholder="Confirm password"
            className="w-full border border-gray-300 px-3 py-1.5 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
 
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md font-semibold transition text-sm"
          >
            Register
          </button>
 
          <p className="text-center text-gray-400 text-xs mt-2">
            Already have an account?{' '}
            <span className="text-blue-500 hover:underline cursor-pointer">Login</span>
          </p>
        </form>
      </div>
    </div>
  </div>
    </section>
 
 
 
         {/* about section */}
     <section id="about" className="relative bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white py-24 px-6 md:px-12 overflow-hidden">
  {/* Animated background shapes */}
  <div className="absolute top-0 left-0 w-full h-full z-0 overflow-hidden">
    <div className="absolute top-22 left-7 w-50 h-50 bg-gray-800 rounded-full opacity-20 animate-pulse"></div>
    <div className="absolute bottom-60 left-140 right-50 w-40 h-40 bg-gray-600 rounded-full opacity-20 animate-ping"></div>
    <div className="absolute bottom-10 right-10 w-60 h-60 bg-gray-600 rounded-full opacity-20 animate-ping"></div>
    <div className="absolute top-30 right-40 w-30 h-30 bg-gray-400 rounded-full opacity-15 animate-bounce"></div>
  </div>
 
  {/* Heading */}
  <div className="text-center mb-5 relative z-10">
    <h2 className="text-4xl md:text-3xl font-extrabold text-white mb-2">
      ABOUT US
    </h2>
    <div className="w-24 h-1 bg-blue-500 mx-auto mt-1"></div>
  </div>
 
  {/* Content */}
  <div className="relative z-10 max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-10">
    {/* Image */}
    <div className="w-full md:w-1/2 h-100 rounded-3xl flex justify-center md:justify-start">
      <img
        src="/img/images (2).jpg"
        alt="About Illustration"
        className="w-[90%] max-w-[500px] h-auto rounded-3xl shadow-5x2  hover:scale-105 transition-transform duration-700"
      />
    </div>
 
    {/* Text */}
    <div className="w-full md:w-1/2 text-center md:text-left">
      <h3 className="text-3xl md:text-4xl font-bold mb-4 leading-snug">
        AI-Powered Interview & Reporting System
      </h3>
      <p className="text-lg md:text-1xl text-gray-300 leading-relaxed">
        Our advanced platform streamlines candidate evaluations by harnessing the power of Artificial Intelligence.
        It eliminates manual effort, ensures consistent assessments, and accelerates hiring processes.
        <br /><br />
        The system is built on a modular architecture that integrates frontend, backend, and Machine Learning models via secure APIs. This provides scalability, flexibility, and real-time analytics.
      </p>
    </div>
  </div>
     </section>
 
      {/* Products Section */}
    <section id="products" className="bg-gradient-to-br from-gray-900 to-gray-900 py-20 px-6 md:px-20">
    <div className="max-w-7xl mx-auto">
    {/* Section Header */}
    <div className="text-center mb-16">
      <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
        OUR PRODUCTS
      </h2>
      <div className="w-24 h-1 bg-blue-800 mx-auto"></div>
      <p className="text-gray-300 max-w-3xl mx-auto text-lg mt-2">
        Discover intelligent tools that streamline interview preparation, analysis, and skill improvement.
      </p>
    </div>
 
    {/* Products Grid */}
    <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
      {[
        {
          title: 'AI Interviewer',
          icon: '🤖',
          desc: 'Interact with AI avatars trained for domain-specific interviews. Practice, fail, learn, and improve—before the real thing.',
          bg: 'bg-blue-500'
        },
        {
          title: 'Smart Feedback',
          icon: '🧠',
          desc: 'Get real-time feedback on voice tone, filler words, clarity, and grammar during your response.',
          bg: 'bg-yellow-500'
        },
        {
          title: 'Skill Match Score',
          icon: '📈',
          desc: 'Evaluate how your skills align with job roles using intelligent matching and score indicators.',
          bg: 'bg-green-600'
        },
        {
          title: 'PDF Reports',
          icon: '📄',
          desc: 'Get detailed downloadable feedback and performance reports. Share it or archive for growth tracking.',
          bg: 'bg-red-500'
        },
        {
          title: 'Voice Analysis',
          icon: '🎤',
          desc: 'Analyze modulation, pace, and clarity. Perfect your tone and command with each attempt.',
          bg: 'bg-purple-600'
        },
        {
          title: 'Resume Insights',
          icon: '📋',
          desc: 'Let AI review your resume, highlight weaknesses, and suggest improvements that attract recruiters.',
          bg: 'bg-teal-500'
        }
      ].map((product, idx) => (
        <div
          key={idx}
          className="bg-gray-700 rounded-2xl pt-16 pb-8 px-6 border border-gray-700 hover:border-blue-500 transition-colors duration-300 shadow-xl hover:shadow-blue-600/20 relative text-center"
        >
          {/* Icon Circle */}
          <div className={`absolute -top-8 left-1/2 -translate-x-1/2 w-16 h-16 ${product.bg} text-white text-3xl rounded-full flex items-center justify-center shadow-lg`}>
            {product.icon}
          </div>
 
          {/* Title */}
          <h3 className="text-xl font-semibold text-white mb-3 mt-2">
            {product.title}
          </h3>
 
          {/* Description */}
          <p className="text-gray-400 text-sm">
            {product.desc}
          </p>
        </div>
      ))}
    </div>
  </div>
    </section>
 
   {/* Our Clients Section */}
      {/* <section id="clients" className="bg-gray-800 text-white py-20 px-6 md:px-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Clients</h2>
          <div className="w-24 h-1 bg-blue-500 mx-auto mt-1"></div>
        </div>
        <div className="flex flex-wrap justify-center gap-10 max-w-6xl mx-auto">
          {["/img/client1.png", "/img/client2.png", "/img/client3.png"].map((logo, idx) => (
            <img key={idx} src={logo} alt={`Client ${idx + 1}`} className="h-20 grayscale hover:grayscale-0 transition-all" />
          ))}
        </div>
      </section> */}
 
    <section id="report" className="bg-gray-900 py-30 px-6 md:px-20">
  <div className="text-center mb-12">
    <h2 className="text-3xl md:text-4xl font-bold text-gray-200 mb-4">AI-Generated Reports</h2>
    <div className="w-24 h-1 bg-blue-500 mx-auto mt-1"></div>
    <p className="text-gray-200 max-w-2xl mx-auto mt-4">
      Get detailed, actionable insights about candidates. Our AI analyzes behavior, speech, and skills to give you accurate evaluation reports in seconds.
    </p>
  </div>
 
  <div className="grid md:grid-cols-3 gap-10 max-w-6xl mx-auto">
    {/* Report Card 1 */}
    <div className="bg-slate-300 p-6 rounded-xl shadow hover:shadow-xl transition">
      <h3 className="text-xl font-semibold text-blue-700 mb-2">Skill Analysis</h3>
      <p className="text-gray-700 text-sm mb-3">
        Evaluate candidate’s technical and soft skills with visual charts and AI-driven feedback.
      </p>
      <img
        src="/img/skill-chart.png"
        alt="Skill Analysis"
        className="w-full rounded-md mt-2"
      />
    </div>
 
    {/* Report Card 2 */}
    <div className="bg-slate-400 p-6 rounded-xl shadow hover:shadow-xl transition">
      <h3 className="text-xl font-semibold text-blue-900 mb-2">Behavior Report</h3>
      <p className="text-gray-700 text-sm mb-3">
        Behavioral insights including confidence, tone, and professionalism based on AI detection.
      </p>
      <img
        src="/img/behavior-report.png"
        alt="Behavioral Report"
        className="w-full rounded-md mt-2"
      />
    </div>
 
    {/* Report Card 3 */}
    <div className="bg-slate-700 p-6 rounded-xl shadow hover:shadow-xl transition">
      <h3 className="text-xl font-semibold text-blue-700 mb-2">Summary & Suggestions</h3>
      <p className="text-gray-300 text-sm mb-3">
        Final summary with strengths, improvement areas, and AI suggestions for next steps.
      </p>
      <img
        src="/img/summary.png"
        alt="Report Summary"
        className="w-full rounded-md mt-2"
      />
    </div>
  </div>
    </section>
 
 
      {/* Testimonials Section */}
      <section id="testimonials" className="bg-gray-900 text-white py-20 px-6 md:px-20">
  <div className="text-center mb-12">
    <h2 className="text-3xl md:text-4xl font-bold mb-4">Testimonials</h2>
    <div className="w-24 h-1 bg-blue-500 mx-auto mt-1"></div>
  </div>
 
  <div className="grid md:grid-cols-2 gap-10 max-w-6xl mx-auto">
    {[
      {
        name: "Amit Sharma",
        feedback: "SculpTrix AI transformed our hiring process completely!",
        company: "HR Manager, TechNova"
      },
      {
        name: "Riya Desai",
        feedback: "The AI interviewer helped me land my dream job.",
        company: "Frontend Developer"
      },
      {
        name: "Kunal Patil",
        feedback: "We saved hours on each candidate evaluation — brilliant system!",
        company: "Talent Head, CodeWorks"
      },
      {
        name: "Sneha Mehta",
        feedback: "Very intuitive and efficient. The AI mimicked a real interview perfectly.",
        company: "Software Engineer, InnovateX"
      }
    ].map((t, idx) => (
      <div key={idx} className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700">
        <p className="italic text-gray-300 mb-4">"{t.feedback}"</p>
        <h4 className="text-lg font-bold text-blue-400">{t.name}</h4>
        <p className="text-sm text-gray-400">{t.company}</p>
      </div>
    ))}
  </div>
     </section>
 
 
      {/* Contact Section */}
        <section id="contact"className="relative bg-cover bg-center bg-no-repeat py-20 px-6 md:px-20"
     style={{ backgroundImage: "url('/img/contact_bg.jpg')" }}>
     {/* Overlay */}
   <div className="absolute inset-0  bg-opacity-10 backdrop-blur-lg z-0"></div>
 
   <div className="relative max-w-6xl mx-auto text-center z-10">
     <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
       Contact Us
     </h2>
    <div className="w-24 h-1 bg-blue-500 mx-auto mt-1 mb-4"></div>
    <p className="text-white max-w-2xl mx-auto text-lg mb-10">
      Reach out to our support or partnerships team.
    </p>
 
    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-stretch">
      {/* Contact Info Card */}
      <div className="relative rounded-2xl p-8 text-left flex flex-col justify-between border-l-[6px] border-blue-600 bg-black/80 backdrop-blur-lg text-white shadow-lg transition-all hover:shadow-2xl duration-300">
        <div className="space-y-6 text-base md:text-lg">
          <div>
            <p className="font-semibold text-white">Email:</p>
            <a
              href="mailto:contact@sculptortechpvtltd.com"
              className="text-blue-400 underline"
            >
              contact@sculptortechpvtltd.com
            </a>
          </div>
          <div>
            <p className="font-semibold text-white">Phone:</p>
            <p>+91 8668584275</p>
          </div>
          <div>
            <p className="font-semibold text-white">Address:</p>
            <p className="leading-relaxed">
              Sculptrix AI Technologies Pvt. Ltd.<br />
              Office No. C-1006, Satav Nagar,<br />
              Handewadi Road, Hadapsar,<br />
              Pune-411028, Maharashtra, India
            </p>
          </div>
        </div>
      </div>
 
      {/* Map Card */}
      <div className="rounded-2xl overflow-hidden shadow-lg h-full transition-all hover:shadow-2xl duration-300">
        <iframe
          title="Sculptrix AI Pune Location"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3782.1426977636033!2d73.85674287515212!3d18.562619167734265!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc2c07cf1c1e6b1%3A0x398c7d79849ab5aa!2sPune%2C%20Maharashtra!5e0!3m2!1sen!2sin!4v1690037031123!5m2!1sen!2sin"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="h-80 w-full md:h-full"
        ></iframe>
      </div>
    </div>
  </div>
 
  {/* WhatsApp Floating Icon */}
 <a
  href="https://wa.me/918668584275"
  target="_blank"
  rel="noopener noreferrer"
  className="fixed bottom-6 right-2 z-50 bg-green-500 hover:bg-green-600 rounded-full p-2 shadow-lg transition duration-300 ease-in-out"
  aria-label="Chat on WhatsApp"
>
  <img
    src="/img/whatsapp_icon.png"
    alt="WhatsApp"
    className="w-10 h-10 md:w-7 md:h-7"
  />
</a>
 
       </section>
 
 
      {/* Footer */}
      <footer className="bg-gray-900 text-center py-6 text-sm text-gray-400">
        © {new Date().getFullYear()} SculpTrix AI. All rights reserved.
      </footer>
 
      {/* Custom Animation */}
      <style>{`
        @keyframes fade-in-up {
          0% { opacity: 0; transform: translateY(40px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 1s ease-out;
        }
 
        html {
          scroll-behavior: smooth;
        }
 .stars {
  background: url('img/stars1.png') repeat;
  position: absolute;
  top: 0;
  left: 0;
  width: 200%;
  height: 200%;
  animation: move-stars 100s linear infinite;
  z-index: 0;
  opacity: 0.5;
}
 
.twinkling {
  background: url('/twinkling.png') repeat;
  position: absolute;
  top: 0;
  left: 0;
  width: 200%;
  height: 200%;
  animation: move-twinkling 200s linear infinite;
  z-index: 1;
  opacity: 0.3;
}
 
.moon-glow {
  position: absolute;
  top: 20%;
  left: 50%;
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.2), transparent 70%);
  transform: translateX(-50%);
  z-index: 1;
  pointer-events: none;
}
 
@keyframes move-stars {
  from {
    transform: translateY(0);
  }
  to {
    transform: translateY(-1000px);
  }
}
 
@keyframes move-twinkling {
  from {
    transform: translateY(0);
  }
  to {
    transform: translateY(-500px);
  }
}
 
 
    `}</style>
    {showLogin && <LoginPopup onClose={() => setShowLogin(false)} />}
  </div>
  );
};
 
export default AiInterviewPage;
 
 