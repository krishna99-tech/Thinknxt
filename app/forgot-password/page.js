"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AuthLayout from "../../components/auth/AuthLayout";
import { forgotPassword, validateEmail } from "../../lib/auth";
import { getErrorMessage } from "../../lib/api";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ type: "", message: "" });

  const handleForgotPassword = async (e) => {
    e?.preventDefault();
    setToast({ type: "", message: "" });

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      return setToast({ type: "error", message: "Please enter email" });
    }

    if (!validateEmail(trimmedEmail)) {
      return setToast({ type: "error", message: "Invalid email format" });
    }

    setLoading(true);

    try {
      await forgotPassword(trimmedEmail);

      setToast({
        type: "success",
        message: "Reset link sent! Check your inbox.",
      });

      setTimeout(() => {
        router.push(`/reset-password?email=${encodeURIComponent(trimmedEmail.toLowerCase())}`);
      }, 1200);
    } catch (err) {
      setToast({
        type: "error",
        message: getErrorMessage(err, "Failed to send reset email. Try again."),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout maxWidth="420px">
      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <h1
          style={{
            fontSize: "26px",
            fontWeight: "bold",
            color: "#1f2937",
            margin: 0,
          }}
        >
          Forgot Password?
        </h1>
        <p
          style={{
            color: "#6b7280",
            marginTop: "8px",
            fontSize: "14px",
          }}
        >
          Enter your registered email to receive a reset link.
        </p>
      </div>

      <form onSubmit={handleForgotPassword}>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
            disabled={loading}
            className="auth-input"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="auth-btn-primary"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </div>
      </form>

      {toast.message && (
        <div
          className={
            toast.type === "success" ? "auth-toast-success" : "auth-toast-error"
          }
          style={{ marginTop: "16px", textAlign: "center" }}
        >
          {toast.type === "success" ? "✓ " : "✗ "}
          {toast.message}
        </div>
      )}

      <div style={{ textAlign: "center", marginTop: "24px" }}>
        <Link
          href="/login"
          style={{
            color: "#3b82f6",
            fontSize: "15px",
            fontWeight: "600",
            textDecoration: "none",
            transition: "all 0.2s ease",
          }}
        >
          ← Back to Login
        </Link>
      </div>
    </AuthLayout>
  );
}