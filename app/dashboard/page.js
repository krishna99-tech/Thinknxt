"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api, { getPublicAppConfig } from "../../lib/api";
import { getToken, logout } from "../../lib/auth";
import { useWebSocket } from "../../lib/useWebSocket";
import DashboardShell from "../../components/dashboard/DashboardShell";
import HardwareNodeBar from "../../components/dashboard/HardwareNodeBar";
import {
  Activity,
  Cpu,
  Layers,
  Radio,
  Wifi,
  Bell,
  Settings,
  Zap,
  RefreshCw,
  Search,
  Server,
  Database,
  Calendar,
  ExternalLink,
  ShieldCheck,
  Grid,
  List,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Folder,
  ArrowUpRight,
  Clock,
  Play,
  Pin,
  PinOff,
  Star,
} from "../../components/common/Icons";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [workspaces, setWorkspaces] = useState([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState(null);
  const [dashboards, setDashboards] = useState([]);
  const [loadingDashboards, setLoadingDashboards] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pinnedDashboard, setPinnedDashboard] = useState(null);
  const [pinLoadingId, setPinLoadingId] = useState(null);
  const [pinNotification, setPinNotification] = useState("");
  const [platformConfig, setPlatformConfig] = useState(null);
  const [streamCount, setStreamCount] = useState(0);
  const [filterQuery, setFilterQuery] = useState("");
  const [viewMode, setViewMode] = useState("grid"); // 'grid' | 'table'
  const [timeRange, setTimeRange] = useState("Live");
  const [recentPackets, setRecentPackets] = useState([]);

  // Genuine hardware stats state from live WebSocket / telemetry
  const [deviceStats, setDeviceStats] = useState({
    ip: null,
    rssi: null,
    uptime: null,
    free_heap: null,
  });
  const [devices, setDevices] = useState([]);
  const [lastPacketTime, setLastPacketTime] = useState(null);

  // Fastify WebSocket listener on port 4001 for live telemetry & status events
  const handleLiveEvent = useCallback((msg) => {
    if (!msg) return;
    const now = new Date();
    setLastPacketTime(now);

    if (msg.type === "status_update" || msg.type === "telemetry_update" || msg.payload || msg.data) {
      setStreamCount((c) => c + 1);

      const telemData = msg.payload || msg.data || {};
      if (telemData.rssi !== undefined || telemData.uptime !== undefined || telemData.free_heap !== undefined || telemData.ip !== undefined) {
        setDeviceStats((prev) => ({
          ip: telemData.ip || prev.ip,
          rssi: telemData.rssi !== undefined ? Number(telemData.rssi) : prev.rssi,
          uptime: telemData.uptime !== undefined ? Number(telemData.uptime) : prev.uptime,
          free_heap: telemData.free_heap !== undefined ? Number(telemData.free_heap) : prev.free_heap,
        }));
      }

      // Keep recent 6 log items for compact audit table
      setRecentPackets((prev) => [
        {
          id: `${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          time: now.toLocaleTimeString(),
          devId: msg.device_id || "esp32_node",
          type: msg.type || "telemetry",
          status: (msg.status || "online").toLowerCase(),
          summary: Object.keys(telemData).length > 0 ? Object.keys(telemData).slice(0, 3).join(", ") : "heartbeat",
        },
        ...prev.slice(0, 5),
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

        // Fetch user preferences for pinned dashboard
        try {
          const prefRes = await api.get("/admin/users/me/preferences");
          if (prefRes.data?.pinned_dashboard) {
            setPinnedDashboard(prefRes.data.pinned_dashboard);
            try {
              localStorage.setItem("thingsnxt_pinned_dashboard", JSON.stringify(prefRes.data.pinned_dashboard));
            } catch {}
          } else {
            setPinnedDashboard(null);
            try {
              localStorage.removeItem("thingsnxt_pinned_dashboard");
            } catch {}
          }
        } catch {
          try {
            const savedStr = localStorage.getItem("thingsnxt_pinned_dashboard");
            if (savedStr) setPinnedDashboard(JSON.parse(savedStr));
          } catch {}
        }
      } catch (err) {
        if (err.response?.status === 401) {
          logout("/login");
        } else {
          setError("Failed to load user profile. Please verify your connection.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  const handleTogglePin = async (dash) => {
    const dashId = dash.id || dash._id;
    const isCurrentlyPinned = pinnedDashboard?.id === dashId;
    setPinLoadingId(dashId);
    setPinNotification("");

    const currentWsId = selectedWorkspace?.workspace_id || selectedWorkspace?.slug || selectedWorkspace?.id || "default";
    const newPinned = isCurrentlyPinned
      ? null
      : {
          id: dashId,
          workspace_id: currentWsId,
          name: dash.name || "Telemetry Dashboard",
        };

    try {
      await api.put("/admin/users/me/preferences", {
        pinned_dashboard: newPinned,
      });
      setPinnedDashboard(newPinned);
      if (newPinned) {
        try {
          localStorage.setItem("thingsnxt_pinned_dashboard", JSON.stringify(newPinned));
        } catch {}
        setPinNotification(`"${dash.name || "Dashboard"}" pinned! This view will automatically open when you sign in.`);
      } else {
        try {
          localStorage.removeItem("thingsnxt_pinned_dashboard");
        } catch {}
        setPinNotification("Dashboard unpinned. Login will now navigate to the dashboard gallery.");
      }
      setTimeout(() => setPinNotification(""), 4500);
    } catch (err) {
      console.error("Failed to sync pinned dashboard:", err);
      // Fallback local persistence
      if (newPinned) {
        try {
          localStorage.setItem("thingsnxt_pinned_dashboard", JSON.stringify(newPinned));
        } catch {}
        setPinnedDashboard(newPinned);
        setPinNotification(`"${dash.name || "Dashboard"}" pinned locally in this browser.`);
      } else {
        try {
          localStorage.removeItem("thingsnxt_pinned_dashboard");
        } catch {}
        setPinnedDashboard(null);
        setPinNotification("Dashboard unpinned locally.");
      }
      setTimeout(() => setPinNotification(""), 4500);
    } finally {
      setPinLoadingId(null);
    }
  };

  // Fetch dashboards for the selected workspace
  useEffect(() => {
    if (!selectedWorkspace) {
      setDashboards([]);
      setDevices([]);
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

    // Fetch genuine devices for this workspace
    api.get("/devices", { params: { workspace_id: wsId } })
      .then((res) => {
        setDevices(Array.isArray(res.data) ? res.data : []);
      })
      .catch((err) => {
        console.error("Failed to load workspace devices:", err);
        setDevices([]);
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
      api.get("/devices", { params: { workspace_id: wsId } })
        .then((res) => {
          if (Array.isArray(res.data)) {
            setDevices(res.data);
          }
        })
        .catch(() => {});
    }, 5000);

    return () => clearInterval(pollInterval);
  }, [selectedWorkspace]);

  const filteredDashboards = useMemo(() => {
    if (!filterQuery.trim()) return dashboards;
    const q = filterQuery.toLowerCase();
    return dashboards.filter(
      (d) =>
        (d.name && d.name.toLowerCase().includes(q)) ||
        (d.description && d.description.toLowerCase().includes(q))
    );
  }, [dashboards, filterQuery]);

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
              width: "40px",
              height: "40px",
              border: "3px solid #E2E8F0",
              borderTopColor: "#F97316",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
              margin: "0 auto 16px",
            }}
          />
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
          <p style={{ color: "#64748B", fontSize: "13px", fontWeight: "600", fontFamily: "monospace" }}>
            LOADING ENTERPRISE IoT CONSOLE...
          </p>
        </div>
      </div>
    );
  }

  const currentWsName = selectedWorkspace?.name || selectedWorkspace?.slug || "Default Tenant";
  const wsId = selectedWorkspace?.workspace_id || selectedWorkspace?.slug || selectedWorkspace?.id || "default";

  return (
    <DashboardShell
      currentWsName={currentWsName}
      wsId={wsId}
      workspaces={workspaces}
      onSelectWorkspace={setSelectedWorkspace}
      user={user}
      isLiveWs={isLiveWs}
      activeNav="dashboards"
      dashboards={dashboards}
      timeRange={timeRange}
      onTimeRangeChange={setTimeRange}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {/* Maintenance Alert Banner */}
        {(platformConfig?.mobile_app?.maintenance_mode || platformConfig?.mobile_app?.maintenance_blocking) && (
          <div
            style={{
              backgroundColor: "#FEF2F2",
              border: "1px solid #FECACA",
              borderRadius: "12px",
              padding: "14px 18px",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              color: "#991B1B",
              fontSize: "13px",
            }}
          >
            <AlertTriangle size={18} color="#DC2626" />
            <div>
              <strong style={{ color: "#DC2626", marginRight: "6px" }}>Platform Maintenance:</strong>
              {platformConfig?.mobile_app?.maintenance_message || "Services are currently undergoing scheduled maintenance."}
            </div>
          </div>
        )}

        {error && (
          <div
            style={{
              backgroundColor: "#FEF2F2",
              border: "1px solid #FECACA",
              borderRadius: "12px",
              padding: "14px 18px",
              color: "#991B1B",
              fontSize: "13px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <AlertTriangle size={16} color="#DC2626" />
            <span>{error}</span>
          </div>
        )}

        {/* Pinned Dashboard Feedback Alert */}
        {pinNotification && (
          <div
            style={{
              backgroundColor: "#ECFDF5",
              border: "1px solid #A7F3D0",
              borderRadius: "12px",
              padding: "14px 18px",
              color: "#065F46",
              fontSize: "13px",
              fontWeight: "600",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              boxShadow: "0 2px 6px rgba(5, 150, 105, 0.08)",
            }}
          >
            <CheckCircle2 size={16} color="#059669" />
            <span>{pinNotification}</span>
          </div>
        )}

        {/* Pinned Default Landing Page Banner */}
        {pinnedDashboard?.id && (
          <div
            style={{
              backgroundColor: "#FFF7ED",
              border: "1px solid #FFEDD5",
              borderRadius: "12px",
              padding: "16px 22px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "14px",
              boxShadow: "0 2px 8px rgba(249, 115, 22, 0.06)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "10px",
                  backgroundColor: "#EA580C",
                  color: "#FFFFFF",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 2px 8px rgba(234, 88, 12, 0.25)",
                }}
              >
                <Pin size={18} color="#FFFFFF" />
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "14px", fontWeight: "800", color: "#9A3412" }}>
                    Default Login Dashboard:
                  </span>
                  <span style={{ fontSize: "14px", fontWeight: "700", color: "#0F172A" }}>
                    {pinnedDashboard.name || "Telemetry Dashboard"}
                  </span>
                </div>
                <p style={{ fontSize: "12px", color: "#C2410C", margin: "2px 0 0" }}>
                  This dashboard will automatically open whenever you log in.
                </p>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Link
                href={`/dashboard/${pinnedDashboard.id}?ws=${encodeURIComponent(pinnedDashboard.workspace_id || wsId)}`}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "8px 16px",
                  borderRadius: "6px",
                  backgroundColor: "#EA580C",
                  color: "#FFFFFF",
                  fontSize: "12.5px",
                  fontWeight: "700",
                  textDecoration: "none",
                  boxShadow: "0 2px 6px rgba(234, 88, 12, 0.25)",
                }}
              >
                <span>Launch Pinned View</span>
                <ArrowUpRight size={14} />
              </Link>
              <button
                type="button"
                onClick={() => handleTogglePin({ id: pinnedDashboard.id, name: pinnedDashboard.name })}
                disabled={pinLoadingId === pinnedDashboard.id}
                style={{
                  padding: "8px 14px",
                  borderRadius: "6px",
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #FDBA74",
                  color: "#9A3412",
                  fontSize: "12.5px",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                {pinLoadingId === pinnedDashboard.id ? "Unpinning..." : "Unpin"}
              </button>
            </div>
          </div>
        )}

        {/* ──────────────────────────────────────────────────────────
            PAGE HEADER: Operational Context Banner (#FFFFFF, border #E2E8F0)
            ────────────────────────────────────────────────────────── */}
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
            gap: "20px",
            boxShadow: "0 2px 8px rgba(15, 23, 42, 0.04)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div
              style={{
                width: "44px",
                height: "44px",
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
              <Folder size={22} />
            </div>

            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", marginBottom: "4px" }}>
                <h1 style={{ fontSize: "22px", fontWeight: "800", color: "#0F172A", margin: 0, letterSpacing: "-0.02em" }}>
                  {currentWsName.charAt(0).toUpperCase() + currentWsName.slice(1)} Operations
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
                  <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#F97316" }} />
                  TENANT: {wsId}
                </span>

                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: "700",
                    padding: "3px 9px",
                    borderRadius: "9999px",
                    backgroundColor: "#ECFDF5",
                    color: "#059669",
                    border: "1px solid #A7F3D0",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "5px",
                  }}
                >
                  <span style={{ width: "5px", height: "5px", borderRadius: "50%", backgroundColor: "#10B981" }} />
                  Mesh Active
                </span>
              </div>

              <p style={{ fontSize: "13.5px", color: "#64748B", margin: 0, lineHeight: "1.5", maxWidth: "700px" }}>
                Live telemetry monitoring, MQTT gateway routing, and industrial hardware control.
              </p>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={() => {
                if (selectedWorkspace) {
                  const id = selectedWorkspace.workspace_id || selectedWorkspace.slug || selectedWorkspace.id;
                  setLoadingDashboards(true);
                  api.get(`/admin/workspaces/${id}/dashboards`)
                    .then((res) => setDashboards(Array.isArray(res.data) ? res.data : []))
                    .finally(() => setLoadingDashboards(false));
                }
              }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 14px",
                borderRadius: "6px",
                backgroundColor: "#F8FAFC",
                border: "1px solid #E2E8F0",
                color: "#334155",
                fontSize: "12px",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              <RefreshCw size={13} />
              <span>Refresh Telemetry</span>
            </button>

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
                backgroundColor: "#F97316",
                color: "#FFFFFF",
                fontSize: "12px",
                fontWeight: "700",
                textDecoration: "none",
                boxShadow: "0 2px 8px rgba(249, 115, 22, 0.35)",
              }}
            >
              <Zap size={14} />
              <span>Configure in Admin</span>
            </a>
          </div>
        </section>

        {/* ──────────────────────────────────────────────────────────
            OPERATIONAL KPI METRICS STRIP (#FFFFFF cards, #E2E8F0 borders)
            ────────────────────────────────────────────────────────── */}
        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "16px",
          }}
        >
          <div
            style={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #E2E8F0",
              borderRadius: "12px",
              padding: "20px 24px",
              boxShadow: "0 2px 8px rgba(15, 23, 42, 0.04)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <span style={{ fontSize: "11.5px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.06em", color: "#64748B" }}>
                Fleet Online
              </span>
              <Cpu size={15} color="#10B981" />
            </div>
            <div style={{ fontSize: "26px", fontWeight: "800", color: "#0F172A", fontFamily: "monospace" }}>
              {devices.length > 0 ? (
                <>{devices.filter((d) => d.status === "online").length} <span style={{ fontSize: "13px", color: "#64748B", fontWeight: "500" }}>/ {devices.length} Node{devices.length === 1 ? "" : "s"}</span></>
              ) : (
                <span style={{ fontSize: "20px", color: "#94A3B8" }}>0 Nodes</span>
              )}
            </div>
            <div style={{ fontSize: "11.5px", color: devices.some((d) => d.status === "online") ? "#059669" : "#64748B", marginTop: "4px", display: "flex", alignItems: "center", gap: "4px" }}>
              {devices.some((d) => d.status === "online") ? <CheckCircle2 size={12} /> : <AlertTriangle size={12} color="#94A3B8" />}
              <span>
                {devices.length === 0
                  ? "No hardware nodes registered"
                  : devices.some((d) => d.status === "online")
                  ? `${devices.filter((d) => d.status === "online").length} active node broadcasting MQTT`
                  : "All registered nodes offline"}
              </span>
            </div>
          </div>

          <div
            style={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #E2E8F0",
              borderRadius: "12px",
              padding: "20px 24px",
              boxShadow: "0 2px 8px rgba(15, 23, 42, 0.04)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <span style={{ fontSize: "11.5px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.06em", color: "#64748B" }}>
                Telemetry Ingest
              </span>
              <Activity size={15} color="#F97316" />
            </div>
            <div style={{ fontSize: "26px", fontWeight: "800", color: "#0F172A", fontFamily: "monospace" }}>
              {streamCount}
            </div>
            <div style={{ fontSize: "11.5px", color: "#64748B", marginTop: "4px" }}>
              Sub-50ms Fastify WS stream
            </div>
          </div>

          <div
            style={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #E2E8F0",
              borderRadius: "12px",
              padding: "20px 24px",
              boxShadow: "0 2px 8px rgba(15, 23, 42, 0.04)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <span style={{ fontSize: "11.5px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.06em", color: "#64748B" }}>
                Active Dashboards
              </span>
              <Layers size={15} color="#0284C7" />
            </div>
            <div style={{ fontSize: "26px", fontWeight: "800", color: "#0F172A", fontFamily: "monospace" }}>
              {dashboards.length}
            </div>
            <div style={{ fontSize: "11.5px", color: "#64748B", marginTop: "4px" }}>
              Configured telemetry views
            </div>
          </div>

          <div
            style={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #E2E8F0",
              borderRadius: "12px",
              padding: "20px 24px",
              boxShadow: "0 2px 8px rgba(15, 23, 42, 0.04)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <span style={{ fontSize: "11.5px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.06em", color: "#64748B" }}>
                Access Clearance
              </span>
              <ShieldCheck size={15} color="#7E22CE" />
            </div>
            <div style={{ fontSize: "26px", fontWeight: "800", color: "#0F172A", fontFamily: "monospace" }}>
              {user?.role || "Operator"}
            </div>
            <div style={{ fontSize: "11.5px", color: "#64748B", marginTop: "4px" }}>
              Workspace permissions verified
            </div>
          </div>
        </section>

        {/* ──────────────────────────────────────────────────────────
            HARDWARE GATEWAY & NODE HEALTH STRIP
            ────────────────────────────────────────────────────────── */}
        {(() => {
          const primaryDevice = devices.find((d) => d.status === "online") || devices[0];
          return (
            <HardwareNodeBar
              deviceId={primaryDevice ? (primaryDevice.id || primaryDevice._id) : null}
              ip={deviceStats.ip || primaryDevice?.ip || null}
              rssi={deviceStats.rssi}
              uptime={deviceStats.uptime}
              freeHeap={deviceStats.free_heap}
              lastUpdated={lastPacketTime}
              status={primaryDevice ? primaryDevice.status : "offline"}
            />
          );
        })()}

        {/* ──────────────────────────────────────────────────────────
            DASHBOARDS OPERATIONAL SECTION (Grid & Table Views)
            ────────────────────────────────────────────────────────── */}
        <section
          style={{
            backgroundColor: "#FFFFFF",
            border: "1px solid #E2E8F0",
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(15, 23, 42, 0.04)",
            overflow: "hidden",
          }}
        >
          {/* Section Toolbar */}
          <div
            style={{
              padding: "16px 24px",
              borderBottom: "1px solid #E2E8F0",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "12px",
              backgroundColor: "#FFFFFF",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "15px", fontWeight: "700", color: "#0F172A" }}>
                Telemetry Dashboards
              </span>
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: "700",
                  fontFamily: "monospace",
                  padding: "2px 8px",
                  borderRadius: "9999px",
                  backgroundColor: "#F1F5F9",
                  color: "#64748B",
                  border: "1px solid #E2E8F0",
                }}
              >
                {filteredDashboards.length}
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              {/* Search input */}
              <div style={{ position: "relative" }}>
                <Search
                  size={14}
                  color="#64748B"
                  style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }}
                />
                <input
                  type="text"
                  placeholder="Filter dashboards..."
                  value={filterQuery}
                  onChange={(e) => setFilterQuery(e.target.value)}
                  style={{
                    backgroundColor: "#F8FAFC",
                    border: "1px solid #CBD5E1",
                    borderRadius: "6px",
                    padding: "7px 12px 7px 32px",
                    color: "#0F172A",
                    fontSize: "12px",
                    outline: "none",
                    width: "200px",
                  }}
                />
              </div>

              {/* View Switch: Grid vs Table */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  backgroundColor: "#F1F5F9",
                  border: "1px solid #E2E8F0",
                  borderRadius: "6px",
                  padding: "2px",
                }}
              >
                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  style={{
                    padding: "4px 8px",
                    borderRadius: "4px",
                    border: "none",
                    backgroundColor: viewMode === "grid" ? "#FFFFFF" : "transparent",
                    color: viewMode === "grid" ? "#0F172A" : "#64748B",
                    boxShadow: viewMode === "grid" ? "0 1px 3px rgba(15, 23, 42, 0.08)" : "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                  }}
                  title="Grid view"
                >
                  <Grid size={13} />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("table")}
                  style={{
                    padding: "4px 8px",
                    borderRadius: "4px",
                    border: "none",
                    backgroundColor: viewMode === "table" ? "#FFFFFF" : "transparent",
                    color: viewMode === "table" ? "#0F172A" : "#64748B",
                    boxShadow: viewMode === "table" ? "0 1px 3px rgba(15, 23, 42, 0.08)" : "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                  }}
                  title="Table view"
                >
                  <List size={13} />
                </button>
              </div>
            </div>
          </div>

          {/* Dashboards Content */}
          {loadingDashboards ? (
            <div style={{ padding: "48px 24px", textAlign: "center" }}>
              <div
                style={{
                  width: "28px",
                  height: "28px",
                  border: "2px solid #E2E8F0",
                  borderTopColor: "#F97316",
                  borderRadius: "50%",
                  animation: "spin 0.8s linear infinite",
                  margin: "0 auto 12px",
                }}
              />
              <div style={{ fontSize: "13px", color: "#64748B" }}>Loading dashboards...</div>
            </div>
          ) : filteredDashboards.length === 0 ? (
            <div style={{ padding: "50px 24px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
              <Layers size={36} color="#CBD5E1" style={{ marginBottom: "12px" }} />
              <div style={{ fontSize: "15px", fontWeight: "700", color: "#0F172A", marginBottom: "4px" }}>
                {filterQuery ? "No matching dashboards" : "No Dashboards Configured"}
              </div>
              <p style={{ fontSize: "13px", color: "#64748B", maxWidth: "420px", lineHeight: "1.5", margin: "0 auto 16px" }}>
                {filterQuery
                  ? "Try adjusting your search criteria."
                  : "Your workspace has not configured any dashboards yet. Create telemetry visualizers and actuators in the Admin Console."}
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
                  borderRadius: "6px",
                  backgroundColor: "#F97316",
                  color: "#FFFFFF",
                  fontSize: "12px",
                  fontWeight: "700",
                  textDecoration: "none",
                }}
              >
                Open Admin Console (:3000) ↗
              </a>
            </div>
          ) : viewMode === "grid" ? (
            /* GRID VIEW (#FFFFFF cards with #E2E8F0 borders) */
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 280px), 1fr))",
                gap: "16px",
                padding: "20px 24px",
                backgroundColor: "#F8FAFC",
              }}
            >
              {filteredDashboards.map((dash) => {
                const dashId = dash.id || dash._id;
                const widgetCount = dash.widget_count || dash.widgets?.length || 0;
                const isPinned = pinnedDashboard?.id === dashId;
                const isPinLoading = pinLoadingId === dashId;

                return (
                  <div
                    key={dashId}
                    style={{
                      backgroundColor: "#FFFFFF",
                      border: isPinned ? "2px solid #F97316" : "1px solid #E2E8F0",
                      borderRadius: "12px",
                      padding: "20px 22px",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      gap: "14px",
                      minHeight: "180px",
                      boxShadow: isPinned ? "0 4px 16px rgba(249, 115, 22, 0.12)" : "0 2px 8px rgba(15, 23, 42, 0.04)",
                      position: "relative",
                      transition: "border-color 0.15s ease, box-shadow 0.15s ease",
                    }}
                  >
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <div
                            style={{
                              width: "36px",
                              height: "36px",
                              borderRadius: "8px",
                              backgroundColor: isPinned ? "#EA580C" : "#FFF7ED",
                              border: `1px solid ${isPinned ? "#EA580C" : "#FFEDD5"}`,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: isPinned ? "#FFFFFF" : "#EA580C",
                            }}
                          >
                            <Activity size={18} />
                          </div>
                          {isPinned && (
                            <span
                              style={{
                                fontSize: "11px",
                                fontWeight: "700",
                                color: "#EA580C",
                                backgroundColor: "#FFF7ED",
                                border: "1px solid #FFEDD5",
                                borderRadius: "9999px",
                                padding: "2px 8px",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "4px",
                              }}
                            >
                              <Pin size={10} color="#EA580C" /> Pinned Default
                            </span>
                          )}
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <span
                            style={{
                              fontSize: "11px",
                              fontWeight: "600",
                              fontFamily: "monospace",
                              padding: "2px 8px",
                              borderRadius: "4px",
                              backgroundColor: "#F1F5F9",
                              color: "#64748B",
                              border: "1px solid #E2E8F0",
                            }}
                          >
                            {widgetCount} Widgets
                          </span>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleTogglePin(dash);
                            }}
                            disabled={isPinLoading}
                            title={isPinned ? "Unpin (Currently opens automatically on login)" : "Pin as default landing page on login"}
                            style={{
                              backgroundColor: isPinned ? "#FFF7ED" : "#F8FAFC",
                              border: `1px solid ${isPinned ? "#FDBA74" : "#E2E8F0"}`,
                              borderRadius: "6px",
                              padding: "5px 8px",
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                              color: isPinned ? "#EA580C" : "#64748B",
                              transition: "all 0.15s ease",
                            }}
                          >
                            <Pin size={13} color={isPinned ? "#EA580C" : "#64748B"} />
                            <span style={{ fontSize: "11px", fontWeight: "600" }}>
                              {isPinLoading ? "..." : isPinned ? "Pinned" : "Pin"}
                            </span>
                          </button>
                        </div>
                      </div>

                      <h4 style={{ fontSize: "15px", fontWeight: "700", color: "#0F172A", margin: "0 0 4px 0" }}>
                        {dash.name || "Telemetry Dashboard"}
                      </h4>
                      <p style={{ fontSize: "12.5px", color: "#64748B", lineHeight: "1.5", margin: 0 }}>
                        {dash.description || "Real-time telemetry and hardware status monitoring."}
                      </p>
                    </div>

                    <Link
                      href={`/dashboard/${dashId}?ws=${encodeURIComponent(wsId)}`}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "9px 14px",
                        borderRadius: "6px",
                        backgroundColor: "#FFF7ED",
                        color: "#EA580C",
                        border: "1px solid #FFEDD5",
                        fontSize: "12.5px",
                        fontWeight: "700",
                        textDecoration: "none",
                        transition: "all 0.15s ease",
                      }}
                    >
                      <span>Launch Live Viewer</span>
                      <ArrowUpRight size={14} />
                    </Link>
                  </div>
                );
              })}
            </div>
          ) : (
            /* TABLE VIEW */
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #E2E8F0", backgroundColor: "#F8FAFC", color: "#64748B", textAlign: "left" }}>
                    <th style={{ padding: "12px 24px", fontWeight: "600" }}>Dashboard</th>
                    <th style={{ padding: "12px 16px", fontWeight: "600" }}>Description</th>
                    <th style={{ padding: "12px 16px", fontWeight: "600" }}>Widgets</th>
                    <th style={{ padding: "12px 16px", fontWeight: "600" }}>Status</th>
                    <th style={{ padding: "12px 24px", fontWeight: "600", textAlign: "right" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDashboards.map((dash) => {
                    const dashId = dash.id || dash._id;
                    const widgetCount = dash.widget_count || dash.widgets?.length || 0;
                    const isPinned = pinnedDashboard?.id === dashId;
                    const isPinLoading = pinLoadingId === dashId;

                    return (
                      <tr
                        key={dashId}
                        style={{
                          borderBottom: "1px solid #F1F5F9",
                          backgroundColor: isPinned ? "#FFFDFB" : "transparent",
                          transition: "background-color 0.1s ease",
                        }}
                      >
                        <td style={{ padding: "14px 24px", color: "#0F172A", fontWeight: "600" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <Activity size={15} color="#EA580C" />
                            <span>{dash.name || "Telemetry Dashboard"}</span>
                            {isPinned && (
                              <span
                                style={{
                                  fontSize: "10px",
                                  fontWeight: "700",
                                  color: "#EA580C",
                                  backgroundColor: "#FFF7ED",
                                  border: "1px solid #FFEDD5",
                                  borderRadius: "9999px",
                                  padding: "1px 6px",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "3px",
                                }}
                              >
                                <Pin size={9} color="#EA580C" /> Pinned
                              </span>
                            )}
                          </div>
                        </td>
                        <td style={{ padding: "14px 16px", color: "#64748B" }}>
                          {dash.description || "Hardware monitoring"}
                        </td>
                        <td style={{ padding: "14px 16px", fontFamily: "monospace", color: "#334155", fontWeight: "600" }}>
                          {widgetCount} widgets
                        </td>
                        <td style={{ padding: "14px 16px" }}>
                          <span
                            style={{
                              fontSize: "10.5px",
                              fontWeight: "700",
                              padding: "2px 7px",
                              borderRadius: "4px",
                              backgroundColor: "#ECFDF5",
                              color: "#059669",
                              border: "1px solid #A7F3D0",
                            }}
                          >
                            Active
                          </span>
                        </td>
                        <td style={{ padding: "14px 24px", textAlign: "right" }}>
                          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", justifyContent: "flex-end" }}>
                            <button
                              type="button"
                              onClick={() => handleTogglePin(dash)}
                              disabled={isPinLoading}
                              title={isPinned ? "Unpin default landing page" : "Pin as default landing page on login"}
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "4px",
                                padding: "6px 10px",
                                borderRadius: "6px",
                                backgroundColor: isPinned ? "#FFF7ED" : "#F8FAFC",
                                color: isPinned ? "#EA580C" : "#64748B",
                                border: `1px solid ${isPinned ? "#FDBA74" : "#E2E8F0"}`,
                                fontSize: "11.5px",
                                fontWeight: "600",
                                cursor: "pointer",
                              }}
                            >
                              <Pin size={12} color={isPinned ? "#EA580C" : "#64748B"} />
                              <span>{isPinLoading ? "..." : isPinned ? "Pinned" : "Pin"}</span>
                            </button>
                            <Link
                              href={`/dashboard/${dashId}?ws=${encodeURIComponent(wsId)}`}
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "4px",
                                padding: "6px 12px",
                                borderRadius: "6px",
                                backgroundColor: "#FFF7ED",
                                color: "#EA580C",
                                border: "1px solid #FFEDD5",
                                fontSize: "12px",
                                fontWeight: "700",
                                textDecoration: "none",
                              }}
                            >
                              <span>Launch</span>
                              <ArrowUpRight size={13} />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* ──────────────────────────────────────────────────────────
            RECENT TELEMETRY & INGEST AUDIT TABLE (#FFFFFF card)
            ────────────────────────────────────────────────────────── */}
        <section
          style={{
            backgroundColor: "#FFFFFF",
            border: "1px solid #E2E8F0",
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(15, 23, 42, 0.04)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "16px 24px",
              borderBottom: "1px solid #E2E8F0",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              backgroundColor: "#FFFFFF",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Clock size={16} color="#64748B" />
              <span style={{ fontSize: "14.5px", fontWeight: "700", color: "#0F172A" }}>
                Recent Telemetry Packets
              </span>
            </div>
            <span style={{ fontSize: "11px", color: "#64748B", fontFamily: "monospace" }}>
              Fastify Port 4001 • Mosquitto Port 1883
            </span>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12.5px" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #E2E8F0", backgroundColor: "#F8FAFC", color: "#64748B", textAlign: "left" }}>
                  <th style={{ padding: "10px 24px", fontWeight: "600" }}>Time</th>
                  <th style={{ padding: "10px 16px", fontWeight: "600" }}>Source Node</th>
                  <th style={{ padding: "10px 16px", fontWeight: "600" }}>Channel</th>
                  <th style={{ padding: "10px 16px", fontWeight: "600" }}>Payload Summary</th>
                  <th style={{ padding: "10px 24px", fontWeight: "600", textAlign: "right" }}>Health</th>
                </tr>
              </thead>
              <tbody>
                {recentPackets.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ padding: "28px 20px", textAlign: "center", color: "#64748B" }}>
                      Listening for incoming MQTT telemetry packets...
                    </td>
                  </tr>
                ) : (
                  recentPackets.map((pkt) => (
                    <tr key={pkt.id} style={{ borderBottom: "1px solid #F1F5F9" }}>
                      <td style={{ padding: "12px 24px", fontFamily: "monospace", color: "#334155" }}>
                        {pkt.time}
                      </td>
                      <td style={{ padding: "12px 16px", fontFamily: "monospace", color: "#EA580C", fontWeight: "600" }}>
                        {pkt.devId}
                      </td>
                      <td style={{ padding: "12px 16px", color: "#64748B" }}>
                        {pkt.type}
                      </td>
                      <td style={{ padding: "12px 16px", fontFamily: "monospace", color: "#0284C7" }}>
                        {pkt.summary}
                      </td>
                      <td style={{ padding: "12px 24px", textAlign: "right" }}>
                        <span
                          style={{
                            fontSize: "10px",
                            fontWeight: "700",
                            padding: "2px 7px",
                            borderRadius: "4px",
                            backgroundColor: "#ECFDF5",
                            color: "#059669",
                            border: "1px solid #A7F3D0",
                          }}
                        >
                          OK (200)
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Quick Reference Footer Links */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "14px",
          }}
        >
          <Link
            href="/products"
            style={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #E2E8F0",
              borderRadius: "12px",
              padding: "16px 20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              textDecoration: "none",
              color: "#0F172A",
              boxShadow: "0 2px 8px rgba(15, 23, 42, 0.04)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <Cpu size={18} color="#EA580C" />
              <div>
                <div style={{ fontSize: "13.5px", fontWeight: "700", color: "#0F172A" }}>
                  Device Catalog
                </div>
                <div style={{ fontSize: "11.5px", color: "#64748B" }}>
                  Supported hardware microcontrollers
                </div>
              </div>
            </div>
            <ArrowUpRight size={15} color="#94A3B8" />
          </Link>

          <Link
            href="/documentation"
            style={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #E2E8F0",
              borderRadius: "12px",
              padding: "16px 20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              textDecoration: "none",
              color: "#0F172A",
              boxShadow: "0 2px 8px rgba(15, 23, 42, 0.04)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <Layers size={18} color="#0284C7" />
              <div>
                <div style={{ fontSize: "13.5px", fontWeight: "700", color: "#0F172A" }}>
                  Firmware Documentation
                </div>
                <div style={{ fontSize: "11.5px", color: "#64748B" }}>
                  MQTT, WebSocket & C++ SDK guides
                </div>
              </div>
            </div>
            <ArrowUpRight size={15} color="#94A3B8" />
          </Link>
        </div>
      </div>
    </DashboardShell>
  );
}
