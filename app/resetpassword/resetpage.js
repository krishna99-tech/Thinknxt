// pages/resetpage.js
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import { API_BASE } from "./config";

export default function ResetPage() {
  const router = useRouter();
  const { token } = router.query;

  const [validToken, setValidToken] = useState(false);
  const [loading, setLoading] = useState(true);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Validate token by attempting to fetch backend (simulate)
  useEffect(() => {
    if (!token) return;

    const validateToken = async () => {
      try {
        // Some backends have no explicit verify-token endpoint, 
        // so we can attempt a "dry run" or just allow form display
        // Here, we just show the form if token exists
        setValidToken(true);
      } catch (err) {
        setError(err.response?.data?.detail || "Invalid or expired token.");
        setValidToken(false);
      } finally {
        setLoading(false);
      }
    };

    validateToken();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!password || !confirmPassword) {
      setError("Please fill both fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const res = await axios.post(
        `${API_BASE}/reset-password`,
        {
          token,
          new_password: password,
        }
      );
      setMessage(res.data.message || "Password reset successfully. Please login.");
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err.response?.data?.detail || "Something went wrong.");
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <p>Loading...</p>
      </div>
    );
  }

  if (!validToken) {
    return (
      <div style={styles.container}>
        <h1>Invalid or Expired Token</h1>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h1>Reset Password</h1>
      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          type="password"
          placeholder="New Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
        />
        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          style={styles.input}
        />
        <button type="submit" style={styles.button}>
          Reset Password
        </button>
      </form>
      {message && <p style={{ ...styles.message, color: "green" }}>{message}</p>}
      {error && <p style={{ ...styles.message, color: "red" }}>{error}</p>}
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    fontFamily: "Arial, sans-serif",
    padding: "0 20px",
    textAlign: "center",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
    width: "100%",
    maxWidth: "400px",
    marginTop: "20px",
  },
  input: {
    padding: "10px",
    fontSize: "16px",
  },
  button: {
    padding: "10px",
    fontSize: "16px",
    cursor: "pointer",
  },
  message: {
    marginTop: "15px",
    textAlign: "center",
  },
};
