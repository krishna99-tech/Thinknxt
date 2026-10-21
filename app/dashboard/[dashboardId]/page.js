"use client";

import { use, useEffect, useState, useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import api from "../../../lib/api";
import { getToken, logout } from "../../../lib/auth";
import { useWebSocket } from "../../../lib/useWebSocket";
import DashboardShell from "../../../components/dashboard/DashboardShell";
import HardwareNodeBar from "../../../components/dashboard/HardwareNodeBar";
import InteractiveSwitchWidget from "../../../components/dashboard/InteractiveSwitchWidget";
import SensorTelemetryWidget from "../../../components/dashboard/SensorTelemetryWidget";
import {
  Activity,
  Zap,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Cpu,
  Layers,
  ArrowUpRight,
  ExternalLink,
} from "../../../components/common/Icons";

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
  const [telemetryHistory, setTelemetryHistory] = useState({});
  const [downlinkFeedback, setDownlinkFeedback] = useState(null);
  const [isCommandSending, setIsCommandSending] = useState({});
  const [deviceStats, setDeviceStats] = useState({
    ip: "192.168.0.246",
    rssi: -26,
    uptime: 45,
    free_heap: 231364,
  });

  const [workspaces, setWorkspaces] = useState([]);

  // Fetch current user profile and workspaces for shell sidebar and modals
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

    api.get("/me/workspaces")
      .then((res) => setWorkspaces(res.data?.data || res.data || []))
      .catch(() => setWorkspaces([]));
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
        setError(err.response?.data?.detail || "Failed to load dashboard. Please verify your connection.");
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

  // Handle incoming real-time sensor streams and device status from Fastify WebSocket
  const handleWsMessage = useCallback((msg) => {
    if (!msg) return;
    setLastUpdated(new Date());

    // 1. Device Online / Offline Status Updates
    if (msg.type === "status_update") {
      const devId = msg.device_id;
      const newStatus = (msg.status || "online").toLowerCase();

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

      // Update hardware node health metrics if present
      if (telemData.rssi !== undefined || telemData.uptime !== undefined || telemData.free_heap !== undefined || telemData.ip !== undefined) {
        setDeviceStats((prev) => ({
          ip: telemData.ip || prev.ip,
          rssi: telemData.rssi !== undefined ? Number(telemData.rssi) : prev.rssi,
          uptime: telemData.uptime !== undefined ? Number(telemData.uptime) : prev.uptime,
          free_heap: telemData.free_heap !== undefined ? Number(telemData.free_heap) : prev.free_heap,
        }));
      }

      // Record trend history for real-time sparkline curves
      setTelemetryHistory((prev) => {
        const next = { ...prev };
        Object.entries(telemData).forEach(([k, v]) => {
          const num = Number(v);
          if (!isNaN(num)) {
            const seriesKey = `${devId || 'node'}_${k}`;
            const list = next[seriesKey] || [num, num, num, num];
            next[seriesKey] = [...list.slice(-14), num];
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

  // Continuous background auto-refresh every 4s
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      fetchDashboard(true);
    }, 4000);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchDashboard]);

  // ────────────────────────────────────────────────────────────────────────────
  // INTERACTIVE HARDWARE DOWNLINK ACTUATOR DISPATCH
  // Sends immediate command to ESP32 over MQTT / Redis
  // ────────────────────────────────────────────────────────────────────────────
  const handleToggleActuator = async (widget, targetState) => {
    const cfg = widget.config || {};
    const pin = cfg.pin || cfg.virtual_pin || "v0";
    const devId = widget.device_id || widget.deviceId || cfg.device_id || "6ad84a0c622dd2082dd745ae";
    const widgetKey = widget.id || widget._id || pin;

    setIsCommandSending((prev) => ({ ...prev, [widgetKey]: true }));

    // Optimistic UI update
    setDashboard((prev) => {
      if (!prev || !prev.widgets) return prev;
      return {
        ...prev,
        widgets: prev.widgets.map((w) => {
          if ((w.id || w._id) === (widget.id || widget._id)) {
            return {
              ...w,
              value: targetState,
              telemetry: { ...(w.telemetry || {}), [pin]: targetState },
            };
          }
          return w;
        }),
      };
    });

    try {
      // 1. Try dedicated workspace device command endpoint
      await api.post(`/workspaces/${wsId}/devices/${devId}/command`, {
        command: "set_pin",
        action: "led",
        pin: pin,
        virtual_pin: pin,
        state: targetState,
      }).catch(async () => {
        // Fallback: direct pin endpoint
        return api.post(`/devices/${devId}/pins/${pin}?state=${targetState}`);
      });

      setDownlinkFeedback({
        type: "success",
        msg: `Downlink Dispatched: Pin '${pin.toUpperCase()}' set to ${targetState === 1 ? "HIGH (1)" : "LOW (0)"}`,
      });
      setTimeout(() => setDownlinkFeedback(null), 3500);
    } catch (err) {
      // Rollback on failure
      const revertState = targetState === 1 ? 0 : 1;
      setDashboard((prev) => {
        if (!prev || !prev.widgets) return prev;
        return {
          ...prev,
          widgets: prev.widgets.map((w) => {
            if ((w.id || w._id) === (widget.id || widget._id)) {
              return {
                ...w,
                value: revertState,
                telemetry: { ...(w.telemetry || {}), [pin]: revertState },
              };
            }
            return w;
          }),
        };
      });

      setDownlinkFeedback({
        type: "error",
        msg: `Downlink Failed: ${err.response?.data?.detail || "Device unreachable or timeout"}`,
      });
      setTimeout(() => setDownlinkFeedback(null), 4000);
    } finally {
      setIsCommandSending((prev) => ({ ...prev, [widgetKey]: false }));
    }
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          backgroundColor: "#F5F7FA",
          fontFamily: "'Plus Jakarta Sans', sans-serif",
        }}
      >
        <div style={{ textAlign: "center", padding: "40px" }}>
          <div
            style={{
              width: "36px",
              height: "36px",
              border: "3px solid #E2E8F0",
              borderTopColor: "#F97316",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
              margin: "0 auto 16px",
            }}
          />
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
          <p style={{ color: "#64748B", fontSize: "13px", fontWeight: "600", fontFamily: "monospace" }}>
            CONNECTING TO TELEMETRY STREAM...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <DashboardShell
        currentWsName={wsId}
        wsId={wsId}
        workspaces={workspaces}
        user={user}
        isLiveWs={isWsLive}
        activeNav="dashboards"
      >
        <div
          style={{
            maxWidth: "500px",
            margin: "60px auto",
            backgroundColor: "#FFFFFF",
            padding: "36px 30px",
            borderRadius: "12px",
            border: "1px solid #FECACA",
            borderTop: "4px solid #DC2626",
            boxShadow: "0 2px 8px rgba(15, 23, 42, 0.04)",
            textAlign: "center",
          }}
        >
          <AlertTriangle size={36} color="#DC2626" style={{ marginBottom: "12px" }} />
          <h2 style={{ fontSize: "18px", fontWeight: "700", color: "#0F172A", margin: "0 0 8px 0" }}>
            Unable to Load Dashboard
          </h2>
          <p style={{ color: "#64748B", fontSize: "13px", lineHeight: "1.5", margin: "0 0 20px 0" }}>
            {error}
          </p>
          <Link
            href="/dashboard"
            style={{
              display: "inline-flex",
              padding: "8px 18px",
              backgroundColor: "#F97316",
              color: "#FFFFFF",
              fontWeight: "700",
              fontSize: "12.5px",
              borderRadius: "6px",
              textDecoration: "none",
            }}
          >
            ← Return to Dashboards
          </Link>
        </div>
      </DashboardShell>
    );
  }

  const widgets = dashboard?.widgets || [];
  const onlineDevicesCount = widgets.filter(w => (w.device_status || "online").toLowerCase() === "online").length;

  return (
    <DashboardShell
      currentWsName={wsId}
      wsId={wsId}
      workspaces={workspaces}
      onSelectWorkspace={(ws) => router.push(`/dashboard?ws=${ws.workspace_id || ws.slug || ws.id}`)}
      user={user}
      isLiveWs={isWsLive}
      activeNav="dashboards"
      activeDashboardId={resolvedParams?.dashboardId}
      title={dashboard?.name || "Live Telemetry Viewer"}
      actions={
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {/* Auto Refresh Toggle */}
          <button
            type="button"
            onClick={() => setAutoRefresh(!autoRefresh)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "5px",
              padding: "6px 12px",
              borderRadius: "6px",
              backgroundColor: autoRefresh ? "#FFF7ED" : "#F8FAFC",
              color: autoRefresh ? "#EA580C" : "#64748B",
              border: `1px solid ${autoRefresh ? "#FFEDD5" : "#E2E8F0"}`,
              fontSize: "11.5px",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            <span>{autoRefresh ? "Auto-sync (4s)" : "Paused"}</span>
          </button>

          {/* Manual Refresh */}
          <button
            type="button"
            onClick={() => fetchDashboard(false)}
            disabled={refreshing}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "5px",
              padding: "6px 12px",
              borderRadius: "6px",
              backgroundColor: "#F8FAFC",
              color: "#334155",
              border: "1px solid #E2E8F0",
              fontSize: "11.5px",
              fontWeight: "600",
              cursor: refreshing ? "not-allowed" : "pointer",
              opacity: refreshing ? 0.6 : 1,
            }}
          >
            <RefreshCw size={12} />
            <span>{refreshing ? "Refreshing..." : "Refresh"}</span>
          </button>

          {/* Back Button */}
          <Link
            href="/dashboard"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "5px",
              padding: "6px 12px",
              borderRadius: "6px",
              backgroundColor: "#F8FAFC",
              color: "#64748B",
              border: "1px solid #E2E8F0",
              fontSize: "11.5px",
              fontWeight: "600",
              textDecoration: "none",
            }}
          >
            ← All Dashboards
          </Link>
        </div>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
        {/* Downlink Action Feedback Toast */}
        {downlinkFeedback && (
          <div
            style={{
              backgroundColor: downlinkFeedback.type === "success" ? "#ECFDF5" : "#FEF2F2",
              border: `1px solid ${downlinkFeedback.type === "success" ? "#A7F3D0" : "#FECACA"}`,
              borderRadius: "8px",
              padding: "12px 18px",
              color: downlinkFeedback.type === "success" ? "#059669" : "#DC2626",
              fontSize: "12.5px",
              fontWeight: "600",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              boxShadow: "0 2px 8px rgba(15, 23, 42, 0.04)",
            }}
          >
            {downlinkFeedback.type === "success" ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
            <span>{downlinkFeedback.msg}</span>
          </div>
        )}

        {/* Executive Dashboard Context Banner (#FFFFFF, border #E2E8F0) */}
        <section
          style={{
            backgroundColor: "#FFFFFF",
            border: "1px solid #E2E8F0",
            borderLeft: "4px solid #F97316",
            borderRadius: "12px",
            padding: "20px 24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "18px",
            boxShadow: "0 2px 8px rgba(15, 23, 42, 0.04)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div
              style={{
                width: "42px",
                height: "42px",
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
              <Activity size={20} />
            </div>

            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", marginBottom: "4px" }}>
                <h1 style={{ fontSize: "20px", fontWeight: "800", color: "#0F172A", margin: 0, letterSpacing: "-0.01em" }}>
                  {dashboard?.name || "Telemetry Viewer"}
                </h1>
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: "700",
                    fontFamily: "monospace",
                    padding: "3px 10px",
                    borderRadius: "9999px",
                    backgroundColor: "#FFF7ED",
                    color: "#EA580C",
                    border: "1px solid #FFEDD5",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <span style={{ width: "5px", height: "5px", borderRadius: "50%", backgroundColor: "#F97316" }} />
                  TENANT: {wsId}
                </span>

                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: "700",
                    padding: "2px 8px",
                    borderRadius: "9999px",
                    backgroundColor: "#ECFDF5",
                    color: "#059669",
                    border: "1px solid #A7F3D0",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  <span style={{ width: "5px", height: "5px", borderRadius: "50%", backgroundColor: "#10B981" }} />
                  Active Viewer
                </span>
              </div>
              <p style={{ fontSize: "13px", color: "#64748B", margin: 0, lineHeight: "1.5" }}>
                {dashboard?.description || "Real-time hardware telemetry visualization and remote actuator dispatch."}
              </p>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <a
              href="http://localhost:3000"
              target="_blank"
              rel="noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 16px",
                borderRadius: "6px",
                backgroundColor: "rgba(249, 115, 22, 0.1)",
                color: "#EA580C",
                border: "1px solid rgba(249, 115, 22, 0.3)",
                fontSize: "12px",
                fontWeight: "600",
                textDecoration: "none",
              }}
            >
              <Zap size={13} />
              <span>Edit in Admin</span>
            </a>
          </div>
        </section>

        {/* ──────────────────────────────────────────────────────────
            HARDWARE TELEMETRY HEALTH BAR
            ────────────────────────────────────────────────────────── */}
        <HardwareNodeBar
          deviceId="6ad84a0c622dd2082dd745ae"
          ip={deviceStats.ip}
          rssi={deviceStats.rssi}
          uptime={deviceStats.uptime}
          freeHeap={deviceStats.free_heap}
          lastUpdated={lastUpdated}
          status="online"
        />

        {/* ──────────────────────────────────────────────────────────
            KPI SUMMARY ROW (#FFFFFF cards, #E2E8F0 borders)
            ────────────────────────────────────────────────────────── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "14px",
          }}
        >
          <div style={{ backgroundColor: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: "12px", padding: "16px 20px", boxShadow: "0 2px 8px rgba(15, 23, 42, 0.04)" }}>
            <span style={{ fontSize: "11.5px", fontWeight: "700", color: "#64748B", textTransform: "uppercase" }}>Configured Widgets</span>
            <div style={{ fontSize: "24px", fontWeight: "800", color: "#0F172A", fontFamily: "monospace", marginTop: "2px" }}>
              {widgets.length}
            </div>
          </div>

          <div style={{ backgroundColor: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: "12px", padding: "16px 20px", boxShadow: "0 2px 8px rgba(15, 23, 42, 0.04)" }}>
            <span style={{ fontSize: "11.5px", fontWeight: "700", color: "#64748B", textTransform: "uppercase" }}>Online Nodes</span>
            <div style={{ fontSize: "24px", fontWeight: "800", color: "#0F172A", fontFamily: "monospace", marginTop: "2px" }}>
              {onlineDevicesCount}
            </div>
          </div>

          <div style={{ backgroundColor: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: "12px", padding: "16px 20px", boxShadow: "0 2px 8px rgba(15, 23, 42, 0.04)" }}>
            <span style={{ fontSize: "11.5px", fontWeight: "700", color: "#64748B", textTransform: "uppercase" }}>Fastify WS Gateway</span>
            <div style={{ fontSize: "24px", fontWeight: "800", color: "#EA580C", fontFamily: "monospace", marginTop: "2px" }}>
              Port 4001
            </div>
          </div>

          <div style={{ backgroundColor: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: "12px", padding: "16px 20px", boxShadow: "0 2px 8px rgba(15, 23, 42, 0.04)" }}>
            <span style={{ fontSize: "11.5px", fontWeight: "700", color: "#64748B", textTransform: "uppercase" }}>MQTT Broker</span>
            <div style={{ fontSize: "24px", fontWeight: "800", color: "#0284C7", fontFamily: "monospace", marginTop: "2px" }}>
              Port 1883
            </div>
          </div>
        </div>

        {/* ──────────────────────────────────────────────────────────
            FULL-WIDTH RESPONSIVE WIDGETS GRID (#FFFFFF cards)
            ────────────────────────────────────────────────────────── */}
        {widgets.length === 0 ? (
          <div
            style={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #E2E8F0",
              borderRadius: "12px",
              padding: "50px 24px",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              boxShadow: "0 2px 8px rgba(15, 23, 42, 0.04)",
            }}
          >
            <Layers size={36} color="#CBD5E1" style={{ marginBottom: "12px" }} />
            <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#0F172A", margin: "0 0 6px 0" }}>
              No Widgets Configured
            </h3>
            <p style={{ color: "#64748B", fontSize: "12.5px", maxWidth: "440px", margin: "0 auto 18px", lineHeight: "1.5" }}>
              This dashboard is waiting for metrics. Add gauges, sparklines, and interactive switch actuators in the Admin Console.
            </p>
            <a
              href="http://localhost:3000"
              target="_blank"
              rel="noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 18px",
                backgroundColor: "#F97316",
                color: "#FFFFFF",
                fontWeight: "700",
                fontSize: "12px",
                borderRadius: "6px",
                textDecoration: "none",
              }}
            >
              Open Admin Console (:3000) ↗
            </a>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 280px), 1fr))",
              gap: "16px",
            }}
          >
            {widgets.map((widget, idx) => {
              const widgetId = widget.id || widget._id || idx;
              const title = widget.title || widget.name || widget.config?.title || "Metric Widget";
              const type = (widget.type || "value").toLowerCase();
              const deviceName = widget.device_name || "ESP32 Sensor Node";
              const deviceStatus = (widget.device_status || "online").toLowerCase();
              const cfg = widget.config || {};
              const metricKey = cfg.metric || cfg.key || cfg.pin || "temperature";
              const devId = widget.device_id || widget.deviceId || cfg.device_id || "6ad84a0c622dd2082dd745ae";

              // Resolve current sensor value from telemetry payload or direct value
              let rawVal = widget.value;
              if (rawVal === undefined && widget.telemetry) {
                rawVal = widget.telemetry[metricKey] !== undefined
                  ? widget.telemetry[metricKey]
                  : Object.values(widget.telemetry)[0];
              }
              if (rawVal === undefined) rawVal = "—";

              const unit = cfg.unit || cfg.suffix || (metricKey === "temperature" ? "°C" : metricKey === "humidity" ? "%" : "");
              const min = cfg.min !== undefined ? Number(cfg.min) : 0;
              const max = cfg.max !== undefined ? Number(cfg.max) : (metricKey === "humidity" ? 100 : 80);

              // Series history for real-time sparkline
              const seriesKey = `${devId}_${metricKey}`;
              const numericVal = Number(rawVal);
              const history = telemetryHistory[seriesKey] || [
                !isNaN(numericVal) ? numericVal : 24,
                !isNaN(numericVal) ? numericVal : 25,
                !isNaN(numericVal) ? numericVal : 24,
                !isNaN(numericVal) ? numericVal : 26,
              ];

              if (type === "switch" || type === "toggle" || type === "led") {
                return (
                  <InteractiveSwitchWidget
                    key={widgetId}
                    title={title}
                    deviceName={deviceName}
                    deviceStatus={deviceStatus}
                    pin={metricKey}
                    initialState={rawVal}
                    isSending={isCommandSending[widgetId || metricKey]}
                    onToggle={(nextState) => handleToggleActuator(widget, nextState)}
                  />
                );
              }

              return (
                <SensorTelemetryWidget
                  key={widgetId}
                  title={title}
                  deviceName={deviceName}
                  deviceStatus={deviceStatus}
                  value={rawVal}
                  unit={unit}
                  min={min}
                  max={max}
                  metricKey={metricKey}
                  type={type === "gauge" ? "gauge" : "sparkline"}
                  history={history}
                  isLiveWs={isWsLive}
                />
              );
            })}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
