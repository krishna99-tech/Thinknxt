"use client";

import { Suspense } from "react";
import LoginComponent from "./LoginComponent";

export default function Page() {
  return (
    <Suspense fallback={
      <div style={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        minHeight: "100vh",
        background: "linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab)",
        backgroundSize: "400% 400%",
      }}>
        <p style={{ textAlign: "center", color: "white", fontSize: "18px" }}>Loading...</p>
      </div>
    }>
      <LoginComponent />
    </Suspense>
  );
}