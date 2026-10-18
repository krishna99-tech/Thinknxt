"use client";

import React from "react";

// Shared animation styles for auth pages
export const AuthAnimationStyles = () => (
  <style jsx global>{`
    @keyframes gradient {
      0% {
        background-position: 0% 50%;
      }
      50% {
        background-position: 100% 50%;
      }
      100% {
        background-position: 0% 50%;
      }
    }

    @keyframes pulse {
      0%, 100% {
        transform: scale(1);
        opacity: 0.5;
      }
      50% {
        transform: scale(1.2);
        opacity: 0.8;
      }
    }

    @keyframes flow {
      0% {
        transform: translateX(-100%);
        opacity: 0;
      }
      50% {
        opacity: 1;
      }
      100% {
        transform: translateX(100%);
        opacity: 0;
      }
    }

    @keyframes nodePulse {
      0%, 100% {
        transform: scale(1);
        opacity: 0.4;
      }
      50% {
        transform: scale(1.3);
        opacity: 0.8;
      }
    }

    @keyframes serverGlow {
      0%, 100% {
        box-shadow: 0 0 5px rgba(255, 255, 255, 0.3);
      }
      50% {
        box-shadow: 0 0 20px rgba(255, 255, 255, 0.6);
      }
    }

    @keyframes databasePulse {
      0%, 100% {
        transform: scaleY(1);
        opacity: 0.6;
      }
      50% {
        transform: scaleY(1.1);
        opacity: 0.9;
      }
    }

    @keyframes spin {
      0% {
        transform: rotate(0deg);
      }
      100% {
        transform: rotate(360deg);
      }
    }

    .auth-input {
      width: 100%;
      padding: 12px 16px;
      font-size: 14px;
      border-radius: 8px;
      border: 1px solid #d1d5db;
      font-family: inherit;
      background-color: rgba(255, 255, 255, 0.8);
      transition: all 0.3s ease;
      outline: none;
    }

    .auth-input:focus {
      background-color: #ffffff;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
      border-color: #3b82f6;
    }

    .auth-input:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .auth-btn-primary {
      width: 100%;
      padding: 13px 24px;
      font-size: 16px;
      font-weight: 600;
      border-radius: 8px;
      border: none;
      background-color: #3b82f6;
      color: #ffffff;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .auth-btn-primary:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
    }

    .auth-btn-primary:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .auth-toast-success {
      padding: 12px 16px;
      border-radius: 8px;
      border: 1px solid #4ade80;
      font-size: 14px;
      font-weight: 600;
      background-color: #dcfce7;
      color: #14532d;
    }

    .auth-toast-error {
      padding: 12px 16px;
      border-radius: 8px;
      border: 1px solid #ef4444;
      font-size: 14px;
      font-weight: 600;
      background-color: #fee2e2;
      color: #7f1d1d;
    }
  `}</style>
);

// Shared animated backend infrastructure loader
export const BackendLoader = () => {
  const elements = [
    // Servers
    { type: "server", top: "20%", left: "15%", delay: "0s" },
    { type: "server", top: "60%", left: "80%", delay: "1s" },
    { type: "server", top: "80%", left: "25%", delay: "2s" },

    // Databases
    { type: "database", top: "30%", left: "75%", delay: "0.5s" },
    { type: "database", top: "70%", left: "10%", delay: "1.5s" },

    // Connection Lines
    { type: "line", top: "25%", left: "20%", width: "50%", delay: "0s" },
    { type: "line", top: "65%", left: "30%", width: "45%", delay: "1.5s" },
    { type: "line", top: "45%", left: "15%", width: "60%", delay: "0.7s" },

    // Nodes
    { type: "node", top: "25%", left: "50%", delay: "0s" },
    { type: "node", top: "45%", left: "30%", delay: "1s" },
    { type: "node", top: "65%", left: "70%", delay: "2s" },
    { type: "node", top: "35%", left: "85%", delay: "1.5s" },
    { type: "node", top: "75%", left: "45%", delay: "0.5s" },

    // Circles
    { type: "circle", top: "50%", left: "50%", size: "100px", delay: "0s" },
    { type: "circle", top: "30%", left: "30%", size: "150px", delay: "1s" },
    { type: "circle", top: "70%", left: "70%", size: "80px", delay: "0.5s" },
  ];

  const getStyle = (element) => {
    const baseStyles = {
      position: "absolute",
      animationDelay: element.delay,
      pointerEvents: "none",
    };

    switch (element.type) {
      case "server":
        return {
          ...baseStyles,
          top: element.top,
          left: element.left,
          width: "40px",
          height: "20px",
          backgroundColor: "rgba(255, 255, 255, 0.8)",
          borderRadius: "4px",
          animation: "serverGlow 3s ease-in-out infinite",
        };
      case "database":
        return {
          ...baseStyles,
          top: element.top,
          left: element.left,
          width: "30px",
          height: "40px",
          backgroundColor: "rgba(255, 255, 255, 0.7)",
          borderBottomLeftRadius: "15px",
          borderBottomRightRadius: "15px",
          animation: "databasePulse 2.5s ease-in-out infinite",
        };
      case "line":
        return {
          ...baseStyles,
          top: element.top,
          left: element.left,
          width: element.width,
          height: "2px",
          background:
            "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.5), transparent)",
          animation: "flow 3s linear infinite",
        };
      case "node":
        return {
          ...baseStyles,
          top: element.top,
          left: element.left,
          width: "8px",
          height: "8px",
          borderRadius: "50%",
          backgroundColor: "rgba(255, 255, 255, 0.6)",
          animation: "nodePulse 4s ease-in-out infinite",
        };
      case "circle":
        return {
          ...baseStyles,
          top: element.top,
          left: element.left,
          width: element.size,
          height: element.size,
          borderRadius: "50%",
          border: "2px solid rgba(255, 255, 255, 0.3)",
          animation: "pulse 2s ease-in-out infinite",
        };
      default:
        return baseStyles;
    }
  };

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 0,
        opacity: 0.7,
        pointerEvents: "none",
      }}
    >
      {elements.map((element, index) => (
        <div key={index} style={getStyle(element)} />
      ))}
    </div>
  );
};

// Reusable card container
export const AuthCard = ({ children, maxWidth = "450px" }) => (
  <div
    style={{
      width: "100%",
      maxWidth,
      backgroundColor: "rgba(255, 255, 255, 0.95)",
      backdropFilter: "blur(10px)",
      borderRadius: "12px",
      boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
      padding: "40px",
      border: "1px solid rgba(255, 255, 255, 0.2)",
      zIndex: 2,
      position: "relative",
    }}
  >
    {children}
  </div>
);

// Unified Auth Page Wrapper
export default function AuthLayout({ children, maxWidth = "450px" }) {
  return (
    <>
      <AuthAnimationStyles />
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          padding: "20px",
          fontFamily:
            "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          position: "relative",
          overflow: "hidden",
          background:
            "linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab)",
          backgroundSize: "400% 400%",
          animation: "gradient 15s ease infinite",
        }}
      >
        <BackendLoader />
        <AuthCard maxWidth={maxWidth}>{children}</AuthCard>
      </div>
    </>
  );
}
