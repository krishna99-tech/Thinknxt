"use client";

import { useState, useEffect } from "react";
import { Zap, Sliders, Radio, Cpu } from "../common/Icons";

export default function InteractiveSwitchWidget({
  title = "Actuator Control",
  deviceName = "ESP32 Relay",
  deviceStatus = "online",
  pin = "v0",
  initialState = 0,
  onToggle,
  isSending = false,
}) {
  const [isOn, setIsOn] = useState(Boolean(initialState && initialState !== "0" && initialState !== "off" && initialState !== 0));

  useEffect(() => {
    setIsOn(Boolean(initialState && initialState !== "0" && initialState !== "off" && initialState !== 0));
  }, [initialState]);

  const handleToggle = async () => {
    if (isSending) return;
    const nextState = !isOn;
    setIsOn(nextState);
    if (onToggle) {
      await onToggle(nextState ? 1 : 0);
    }
  };

  return (
    <div
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "#CBD5E1";
        e.currentTarget.style.boxShadow = "0 4px 14px rgba(15, 23, 42, 0.07)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "#E2E8F0";
        e.currentTarget.style.boxShadow = "0 2px 8px rgba(15, 23, 42, 0.04)";
      }}
      style={{
        backgroundColor: "#FFFFFF",
        border: "1px solid #E2E8F0",
        borderRadius: "12px",
        padding: "20px 24px",
        boxShadow: "0 2px 8px rgba(15, 23, 42, 0.04)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        minHeight: "190px",
        transition: "border-color 0.15s ease, box-shadow 0.15s ease",
      }}
    >
      <div>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px", marginBottom: "14px" }}>
          <div>
            <div style={{ fontSize: "14.5px", fontWeight: "700", color: "#334155" }}>{title}</div>
            <div style={{ fontSize: "11.5px", color: "#64748B", display: "flex", alignItems: "center", gap: "6px", marginTop: "3px" }}>
              <span>{deviceName}</span>
              <span style={{ color: "#CBD5E1" }}>•</span>
              <span
                style={{
                  color: deviceStatus === "online" ? "#059669" : "#DC2626",
                  fontWeight: "600",
                  fontFamily: "monospace",
                }}
              >
                {deviceStatus.toUpperCase()}
              </span>
            </div>
          </div>

          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "6px",
              backgroundColor: "#FFF7ED",
              border: "1px solid #FFEDD5",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#EA580C",
              flexShrink: 0,
            }}
          >
            <Zap size={16} />
          </div>
        </div>

        {/* Actuator State & Toggle Switch Box */}
        <div
          style={{
            padding: "14px 16px",
            borderRadius: "8px",
            backgroundColor: "#F8FAFC",
            border: "1px solid #E2E8F0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            margin: "10px 0",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span
              style={{
                fontSize: "12px",
                fontWeight: "700",
                fontFamily: "monospace",
                color: isOn ? "#059669" : "#64748B",
              }}
            >
              {isOn ? "STATE: HIGH (1)" : "STATE: LOW (0)"}
            </span>
            <span style={{ fontSize: "11px", color: "#64748B", marginTop: "2px", fontFamily: "monospace" }}>
              Pin: {pin.toUpperCase()}
            </span>
          </div>

          <button
            type="button"
            disabled={isSending}
            onClick={handleToggle}
            style={{
              width: "50px",
              height: "28px",
              borderRadius: "9999px",
              padding: "3px",
              cursor: isSending ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              backgroundColor: isOn ? "#F97316" : "#E2E8F0",
              border: `1px solid ${isOn ? "#EA580C" : "#CBD5E1"}`,
              justifyContent: isOn ? "flex-end" : "flex-start",
              transition: "all 0.2s ease",
              opacity: isSending ? 0.6 : 1,
            }}
            title={isOn ? "Click to set LOW (OFF)" : "Click to set HIGH (ON)"}
          >
            <div
              style={{
                width: "20px",
                height: "20px",
                borderRadius: "50%",
                backgroundColor: "#FFFFFF",
                boxShadow: "0 1px 3px rgba(15, 23, 42, 0.2)",
              }}
            />
          </button>
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          borderTop: "1px solid #F1F5F9",
          paddingTop: "10px",
          marginTop: "6px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: "11px",
          color: "#94A3B8",
          fontFamily: "monospace",
        }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
          <span
            style={{
              width: "5px",
              height: "5px",
              borderRadius: "50%",
              backgroundColor: deviceStatus === "online" ? "#10B981" : "#EF4444",
            }}
          />
          {isSending ? "Dispatching..." : "Hardware Downlink Ready"}
        </span>
        <span style={{ color: "#64748B" }}>{pin}</span>
      </div>
    </div>
  );
}
