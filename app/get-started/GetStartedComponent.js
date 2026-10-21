"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AuthLayout from "../../components/auth/AuthLayout";
import { signup } from "../../lib/auth";
import { getErrorMessage } from "../../lib/api";

// Clean inline SVG Icons (no external icon dependencies required)
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

const CheckIcon = ({ size = 14, color = "#16a34a" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ display: "inline-block", verticalAlign: "middle", flexShrink: 0 }}
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export default function GetStartedComponent() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  // Password requirement checks (matching backend validation)
  const reqLength = password.length >= 8 && password.length <= 72;
  const reqLower = /[a-z]/.test(password);
  const reqUpper = /[A-Z]/.test(password);
  const reqDigit = /[0-9]/.test(password);
  const allReqsMet = reqLength && reqLower && reqUpper && reqDigit;

  // Confirm password match check
  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;
  const passwordsMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      return setError("Please fill in all fields.");
    }

    if (password.length < 8) {
      return setError("Password must be at least 8 characters long.");
    }

    if (password.length > 72) {
      return setError("Password must be at most 72 characters long.");
    }

    if (!reqLower) {
      return setError("Password must contain at least one lowercase letter.");
    }

    if (!reqUpper) {
      return setError("Password must contain at least one uppercase letter.");
    }

    if (!reqDigit) {
      return setError("Password must contain at least one number.");
    }

    if (password !== confirmPassword) {
      return setError("Passwords do not match. Please verify your confirm password.");
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
    <AuthLayout maxWidth="480px">
      <div style={{ marginBottom: "26px", textAlign: "center" }}>
        <h1
          style={{
            margin: 0,
            fontSize: "1.875rem",
            color: "#1f2937",
            fontWeight: "700",
            letterSpacing: "-0.025em",
          }}
        >
          Create an Account
        </h1>
        <p style={{ margin: "8px 0 0 0", color: "#6b7280", fontSize: "14px" }}>
          Get started with us today!
        </p>
      </div>

      {error && (
        <div className="auth-toast-error" style={{ marginBottom: "18px" }}>
          ✗ {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "18px",
          marginBottom: "20px",
        }}
      >
        {/* Full Name */}
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <label
            htmlFor="full-name-input"
            style={{ fontSize: "14px", fontWeight: "600", color: "#374151" }}
          >
            Full Name
          </label>
          <input
            id="full-name-input"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="auth-input"
            disabled={isSubmitting}
            required
            placeholder="Enter your full name"
            autoComplete="name"
          />
        </div>

        {/* Email */}
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <label
            htmlFor="email-input"
            style={{ fontSize: "14px", fontWeight: "600", color: "#374151" }}
          >
            Email
          </label>
          <input
            id="email-input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="auth-input"
            disabled={isSubmitting}
            required
            placeholder="Enter your email"
            autoComplete="email"
          />
        </div>

        {/* Password */}
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <label
              htmlFor="password-input"
              style={{ fontSize: "14px", fontWeight: "600", color: "#374151" }}
            >
              Password
            </label>
            {password.length > 0 && (
              <span
                style={{
                  fontSize: "12px",
                  fontWeight: "600",
                  color: allReqsMet ? "#16a34a" : "#ea580c",
                }}
              >
                {allReqsMet ? "Strong password" : `${password.length}/8 min chars`}
              </span>
            )}
          </div>
          <div style={{ position: "relative", width: "100%" }}>
            <input
              id="password-input"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setPasswordFocused(true)}
              className="auth-input"
              disabled={isSubmitting}
              required
              placeholder="Create a password (min. 8 characters)"
              autoComplete="new-password"
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

          {/* Password Requirements Guide */}
          {(passwordFocused || password.length > 0) && (
            <div
              style={{
                marginTop: "6px",
                padding: "10px 12px",
                background: "#f9fafb",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                fontSize: "12px",
                color: "#4b5563",
              }}
            >
              <div style={{ fontWeight: "600", marginBottom: "6px", color: "#374151" }}>
                Password Requirements:
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "6px 12px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    color: reqLength ? "#16a34a" : "#6b7280",
                    fontWeight: reqLength ? "600" : "400",
                  }}
                >
                  {reqLength ? (
                    <CheckIcon />
                  ) : (
                    <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: "#9ca3af" }} />
                  )}
                  <span>At least 8 characters</span>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    color: reqUpper ? "#16a34a" : "#6b7280",
                    fontWeight: reqUpper ? "600" : "400",
                  }}
                >
                  {reqUpper ? (
                    <CheckIcon />
                  ) : (
                    <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: "#9ca3af" }} />
                  )}
                  <span>One uppercase (A-Z)</span>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    color: reqLower ? "#16a34a" : "#6b7280",
                    fontWeight: reqLower ? "600" : "400",
                  }}
                >
                  {reqLower ? (
                    <CheckIcon />
                  ) : (
                    <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: "#9ca3af" }} />
                  )}
                  <span>One lowercase (a-z)</span>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    color: reqDigit ? "#16a34a" : "#6b7280",
                    fontWeight: reqDigit ? "600" : "400",
                  }}
                >
                  {reqDigit ? (
                    <CheckIcon />
                  ) : (
                    <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: "#9ca3af" }} />
                  )}
                  <span>At least one number</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <label
              htmlFor="confirm-password-input"
              style={{ fontSize: "14px", fontWeight: "600", color: "#374151" }}
            >
              Confirm Password
            </label>
            {confirmPassword.length > 0 && (
              <span
                style={{
                  fontSize: "12px",
                  fontWeight: "600",
                  color: passwordsMatch ? "#16a34a" : "#dc2626",
                }}
              >
                {passwordsMatch ? "✓ Passwords match" : "✗ Passwords do not match"}
              </span>
            )}
          </div>
          <div style={{ position: "relative", width: "100%" }}>
            <input
              id="confirm-password-input"
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="auth-input"
              disabled={isSubmitting}
              required
              placeholder="Re-enter your password"
              autoComplete="new-password"
              style={{
                paddingRight: "44px",
                borderColor: passwordsMismatch
                  ? "#ef4444"
                  : passwordsMatch
                  ? "#22c55e"
                  : undefined,
              }}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
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
              {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="auth-btn-primary"
          disabled={isSubmitting}
          style={{ marginTop: "4px" }}
        >
          {isSubmitting ? "Creating Account..." : "Sign Up"}
        </button>
      </form>

      {/* Sign In Link */}
      <div style={{ textAlign: "center", marginTop: "16px", fontSize: "14px" }}>
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