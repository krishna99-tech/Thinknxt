"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";

const API_BASE = "http://192.168.29.139:8000";

// CSS Styles Component
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

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .animated-background {
      position: relative;
      min-height: 100vh;
      background: linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab);
      background-size: 400% 400%;
      animation: gradient 15s ease infinite;
      overflow: hidden;
    }

    .backend-loader {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 0;
      opacity: 0.7;
      pointer-events: none;
    }

    .loader-circle {
      position: absolute;
      border-radius: 50%;
      border: 2px solid rgba(255, 255, 255, 0.3);
      animation: pulse 2s ease-in-out infinite;
    }

    .connection-line {
      position: absolute;
      height: 2px;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.5), transparent);
      animation: flow 3s linear infinite;
    }

    .loader-node {
      position: absolute;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background-color: rgba(255, 255, 255, 0.6);
      animation: nodePulse 4s ease-in-out infinite;
    }

    .loader-server {
      position: absolute;
      width: 40px;
      height: 20px;
      background-color: rgba(255, 255, 255, 0.8);
      border-radius: 4px;
      animation: serverGlow 3s ease-in-out infinite;
    }

    .loader-database {
      position: absolute;
      width: 30px;
      height: 40px;
      background-color: rgba(255, 255, 255, 0.7);
      border-bottom-left-radius: 15px;
      border-bottom-right-radius: 15px;
      animation: databasePulse 2.5s ease-in-out infinite;
    }

    .glass-card {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      z-index: 2;
    }

    .animated-input {
      background: rgba(255, 255, 255, 0.8);
      border: 1px solid #d1d5db;
      transition: all 0.3s ease;
      font-family: inherit;
    }

    .animated-input:focus {
      background: white;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
      border-color: #3b82f6;
      outline: none;
    }

    .animated-button {
      transition: all 0.3s ease;
      background: #3b82f6;
      color: white;
      border: none;
      cursor: pointer;
      font-weight: 600;
      border-radius: 8px;
    }

    .animated-button:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
    }

    .animated-button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none !important;
      box-shadow: none !important;
    }

    .animated-toast {
      padding: 12px 16px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 14px;
      transition: all 0.3s ease;
      margin-bottom: 20px;
    }

    .toast-success {
      background-color: #dcfce7;
      color: #14532d;
      border: 1px solid #4ade80;
    }

    .toast-error {
      background-color: #fee2e2;
      color: #7f1d1d;
      border: 1px solid #ef4444;
    }

    .animated-link {
      color: #3b82f6;
      text-decoration: none;
      font-weight: 600;
      transition: color 0.2s ease;
    }

    .animated-link:hover {
      color: #1d4ed8;
      text-decoration: underline;
    }

    .loading-spinner {
      text-align: center;
      padding: 40px 20px;
    }

    .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid #e5e7eb;
      border-top: 4px solid #3b82f6;
      border-radius: 50%;
      margin: 0 auto 20px;
      animation: spin 0.8s linear infinite;
    }

    .reset-password-page {
      background: none !important;
      animation: none !important;
    }

    .reset-password-page body {
      background: none !important;
      animation: none !important;
    }
  `}</style>
);

const BackendLoader = () => {
  const elements = [
    { type: 'server', top: '20%', left: '15%', delay: '0s' },
    { type: 'server', top: '60%', left: '80%', delay: '1s' },
    { type: 'server', top: '80%', left: '25%', delay: '2s' },
    { type: 'database', top: '30%', left: '75%', delay: '0.5s' },
    { type: 'database', top: '70%', left: '10%', delay: '1.5s' },
    { type: 'line', top: '25%', left: '20%', width: '50%', delay: '0s' },
    { type: 'line', top: '65%', left: '30%', width: '45%', delay: '1.5s' },
    { type: 'line', top: '45%', left: '15%', width: '60%', delay: '0.7s' },
    { type: 'node', top: '25%', left: '50%', delay: '0s' },
    { type: 'node', top: '45%', left: '30%', delay: '1s' },
    { type: 'node', top: '65%', left: '70%', delay: '2s' },
    { type: 'node', top: '35%', left: '85%', delay: '1.5s' },
    { type: 'node', top: '75%', left: '45%', delay: '0.5s' },
    { type: 'circle', top: '50%', left: '50%', size: '100px', delay: '0s' },
    { type: 'circle', top: '30%', left: '30%', size: '150px', delay: '1s' },
    { type: 'circle', top: '70%', left: '70%', size: '80px', delay: '0.5s' },
  ];

  return (
    <div className="backend-loader">
      {elements.map((element, index) => (
        <div
          key={index}
          className={
            element.type === 'server' ? 'loader-server' :
            element.type === 'database' ? 'loader-database' :
            element.type === 'line' ? 'connection-line' :
            element.type === 'node' ? 'loader-node' : 'loader-circle'
          }
          style={{
            top: element.top,
            left: element.left,
            width: element.size,
            height: element.size,
            animationDelay: element.delay,
          }}
        />
      ))}
    </div>
  );
};

export default function ResetPasswordComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [validToken, setValidToken] = useState(false);
  const [loading, setLoading] = useState(true);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Add class to body to override global styles
    document.documentElement.classList.add('reset-password-page');
    document.body.classList.add('reset-password-page');
    
    return () => {
      document.documentElement.classList.remove('reset-password-page');
      document.body.classList.remove('reset-password-page');
    };
  }, []);

  useEffect(() => {
    if (token === null) return; // wait until token loads

    (async () => {
      try {
        const res = await axios.get(
          `${API_BASE}/verify-reset-token?token=${token}`
        );
        if (res.status === 200) setValidToken(true);
      } catch {
        setError("Invalid or expired reset token. Please request a new password.");
        setValidToken(false);
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  const validatePassword = (pwd) =>
    pwd.length >= 8 && /[A-Z]/.test(pwd) && /[a-z]/.test(pwd) && /\d/.test(pwd);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!password || !confirmPassword)
      return setError("Please fill in both password fields.");
    if (!validatePassword(password))
      return setError(
        "Password must contain uppercase, lowercase, numbers, min 8 chars."
      );
    if (password !== confirmPassword)
      return setError("Passwords do not match.");

    setIsSubmitting(true);

    try {
      const res = await axios.post(`${API_BASE}/reset-password`, {
        token,
        new_password: password,
      });
      setMessage(res.data.message || "Password reset successfully.");
      setTimeout(() => router.push("/login"), 2000);
    } catch {
      setError("Token invalid or expired. Please request a new password reset.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (loading)
    return (
      <>
        <AnimationStyles />
        <div className="animated-background">
          <BackendLoader />
          <div style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "100vh",
            padding: "20px",
          }}>
            <div className="glass-card" style={{
              width: "100%",
              maxWidth: "450px",
              padding: "40px",
              textAlign: "center",
            }}>
              <div className="loading-spinner">
                <div className="spinner"></div>
                <p style={{ color: "#6b7280", marginTop: "20px" }}>Verifying reset token...</p>
              </div>
            </div>
          </div>
        </div>
      </>
    );

  // No token provided
  if (!loading && !token)
    return (
      <>
        <AnimationStyles />
        <div className="animated-background">
          <BackendLoader />
          <div style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "100vh",
            padding: "20px",
          }}>
            <div className="glass-card" style={{
              width: "100%",
              maxWidth: "450px",
              padding: "40px",
              textAlign: "center",
            }}>
              <h1 style={{ color: "#ef4444", marginBottom: "20px", fontSize: "1.5rem" }}>⚠️ Missing Token</h1>
              <p style={{ color: "#6b7280", marginBottom: "30px" }}>Please request a new reset link.</p>
              <button
                onClick={() => router.push("/forgot-password")}
                className="animated-button"
                style={{ 
                  padding: "12px 24px",
                  fontSize: "16px",
                }}
              >
                Request Reset Link
              </button>
            </div>
          </div>
        </div>
      </>
    );

  // Token invalid or expired
  if (!validToken)
    return (
      <>
        <AnimationStyles />
        <div className="animated-background">
          <BackendLoader />
          <div style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "100vh",
            padding: "20px",
          }}>
            <div className="glass-card" style={{
              width: "100%",
              maxWidth: "450px",
              padding: "40px",
              textAlign: "center",
            }}>
              <h1 style={{ color: "#ef4444", marginBottom: "20px", fontSize: "1.5rem" }}>⚠️ Invalid or Expired Token</h1>
              <p style={{ color: "#6b7280", marginBottom: "30px" }}>{error}</p>
              <button
                onClick={() => router.push("/forgot-password")}
                className="animated-button"
                style={{ 
                  padding: "12px 24px",
                  fontSize: "16px",
                }}
              >
                Request New Reset Link
              </button>
            </div>
          </div>
        </div>
      </>
    );

  // Main UI Form
  return (
    <>
      <AnimationStyles />
      <div className="animated-background">
        <BackendLoader />
        <div style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          padding: "20px",
        }}>
          <div className="glass-card" style={{
            width: "100%",
            maxWidth: "450px",
            padding: "40px",
          }}>
            <div style={{ marginBottom: "30px", textAlign: "center" }}>
              <h1 style={{ margin: 0, fontSize: "2rem", color: "#1f2937", fontWeight: "700" }}>Reset Your Password</h1>
              <p style={{ margin: "10px 0 0 0", color: "#6b7280", fontSize: "14px" }}>Enter a new password for your account</p>
            </div>

            <form onSubmit={handleSubmit} style={{
              display: "flex",
              flexDirection: "column",
              gap: "20px",
              marginBottom: "20px",
            }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label style={{ fontSize: "14px", fontWeight: "600", color: "#374151" }}>New Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="animated-input"
                  style={{
                    padding: "12px 16px",
                    fontSize: "14px",
                    borderRadius: "8px",
                  }}
                  disabled={isSubmitting}
                  placeholder="Enter new password"
                />
                <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "4px" }}>
                  Must contain uppercase, lowercase, numbers, and be at least 8 characters
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label style={{ fontSize: "14px", fontWeight: "600", color: "#374151" }}>Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="animated-input"
                  style={{
                    padding: "12px 16px",
                    fontSize: "14px",
                    borderRadius: "8px",
                  }}
                  disabled={isSubmitting}
                  placeholder="Confirm new password"
                />
              </div>

              <button
                type="submit"
                className="animated-button"
                style={{ 
                  padding: "12px 24px",
                  fontSize: "16px",
                  opacity: isSubmitting ? 0.6 : 1,
                }}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Resetting..." : "Reset Password"}
              </button>
            </form>

            {message && (
              <div className="animated-toast toast-success">
                ✓ {message}
              </div>
            )}

            {error && (
              <div className="animated-toast toast-error">
                ✗ {error}
              </div>
            )}

            <div style={{ textAlign: "center", marginTop: "20px", fontSize: "14px" }}>
              <p style={{ color: "#6b7280" }}>
                Remember your password?{" "}
                <a href="/login" className="animated-link">
                  Login here
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}