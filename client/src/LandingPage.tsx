  import React from "react";
  import { useNavigate } from "react-router-dom";

  const AiInterviewPage = () => {
    const navigatee = useNavigate();

  const handleStartClickk = () => {
    navigate('/chat');
  };

  const handleLoginClick = () => {
    navigate('/auth');
  };
    const navigate = useNavigate();

    const handleStartClick = () => {
      navigate("/chat");
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
        <button onClick={handleLoginClick}style={styles.navLink} >Login</button>
      </nav>
    </header>


        {/* Main Content */}
        <main style={styles.main}>
          {/* Left Section */}
          <section style={styles.textSection}>
            <p className="floating" style={styles.subheading}>
              Revolutionize your hiring process
            </p>
            <h1 className="text-pop" style={styles.heading}>
              Smart, Scalable & Seamless
              <br />
              <strong>AI Hiring Management</strong>
            </h1>
            <p style={styles.description}>
              Our system handles hundreds of interviews simultaneously, evaluates candidates in real-time,
              and helps you select the top performers based on intelligent scoring.
            </p>

            <ul style={styles.features}>
              <li>✅ Conduct 100s of interviews in parallel</li>
              <li>✅ Real-time scoring & feedback from AI</li>
              <li>✅ Auto-filtering of top talent</li>
              <li>✅ Seamless integration with your HR tools</li>
            </ul>

            <button className="glow-btn" style={styles.ctaButton} onClick={handleStartClick}>
              Start Interview
            </button>
          </section>

          {/* Right Section */}
          <section className="robot-tilt" style={styles.imageSection}>
            <img src="/robot1.webp" alt="AI Robot with Laptop" style={styles.robotImage} />
          </section>
        </main>

        {/* Animation Styles */}
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
      padding: "12px 0px",
      height: "60px",
      lineHeight: "60px",
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
      height: "calc(100vh - 100px)",
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
      fontSize: 22,
      color: "#444",
      marginBottom: 24,
    },
    features: {
      listStyle: "none",
      padding: 0,
      marginBottom: 36,
      fontSize: 18,
      color: "#222",
      lineHeight: "1.6",
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
      width: "100vw",
      height: "auto",
    },
  };

  export default AiInterviewPage;
