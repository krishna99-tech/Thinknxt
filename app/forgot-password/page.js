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

    if (!email.trim()) return setToast({ type: "error", message: "Please enter email" });
    if (!validateEmail(email)) return setToast({ type: "error", message: "Invalid email format" });

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email: email.toLowerCase().trim() }),
      });

      if (!res.ok) throw new Error("Failed");

      setToast({ type: "success", message: "Reset code sent! Check your email." });

      setTimeout(() => {
        router.push("/reset-password");
      }, 1500);

    } catch (err) {
      setToast({
        type: "error",
        message: "Failed to send reset request",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display:"flex",alignItems:"center",justifyContent:"center",minHeight:"100vh",backgroundColor:"#f3f4f6",padding:"20px" }}>
      <div style={{ width:"100%",maxWidth:"450px",backgroundColor:"#fff",padding:"40px",borderRadius:"12px",boxShadow:"0px 4px 10px rgba(0,0,0,0.15)",textAlign:"center" }}>
        <h1 style={{ fontSize:"26px",fontWeight:"bold" }}>Forgot Password?</h1>
        <p style={{ color:"#666",marginTop:"8px" }}>Enter your registered email to receive a reset code.</p>

        <input
          type="email"
          style={{ width:"100%",padding:"14px 16px",marginTop:"18px",borderRadius:"10px",border:"1px solid #ccc",fontSize:"15px" }}
          placeholder="Enter your email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
        />

        <button
          style={{ width:"100%",padding:"14px",marginTop:"18px",backgroundColor:"#007aff",color:"white",border:"none",borderRadius:"10px",fontSize:"16px",fontWeight:"600",cursor:"pointer",opacity:loading?0.6:1 }}
          onClick={handleForgotPassword}
          disabled={loading}
        >
          {loading ? "Sending..." : "Send Reset Code"}
        </button>

        {toast.message && (
          <div style={{
            width:"100%",padding:"12px",marginTop:"14px",borderRadius:"8px",fontWeight:"600",
            backgroundColor: toast.type === "success" ? "#d1fae5" : "#fee2e2",
            color: toast.type === "success" ? "#065f46" : "#7f1d1d",
            border: toast.type === "success" ? "1px solid #6ee7b7" : "1px solid #fca5a5"
          }}>
            {toast.type === "success" ? "✓ " : "✗ "}
            {toast.message}
          </div>
        )}

        <button
          style={{ marginTop:"18px",background:"none",border:"none",cursor:"pointer",color:"#007aff",fontSize:"16px",fontWeight:"600" }}
          onClick={() => router.push("/login")}
        >
          Back to Login
        </button>
      </div>
    </div>
  );
}
