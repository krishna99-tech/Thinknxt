"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AuthLayout from "../../components/auth/AuthLayout";
import { login, getGoogleAuthUrl } from "../../lib/auth";
import { getErrorMessage, getPublicAppConfig } from "../../lib/api";

export default function LoginComponent() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
    "All services has been paused for scheduled system maintenance.";
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
      router.push("/dashboard");
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

      {isBlocking ? (
        <div
          style={{
            backgroundColor: "#fef2f2",
            border: "1px solid #f87171",
            borderRadius: "10px",
            padding: "14px 16px",
            marginBottom: "20px",
            color: "#991b1b",
            fontSize: "13px",
            lineHeight: "1.4",
          }}
        >
          <div
            style={{
              fontWeight: "700",
              marginBottom: "4px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <span>🛑</span> Hard Maintenance Block Active
          </div>
          <div>{maintenanceMsg}</div>
          <div style={{ marginTop: "6px", fontSize: "11px", color: "#b91c1c" }}>
            Note: Standard client and workspace member logins are paused during scheduled maintenance. Platform administrators may continue.
          </div>
        </div>
      ) : isMaintenance ? (
        <div
          style={{
            backgroundColor: "#fffbeb",
            border: "1px solid #fcd34d",
            borderRadius: "10px",
            padding: "12px 16px",
            marginBottom: "20px",
            color: "#92400e",
            fontSize: "13px",
            lineHeight: "1.4",
          }}
        >
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
      ) : null}

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
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="auth-input"
            disabled={isSubmitting}
            required
            placeholder="Enter your password"
          />
        </div>

        <button
          type="submit"
          className="auth-btn-primary"
          disabled={isSubmitting}
          style={
            isBlocking
              ? {
                  backgroundColor: "#d97706",
                }
              : undefined
          }
        >
          {isSubmitting
            ? "Signing In..."
            : isBlocking
            ? "Sign In (Admin Bypass)"
            : "Sign In"}
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
