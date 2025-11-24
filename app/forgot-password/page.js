"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const API_BASE = "http://192.168.29.139:8000";

// Animation Styles Component
const AnimationStyles = () => (
  <style jsx global>{`
    @keyframes gradient {
      0% {
        background-position: 0% 50%;
      }
      50% {
        background-position: 100% 50%;
      }
      100% {
        background-position: 0% 50%;
      }
    }

    @keyframes pulse {
      0%, 100% {
        transform: scale(1);
        opacity: 0.5;
      }
      50% {
        transform: scale(1.2);
        opacity: 0.8;
      }
    }

    @keyframes flow {
      0% {
        transform: translateX(-100%);
        opacity: 0;
      }
      50% {
        opacity: 1;
      }
      100% {
        transform: translateX(100%);
        opacity: 0;
      }
    }

    @keyframes nodePulse {
      0%, 100% {
        transform: scale(1);
        opacity: 0.4;
      }
      50% {
        transform: scale(1.3);
        opacity: 0.8;
      }
    }

    @keyframes serverGlow {
      0%, 100% {
        box-shadow: 0 0 5px rgba(255, 255, 255, 0.3);
      }
      50% {
        box-shadow: 0 0 20px rgba(255, 255, 255, 0.6);
      }
    }

    @keyframes databasePulse {
      0%, 100% {
        transform: scaleY(1);
        opacity: 0.6;
      }
      50% {
        transform: scaleY(1.1);
        opacity: 0.9;
      }
    }

    .forgot-password-page {
      background: none !important;
      animation: none !important;
    }

    .forgot-password-page body {
      background: none !important;
      animation: none !important;
    }
  `}</style>
);

const BackendLoader = () => {
  const elements = [
    // Servers
    { type: 'server', top: '20%', left: '15%', delay: '0s' },
    { type: 'server', top: '60%', left: '80%', delay: '1s' },
    { type: 'server', top: '80%', left: '25%', delay: '2s' },
    
    // Databases
    { type: 'database', top: '30%', left: '75%', delay: '0.5s' },
    { type: 'database', top: '70%', left: '10%', delay: '1.5s' },
    
    // Connection Lines
    { type: 'line', top: '25%', left: '20%', width: '50%', delay: '0s' },
    { type: 'line', top: '65%', left: '30%', width: '45%', delay: '1.5s' },
    { type: 'line', top: '45%', left: '15%', width: '60%', delay: '0.7s' },
    
    // Nodes
    { type: 'node', top: '25%', left: '50%', delay: '0s' },
    { type: 'node', top: '45%', left: '30%', delay: '1s' },
    { type: 'node', top: '65%', left: '70%', delay: '2s' },
    { type: 'node', top: '35%', left: '85%', delay: '1.5s' },
    { type: 'node', top: '75%', left: '45%', delay: '0.5s' },
    
    // Circles
    { type: 'circle', top: '50%', left: '50%', size: '100px', delay: '0s' },
    { type: 'circle', top: '30%', left: '30%', size: '150px', delay: '1s' },
    { type: 'circle', top: '70%', left: '70%', size: '80px', delay: '0.5s' },
  ];

  const getStyle = (element) => {
    const baseStyles = {
      position: 'absolute',
      animationDelay: element.delay,
    };

    switch (element.type) {
      case 'server':
        return {
          ...baseStyles,
          top: element.top,
          left: element.left,
          width: '40px',
          height: '20px',
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          borderRadius: '4px',
          animation: 'serverGlow 3s ease-in-out infinite',
        };
      case 'database':
        return {
          ...baseStyles,
          top: element.top,
          left: element.left,
          width: '30px',
          height: '40px',
          backgroundColor: 'rgba(255, 255, 255, 0.7)',
          borderBottomLeftRadius: '15px',
          borderBottomRightRadius: '15px',
          animation: 'databasePulse 2.5s ease-in-out infinite',
        };
      case 'line':
        return {
          ...baseStyles,
          top: element.top,
          left: element.left,
          width: element.width,
          height: '2px',
          background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.5), transparent)',
          animation: 'flow 3s linear infinite',
        };
      case 'node':
        return {
          ...baseStyles,
          top: element.top,
          left: element.left,
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          backgroundColor: 'rgba(255, 255, 255, 0.6)',
          animation: 'nodePulse 4s ease-in-out infinite',
        };
      case 'circle':
        return {
          ...baseStyles,
          top: element.top,
          left: element.left,
          width: element.size,
          height: element.size,
          borderRadius: '50%',
          border: '2px solid rgba(255, 255, 255, 0.3)',
          animation: 'pulse 2s ease-in-out infinite',
        };
      default:
        return baseStyles;
    }
  };

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      zIndex: -1,
      opacity: 0.7,
    }}>
      {elements.map((element, index) => (
        <div key={index} style={getStyle(element)} />
      ))}
    </div>
  );
};

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ type: "", message: "" });

  useEffect(() => {
    // Add class to body to override global styles
    document.documentElement.classList.add('forgot-password-page');
    document.body.classList.add('forgot-password-page');
    
    return () => {
      document.documentElement.classList.remove('forgot-password-page');
      document.body.classList.remove('forgot-password-page');
    };
  }, []);

  const validateEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleForgotPassword = async () => {
    setToast({ type: "", message: "" });

    if (!email.trim())
      return setToast({ type: "error", message: "Please enter email" });

    if (!validateEmail(email))
      return setToast({ type: "error", message: "Invalid email format" });

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email: email.toLowerCase().trim() }), // EXACT format backend needs
      });

      if (!res.ok) throw new Error("Failed to send reset request");

      setToast({ type: "success", message: "Reset link sent! Check your inbox." });

      setTimeout(() => {
        router.push(`/reset-password?email=${email.toLowerCase().trim()}`);
      }, 1200);

    } catch (err) {
      setToast({
        type: "error",
        message: "Failed to send reset email. Try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AnimationStyles />
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        padding: "20px",
        position: "relative",
        overflow: "hidden",
        background: "linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab)",
        backgroundSize: "400% 400%",
        animation: "gradient 15s ease infinite",
      }}>
        {/* Backend Loader Animation */}
        <BackendLoader />
        
        <div style={{
          width: "100%",
          maxWidth: "420px",
          backgroundColor: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(10px)",
          padding: "40px",
          borderRadius: "12px",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          textAlign: "center",
          zIndex: 2,
        }}>
          <h1 style={{ 
            fontSize: "26px", 
            fontWeight: "bold",
            color: "#1f2937",
            margin: 0 
          }}>
            Forgot Password?
          </h1>
          <p style={{ 
            color: "#6b7280", 
            marginTop: "8px",
            fontSize: "14px"
          }}>
            Enter your registered email to receive a reset link.
          </p>

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
            disabled={loading}
            style={{
              width: "100%",
              marginTop: "20px",
              padding: "14px",
              borderRadius: "10px",
              border: "1px solid #d1d5db",
              fontSize: "15px",
              backgroundColor: "rgba(255, 255, 255, 0.8)",
              transition: "all 0.3s ease",
              fontFamily: "inherit",
            }}
            onFocus={(e) => {
              e.target.style.backgroundColor = "white";
              e.target.style.boxShadow = "0 0 0 3px rgba(59, 130, 246, 0.1)";
              e.target.style.borderColor = "#3b82f6";
            }}
            onBlur={(e) => {
              e.target.style.backgroundColor = "rgba(255, 255, 255, 0.8)";
              e.target.style.boxShadow = "none";
              e.target.style.borderColor = "#d1d5db";
            }}
          />

          <button
            onClick={handleForgotPassword}
            disabled={loading}
            style={{
              width: "100%",
              padding: "14px",
              marginTop: "20px",
              background: "#3b82f6",
              color: "#fff",
              borderRadius: "10px",
              fontWeight: "600",
              opacity: loading ? 0.6 : 1,
              cursor: loading ? "not-allowed" : "pointer",
              border: "none",
              fontSize: "16px",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow = "0 4px 12px rgba(59, 130, 246, 0.4)";
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "none";
              }
            }}
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>

          {toast.message && (
            <div style={{
              marginTop: "15px",
              padding: "12px",
              borderRadius: "8px",
              backgroundColor: toast.type === "success" ? "#dcfce7" : "#fee2e2",
              color: toast.type === "success" ? "#14532d" : "#7f1d1d",
              fontWeight: "600",
              border: toast.type === "success" ? "1px solid #4ade80" : "1px solid #ef4444",
              fontSize: "14px",
              transition: "all 0.3s ease",
            }}>
              {toast.type === "success" ? "✓ " : "✗ "}
              {toast.message}
            </div>
          )}

          <button
            onClick={() => router.push("/login")}
            style={{
              marginTop: "18px",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#3b82f6",
              fontSize: "16px",
              fontWeight: "600",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.target.style.color = "#1d4ed8";
            }}
            onMouseLeave={(e) => {
              e.target.style.color = "#3b82f6";
            }}
          >
            Back to Login
          </button>
        </div>
      </div>
    </>
  );
}