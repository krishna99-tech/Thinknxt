"use client";

import { Cpu, Wifi, Server, Database, Clock, Radio, CheckCircle2, AlertTriangle } from "../common/Icons";

export default function HardwareNodeBar({
  deviceId = "6ad84a0c622dd2082dd745ae",
  ip = "192.168.0.246",
  rssi = -26,
  uptime = 45,
  freeHeap = 231364,
  lastUpdated,
  status = "online",
}) {
  const signalQuality = rssi >= -50 ? "Excellent" : rssi >= -70 ? "Good" : rssi >= -85 ? "Fair" : "Weak";
  const activeBars = rssi >= -55 ? 4 : rssi >= -70 ? 3 : rssi >= -85 ? 2 : 1;
  const freeHeapKb = Math.round(freeHeap / 1024);

  return (
    <section
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
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "16px",
        transition: "border-color 0.15s ease, box-shadow 0.15s ease",
      }}
    >
      {/* Node Identity */}
      <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
        <div
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "8px",
            backgroundColor: "#FFF7ED",
            border: "1px solid #FFEDD5",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#EA580C",
            flexShrink: 0,
          }}
        >
          <Cpu size={20} />
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <span style={{ fontSize: "14px", fontWeight: "700", color: "#0F172A" }}>
              ESP32 IoT Node
            </span>
            <span
              style={{
                fontFamily: "monospace",
                fontSize: "11px",
                color: "#EA580C",
                backgroundColor: "#FFF7ED",
                padding: "2px 7px",
                borderRadius: "4px",
                border: "1px solid #FFEDD5",
                fontWeight: "600",
              }}
            >
              {deviceId}
            </span>
            <span
              style={{
                fontSize: "10px",
                fontWeight: "700",
                padding: "2px 7px",
                borderRadius: "9999px",
                backgroundColor: status === "online" ? "#ECFDF5" : "#FEF2F2",
                color: status === "online" ? "#059669" : "#DC2626",
                border: status === "online" ? "1px solid #A7F3D0" : "1px solid #FECACA",
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <span
                style={{
                  width: "5px",
                  height: "5px",
                  borderRadius: "50%",
                  backgroundColor: status === "online" ? "#10B981" : "#EF4444",
                }}
              />
              {status.toUpperCase()}
            </span>
          </div>

          <div style={{ fontSize: "11.5px", color: "#64748B", marginTop: "3px" }}>
            MQTT Ingest: <code style={{ color: "#334155", fontFamily: "monospace" }}>thingsnxt/device/{deviceId.slice(0, 8)}.../telemetry</code>
          </div>
        </div>
      </div>

      {/* Hardware Node Metrics */}
      <div style={{ display: "flex", alignItems: "center", gap: "24px", flexWrap: "wrap" }}>
        {/* Wi-Fi RSSI */}
        <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
          <span style={{ fontSize: "11px", fontWeight: "600", color: "#64748B", textTransform: "uppercase", letterSpacing: "0.04em" }}>
            Wi-Fi Signal
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <div style={{ display: "inline-flex", alignItems: "flex-end", gap: "2px", height: "13px" }}>
              <span style={{ width: "3px", height: "4px", borderRadius: "1px", backgroundColor: activeBars >= 1 ? "#10B981" : "#E2E8F0" }} />
              <span style={{ width: "3px", height: "7px", borderRadius: "1px", backgroundColor: activeBars >= 2 ? "#10B981" : "#E2E8F0" }} />
              <span style={{ width: "3px", height: "10px", borderRadius: "1px", backgroundColor: activeBars >= 3 ? "#10B981" : "#E2E8F0" }} />
              <span style={{ width: "3px", height: "13px", borderRadius: "1px", backgroundColor: activeBars >= 4 ? "#10B981" : "#E2E8F0" }} />
            </div>
            <span style={{ fontSize: "12.5px", fontFamily: "monospace", color: "#0F172A", fontWeight: "600" }}>
              {rssi} dBm <span style={{ color: "#64748B", fontSize: "11px", fontWeight: "400" }}>({signalQuality})</span>
            </span>
          </div>
        </div>

        {/* LAN IP */}
        <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
          <span style={{ fontSize: "11px", fontWeight: "600", color: "#64748B", textTransform: "uppercase", letterSpacing: "0.04em" }}>
            Node LAN IP
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <Server size={13} color="#64748B" />
            <span style={{ fontSize: "12.5px", fontFamily: "monospace", color: "#0F172A", fontWeight: "600" }}>
              {ip}
            </span>
          </div>
        </div>

        {/* Free Heap */}
        <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
          <span style={{ fontSize: "11px", fontWeight: "600", color: "#64748B", textTransform: "uppercase", letterSpacing: "0.04em" }}>
            Free RAM Heap
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <Database size={13} color="#0284C7" />
            <span style={{ fontSize: "12.5px", fontFamily: "monospace", color: "#0284C7", fontWeight: "600" }}>
              {freeHeapKb} KB
            </span>
          </div>
        </div>

        {/* Uptime */}
        <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
          <span style={{ fontSize: "11px", fontWeight: "600", color: "#64748B", textTransform: "uppercase", letterSpacing: "0.04em" }}>
            Uptime
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <Clock size={13} color="#64748B" />
            <span style={{ fontSize: "12.5px", fontFamily: "monospace", color: "#0F172A", fontWeight: "600" }}>
              {uptime}s
            </span>
          </div>
        </div>

        {/* Last Ingest */}
        {lastUpdated && (
          <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
            <span style={{ fontSize: "11px", fontWeight: "600", color: "#64748B", textTransform: "uppercase", letterSpacing: "0.04em" }}>
              Last Ingest
            </span>
            <span style={{ fontSize: "12px", fontFamily: "monospace", color: "#64748B" }}>
              {lastUpdated.toLocaleTimeString()}
            </span>
          </div>
        )}
      </div>
    </section>
  );
}
