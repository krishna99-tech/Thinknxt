"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Link from "next/link";

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

    .signup-page {
      background: none !important;
      animation: none !important;
    }

    .signup-page body {
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

export default function GetStartedComponent() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Add class to body to override global styles
    document.documentElement.classList.add('signup-page');
    document.body.classList.add('signup-page');
    
    return () => {
      document.documentElement.classList.remove('signup-page');
      document.body.classList.remove('signup-page');
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!name || !email || !password) {
      return setError("Please fill in all fields.");
    }

    setIsSubmitting(true);

    try {
      // This is a placeholder for your actual signup API call
      await axios.post(`${API_BASE}/signup`, { name, email, password });

      // On success, redirect to login page with a query param
      router.push("/login?from=signup");
    } catch (err) {
      setError(err.response?.data?.detail || "Could not create account. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <AnimationStyles />
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
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
          maxWidth: "450px",
          backgroundColor: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(10px)",
          borderRadius: "12px",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
          padding: "40px",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          zIndex: 2,
        }}>
          <div style={{ marginBottom: "30px", textAlign: "center" }}>
            <h1 style={{ margin: 0, fontSize: "2rem", color: "#1f2937", fontWeight: "700" }}>Create an Account</h1>
            <p style={{ margin: "10px 0 0 0", color: "#6b7280", fontSize: "14px" }}>Get started with us today!</p>
          </div>

          <form onSubmit={handleSubmit} style={{
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            marginBottom: "20px",
          }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label style={{ fontSize: "14px", fontWeight: "600", color: "#374151" }}>Full Name</label>
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                style={{
                  padding: "12px 16px",
                  fontSize: "14px",
                  borderRadius: "8px",
                  border: "1px solid #d1d5db",
                  fontFamily: "inherit",
                  backgroundColor: "rgba(255, 255, 255, 0.8)",
                  transition: "all 0.3s ease",
                }} 
                disabled={isSubmitting} 
                required 
                onFocus={(e) => {
                  e.target.style.backgroundColor = "white";
                  e.target.style.boxShadow = "0 0 0 3px rgba(59, 130, 246, 0.1)";
                }}
                onBlur={(e) => {
                  e.target.style.backgroundColor = "rgba(255, 255, 255, 0.8)";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label style={{ fontSize: "14px", fontWeight: "600", color: "#374151" }}>Email</label>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                style={{
                  padding: "12px 16px",
                  fontSize: "14px",
                  borderRadius: "8px",
                  border: "1px solid #d1d5db",
                  fontFamily: "inherit",
                  backgroundColor: "rgba(255, 255, 255, 0.8)",
                  transition: "all 0.3s ease",
                }} 
                disabled={isSubmitting} 
                required 
                onFocus={(e) => {
                  e.target.style.backgroundColor = "white";
                  e.target.style.boxShadow = "0 0 0 3px rgba(59, 130, 246, 0.1)";
                }}
                onBlur={(e) => {
                  e.target.style.backgroundColor = "rgba(255, 255, 255, 0.8)";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label style={{ fontSize: "14px", fontWeight: "600", color: "#374151" }}>Password</label>
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                style={{
                  padding: "12px 16px",
                  fontSize: "14px",
                  borderRadius: "8px",
                  border: "1px solid #d1d5db",
                  fontFamily: "inherit",
                  backgroundColor: "rgba(255, 255, 255, 0.8)",
                  transition: "all 0.3s ease",
                }} 
                disabled={isSubmitting} 
                required 
                onFocus={(e) => {
                  e.target.style.backgroundColor = "white";
                  e.target.style.boxShadow = "0 0 0 3px rgba(59, 130, 246, 0.1)";
                }}
                onBlur={(e) => {
                  e.target.style.backgroundColor = "rgba(255, 255, 255, 0.8)";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>

            <button 
              type="submit" 
              style={{ 
                padding: "12px 24px",
                fontSize: "16px",
                fontWeight: "600",
                borderRadius: "8px",
                border: "none",
                backgroundColor: "#3b82f6",
                color: "white",
                cursor: "pointer",
                transition: "all 0.3s ease",
                opacity: isSubmitting ? 0.6 : 1,
              }} 
              disabled={isSubmitting}
              onMouseEnter={(e) => {
                if (!isSubmitting) {
                  e.target.style.transform = "translateY(-2px)";
                  e.target.style.boxShadow = "0 4px 12px rgba(59, 130, 246, 0.4)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isSubmitting) {
                  e.target.style.transform = "translateY(0)";
                  e.target.style.boxShadow = "none";
                }
              }}
            >
              {isSubmitting ? "Creating Account..." : "Sign Up"}
            </button>
          </form>

          {error && (
            <div style={{
              padding: "12px 16px",
              borderRadius: "8px",
              border: "1px solid #ef4444",
              fontSize: "14px",
              marginBottom: "20px",
              backgroundColor: "#fee2e2",
              color: "#7f1d1d",
            }}>
              ✗ {error}
            </div>
          )}

          <div style={{ textAlign: "center", marginTop: "20px", fontSize: "14px" }}>
            <p>
              Already have an account?{" "}
              <Link href="/login" style={{
                color: "#3b82f6",
                textDecoration: "none",
                fontWeight: "600",
              }}>
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}