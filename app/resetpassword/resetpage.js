'use client';

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";

const API_BASE = "http://localhost:8000";

export default function ResetPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [validToken, setValidToken] = useState(false);
  const [loading, setLoading] = useState(true);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validate token on component mount
  useEffect(() => {
    if (!token) {
      setError("Invalid or missing reset token.");
      setValidToken(false);
      setLoading(false);
      return;
    }

    const validateToken = async () => {
      try {
        const res = await axios.get(
          `${API_BASE}/verify-reset-token?token=${token}`,
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
        
        if (res.status === 200) {
          setValidToken(true);
          setError("");
        }
      } catch (err) {
        console.error("Token validation error:", err);
        setError(
          err.response?.data?.detail || 
          err.response?.data?.message ||
          "Invalid or expired reset token. Please request a new password reset."
        );
        setValidToken(false);
      } finally {
        setLoading(false);
      }
    };

    validateToken();
  }, [token]);

  const validatePassword = (pwd) => {
    // Password requirements: min 8 chars, at least one uppercase, one lowercase, one number
    const minLength = pwd.length >= 8;
    const hasUpperCase = /[A-Z]/.test(pwd);
    const hasLowerCase = /[a-z]/.test(pwd);
    const hasNumbers = /\d/.test(pwd);
    
    return minLength && hasUpperCase && hasLowerCase && hasNumbers;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    // Validation
    if (!password || !confirmPassword) {
      setError("Please fill in both password fields.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (!validatePassword(password)) {
      setError("Password must contain uppercase, lowercase, numbers, and be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await axios.post(
        `${API_BASE}/reset-password`,
        {
          token: token,
          new_password: password,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      setMessage(
        res.data.message || 
        "Password reset successfully! Redirecting to login..."
      );
      setPassword("");
      setConfirmPassword("");

      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push("/login");
      }, 2000);

    } catch (err) {
      console.error("Reset password error:", err);
      const errorMessage = 
        err.response?.data?.detail || 
        err.response?.data?.message ||
        err.message ||
        "Failed to reset password. Please try again or contact support.";
      
      setError(errorMessage);
      
      // If token is invalid/expired, show link to request new token
      if (err.response?.status === 400 || err.response?.status === 401) {
        setError(errorMessage + " Please request a new password reset.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingSpinner}>
          <div style={styles.spinner}></div>
          <p>Verifying reset token...</p>
        </div>
      </div>
    );
  }

  if (!validToken) {
    return (
      <div style={styles.container}>
        <div style={styles.errorBox}>
          <h1>⚠️ Invalid or Expired Token</h1>
          <p>{error}</p>
          <button 
            onClick={() => router.push("/forgot-password")}
            style={styles.button}
          >
            Request New Password Reset
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h1>Reset Your Password</h1>
          <p>Enter a new password for your ThingsNXT account</p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label htmlFor="password" style={styles.label}>
              New Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="Enter new password (min 8 chars, uppercase, lowercase, numbers)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              disabled={isSubmitting}
              autoComplete="new-password"
            />
          </div>

          <div style={styles.formGroup}>
            <label htmlFor="confirmPassword" style={styles.label}>
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              placeholder="Confirm your new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              style={styles.input}
              disabled={isSubmitting}
              autoComplete="new-password"
            />
          </div>

          {password && (
            <div style={styles.passwordStrength}>
              <p style={styles.strengthLabel}>Password Requirements:</p>
              <ul style={styles.requirementsList}>
                <li style={{ color: password.length >= 8 ? '#10b981' : '#ef4444' }}>
                  {password.length >= 8 ? '✓' : '✗'} At least 8 characters
                </li>
                <li style={{ color: /[A-Z]/.test(password) ? '#10b981' : '#ef4444' }}>
                  {/[A-Z]/.test(password) ? '✓' : '✗'} One uppercase letter
                </li>
                <li style={{ color: /[a-z]/.test(password) ? '#10b981' : '#ef4444' }}>
                  {/[a-z]/.test(password) ? '✓' : '✗'} One lowercase letter
                </li>
                <li style={{ color: /\d/.test(password) ? '#10b981' : '#ef4444' }}>
                  {/\d/.test(password) ? '✓' : '✗'} One number
                </li>
              </ul>
            </div>
          )}

          <button 
            type="submit" 
            style={{
              ...styles.button,
              opacity: isSubmitting ? 0.6 : 1,
              cursor: isSubmitting ? 'not-allowed' : 'pointer'
            }}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Resetting Password...' : 'Reset Password'}
          </button>
        </form>

        {message && (
          <div style={{ ...styles.message, backgroundColor: '#d1fae5', color: '#065f46', borderColor: '#6ee7b7' }}>
            ✓ {message}
          </div>
        )}
        {error && (
          <div style={{ ...styles.message, backgroundColor: '#fee2e2', color: '#7f1d1d', borderColor: '#fca5a5' }}>
            ✗ {error}
          </div>
        )}

        <div style={styles.footer}>
          <p>Remember your password? <a href="/login" style={styles.link}>Login here</a></p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
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
    marginBottom: "4px",
  },
  input: {
    padding: "12px 16px",
    fontSize: "14px",
    borderRadius: "8px",
    border: "1px solid #d1d5db",
    fontFamily: "inherit",
    transition: "border-color 0.2s, box-shadow 0.2s",
    outline: "none",
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
    transition: "background-color 0.2s",
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
  footer: {
    textAlign: "center",
    fontSize: "14px",
    color: "#6b7280",
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
  passwordStrength: {
    backgroundColor: "#f3f4f6",
    padding: "12px 16px",
    borderRadius: "8px",
    fontSize: "14px",
  },
  strengthLabel: {
    fontWeight: "600",
    color: "#374151",
    marginBottom: "8px",
  },
  requirementsList: {
    listStyle: "none",
    padding: 0,
    margin: 0,
  },
};
