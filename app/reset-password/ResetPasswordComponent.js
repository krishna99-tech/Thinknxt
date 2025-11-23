"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";

const API_BASE = "http://192.168.29.139:8000";

const styles = {
  container: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    fontFamily:
      "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    padding: "20px",
    backgroundColor: "#f9fafb",
  },
  card: {
    width: "100%",
    maxWidth: "450px",
    backgroundColor: "white",
    borderRadius: "12px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    padding: "40px",
  },
  header: {
    marginBottom: "30px",
    textAlign: "center",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    marginBottom: "20px",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  label: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#374151",
  },
  input: {
    padding: "12px 16px",
    fontSize: "14px",
    borderRadius: "8px",
    border: "1px solid #d1d5db",
    fontFamily: "inherit",
  },
  button: {
    padding: "12px 24px",
    fontSize: "16px",
    fontWeight: "600",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#3b82f6",
    color: "white",
    cursor: "pointer",
  },
  message: {
    padding: "12px 16px",
    borderRadius: "8px",
    border: "1px solid",
    fontSize: "14px",
    marginBottom: "20px",
  },
  link: {
    color: "#3b82f6",
    textDecoration: "none",
    fontWeight: "600",
  },
  loadingSpinner: {
    textAlign: "center",
  },
  spinner: {
    width: "40px",
    height: "40px",
    border: "4px solid #e5e7eb",
    borderTop: "4px solid #3b82f6",
    borderRadius: "50%",
    margin: "0 auto 20px",
    animation: "spin 0.8s linear infinite",
  },
  errorBox: {
    textAlign: "center",
    padding: "40px 30px",
    backgroundColor: "white",
    borderRadius: "12px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
  },
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
      <div style={styles.container}>
        <div style={styles.loadingSpinner}>
          <div style={styles.spinner}></div>
          <p>Verifying reset token...</p>
        </div>
      </div>
    );

  // No token provided
  if (!loading && !token)
    return (
      <div style={styles.container}>
        <div style={styles.errorBox}>
          <h1>⚠️ Missing Token</h1>
          <p>Please request a new reset link.</p>
          <button
            onClick={() => router.push("/forgot-password")}
            style={styles.button}
          >
            Request Reset Link
          </button>
        </div>
      </div>
    );

  // Token invalid or expired
  if (!validToken)
    return (
      <div style={styles.container}>
        <div style={styles.errorBox}>
          <h1>⚠️ Invalid or Expired Token</h1>
          <p>{error}</p>
          <button
            onClick={() => router.push("/forgot-password")}
            style={styles.button}
          >
            Request New Reset Link
          </button>
        </div>
      </div>
    );

  // Main UI Form
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h1>Reset Your Password</h1>
          <p>Enter a new password for your ThingsNXT account</p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>New Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              disabled={isSubmitting}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              style={styles.input}
              disabled={isSubmitting}
            />
          </div>

          <button
            type="submit"
            style={{ ...styles.button, opacity: isSubmitting ? 0.6 : 1 }}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Resetting..." : "Reset Password"}
          </button>
        </form>

        {message && (
          <div
            style={{
              ...styles.message,
              backgroundColor: "#d1fae5",
              color: "#065f46",
            }}
          >
            ✓ {message}
          </div>
        )}

        {error && (
          <div
            style={{
              ...styles.message,
              backgroundColor: "#fee2e2",
              color: "#7f1d1d",
            }}
          >
            ✗ {error}
          </div>
        )}

        <div style={{ textAlign: "center", marginTop: "10px" }}>
          <p>
            Remember your password?{" "}
            <a href="/login" style={styles.link}>
              Login here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
