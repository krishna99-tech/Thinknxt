"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AuthLayout from "../../components/auth/AuthLayout";
import { signup } from "../../lib/auth";
import { getErrorMessage } from "../../lib/api";

export default function GetStartedComponent() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!name.trim() || !email.trim() || !password) {
      return setError("Please fill in all fields.");
    }

    setIsSubmitting(true);

    try {
      await signup({ name, email, password });
      router.push("/login?from=signup");
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          "Could not create account. Please try again."
        )
      );
    } finally {
      setIsSubmitting(false);
    }
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
          Create an Account
        </h1>
        <p style={{ margin: "10px 0 0 0", color: "#6b7280", fontSize: "14px" }}>
          Get started with us today!
        </p>
      </div>

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
            Full Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="auth-input"
            disabled={isSubmitting}
            required
            placeholder="Enter your full name"
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <label
            style={{ fontSize: "14px", fontWeight: "600", color: "#374151" }}
          >
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="auth-input"
            disabled={isSubmitting}
            required
            placeholder="Enter your email"
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
            placeholder="Create a password"
          />
        </div>

        <button
          type="submit"
          className="auth-btn-primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Creating Account..." : "Sign Up"}
        </button>
      </form>

      <div style={{ textAlign: "center", marginTop: "20px", fontSize: "14px" }}>
        <p style={{ margin: 0, color: "#6b7280" }}>
          Already have an account?{" "}
          <Link
            href="/login"
            style={{
              color: "#3b82f6",
              textDecoration: "none",
              fontWeight: "600",
            }}
          >
            Sign In
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}