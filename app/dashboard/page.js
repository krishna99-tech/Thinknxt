"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api, { getPublicAppConfig } from "../../lib/api";
import { getToken, logout } from "../../lib/auth";
import { useWebSocket } from "../../lib/useWebSocket";
import "./dashboard.css";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [workspaces, setWorkspaces] = useState([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState(null);
  const [dashboards, setDashboards] = useState([]);
  const [loadingDashboards, setLoadingDashboards] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [platformConfig, setPlatformConfig] = useState(null);
  const [liveEvents, setLiveEvents] = useState([]);
  const [streamCount, setStreamCount] = useState(0);
  const [activeTab, setActiveTab] = useState("dashboards"); // 'dashboards' | 'live' | 'workspaces'

  // Fastify WebSocket listener on port 4001 for live telemetry & status events
  const handleLiveEvent = useCallback((msg) => {
    if (!msg) return;
    if (msg.type === "status_update" || msg.type === "telemetry_update" || msg.payload || msg.data) {
      setStreamCount((c) => c + 1);
      setLiveEvents((prev) => [
        {
          id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          type: msg.type || "telemetry",
          deviceId: msg.device_id || "sensor_device",
          status: (msg.status || "online").toLowerCase(),
          timestamp: new Date().toLocaleTimeString(),
          payload: msg.payload || msg.data,
        },
        ...prev.slice(0, 14), // Keep up to 15 recent telemetry records
      ]);
    }
  }, []);

  const { isConnected: isLiveWs } = useWebSocket(handleLiveEvent, ["*"]);

  useEffect(() => {
    getPublicAppConfig().then((cfg) => {
      if (cfg) setPlatformConfig(cfg);
    });
  }, []);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.replace("/login");
      return;
    }

    const fetchUserData = async () => {
      try {
        const userRes = await api.get("/me");
        setUser(userRes.data);

        try {
          const wsRes = await api.get("/me/workspaces");
          const wsList = wsRes.data?.data || wsRes.data || [];
          setWorkspaces(wsList);
          if (wsList.length > 0) {
            setSelectedWorkspace(wsList[0]);
          }
        } catch {
          setWorkspaces([]);
        }
      } catch (err) {
        if (err.response?.status === 401) {
          logout("/login");
        } else {
          setError("Failed to load user profile. Please try refreshing.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  // Fetch dashboards for the selected workspace
  useEffect(() => {
    if (!selectedWorkspace) {
      setDashboards([]);
      return;
    }
    const wsId = selectedWorkspace.workspace_id || selectedWorkspace.slug || selectedWorkspace.id;
    setLoadingDashboards(true);
    api.get(`/admin/workspaces/${wsId}/dashboards`)
      .then((res) => {
        setDashboards(Array.isArray(res.data) ? res.data : []);
      })
      .catch((err) => {
        console.error("Failed to load workspace dashboards:", err);
        setDashboards([]);
      })
      .finally(() => {
        setLoadingDashboards(false);
      });

    // Background live polling interval (every 5s)
    const pollInterval = setInterval(() => {
      api.get(`/admin/workspaces/${wsId}/dashboards`)
        .then((res) => {
          if (Array.isArray(res.data)) {
            setDashboards(res.data);
          }
        })
        .catch(() => {});
    }, 5000);

    return () => clearInterval(pollInterval);
  }, [selectedWorkspace]);

  if (loading) {
    return (
      <div className="iot-app-shell" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: "44px",
              height: "44px",
              border: "3px solid rgba(255, 255, 255, 0.1)",
              borderTopColor: "var(--accent-blue)",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
              margin: "0 auto 16px",
            }}
          />
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
          <p style={{ color: "var(--text-dim)", fontSize: "14px", fontWeight: "600", letterSpacing: "0.02em" }}>
            Connecting to ThingsNXT Cloud Console...
          </p>
        </div>
      </div>
    );
  }

  const displayName = user?.display_name || user?.full_name || user?.username || "Enterprise Member";
  const userRole = user?.role || "User";
  const isAdmin = userRole.toLowerCase().includes("admin") || user?.is_admin;
  const currentWsName = selectedWorkspace?.name || selectedWorkspace?.slug || "Default Tenant";

  return (
    <div className="iot-app-shell">
      {/* ──────────────────────────────────────────────────────────────────
          LEFT NAVIGATION SIDEBAR
          ────────────────────────────────────────────────────────────────── */}
      <aside className="iot-sidebar">
        <div>
          {/* Brand Box */}
          <div className="sidebar-brand-box">
            <div className="sidebar-brand-icon">⚡</div>
            <div className="sidebar-brand-text">
              <span className="brand-name">ThingsNXT</span>
              <span className="brand-badge">IoT Console v2</span>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="sidebar-menu">
            <span className="menu-category-label">Monitoring</span>

            <button
              type="button"
              className={`menu-item ${activeTab === "dashboards" ? "active" : ""}`}
              onClick={() => setActiveTab("dashboards")}
            >
              <span className="menu-item-icon">📊</span>
              <span>Overview & Dashboards</span>
              {dashboards.length > 0 && <span className="menu-item-tag">{dashboards.length}</span>}
            </button>

            <button
              type="button"
              className={`menu-item ${activeTab === "live" ? "active" : ""}`}
              onClick={() => setActiveTab("live")}
            >
              <span className="menu-item-icon">📡</span>
              <span>Live Telemetry Feed</span>
              {streamCount > 0 && <span className="menu-item-tag">{streamCount}</span>}
            </button>

            <button
              type="button"
              className={`menu-item ${activeTab === "workspaces" ? "active" : ""}`}
              onClick={() => setActiveTab("workspaces")}
            >
              <span className="menu-item-icon">🏢</span>
              <span>Workspaces</span>
              <span className="menu-item-tag">{workspaces.length || 1}</span>
            </button>

            <span className="menu-category-label">Platform & Developer</span>

            {isAdmin && (
              <a
                href="http://100.77.110.74:3000"
                target="_blank"
                rel="noreferrer"
                className="menu-item"
              >
                <span className="menu-item-icon">⚙️</span>
                <span>Admin Console</span>
                <span className="menu-item-tag" style={{ color: "#34d399", borderColor: "rgba(16,185,129,0.3)" }}>:3000</span>
              </a>
            )}


            <Link href="/products" className="menu-item">
              <span className="menu-item-icon">📦</span>
              <span>Hardware Products</span>
            </Link>

            <Link href="/documentation" className="menu-item">
              <span className="menu-item-icon">📚</span>
              <span>IoT Documentation</span>
            </Link>
          </nav>
        </div>

        {/* Profile & Logout Card */}
        <div className="sidebar-profile-box">
          <div className="user-profile-card">
            <div className="user-avatar">
              {displayName.slice(0, 2).toUpperCase()}
            </div>
            <div className="user-info-text">
              <div className="user-name-text">{displayName}</div>
              <div className="user-role-badge">{userRole} Portal</div>
            </div>
          </div>
          <button type="button" onClick={() => logout("/login")} className="btn-signout">
            <span>⏻</span> Sign Out
          </button>
        </div>
      </aside>

      {/* ──────────────────────────────────────────────────────────────────
          MAIN VIEWPORT AREA
          ────────────────────────────────────────────────────────────────── */}
      <div className="iot-main-viewport">
        {/* Sticky Topbar */}
        <header className="iot-topbar">
          <div className="topbar-breadcrumbs">
            <span className="breadcrumb-root">ThingsNXT</span>
            <span className="breadcrumb-sep">/</span>
            <span className="breadcrumb-root">{currentWsName}</span>
            <span className="breadcrumb-sep">/</span>
            <span className="breadcrumb-current">Console</span>
          </div>

          <div className="topbar-actions">
            {/* Live Socket Status */}
            <div className={`live-stream-status-pill ${isLiveWs ? "online" : "offline"}`}>
              <span className={`pulse-circle ${isLiveWs ? "online" : "offline"}`} />
              <span>{isLiveWs ? "Fastify Stream Live (:4001)" : "Stream Disconnected"}</span>
            </div>

            {/* Admin Console Shortcut */}
            {isAdmin && (
              <a
                href="http://100.77.110.74:3000"
                target="_blank"
                rel="noreferrer"
                className="btn-admin-console"
              >
                <span>⚙️</span> Admin Console ↗
              </a>
            )}
          </div>
        </header>

        {/* Main Body */}
        <main className="iot-console-content">
          {/* Maintenance Alert Banner */}
          {(platformConfig?.mobile_app?.maintenance_mode || platformConfig?.mobile_app?.maintenance_blocking) && (
            <div className={`maintenance-alert-banner ${platformConfig?.mobile_app?.maintenance_blocking ? "blocking" : "warning"}`}>
              <span style={{ fontSize: "18px" }}>
                {platformConfig?.mobile_app?.maintenance_blocking ? "🛑" : "⚠️"}
              </span>
              <div>
                <strong>
                  {platformConfig?.mobile_app?.maintenance_blocking
                    ? "Platform Hard Maintenance Active"
                    : "Platform Maintenance Advisory"}
                </strong>
                <span>
                  {platformConfig?.mobile_app?.maintenance_message || "Services are currently undergoing scheduled maintenance."}
                </span>
              </div>
            </div>
          )}

          {error && (
            <div className="maintenance-alert-banner blocking">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* KPI Metrics Row */}
          <section className="kpi-cards-row">
            <div className="kpi-card">
              <div className="kpi-card-header">
                <span className="kpi-card-title">Access Level</span>
                <div className="kpi-card-icon kpi-icon-blue">🛡️</div>
              </div>
              <div className="kpi-card-value">{userRole}</div>
              <div className="kpi-card-desc">
                <span style={{ color: "#34d399" }}>●</span> Active Enterprise Session
              </div>
            </div>

            <div className="kpi-card">
              <div className="kpi-card-header">
                <span className="kpi-card-title">Assigned Tenants</span>
                <div className="kpi-card-icon kpi-icon-purple">🏢</div>
              </div>
              <div className="kpi-card-value">{workspaces.length > 0 ? workspaces.length : 1}</div>
              <div className="kpi-card-desc">
                Isolated workspace partition
              </div>
            </div>

            <div className="kpi-card">
              <div className="kpi-card-header">
                <span className="kpi-card-title">Live Ingest Packets</span>
                <div className="kpi-card-icon kpi-icon-cyan">⚡</div>
              </div>
              <div className="kpi-card-value" style={{ color: "var(--text-cyan)" }}>
                {streamCount}
              </div>
              <div className="kpi-card-desc">
                Fastify WS Broadcast
              </div>
            </div>

            <div className="kpi-card">
              <div className="kpi-card-header">
                <span className="kpi-card-title">Active Dashboards</span>
                <div className="kpi-card-icon kpi-icon-green">📈</div>
              </div>
              <div className="kpi-card-value" style={{ color: "var(--text-green)" }}>
                {dashboards.length}
              </div>
              <div className="kpi-card-desc">
                {currentWsName}
              </div>
            </div>
          </section>

          {/* Split View: Telemetry Dashboards (Left) + Live Activity Feed (Right) */}
          <section className="console-split-layout">
            {/* Left Panel: Dashboards & Workspaces */}
            <div className="console-panel">
              <div className="console-panel-header">
                <div className="panel-title-group">
                  <h2>
                    <span>📊</span> Telemetry Dashboards
                  </h2>
                  <p>Configured visual metrics for {currentWsName}</p>
                </div>

                {/* Workspace Switcher Pills */}
                {workspaces.length > 1 && (
                  <div className="workspace-tabs-row">
                    {workspaces.map((ws) => {
                      const isCurrent =
                        (ws.id || ws.slug) === (selectedWorkspace?.id || selectedWorkspace?.slug);
                      return (
                        <button
                          key={ws.id || ws.slug}
                          type="button"
                          onClick={() => setSelectedWorkspace(ws)}
                          className={`ws-tab-btn ${isCurrent ? "active" : ""}`}
                        >
                          {ws.name || ws.slug}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {loadingDashboards ? (
                <div className="empty-box-state">
                  <div
                    style={{
                      width: "30px",
                      height: "30px",
                      border: "2px solid rgba(255, 255, 255, 0.1)",
                      borderTopColor: "var(--accent-blue)",
                      borderRadius: "50%",
                      animation: "spin 0.8s linear infinite",
                      marginBottom: "12px",
                    }}
                  />
                  <div className="empty-box-title">Loading dashboards...</div>
                </div>
              ) : dashboards.length === 0 ? (
                <div className="empty-box-state">
                  <div className="empty-box-icon">📈</div>
                  <div className="empty-box-title">No Dashboards in This Workspace</div>
                  <p className="empty-box-desc">
                    Your workspace administrator has not created any telemetry dashboards for this tenant yet. Once created in the Admin Console, they will appear here automatically.
                  </p>
                </div>
              ) : (
                <div className="telemetry-dashboards-grid">
                  {dashboards.map((dash) => {
                    const wsId =
                      selectedWorkspace?.workspace_id ||
                      selectedWorkspace?.slug ||
                      selectedWorkspace?.id;
                    const dashId = dash.id || dash._id;
                    const widgetCount = dash.widget_count || dash.widgets?.length || 0;

                    return (
                      <div key={dashId} className="dashboard-tile-card">
                        <div>
                          <div className="tile-top">
                            <div className="tile-icon-box">📊</div>
                            <span className="tile-widget-pill">{widgetCount} Widgets</span>
                          </div>
                          <h4 className="tile-title">{dash.name || "Telemetry Dashboard"}</h4>
                          <p className="tile-desc">
                            {dash.description || "Real-time telemetry and hardware status monitoring."}
                          </p>
                        </div>

                        <Link
                          href={`/dashboard/${dashId}?ws=${encodeURIComponent(wsId)}`}
                          className="btn-open-tile"
                        >
                          <span>Open Live Dashboard</span>
                          <span>→</span>
                        </Link>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right Panel: Live Activity Stream */}
            <div className="console-panel">
              <div className="console-panel-header">
                <div className="panel-title-group">
                  <h3>
                    <span>📡</span> Live Hardware Stream
                  </h3>
                  <p>Fastify WebSockets broadcast on port 4001</p>
                </div>

                <div className="panel-actions-group">
                  {liveEvents.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setLiveEvents([])}
                      className="btn-mini-clear"
                    >
                      Clear
                    </button>
                  )}
                  <div className={`live-stream-status-pill ${isLiveWs ? "online" : "offline"}`} style={{ padding: "4px 10px", fontSize: "11px" }}>
                    <span className={`pulse-circle ${isLiveWs ? "online" : "offline"}`} />
                    <span>{isLiveWs ? "Live" : "Offline"}</span>
                  </div>
                </div>
              </div>

              {liveEvents.length === 0 ? (
                <div className="empty-box-state">
                  <div className="empty-box-icon">🛰️</div>
                  <div className="empty-box-title">Listening for Telemetry</div>
                  <p className="empty-box-desc">
                    When your ESP32, MQTT bridge, or IoT sensor sends data, live packets stream here instantaneously.
                  </p>
                </div>
              ) : (
                <div className="telemetry-feed-container">
                  {liveEvents.map((evt) => (
                    <div key={evt.id} className="telemetry-event-card">
                      <div className="event-card-head">
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span className={`event-status-pill ${evt.status}`}>
                            {evt.status}
                          </span>
                          <span className="event-device-badge">
                            {evt.deviceId}
                          </span>
                        </div>
                        <span className="event-time-text">{evt.timestamp}</span>
                      </div>

                      {evt.payload && (
                        <div className="event-payload-box">
                          {typeof evt.payload === "object"
                            ? JSON.stringify(evt.payload, null, 2)
                            : String(evt.payload)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Quick Platform Shortcuts (Bottom Row) */}
          <section className="quick-tools-grid">

            <Link href="/products" className="tool-card-btn">
              <div className="tool-card-left">
                <span className="tool-card-icon">📦</span>
                <div>
                  <div className="tool-card-label">Hardware & Device Catalog</div>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Sensors, controllers, & gateways</div>
                </div>
              </div>
              <span className="tool-card-arrow">→</span>
            </Link>

            <Link href="/documentation" className="tool-card-btn">
              <div className="tool-card-left">
                <span className="tool-card-icon">📚</span>
                <div>
                  <div className="tool-card-label">Firmware SDK & Integration</div>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>ESP32, MQTT & REST client docs</div>
                </div>
              </div>
              <span className="tool-card-arrow">→</span>
            </Link>
          </section>
        </main>
      </div>
    </div>
  );
}
