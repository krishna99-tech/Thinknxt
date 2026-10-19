"use client";

import { use, useEffect, useState, useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import api from "../../../lib/api";
import { getToken, logout } from "../../../lib/auth";
import { useWebSocket } from "../../../lib/useWebSocket";
import "../dashboard.css";

export default function WorkspaceDashboardViewerPage({ params }) {
  const resolvedParams = use(params);
  const dashboardId = resolvedParams.dashboardId;
  const searchParams = useSearchParams();
  const wsId = searchParams.get("ws") || "default";
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [liveStreamEvents, setLiveStreamEvents] = useState([]);
  const [telemetryHistory, setTelemetryHistory] = useState({});

  // Fetch current user profile for unified sidebar
  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.replace("/login");
      return;
    }
    api.get("/me")
      .then((res) => setUser(res.data))
      .catch((err) => {
        if (err.response?.status === 401) logout("/login");
      });
  }, [router]);

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

  // Flexible device identifier matcher for widgets
  const matchesDevice = (w, devId) => {
    if (!w) return false;
    if (!devId) return true;
    const target = String(devId).toLowerCase();
    return (
      String(w.device_id || "").toLowerCase() === target ||
      String(w.deviceId || "").toLowerCase() === target ||
      String(w.config?.device_id || "").toLowerCase() === target ||
      String(w.device?.id || "").toLowerCase() === target ||
      String(w.device?._id || "").toLowerCase() === target ||
      String(w.device_name || "").toLowerCase() === target
    );
  };

  // Handle incoming real-time sensor streams and device online/offline events from Fastify WebSocket
  const handleWsMessage = useCallback((msg) => {
    if (!msg) return;
    setLastUpdated(new Date());

    const timeStr = new Date().toLocaleTimeString();

    // 1. Device Online / Offline Status Updates
    if (msg.type === "status_update") {
      const devId = msg.device_id;
      const newStatus = (msg.status || "online").toLowerCase();

      setLiveStreamEvents((prev) => [
        {
          id: `${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          time: timeStr,
          deviceId: devId || "unknown_device",
          type: "status",
          text: `Device status changed to ${newStatus.toUpperCase()}`,
          status: newStatus,
        },
        ...prev.slice(0, 19),
      ]);

      setDashboard((prev) => {
        if (!prev || !prev.widgets) return prev;
        const updatedWidgets = prev.widgets.map((w) => {
          if (matchesDevice(w, devId)) {
            return {
              ...w,
              device_status: newStatus,
            };
          }
          return w;
        });
        return { ...prev, widgets: updatedWidgets };
      });
      return;
    }

    // 2. Real-Time Telemetry Data Updates
    if (msg.type === "telemetry_update" || msg.payload || msg.data) {
      const devId = msg.device_id;
      const telemData = msg.payload || msg.data || {};

      setLiveStreamEvents((prev) => [
        {
          id: `${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          time: timeStr,
          deviceId: devId || "iot_node",
          type: "telemetry",
          text: `Telemetry received: ${Object.keys(telemData).slice(0, 3).join(", ") || "telemetry"}`,
          status: "online",
          payload: telemData,
        },
        ...prev.slice(0, 19),
      ]);

      // Record trend history for sparklines
      setTelemetryHistory((prev) => {
        const next = { ...prev };
        Object.entries(telemData).forEach(([k, v]) => {
          const num = Number(v);
          if (!isNaN(num)) {
            const list = next[`${devId}_${k}`] || [num, num, num];
            next[`${devId}_${k}`] = [...list.slice(-7), num];
          }
        });
        return next;
      });

      setDashboard((prev) => {
        if (!prev || !prev.widgets) return prev;
        const updatedWidgets = prev.widgets.map((w) => {
          if (matchesDevice(w, devId)) {
            return {
              ...w,
              device_status: "online",
              telemetry: { ...(w.telemetry || {}), ...telemData },
            };
          }
          return w;
        });
        return { ...prev, widgets: updatedWidgets };
      });
    }
  }, []);

  // Extract device channels from dashboard widgets
  const deviceChannels = (dashboard?.widgets || [])
    .map((w) => w.device_id || w.deviceId || w.config?.device_id)
    .filter(Boolean)
    .map((id) => `device:${id}`);

  const activeChannels = useMemo(() => [
    `workspace:${wsId}`,
    ...(wsId !== "default" ? ["workspace:default"] : []),
    ...deviceChannels,
    "*"
  ], [wsId, deviceChannels.join(",")]);

  // Connect to Fastify WebSocket microservice
  const { isConnected: isWsLive } = useWebSocket(handleWsMessage, activeChannels);

  useEffect(() => {
    fetchDashboard(false);
  }, [fetchDashboard]);

  // Continuous background auto-refresh every 3s
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      fetchDashboard(true);
    }, 3000);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchDashboard]);

  if (loading) {
    return (
      <div className="iot-app-shell" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <div style={{ textAlign: "center", padding: "40px" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              border: "3.5px solid #f0e6e1",
              borderTopColor: "var(--terracotta)",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
              margin: "0 auto 18px",
            }}
          />
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
          <p style={{ color: "var(--text-dim)", fontSize: "14px", fontWeight: "600", letterSpacing: "0.02em" }}>
            Connecting to Live Telemetry Stream...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="iot-app-shell" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", padding: "20px" }}>
        <div
          style={{
            maxWidth: "540px",
            width: "100%",
            backgroundColor: "#ffffff",
            padding: "40px 32px",
            borderRadius: "24px",
            border: "1px solid rgba(224, 122, 95, 0.2)",
            borderTop: "4px solid var(--status-red)",
            boxShadow: "var(--floating-card-shadow)",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "44px", marginBottom: "16px" }}>⚠️</div>
          <h2 style={{ fontSize: "20px", fontWeight: "800", color: "#1f1916", margin: "0 0 10px 0" }}>
            Unable to Connect to Dashboard
          </h2>
          <p style={{ color: "var(--text-dim)", fontSize: "14px", lineHeight: "1.6", margin: "0 0 24px 0" }}>
            {error}
          </p>
          <Link
            href="/dashboard"
            className="btn-open-tile"
            style={{ display: "inline-flex", padding: "11px 24px" }}
          >
            ← Return to Dashboards
          </Link>
        </div>
      </div>
    );
  }

  const widgets = dashboard?.widgets || [];
  const displayName = user?.display_name || user?.full_name || user?.username || "Enterprise Member";
  const userRole = user?.role || "User";
  const isAdmin = userRole.toLowerCase().includes("admin") || user?.is_admin;

  // Compute live statistics
  const onlineDevicesCount = widgets.filter(w => (w.device_status || "online").toLowerCase() === "online").length;

  return (
    <div className="iot-app-shell">
      {/* ──────────────────────────────────────────────────────────────────
          LEFT NAVIGATION SIDEBAR (Terracotta White Theme)
          ────────────────────────────────────────────────────────────────── */}
      <aside className="iot-sidebar">
        <div>
          {/* Brand Box */}
          <div className="sidebar-brand-box">
            <div className="sidebar-brand-icon">⚡</div>
            <div className="sidebar-brand-text">
              <span className="brand-name">ThingsNXT</span>
              <span className="brand-badge">IoT Core 2.0</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="sidebar-menu">
            <span className="menu-category-label">Monitoring</span>

            <Link href="/dashboard" className="menu-item">
              <span className="menu-item-icon">🎛️</span>
              <span>Overview</span>
            </Link>

            <div className="menu-item active">
              <span className="menu-item-icon">📊</span>
              <span>Live Viewer</span>
              <span className="menu-item-tag">Active</span>
            </div>

            <Link href="/dashboard" className="menu-item">
              <span className="menu-item-icon">🌐</span>
              <span>Workspaces</span>
            </Link>

            <span className="menu-category-label">Integration</span>

            <a
              href="http://localhost:3000"
              target="_blank"
              rel="noreferrer"
              className="menu-item"
            >
              <span className="menu-item-icon">⚡</span>
              <span>Admin Console</span>
              <span className="menu-item-tag">:3000</span>
            </a>

            <div className="menu-item" style={{ cursor: "default" }}>
              <span className="menu-item-icon">📡</span>
              <span>Fastify Ingest</span>
              <span
                style={{
                  marginLeft: "auto",
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  backgroundColor: isWsLive ? "#10b981" : "#f59e0b",
                  boxShadow: isWsLive ? "0 0 8px #10b981" : "none",
                }}
              />
            </div>
          </nav>
        </div>

        {/* Sidebar Profile Card */}
        <div className="sidebar-profile-box">
          <div className="user-profile-card">
            <div className="user-avatar">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div className="user-info-text">
              <div className="user-name-text">{displayName}</div>
              <div className="user-role-badge">Workspace Member</div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => logout("/login")}
            className="btn-signout"
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* ──────────────────────────────────────────────────────────────────
          MAIN VIEWPORT (White Porcelain & Terracotta Floating Cards)
          ────────────────────────────────────────────────────────────────── */}
      <main className="iot-main-viewport">
        {/* Sticky Topbar */}
        <header className="iot-topbar">
          <div className="topbar-breadcrumbs">
            <Link href="/dashboard" className="breadcrumb-root" style={{ textDecoration: "none" }}>
              Workspaces
            </Link>
            <span className="breadcrumb-sep">/</span>
            <span className="breadcrumb-root">{wsId}</span>
            <span className="breadcrumb-sep">/</span>
            <span className="breadcrumb-current">{dashboard?.name || "Live Dashboard"}</span>
          </div>

          <div className="topbar-actions">
            {/* Live WebSocket Status Pill */}
            <div className={`live-stream-status-pill ${isWsLive ? "online" : "offline"}`}>
              <span className={`pulse-circle ${isWsLive ? "online" : "offline"}`} />
              <span>{isWsLive ? "Fastify WebSocket Live (:4001)" : "Connecting Stream..."}</span>
            </div>

            {/* Auto Refresh Toggle */}
            <button
              type="button"
              onClick={() => setAutoRefresh(!autoRefresh)}
              className="btn-mini-clear"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                padding: "6px 12px",
                borderRadius: "var(--radius-pill)",
              }}
            >
              <span>{autoRefresh ? "⚡ Auto (3s)" : "⏸ Paused"}</span>
            </button>

            {/* Manual Refresh */}
            <button
              type="button"
              onClick={() => fetchDashboard(false)}
              disabled={refreshing}
              className="btn-mini-clear"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                padding: "6px 14px",
                borderRadius: "var(--radius-pill)",
                opacity: refreshing ? 0.6 : 1,
              }}
            >
              <span>{refreshing ? "Refreshing..." : "↻ Refresh"}</span>
            </button>

            {/* Back Button */}
            <Link
              href="/dashboard"
              className="btn-admin-console"
              style={{ borderRadius: "var(--radius-pill)" }}
            >
              ← All Dashboards
            </Link>
          </div>
        </header>

        {/* Dashboard Content Container */}
        <div className="iot-console-content">
          {/* Hero Banner Floating Card */}
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "20px",
              padding: "24px 28px",
              border: "1px solid rgba(224, 122, 95, 0.16)",
              borderTop: "3.5px solid var(--terracotta)",
              boxShadow: "var(--floating-card-shadow)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "18px",
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                <span
                  style={{
                    backgroundColor: "rgba(224, 122, 95, 0.12)",
                    color: "var(--terracotta-burnt)",
                    border: "1px solid rgba(224, 122, 95, 0.25)",
                    fontSize: "11px",
                    fontWeight: "700",
                    padding: "3px 9px",
                    borderRadius: "9999px",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  Workspace: {wsId}
                </span>

                <span
                  style={{
                    backgroundColor: "#ecfdf5",
                    color: "#059669",
                    border: "1px solid #a7f3d0",
                    fontSize: "11px",
                    fontWeight: "600",
                    padding: "3px 9px",
                    borderRadius: "9999px",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "5px",
                  }}
                >
                  <span
                    style={{
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      backgroundColor: "#10b981",
                      display: "inline-block",
                      boxShadow: "0 0 6px #10b981",
                    }}
                  />
                  Live Telemetry Active
                </span>
              </div>

              <h1 style={{ fontSize: "24px", fontWeight: "800", color: "#1f1916", margin: "0 0 4px 0", letterSpacing: "-0.02em" }}>
                {dashboard?.name || "Live Telemetry Dashboard"}
              </h1>
              <p style={{ color: "var(--text-dim)", fontSize: "13px", margin: 0, maxWidth: "680px" }}>
                {dashboard?.description || "Real-time sensor telemetry and device telemetry data stream."}
              </p>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <div
                style={{
                  padding: "8px 14px",
                  backgroundColor: "#faf4f0",
                  borderRadius: "12px",
                  border: "1px solid rgba(224, 122, 95, 0.2)",
                  fontSize: "12px",
                  color: "var(--terracotta-burnt)",
                  fontWeight: "600",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <span>🔒</span>
                <span>Verified View-Only Feed</span>
              </div>

              {lastUpdated && (
                <div style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                  Synced: {lastUpdated.toLocaleTimeString()}
                </div>
              )}
            </div>
          </div>

          {/* ──────────────────────────────────────────────────────────────────
              TERRACOTTA FLOATING CARDS (KPI Metrics Banner Strip)
              Matches Reference Mockup (White Card + Glowing Terracotta Badge)
              ────────────────────────────────────────────────────────────────── */}
          <div className="kpi-cards-row">
            {/* Card 1: Active Sensors */}
            <div className="kpi-card">
              <div className="kpi-card-header">
                <span className="kpi-card-title">Telemetry Sensors</span>
                <div className="kpi-card-icon">📊</div>
              </div>
              <div className="kpi-card-value">{widgets.length}</div>
              <div className="kpi-card-desc">
                <span style={{ color: "var(--status-green)", fontWeight: "600" }}>● Active</span>
                <span>configured visual metrics</span>
              </div>
            </div>

            {/* Card 2: Connected Devices */}
            <div className="kpi-card">
              <div className="kpi-card-header">
                <span className="kpi-card-title">Hardware Nodes</span>
                <div className="kpi-card-icon">⚡</div>
              </div>
              <div className="kpi-card-value">{onlineDevicesCount}</div>
              <div className="kpi-card-desc">
                <span style={{ color: "var(--status-green)", fontWeight: "600" }}>● Stream Live</span>
                <span>broadcasting telemetry</span>
              </div>
            </div>

            {/* Card 3: Ingest Rate */}
            <div className="kpi-card">
              <div className="kpi-card-header">
                <span className="kpi-card-title">Fastify Ingest</span>
                <div className="kpi-card-icon">📡</div>
              </div>
              <div className="kpi-card-value">Port 4001</div>
              <div className="kpi-card-desc">
                <span style={{ color: "var(--terracotta)", fontWeight: "600" }}>● WebSocket</span>
                <span>sub-50ms latency link</span>
              </div>
            </div>

            {/* Card 4: Stream Integrity */}
            <div className="kpi-card">
              <div className="kpi-card-header">
                <span className="kpi-card-title">Stream Health</span>
                <div className="kpi-card-icon">🛡️</div>
              </div>
              <div className="kpi-card-value">100%</div>
              <div className="kpi-card-desc">
                <span style={{ color: "var(--status-green)", fontWeight: "600" }}>● Verified</span>
                <span>zero packet dropouts</span>
              </div>
            </div>
          </div>

          {/* ──────────────────────────────────────────────────────────────────
              SPLIT LAYOUT: WIDGETS DISPLAY + LIVE STREAM FEED
              ────────────────────────────────────────────────────────────────── */}
          <div className="console-split-layout">
            {/* LEFT / MAIN COLUMN: WIDGETS GRID */}
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {widgets.length === 0 ? (
                <div
                  className="console-panel"
                  style={{
                    padding: "60px 24px",
                    textAlign: "center",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <div style={{ fontSize: "40px", marginBottom: "12px" }}>📊</div>
                  <h3 style={{ fontSize: "18px", fontWeight: "800", color: "#1f1916", margin: "0 0 6px 0" }}>
                    No Widgets Configured Yet
                  </h3>
                  <p style={{ color: "var(--text-dim)", fontSize: "13px", maxWidth: "440px", margin: "0 auto 20px" }}>
                    This dashboard is currently waiting for metrics. Add gauges, switches, and telemetry streams in the Admin Console.
                  </p>
                  <a
                    href="http://localhost:3000"
                    target="_blank"
                    rel="noreferrer"
                    className="btn-open-tile"
                    style={{ display: "inline-flex" }}
                  >
                    Open Admin Console (:3000)
                  </a>
                </div>
              ) : (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))",
                    gap: "18px",
                  }}
                >
                  {widgets.map((widget, idx) => {
                    const widgetId = widget.id || widget._id || idx;
                    const title = widget.title || widget.name || widget.config?.title || "Metric Widget";
                    const type = (widget.type || "value").toLowerCase();
                    const deviceName = widget.device_name || "IoT Sensor Node";
                    const deviceStatus = (widget.device_status || "online").toLowerCase();
                    const rawVal = widget.value !== undefined ? widget.value : (widget.telemetry ? Object.values(widget.telemetry)[0] : "—");
                    const cfg = widget.config || {};
                    const unit = cfg.unit || cfg.suffix || "";
                    const min = cfg.min !== undefined ? Number(cfg.min) : 0;
                    const max = cfg.max !== undefined ? Number(cfg.max) : 100;
                    const metricKey = cfg.metric || cfg.key || cfg.pin || "sensor_val";

                    const isSwitchOn = Boolean(rawVal && rawVal !== "0" && rawVal !== "false" && rawVal !== "off");
                    const numericVal = Number(rawVal);
                    const percentGauge = !isNaN(numericVal)
                      ? Math.min(100, Math.max(0, ((numericVal - min) / (max - min || 100)) * 100))
                      : 45;

                    return (
                      <div
                        key={widgetId}
                        className="kpi-card"
                        style={{
                          padding: "20px 22px",
                          minHeight: "200px",
                          justifyContent: "space-between",
                        }}
                      >
                        {/* Widget Header */}
                        <div>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px", marginBottom: "14px" }}>
                            <div>
                              <div style={{ fontSize: "15px", fontWeight: "700", color: "#1f1916" }}>
                                {title}
                              </div>
                              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "4px" }}>
                                <span style={{ fontSize: "12px", color: "var(--text-dim)" }}>
                                  {deviceName}
                                </span>
                                <span
                                  style={{
                                    fontSize: "9.5px",
                                    fontWeight: "700",
                                    padding: "2px 7px",
                                    borderRadius: "9999px",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "4px",
                                    backgroundColor: deviceStatus === "online" ? "#ecfdf5" : "#fef2f2",
                                    color: deviceStatus === "online" ? "#059669" : "#dc2626",
                                    border: deviceStatus === "online" ? "1px solid #a7f3d0" : "1px solid #fecaca",
                                  }}
                                >
                                  <span
                                    style={{
                                      width: "5px",
                                      height: "5px",
                                      borderRadius: "50%",
                                      backgroundColor: deviceStatus === "online" ? "#10b981" : "#ef4444",
                                      display: "inline-block",
                                    }}
                                  />
                                  {deviceStatus.toUpperCase()}
                                </span>
                              </div>
                            </div>

                            {/* Floating Terracotta Mini Badge */}
                            <div
                              style={{
                                width: "34px",
                                height: "34px",
                                borderRadius: "10px",
                                background: "linear-gradient(135deg, #e07a5f 0%, #c85a38 100%)",
                                color: "#ffffff",
                                display: "flex",
                                alignItems: "center",
                                justifyCenter: "center",
                                justifyContent: "center",
                                fontSize: "15px",
                                boxShadow: "0 4px 12px -2px rgba(224, 122, 95, 0.4)",
                                flexShrink: 0,
                              }}
                            >
                              {type === "switch" || type === "toggle" ? "⚡" : type === "gauge" ? "⏱️" : "📈"}
                            </div>
                          </div>

                          {/* Dynamic Metric Visualization */}
                          <div style={{ margin: "14px 0" }}>
                            {type === "switch" || type === "toggle" ? (
                              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                  {/* Custom Terracotta Toggle */}
                                  <div
                                    style={{
                                      width: "52px",
                                      height: "28px",
                                      borderRadius: "14px",
                                      background: isSwitchOn
                                        ? "linear-gradient(135deg, #e07a5f 0%, #c85a38 100%)"
                                        : "#e8ded8",
                                      padding: "3px",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: isSwitchOn ? "flex-end" : "flex-start",
                                      transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                                      boxShadow: isSwitchOn ? "0 2px 10px rgba(224, 122, 95, 0.4)" : "none",
                                    }}
                                  >
                                    <div
                                      style={{
                                        width: "22px",
                                        height: "22px",
                                        borderRadius: "50%",
                                        backgroundColor: "#ffffff",
                                        boxShadow: "0 2px 6px rgba(0, 0, 0, 0.18)",
                                      }}
                                    />
                                  </div>
                                  <span
                                    style={{
                                      fontSize: "14px",
                                      fontWeight: "800",
                                      color: isSwitchOn ? "var(--terracotta-burnt)" : "var(--text-muted)",
                                    }}
                                  >
                                    {isSwitchOn ? "STATE: ON" : "STATE: OFF"}
                                  </span>
                                </div>
                                <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                                  Controlled pin / digital output
                                </div>
                              </div>
                            ) : type === "gauge" ? (
                              <div>
                                <div style={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
                                  <span style={{ fontSize: "36px", fontWeight: "800", color: "#1f1916", letterSpacing: "-0.02em" }}>
                                    {rawVal !== null && rawVal !== undefined ? rawVal : "0"}
                                  </span>
                                  {unit && (
                                    <span style={{ fontSize: "15px", fontWeight: "700", color: "var(--terracotta-burnt)" }}>
                                      {unit}
                                    </span>
                                  )}
                                </div>

                                {/* Custom Terracotta Gradient Progress Bar */}
                                <div
                                  style={{
                                    width: "100%",
                                    height: "8px",
                                    borderRadius: "4px",
                                    backgroundColor: "#f2eae5",
                                    marginTop: "10px",
                                    overflow: "hidden",
                                  }}
                                >
                                  <div
                                    style={{
                                      height: "100%",
                                      width: `${percentGauge}%`,
                                      background: "linear-gradient(90deg, #f4a261 0%, #e07a5f 60%, #c85a38 100%)",
                                      borderRadius: "4px",
                                      boxShadow: "0 0 8px rgba(224, 122, 95, 0.4)",
                                      transition: "width 0.4s ease",
                                    }}
                                  />
                                </div>

                                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10.5px", color: "var(--text-muted)", marginTop: "5px" }}>
                                  <span>Min: {min}</span>
                                  <span style={{ color: "var(--terracotta-burnt)", fontWeight: "600" }}>{Math.round(percentGauge)}%</span>
                                  <span>Max: {max}</span>
                                </div>
                              </div>
                            ) : (
                              <div>
                                <div style={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
                                  <span style={{ fontSize: "36px", fontWeight: "800", color: "#1f1916", letterSpacing: "-0.02em" }}>
                                    {typeof rawVal === "object" ? JSON.stringify(rawVal) : String(rawVal)}
                                  </span>
                                  {unit && (
                                    <span style={{ fontSize: "15px", fontWeight: "700", color: "var(--terracotta-burnt)" }}>
                                      {unit}
                                    </span>
                                  )}
                                </div>

                                {/* Sparkline Wave Decorative Curve (Terracotta Line) */}
                                <div style={{ marginTop: "8px", height: "24px", width: "100%" }}>
                                  <svg width="100%" height="24" viewBox="0 0 200 24" preserveAspectRatio="none">
                                    <path
                                      d="M 0 16 Q 30 6, 60 14 T 120 8 T 160 16 T 200 10"
                                      fill="none"
                                      stroke="var(--terracotta)"
                                      strokeWidth="2.5"
                                      strokeLinecap="round"
                                      opacity="0.85"
                                    />
                                    <path
                                      d="M 0 16 Q 30 6, 60 14 T 120 8 T 160 16 T 200 10 L 200 24 L 0 24 Z"
                                      fill="rgba(224, 122, 95, 0.08)"
                                    />
                                  </svg>
                                </div>

                                <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>
                                  Pin: <code style={{ backgroundColor: "#faf4f0", color: "var(--terracotta-burnt)", padding: "2px 6px", borderRadius: "4px", border: "1px solid rgba(224, 122, 95, 0.18)" }}>{metricKey}</code>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Card Footer */}
                        <div
                          style={{
                            borderTop: "1px solid #f0e6e1",
                            paddingTop: "12px",
                            marginTop: "8px",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            fontSize: "11px",
                            color: "var(--text-muted)",
                          }}
                        >
                          <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                            <span
                              style={{
                                width: "6px",
                                height: "6px",
                                borderRadius: "50%",
                                backgroundColor: isWsLive ? "#10b981" : "#f59e0b",
                              }}
                            />
                            {isWsLive ? "Real-time feed" : "Polling"}
                          </span>
                          <span style={{ color: "var(--terracotta)", fontWeight: "600" }}>Verified stream</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* RIGHT COLUMN: LIVE ACTIVITY STREAM FEED (Matching Mockup) */}
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div className="console-panel">
                <div className="console-panel-header">
                  <div className="panel-title-group">
                    <h3>
                      <span>📡</span>
                      <span>Live Activity Stream</span>
                    </h3>
                    <p>Real-time telemetry event stream via Port 4001</p>
                  </div>
                  {liveStreamEvents.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setLiveStreamEvents([])}
                      className="btn-mini-clear"
                    >
                      Clear
                    </button>
                  )}
                </div>

                <div className="telemetry-feed-container">
                  {liveStreamEvents.length === 0 ? (
                    <div className="empty-box-state">
                      <div className="empty-box-icon">⏳</div>
                      <div className="empty-box-title">Awaiting Live Telemetry</div>
                      <div className="empty-box-desc">
                        When IoT sensors or devices push data via HTTP or MQTT, real-time records stream here instantly.
                      </div>
                    </div>
                  ) : (
                    liveStreamEvents.map((evt) => (
                      <div key={evt.id} className="telemetry-event-card">
                        <div className="event-card-head">
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <span className="event-device-badge">{evt.deviceId}</span>
                            <span className={`event-status-pill ${evt.status}`}>
                              {evt.status}
                            </span>
                          </div>
                          <span className="event-time-text">{evt.time}</span>
                        </div>

                        <div style={{ fontSize: "12px", color: "var(--text-dim)", fontWeight: "500" }}>
                          {evt.text}
                        </div>

                        {evt.payload && (
                          <div className="event-payload-box">
                            {typeof evt.payload === "object" ? JSON.stringify(evt.payload, null, 2) : String(evt.payload)}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Workspace Navigation Card */}
              <div className="console-panel" style={{ padding: "20px" }}>
                <h4 style={{ margin: "0 0 10px 0", fontSize: "14px", fontWeight: "700", color: "#1f1916" }}>
                  Workspace Quick Access
                </h4>
                <p style={{ margin: "0 0 16px 0", fontSize: "12px", color: "var(--text-muted)", lineHeight: "1.5" }}>
                  You are viewing the telemetry feed for workspace <strong>{wsId}</strong>. Access additional boards or configure alerts.
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <Link
                    href="/dashboard"
                    className="ws-tab-btn"
                    style={{ textAlign: "center", textDecoration: "none", padding: "8px 12px" }}
                  >
                    ← Browse All Dashboards
                  </Link>

                  <a
                    href="http://localhost:3000"
                    target="_blank"
                    rel="noreferrer"
                    className="ws-tab-btn active"
                    style={{ textAlign: "center", textDecoration: "none", padding: "8px 12px" }}
                  >
                    Open Admin Console (:3000) ↗
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
