"use client";

import { Thermometer, Droplets, Gauge, Activity } from "../common/Icons";

export default function SensorTelemetryWidget({
  title = "Sensor Reading",
  deviceName = "ESP32 Node",
  deviceStatus = "online",
  value = "—",
  unit = "",
  min = 0,
  max = 100,
  metricKey = "temp",
  type = "sparkline", // 'sparkline' | 'gauge' | 'numeric'
  history = [20, 22, 21, 25, 24, 28],
  isLiveWs = true,
}) {
  const numericVal = Number(value);
  const percentGauge = !isNaN(numericVal)
    ? Math.min(100, Math.max(0, ((numericVal - min) / (max - min || 100)) * 100))
    : 50;

  // Sparkline SVG coordinates
  const sparkH = 36;
  const sparkW = 240;
  const minH = Math.min(...history);
  const maxH = Math.max(...history) || minH + 1;
  const points = history.map((val, i) => {
    const x = (i / Math.max(1, history.length - 1)) * sparkW;
    const y = sparkH - ((val - minH) / (maxH - minH || 1)) * (sparkH - 8) - 4;
    return `${x},${y}`;
  }).join(" ");

  const isTemp = metricKey.toLowerCase().includes("temp");
  const isHum = metricKey.toLowerCase().includes("hum");

  const IconComponent = isTemp ? Thermometer : isHum ? Droplets : type === "gauge" ? Gauge : Activity;

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
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px", marginBottom: "12px" }}>
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
              backgroundColor: isTemp ? "#FFF7ED" : isHum ? "#F0F9FF" : "#F8FAFC",
              border: `1px solid ${isTemp ? "#FFEDD5" : isHum ? "#E0F2FE" : "#E2E8F0"}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: isTemp ? "#EA580C" : isHum ? "#0284C7" : "#64748B",
              flexShrink: 0,
            }}
          >
            <IconComponent size={16} />
          </div>
        </div>

        {/* Big Numeric Value Display */}
        <div style={{ display: "flex", alignItems: "baseline", gap: "6px", margin: "8px 0" }}>
          <span
            style={{
              fontSize: "32px",
              fontWeight: "800",
              color: "#0F172A",
              fontFamily: "monospace",
              letterSpacing: "-0.03em",
              lineHeight: 1,
            }}
          >
            {typeof value === "object" ? JSON.stringify(value) : String(value)}
          </span>
          {unit && (
            <span
              style={{
                fontSize: "14px",
                fontWeight: "700",
                color: "#64748B",
                fontFamily: "monospace",
              }}
            >
              {unit}
            </span>
          )}
        </div>

        {/* Visual representation: Sparkline or Horizontal Gauge */}
        {type === "gauge" ? (
          <div>
            <div
              style={{
                width: "100%",
                height: "6px",
                borderRadius: "9999px",
                backgroundColor: "#F1F5F9",
                border: "1px solid #E2E8F0",
                overflow: "hidden",
                margin: "10px 0 6px",
              }}
            >
              <div
                style={{
                  width: `${percentGauge}%`,
                  height: "100%",
                  backgroundColor: percentGauge > 80 ? "#DC2626" : percentGauge > 60 ? "#F97316" : "#10B981",
                  borderRadius: "9999px",
                  transition: "width 0.3s ease",
                }}
              />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10.5px", color: "#64748B", fontFamily: "monospace" }}>
              <span>{min}{unit}</span>
              <span style={{ color: "#0F172A", fontWeight: "600" }}>{Math.round(percentGauge)}%</span>
              <span>{max}{unit}</span>
            </div>
          </div>
        ) : (
          <div style={{ width: "100%", height: "36px", margin: "6px 0" }}>
            <svg width="100%" height="36" viewBox={`0 0 ${sparkW} ${sparkH}`} preserveAspectRatio="none">
              <defs>
                <linearGradient id={`grad_${title.replace(/\s+/g, "_")}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F97316" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#F97316" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <polygon points={`0,${sparkH} ${points} ${sparkW},${sparkH}`} fill={`url(#grad_${title.replace(/\s+/g, "_")})`} />
              <polyline
                fill="none"
                stroke="#F97316"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={points}
              />
            </svg>
          </div>
        )}
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
              backgroundColor: isLiveWs ? "#10B981" : "#F59E0B",
            }}
          />
          {isLiveWs ? "Fastify Live" : "Polling"}
        </span>
        <span style={{ color: "#64748B" }}>Key: {metricKey}</span>
      </div>
    </div>
  );
}
