"use client";

import { use, useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import api from "../../../lib/api";
import { getToken, logout } from "../../../lib/auth";

export default function WorkspaceDashboardViewerPage({ params }) {
  const resolvedParams = use(params);
  const dashboardId = resolvedParams.dashboardId;
  const searchParams = useSearchParams();
  const wsId = searchParams.get("ws") || "default";
  const router = useRouter();

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchDashboard = useCallback(async (isSilent = false) => {
    if (!isSilent) setRefreshing(true);
    try {
      const res = await api.get(`/admin/workspaces/${wsId}/dashboards/${dashboardId}`);
      setDashboard(res.data);
      setLastUpdated(new Date());
      setError("");
    } catch (err) {
      if (err.response?.status === 401) {
        logout("/login");
      } else if (err.response?.status === 403) {
        setError("Access Denied: You do not have permission to view dashboards in this workspace.");
      } else if (err.response?.status === 404) {
        setError("Dashboard not found or was removed by the administrator.");
      } else {
        setError(err.response?.data?.detail || "Failed to load dashboard. Please try again.");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [dashboardId, wsId]);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.replace("/login");
      return;
    }
    fetchDashboard(false);
  }, [fetchDashboard, router]);

  // Periodic auto-refresh every 5 seconds for real-time telemetry streaming
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      fetchDashboard(true);
    }, 5000);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchDashboard]);

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          paddingTop: "90px",
          fontFamily: "system-ui, sans-serif",
          color: "#475569",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: "44px",
              height: "44px",
              border: "4px solid #e2e8f0",
              borderTopColor: "#2563eb",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto 16px",
            }}
          />
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
          <p style={{ fontSize: "15px", fontWeight: "600" }}>Connecting to live workspace telemetry...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "#f8fafc",
          padding: "120px 20px 80px",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            maxWidth: "600px",
            margin: "0 auto",
            backgroundColor: "#ffffff",
            padding: "36px",
            borderRadius: "20px",
            border: "1px solid #fee2e2",
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05)",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "40px", marginBottom: "16px" }}>⚠️</div>
          <h2 style={{ fontSize: "20px", fontWeight: "700", color: "#991b1b", margin: "0 0 10px 0" }}>
            Unable to Load Dashboard
          </h2>
          <p style={{ color: "#64748b", fontSize: "14px", lineHeight: "1.6", margin: "0 0 24px 0" }}>
            {error}
          </p>
          <Link
            href="/dashboard"
            style={{
              display: "inline-block",
              padding: "10px 20px",
              borderRadius: "10px",
              backgroundColor: "#2563eb",
              color: "#ffffff",
              fontSize: "14px",
              fontWeight: "600",
              textDecoration: "none",
            }}
          >
            ← Back to Workspaces
          </Link>
        </div>
      </div>
    );
  }

  const widgets = dashboard?.widgets || [];

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f8fafc",
        padding: "110px 20px 80px",
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      <div style={{ maxWidth: "1240px", margin: "0 auto" }}>
        {/* Navigation Breadcrumb */}
        <div style={{ marginBottom: "20px" }}>
          <Link
            href="/dashboard"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              color: "#2563eb",
              textDecoration: "none",
              fontSize: "13px",
              fontWeight: "600",
            }}
          >
            <span>← Back to Workspaces</span>
          </Link>
        </div>

        {/* Dashboard Top Header Banner */}
        <div
          style={{
            background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
            borderRadius: "20px",
            padding: "28px 32px",
            color: "#ffffff",
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
            marginBottom: "28px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "20px",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
              <span
                style={{
                  background: "rgba(37, 99, 235, 0.25)",
                  color: "#93c5fd",
                  border: "1px solid rgba(147, 197, 253, 0.3)",
                  fontSize: "11px",
                  fontWeight: "700",
                  padding: "3px 8px",
                  borderRadius: "6px",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Workspace Dashboard
              </span>
              <span
                style={{
                  background: "rgba(16, 185, 129, 0.2)",
                  color: "#6ee7b7",
                  border: "1px solid rgba(110, 231, 183, 0.3)",
                  fontSize: "11px",
                  fontWeight: "600",
                  padding: "3px 8px",
                  borderRadius: "6px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <span
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    backgroundColor: "#10b981",
                    display: "inline-block",
                  }}
                />
                Live Streaming
              </span>
            </div>

            <h1 style={{ fontSize: "24px", fontWeight: "800", margin: "0 0 6px 0", letterSpacing: "-0.5px" }}>
              {dashboard?.name || "IoT Telemetry Dashboard"}
            </h1>
            <p style={{ color: "#94a3b8", fontSize: "13px", margin: 0, maxWidth: "600px" }}>
              {dashboard?.description || "Real-time telemetry and hardware status monitoring view."}
            </p>
          </div>

          {/* Right Header Controls */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
            {/* Auto Refresh Toggle */}
            <button
              type="button"
              onClick={() => setAutoRefresh(!autoRefresh)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 14px",
                borderRadius: "10px",
                fontSize: "12px",
                fontWeight: "600",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                backgroundColor: autoRefresh ? "rgba(37, 99, 235, 0.3)" : "rgba(255, 255, 255, 0.05)",
                color: "#ffffff",
                cursor: "pointer",
              }}
            >
              <span>{autoRefresh ? "⚡ Auto-refresh (5s)" : "⏸ Paused"}</span>
            </button>

            {/* Manual Refresh Button */}
            <button
              type="button"
              onClick={() => fetchDashboard(false)}
              disabled={refreshing}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 16px",
                borderRadius: "10px",
                fontSize: "12px",
                fontWeight: "600",
                backgroundColor: "#2563eb",
                color: "#ffffff",
                border: "none",
                cursor: "pointer",
                opacity: refreshing ? 0.6 : 1,
              }}
            >
              <span>{refreshing ? "Refreshing..." : "↻ Refresh"}</span>
            </button>
          </div>
        </div>

        {/* View-Only Security Notice */}
        <div
          style={{
            padding: "12px 18px",
            backgroundColor: "#eff6ff",
            borderRadius: "12px",
            border: "1px solid #bfdbfe",
            marginBottom: "24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "10px",
            fontSize: "12px",
            color: "#1e40af",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span>🔒</span>
            <span>
              <strong>Read-Only Mode:</strong> Configured by your workspace administrator. Widgets stream live IoT data.
            </span>
          </div>
          {lastUpdated && (
            <div style={{ color: "#64748b", fontSize: "11px" }}>
              Last updated: {lastUpdated.toLocaleTimeString()}
            </div>
          )}
        </div>

        {/* Widgets Grid */}
        {widgets.length === 0 ? (
          <div
            style={{
              padding: "60px 20px",
              textAlign: "center",
              backgroundColor: "#ffffff",
              borderRadius: "20px",
              border: "1px dashed #cbd5e1",
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
            }}
          >
            <div style={{ fontSize: "36px", marginBottom: "12px" }}>📊</div>
            <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#0f172a", margin: "0 0 6px 0" }}>
              No Widgets Configured Yet
            </h3>
            <p style={{ color: "#64748b", fontSize: "13px", maxWidth: "480px", margin: "0 auto 20px" }}>
              This dashboard is currently empty. When your workspace administrator adds device metrics and gauges in the Admin Console, they will appear here automatically.
            </p>
            <Link
              href="/dashboard"
              style={{
                display: "inline-block",
                padding: "10px 18px",
                borderRadius: "10px",
                backgroundColor: "#f1f5f9",
                color: "#334155",
                fontSize: "13px",
                fontWeight: "600",
                textDecoration: "none",
              }}
            >
              ← Return to Dashboard Overview
            </Link>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
              gap: "20px",
            }}
          >
            {widgets.map((widget, idx) => {
              const widgetId = widget.id || widget._id || idx;
              const title = widget.title || widget.name || widget.config?.title || "Metric Widget";
              const type = (widget.type || "value").toLowerCase();
              const deviceName = widget.device_name || "IoT Sensor";
              const deviceStatus = widget.device_status || "online";
              const rawVal = widget.value !== undefined ? widget.value : (widget.telemetry ? Object.values(widget.telemetry)[0] : "—");
              const cfg = widget.config || {};
              const unit = cfg.unit || cfg.suffix || "";
              const min = cfg.min !== undefined ? cfg.min : 0;
              const max = cfg.max !== undefined ? cfg.max : 100;

              return (
                <div
                  key={widgetId}
                  style={{
                    backgroundColor: "#ffffff",
                    borderRadius: "18px",
                    border: "1px solid #e2e8f0",
                    padding: "24px",
                    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.04)",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    minHeight: "180px",
                  }}
                >
                  {/* Widget Card Top */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px", marginBottom: "16px" }}>
                    <div>
                      <div style={{ fontSize: "15px", fontWeight: "700", color: "#0f172a" }}>
                        {title}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "3px" }}>
                        <span style={{ fontSize: "12px", color: "#64748b" }}>
                          {deviceName}
                        </span>
                        <span
                          style={{
                            fontSize: "10px",
                            fontWeight: "700",
                            padding: "2px 6px",
                            borderRadius: "4px",
                            backgroundColor: deviceStatus === "online" ? "#ecfdf5" : "#f1f5f9",
                            color: deviceStatus === "online" ? "#059669" : "#64748b",
                          }}
                        >
                          {deviceStatus.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: "600",
                        padding: "3px 8px",
                        borderRadius: "6px",
                        backgroundColor: "#f8fafc",
                        border: "1px solid #e2e8f0",
                        color: "#475569",
                        textTransform: "capitalize",
                      }}
                    >
                      {type}
                    </span>
                  </div>

                  {/* Widget Metric Display */}
                  <div style={{ margin: "10px 0" }}>
                    {type === "switch" || type === "toggle" ? (
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div
                          style={{
                            width: "48px",
                            height: "26px",
                            borderRadius: "13px",
                            backgroundColor: Boolean(rawVal && rawVal !== "0" && rawVal !== "false" && rawVal !== "off") ? "#10b981" : "#cbd5e1",
                            padding: "2px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: Boolean(rawVal && rawVal !== "0" && rawVal !== "false" && rawVal !== "off") ? "flex-end" : "flex-start",
                            transition: "all 0.2s ease",
                          }}
                        >
                          <div
                            style={{
                              width: "22px",
                              height: "22px",
                              borderRadius: "50%",
                              backgroundColor: "#ffffff",
                              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.2)",
                            }}
                          />
                        </div>
                        <span style={{ fontSize: "16px", fontWeight: "700", color: "#0f172a" }}>
                          {Boolean(rawVal && rawVal !== "0" && rawVal !== "false" && rawVal !== "off") ? "ACTIVE (ON)" : "INACTIVE (OFF)"}
                        </span>
                      </div>
                    ) : type === "gauge" ? (
                      <div>
                        <div style={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
                          <span style={{ fontSize: "36px", fontWeight: "800", color: "#0f172a" }}>
                            {rawVal !== null && rawVal !== undefined ? rawVal : "0"}
                          </span>
                          {unit && (
                            <span style={{ fontSize: "16px", fontWeight: "600", color: "#64748b" }}>
                              {unit}
                            </span>
                          )}
                        </div>
                        {/* Progress bar gauge representation */}
                        <div
                          style={{
                            width: "100%",
                            height: "8px",
                            borderRadius: "4px",
                            backgroundColor: "#f1f5f9",
                            marginTop: "10px",
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              height: "100%",
                              width: `${Math.min(100, Math.max(0, ((Number(rawVal) - min) / (max - min || 100)) * 100))}%`,
                              backgroundColor: "#2563eb",
                              borderRadius: "4px",
                              transition: "width 0.4s ease",
                            }}
                          />
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", color: "#94a3b8", marginTop: "4px" }}>
                          <span>Min: {min}</span>
                          <span>Max: {max}</span>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div style={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
                          <span style={{ fontSize: "36px", fontWeight: "800", color: "#0f172a" }}>
                            {typeof rawVal === "object" ? JSON.stringify(rawVal) : String(rawVal)}
                          </span>
                          {unit && (
                            <span style={{ fontSize: "16px", fontWeight: "600", color: "#64748b" }}>
                              {unit}
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "4px" }}>
                          Metric Pin / Key: <code style={{ backgroundColor: "#f1f5f9", padding: "2px 4px", borderRadius: "4px", color: "#334155" }}>{cfg.metric || cfg.key || cfg.pin || "telemetry"}</code>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Widget Card Footer */}
                  <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: "12px", marginTop: "14px", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "11px", color: "#94a3b8" }}>
                    <span>Live telemetry stream</span>
                    <span>Verified</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
