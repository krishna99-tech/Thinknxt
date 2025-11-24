"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import Cookies from "js-cookie";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

// Create a separate CSS file or use this approach
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

    .login-page {
      background: none !important;
      animation: none !important;
    }

    .login-page body {
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

export default function LoginComponent() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    // Add class to body to override global styles
    document.documentElement.classList.add('login-page');
    document.body.classList.add('login-page');
    
    return () => {
      document.documentElement.classList.remove('login-page');
      document.body.classList.remove('login-page');
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      return setError("Please fill in both email and password.");
    }

    setIsSubmitting(true);

    try {
      const response = await axios.post(`${API_BASE}/login`, {
        email,
        password,
      });

      const token = response.data.access_token;
      Cookies.set("auth_token", token, { expires: 1 });
      console.log("Login successful:", response.data);

      router.push("/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.detail || "Invalid credentials. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("from") === "signup") {
        setSuccessMessage(
          "Install our app from the Play Store, then login and explore our services."
        );
      }
    }
  }, []);

  const handleGoogleSignIn = () => {
    window.location.href = `${API_BASE}/auth/google`;
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
        paddingTop: "50px",
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
            <h1 style={{ margin: 0, fontSize: "2rem", color: "#1f2937", fontWeight: "700" }}>Sign In</h1>
            <p style={{ margin: "10px 0 0 0", color: "#6b7280", fontSize: "14px" }}>Welcome back! Please sign in to your account.</p>
          </div>

          {successMessage && (
            <div style={{
              padding: "12px 16px",
              borderRadius: "8px",
              border: "1px solid #4ade80",
              fontSize: "14px",
              marginBottom: "20px",
              backgroundColor: "#dcfce7",
              color: "#14532d",
            }}>
              ✓ {successMessage}
            </div>
          )}
          
          <form onSubmit={handleSubmit} style={{
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            marginBottom: "20px",
          }}>
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
              {isSubmitting ? "Signing In..." : "Sign In"}
            </button>
          </form>

          <div style={{
            display: "flex",
            alignItems: "center",
            textAlign: "center",
            color: "#6b7280",
            margin: "25px 0",
          }}>
            <div style={{ flex: 1, borderBottom: "1px solid #d1d5db" }} />
            <span style={{ padding: "0 10px", fontSize: "14px" }}>OR</span>
            <div style={{ flex: 1, borderBottom: "1px solid #d1d5db" }} />
          </div>

          <button 
            onClick={handleGoogleSignIn} 
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              width: "100%",
              padding: "12px 24px",
              fontSize: "16px",
              fontWeight: "600",
              borderRadius: "8px",
              border: "1px solid #d1d5db",
              backgroundColor: "white",
              color: "#374151",
              cursor: "pointer",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = "translateY(-2px)";
              e.target.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.1)";
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "none";
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 0 24 24" width="20">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              <path d="M1 1h22v22H1z" fill="none"/>
            </svg>
            Sign in with Google
          </button>

          {error && (
            <div style={{
              padding: "12px 16px",
              borderRadius: "8px",
              border: "1px solid #ef4444",
              fontSize: "14px",
              marginBottom: "20px",
              backgroundColor: "#fee2e2",
              color: "#7f1d1d",
              marginTop: "20px",
            }}>
              ✗ {error}
            </div>
          )}

          <div style={{ textAlign: "center", marginTop: "20px", fontSize: "14px" }}>
            <p>
              <Link href="/forgot-password" style={{
                color: "#3b82f6",
                textDecoration: "none",
                fontWeight: "600",
              }}>
                Forgot your password?
              </Link>
            </p>
            <p style={{ marginTop: "10px" }}>
              Don't have an account?{" "}
              <Link href="/get-started" style={{
                color: "#3b82f6",
                textDecoration: "none",
                fontWeight: "600",
              }}>
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}