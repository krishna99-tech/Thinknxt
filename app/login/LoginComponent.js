"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import AuthLayout from "../../components/auth/AuthLayout";
import { login, getGoogleAuthUrl } from "../../lib/auth";
import { getErrorMessage, getPublicAppConfig } from "../../lib/api";

const EyeIcon = ({ size = 18, color = "#6b7280" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ display: "block" }}
  >
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = ({ size = 18, color = "#6b7280" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ display: "block" }}
  >
    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
    <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
    <line x1="2" y1="2" x2="22" y2="22" />
  </svg>
);

export default function LoginComponent() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [platformConfig, setPlatformConfig] = useState(null);

  useEffect(() => {
    getPublicAppConfig().then((cfg) => {
      if (cfg) setPlatformConfig(cfg);
    });
  }, []);

  const mobileSettings = platformConfig?.mobile_app || {};
  const isMaintenance = Boolean(mobileSettings.maintenance_mode);
  const isBlocking = Boolean(mobileSettings.maintenance_blocking);
  const maintenanceMsg =
    mobileSettings.maintenance_message?.trim() ||
    "All services have been paused for scheduled system maintenance.";
  const showConnectedApps = mobileSettings.feature_flags?.connected_apps !== false;

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      return setError("Please fill in both email and password.");
    }

    setIsSubmitting(true);

    try {
      await login(email, password);
      window.location.href = "/dashboard";
    } catch (err) {
      setError(
        getErrorMessage(err, "Invalid credentials. Please try again.")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = () => {
    window.location.href = getGoogleAuthUrl();
  };

  // ── Hard Maintenance Block: full-page with image as hero ──
  if (isBlocking) {
    return (
      <>
        <style>{`
          @keyframes maint-pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.4; transform: scale(1.4); }
          }
          @keyframes maint-fade-up {
            from { opacity: 0; transform: translateY(24px); }
            to   { opacity: 1; transform: translateY(0); }
          }
          .maint-page {
            display: flex;
            flex-direction: column;
            min-height: 100vh;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: #0a0a0f;
          }
          .maint-image-section {
            position: relative;
            width: 100%;
            flex: 0 0 auto;
          }
          .maint-image-section img {
            width: 100%;
            height: 55vh;
            object-fit: cover;
            object-position: center;
            display: block;
          }
          .maint-image-fade {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            height: 120px;
            background: linear-gradient(to bottom, transparent, #0a0a0f);
            pointer-events: none;
          }
          .maint-content {
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
            padding: 32px 24px 40px;
            animation: maint-fade-up 0.6s cubic-bezier(0.22,1,0.36,1) both;
          }

          @media (min-width: 900px) {
            .maint-page {
              flex-direction: row;
            }
            .maint-image-section {
              flex: 0 0 55%;
              height: 100vh;
              position: sticky;
              top: 0;
            }
            .maint-image-section img {
              height: 100%;
            }
            .maint-image-fade {
              display: none;
            }
            .maint-image-side-fade {
              position: absolute;
              top: 0;
              right: 0;
              bottom: 0;
              width: 100px;
              background: linear-gradient(to right, transparent, #0a0a0f);
              pointer-events: none;
            }
            .maint-content {
              flex: 1;
              justify-content: center;
              padding: 60px 48px;
            }
          }
        `}</style>

        <div className="maint-page">
          {/* ── Image Hero Section ── */}
          <div className="maint-image-section">
            <img
              src="/images/maintenance-crew.svg"
              alt="Futuristic maintenance crew at work"
            />
            {/* Bottom fade for mobile (column layout) */}
            <div className="maint-image-fade" />
            {/* Right-edge fade for desktop (row layout) */}
            <div className="maint-image-side-fade" />
          </div>

          {/* ── Content Section ── */}
          <div className="maint-content">
            <div style={{ maxWidth: "420px", width: "100%" }}>

              {/* Brand tag */}
              <span style={{
                fontSize: "11px",
                fontWeight: "700",
                letterSpacing: "0.2em",
                color: "#a78bfa",
                textTransform: "uppercase",
                display: "block",
                marginBottom: "24px",
              }}>
                ThingsNXT Platform
              </span>

              {/* Status badge */}
              <div style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                background: "rgba(239,68,68,0.12)",
                border: "1px solid rgba(239,68,68,0.35)",
                borderRadius: "999px",
                padding: "6px 18px",
                marginBottom: "28px",
              }}>
                <span style={{
                  width: "7px",
                  height: "7px",
                  borderRadius: "50%",
                  background: "#ef4444",
                  display: "inline-block",
                  animation: "maint-pulse 1.4s ease-in-out infinite",
                }} />
                <span style={{
                  fontSize: "11px",
                  fontWeight: "700",
                  letterSpacing: "0.08em",
                  color: "#fca5a5",
                }}>
                  🛑 HARD MAINTENANCE BLOCK ACTIVE
                </span>
              </div>

              {/* Title */}
              <h1 style={{
                margin: "0 0 16px",
                fontSize: "2rem",
                fontWeight: "800",
                color: "#ffffff",
                letterSpacing: "-0.02em",
                lineHeight: 1.2,
              }}>
                System Under Maintenance
              </h1>

              {/* Dynamic message from backend */}
              <p style={{
                margin: "0 0 32px",
                color: "rgba(255,255,255,0.5)",
                fontSize: "15px",
                lineHeight: "1.7",
              }}>
                {maintenanceMsg}
              </p>

              {/* Divider */}
              <div style={{
                height: "1px",
                background: "linear-gradient(90deg, transparent, rgba(168,85,247,0.3), transparent)",
                marginBottom: "24px",
              }} />

              {/* Info note */}
              <p style={{
                margin: "0 0 32px",
                fontSize: "13px",
                color: "rgba(255,255,255,0.3)",
                lineHeight: "1.65",
              }}>
                All sign-ins — including Google — are suspended while the
                platform undergoes scheduled upgrades. Please check back shortly.
              </p>

              {/* Back link */}
              <Link
                href="/"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  color: "#a78bfa",
                  textDecoration: "none",
                  fontSize: "14px",
                  fontWeight: "600",
                  transition: "color 0.2s",
                }}
              >
                ← Back to ThingsNXT
              </Link>

              {/* Bottom monospace hint */}
              <p style={{
                marginTop: "40px",
                fontSize: "11px",
                color: "rgba(255,255,255,0.15)",
                fontFamily: "monospace",
                letterSpacing: "0.04em",
              }}>
                thingsnxt.com • maintenance window in progress
              </p>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <AuthLayout maxWidth="450px">
      <div style={{ marginBottom: "30px", textAlign: "center" }}>
        <h1
          style={{
            margin: 0,
            fontSize: "2rem",
            color: "#1f2937",
            fontWeight: "700",
          }}
        >
          Sign In
        </h1>
        <p style={{ margin: "10px 0 0 0", color: "#6b7280", fontSize: "14px" }}>
          Welcome back! Please sign in to your account.
        </p>
      </div>

      {/* Soft maintenance advisory banner (non-blocking) */}
      {isMaintenance && (
        <div
          style={{
            display: "flex",
            gap: "14px",
            alignItems: "flex-start",
            backgroundColor: "#fffbeb",
            border: "1px solid #fcd34d",
            borderRadius: "12px",
            padding: "14px 16px",
            marginBottom: "20px",
          }}
        >
          <img
            src="/images/maintenance-crew.svg"
            alt="Maintenance"
            style={{
              width: "52px",
              height: "52px",
              objectFit: "cover",
              borderRadius: "8px",
              flexShrink: 0,
              border: "1px solid #fde68a",
            }}
          />
          <div style={{ color: "#92400e", fontSize: "13px", lineHeight: "1.5" }}>
            <div
              style={{
                fontWeight: "700",
                marginBottom: "3px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <span>⚠️</span> Maintenance Announcement
            </div>
            <div>{maintenanceMsg}</div>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="auth-toast-success" style={{ marginBottom: "20px" }}>
          ✓ {successMessage}
        </div>
      )}

      {error && (
        <div className="auth-toast-error" style={{ marginBottom: "20px" }}>
          ✗ {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          marginBottom: "20px",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <label
            style={{ fontSize: "14px", fontWeight: "600", color: "#374151" }}
          >
            Email or Username
          </label>
          <input
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="auth-input"
            disabled={isSubmitting}
            required
            placeholder="Enter your email or username"
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <label
            style={{ fontSize: "14px", fontWeight: "600", color: "#374151" }}
          >
            Password
          </label>
          <div style={{ position: "relative", width: "100%" }}>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="auth-input"
              disabled={isSubmitting}
              required
              placeholder="Enter your password"
              autoComplete="current-password"
              style={{ paddingRight: "44px" }}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              style={{
                position: "absolute",
                right: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                padding: "4px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#6b7280",
                borderRadius: "4px",
              }}
            >
              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          className="auth-btn-primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Signing In..." : "Sign In"}
        </button>
      </form>

      {showConnectedApps && (
        <>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              textAlign: "center",
              color: "#6b7280",
              margin: "25px 0",
            }}
          >
            <div style={{ flex: 1, borderBottom: "1px solid #d1d5db" }} />
            <span style={{ padding: "0 10px", fontSize: "14px" }}>OR</span>
            <div style={{ flex: 1, borderBottom: "1px solid #d1d5db" }} />
          </div>

          <button
            onClick={handleGoogleSignIn}
            type="button"
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
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="20"
              viewBox="0 0 24 24"
              width="20"
            >
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
              <path d="M1 1h22v22H1z" fill="none" />
            </svg>
            Sign in with Google
          </button>
        </>
      )}

      <div style={{ textAlign: "center", marginTop: "24px", fontSize: "14px" }}>
        <p style={{ margin: "0 0 10px 0" }}>
          <Link
            href="/forgot-password"
            style={{
              color: "#3b82f6",
              textDecoration: "none",
              fontWeight: "600",
            }}
          >
            Forgot your password?
          </Link>
        </p>
        <p style={{ margin: 0, color: "#6b7280" }}>
          Don't have an account?{" "}
          <Link
            href="/get-started"
            style={{
              color: "#3b82f6",
              textDecoration: "none",
              fontWeight: "600",
            }}
          >
            Sign up
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
