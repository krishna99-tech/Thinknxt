"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import AuthLayout from "../../components/auth/AuthLayout";
import {
  verifyResetToken,
  resetPassword,
  validatePassword,
} from "../../lib/auth";
import { getErrorMessage } from "../../lib/api";

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
    if (token === null) return; // wait until searchParams load

    if (!token) {
      setLoading(false);
      setValidToken(false);
      return;
    }

    (async () => {
      try {
        await verifyResetToken(token);
        setValidToken(true);
      } catch (err) {
        setError(
          getErrorMessage(
            err,
            "Invalid or expired reset token. Please request a new password."
          )
        );
        setValidToken(false);
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!password || !confirmPassword) {
      return setError("Please fill in both password fields.");
    }
    if (!validatePassword(password)) {
      return setError(
        "Password must contain uppercase, lowercase, numbers, and be at least 8 characters."
      );
    }
    if (password !== confirmPassword) {
      return setError("Passwords do not match.");
    }

    setIsSubmitting(true);

    try {
      const res = await resetPassword(token, password);
      setMessage(res?.message || "Password reset successfully.");
      setTimeout(() => router.push("/login"), 2000);
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          "Token invalid or expired. Please request a new password reset."
        )
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // State 1: Verifying token
  if (loading) {
    return (
      <AuthLayout maxWidth="450px">
        <div style={{ textAlign: "center", padding: "30px 10px" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              border: "4px solid #e5e7eb",
              borderTop: "4px solid #3b82f6",
              borderRadius: "50%",
              margin: "0 auto 20px",
              animation: "spin 0.8s linear infinite",
            }}
          />
          <p style={{ color: "#6b7280", margin: 0, fontSize: "15px" }}>
            Verifying reset token...
          </p>
        </div>
      </AuthLayout>
    );
  }

  // State 2: Missing token
  if (!token) {
    return (
      <AuthLayout maxWidth="450px">
        <div style={{ textAlign: "center" }}>
          <h1
            style={{
              color: "#ef4444",
              marginBottom: "16px",
              fontSize: "1.5rem",
              fontWeight: "700",
            }}
          >
            ⚠️ Missing Token
          </h1>
          <p style={{ color: "#6b7280", marginBottom: "24px" }}>
            The password reset link is missing a valid security token.
          </p>
          <Link
            href="/forgot-password"
            className="auth-btn-primary"
            style={{
              display: "inline-block",
              textDecoration: "none",
              textAlign: "center",
            }}
          >
            Request Reset Link
          </Link>
        </div>
      </AuthLayout>
    );
  }

  // State 3: Invalid or expired token
  if (!validToken) {
    return (
      <AuthLayout maxWidth="450px">
        <div style={{ textAlign: "center" }}>
          <h1
            style={{
              color: "#ef4444",
              marginBottom: "16px",
              fontSize: "1.5rem",
              fontWeight: "700",
            }}
          >
            ⚠️ Invalid or Expired Token
          </h1>
          <p style={{ color: "#6b7280", marginBottom: "24px" }}>
            {error || "This reset link is no longer valid. Please request a new one."}
          </p>
          <Link
            href="/forgot-password"
            className="auth-btn-primary"
            style={{
              display: "inline-block",
              textDecoration: "none",
              textAlign: "center",
            }}
          >
            Request New Reset Link
          </Link>
        </div>
      </AuthLayout>
    );
  }

  // State 4: Valid token - Reset form
  return (
    <AuthLayout maxWidth="450px">
      <div style={{ marginBottom: "28px", textAlign: "center" }}>
        <h1
          style={{
            margin: 0,
            fontSize: "2rem",
            color: "#1f2937",
            fontWeight: "700",
          }}
        >
          Reset Your Password
        </h1>
        <p style={{ margin: "10px 0 0 0", color: "#6b7280", fontSize: "14px" }}>
          Enter a new password for your account
        </p>
      </div>

      {message && (
        <div className="auth-toast-success" style={{ marginBottom: "20px" }}>
          ✓ {message}
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
            New Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="auth-input"
            disabled={isSubmitting}
            placeholder="Enter new password"
            required
          />
          <div style={{ fontSize: "12px", color: "#6b7280" }}>
            Must contain uppercase, lowercase, numbers, and min 8 characters.
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <label
            style={{ fontSize: "14px", fontWeight: "600", color: "#374151" }}
          >
            Confirm Password
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="auth-input"
            disabled={isSubmitting}
            placeholder="Confirm new password"
            required
          />
        </div>

        <button
          type="submit"
          className="auth-btn-primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Resetting..." : "Reset Password"}
        </button>
      </form>

      <div style={{ textAlign: "center", marginTop: "20px", fontSize: "14px" }}>
        <p style={{ margin: 0, color: "#6b7280" }}>
          Remember your password?{" "}
          <Link
            href="/login"
            style={{
              color: "#3b82f6",
              textDecoration: "none",
              fontWeight: "600",
            }}
          >
            Login here
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}