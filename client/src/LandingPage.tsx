import React from "react";
import { useNavigate } from "react-router-dom";

const AiInterviewPage = () => {
  const navigate = useNavigate(); // hook to navigate programmatically

  const handleStartClick = () => {
    navigate('/chat');
  };
  return (
    
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.logoContainer}>
          <img src="image.png" alt="AiInterview" style={styles.logoIcon} />
          <span style={styles.logoText}>SculpTrix AI</span>
        </div>
        <nav style={styles.nav}>
          {["Home", "About", "Products", "Contact"].map((item) => (
            <a key={item} href="#" style={styles.navLink}>
              {item}
            </a>
          ))}
          <a href="#" style={styles.faqButton}>FAQ</a>
        </nav>
      </header>

      {/* Main Content */}
      <main style={styles.main}>
        <section style={styles.textSection}>
          <p className="floating" style={styles.subheading}>Get ready for your AI-powered interview!</p>
          <h1 className="text-pop" style={styles.heading}>
            Introducing the
            <br />
            <strong>3D AI Interview</strong>
          </h1>
          <p style={styles.description}>
            Elevate your interview experience with our cutting-edge AI assistant
          </p>
          <button
          className="glow-btn"
          style={styles.ctaButton}
          onClick={handleStartClick}
        >
          Start Interview
        </button>        </section>

        <section className="robot-tilt" style={styles.imageSection}>
          <img src="/robot1.webp" alt="AI Robot with Laptop" style={styles.robotImage} />
        </section>
      </main>

      <style>
        {`
          @keyframes float {
            0% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
            100% { transform: translateY(0); }
          }

          @keyframes pop {
            0% { transform: scale(0.95); opacity: 0.5; }
            50% { transform: scale(1.05); opacity: 1; }
            100% { transform: scale(1); }
          }

          .floating {
            animation: float 3s ease-in-out infinite;
          }

          .text-pop {
            animation: pop 1.5s ease-out;
          }

          .glow-btn {
            animation: glow 2s ease-in-out infinite;
          }

          @keyframes glow {
            0% { box-shadow: 0 0 10px rgba(58,130,246,0.3); }
            50% { box-shadow: 0 0 20px rgba(58,130,246,0.7); }
            100% { box-shadow: 0 0 10px rgba(58,130,246,0.3); }
          }

          .robot-tilt:hover img {
            transform: perspective(1000px) rotateY(10deg) rotateX(5deg) scale(1.05);
            transition: transform 0.6s ease;
          }

          .robot-tilt img {
            transition: transform 0.8s ease;
            will-change: transform;
          }
        `}
      </style>
    </div>
  );
};

const styles = {
  container: {
    fontFamily: "'Inter', sans-serif",
    background: "linear-gradient(to bottom right, #e1f0ff, #ffffff)",
    color: "#111",
    height: "100vh",
    overflow: "hidden",
  },
  header: {
    height: "100px",
    padding: "0 190px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
  },
  logoContainer: {
    display: "flex",
    alignItems: "center",
  },
  logoIcon: {
    width: 304,
    height: 344,
    marginRight: -190,
  },
  logoText: {
    fontSize: 29,
    fontWeight: 700,
    padding: "12px 0px",   // top-bottom: 10px, left-right: 20px
    height: "60px",         // sets a fixed height
    lineHeight: "60px",     // vertically centers text if needed
  },
  
  nav: {
    display: "flex",
    gap: 44,
    alignItems: "center",
    fontSize: 19,
  },
  navLink: {
    color: "#333",
    textDecoration: "none",
    padding: "8px 12px",
    borderRadius: "4px",
  },
  faqButton: {
    backgroundColor: "#3a82f6",
    color: "#fff",
    padding: "8px 16px",
    borderRadius: "999px",
    fontWeight: 600,
    textDecoration: "none",
  },
  main: {
    display: "flex",
    height: "calc(100vh - 70px)",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 60px",
  },
  textSection: {
    width: "50%",
    paddingRight: "40px",
  },
  subheading: {
    fontSize: 32,
    color: "#3a82f6",
    marginBottom: 12,
  },
  heading: {
    fontSize: 64,
    fontWeight: 700,
    margin: "0 0 20px 0",
    lineHeight: 1.2,
  },
  description: {
    fontSize: 24,
    color: "#555",
    marginBottom: 32,
  },
  ctaButton: {
    backgroundColor: "#3a82f6",
    color: "#fff",
    padding: "14px 32px",
    border: "none",
    borderRadius: "32px",
    fontSize: 20,
    fontWeight: 600,
    cursor: "pointer",
  },
  imageSection: {
    width: "52%",
    display: "flex",
    justifyContent: "center",
  },
  robotImage: {
    width: "100vw",     // 100% of the viewport width
    height: "auto",     // Automatically scales height
  }
  
  
};

export default AiInterviewPage;
