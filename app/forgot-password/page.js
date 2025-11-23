"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const API_BASE = "http://192.168.29.139:8000";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ type: "", message: "" });

  const validateEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleForgotPassword = async () => {
    setToast({ type: "", message: "" });

    if (!email.trim())
      return setToast({ type: "error", message: "Please enter email" });

    if (!validateEmail(email))
      return setToast({ type: "error", message: "Invalid email format" });

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email: email.toLowerCase().trim() }), // EXACT format backend needs
      });

      if (!res.ok) throw new Error("Failed to send reset request");

      setToast({ type: "success", message: "Reset link sent! Check your inbox." });

      setTimeout(() => {
        router.push(`/reset-password?email=${email.toLowerCase().trim()}`);
      }, 1200);

    } catch (err) {
      setToast({
        type: "error",
        message: "Failed to send reset email. Try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display:"flex",alignItems:"center",justifyContent:"center",
      minHeight:"100vh",backgroundColor:"#f3f4f6",padding:"20px"
    }}>
      <div style={{
        width:"100%",maxWidth:"420px",background:"#fff",
        padding:"40px",borderRadius:"12px",
        boxShadow:"0px 4px 12px rgba(0,0,0,0.12)",textAlign:"center"
      }}>
        <h1 style={{ fontSize:"26px",fontWeight:"bold" }}>Forgot Password?</h1>
        <p style={{ color:"#666",marginTop:"8px" }}>
          Enter your registered email to receive a reset link.
        </p>

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email address"
          disabled={loading}
          style={{
            width:"100%",marginTop:"20px",padding:"14px",
            borderRadius:"10px",border:"1px solid #ccc",fontSize:"15px"
          }}
        />

        <button
          onClick={handleForgotPassword}
          disabled={loading}
          style={{
            width:"100%",padding:"14px",marginTop:"20px",
            background:"#007aff",color:"#fff",
            borderRadius:"10px",fontWeight:"600",
            opacity:loading?0.6:1,cursor:"pointer",border:"none"
          }}
        >
          {loading ? "Sending..." : "Send Reset Link"}
        </button>

        {toast.message && (
          <div style={{
            marginTop:"15px",padding:"12px",borderRadius:"8px",
            backgroundColor: toast.type === "success" ? "#d1fae5" : "#fee2e2",
            color: toast.type === "success" ? "#065f46" : "#7f1d1d",
            fontWeight:"600",border:"1px solid #ddd"
          }}>
            {toast.type === "success" ? "✓ " : "✗ "}
            {toast.message}
          </div>
        )}

        <button
          onClick={() => router.push("/ResetPasswordComponent")}
          style={{
            marginTop:"18px",background:"none",border:"none",
            cursor:"pointer",color:"#007aff",fontSize:"16px",fontWeight:"600"
          }}
        >
          Back to Login
        </button>
      </div>
    </div>
  );
}
