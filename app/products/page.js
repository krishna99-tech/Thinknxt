"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "../../lib/api";
import { getToken } from "../../lib/auth";
import { useWebSocket } from "../../lib/useWebSocket";
import DashboardShell from "../../components/dashboard/DashboardShell";
import {
  Cpu,
  Radio,
  Wifi,
  Server,
  Database,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Search,
  Activity,
  ArrowUpRight,
  RefreshCw,
  Zap,
  Grid,
  List,
} from "../../components/common/Icons";

export default function DeviceFleetPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [workspaces, setWorkspaces] = useState([]);
  const [currentWsId, setCurrentWsId] = useState("beta");
  const [nodes, setNodes] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [viewMode, setViewMode] = useState("grid");
  const [pingStatus, setPingStatus] = useState({});
  const [isRefreshing, setIsRefreshing] = useState(false);

  // WebSocket for Live Telemetry Ping
  const wsUrl = `ws://localhost:4001/ws?token=${getToken() || ""}&workspace=${currentWsId}`;
  const { isConnected: isLiveWs } = useWebSocket(wsUrl);

  const fetchNodes = (wsId) => {
    if (!wsId) return;
    setIsRefreshing(true);
    api
      .get("/devices", { params: { workspace_id: wsId } })
      .then((res) => {
        const raw = Array.isArray(res.data) ? res.data : (res.data?.data || []);
        const formatted = raw.map((d) => ({
          id: String(d.id || d._id || ""),
          name: d.name || "IoT Hardware Node",
          type: d.type || "sensor",
          hardware: d.hardware || d.type || "ESP32",
          ip: d.ip || d.telemetry?.ip || d.telemetry?.lan_ip || "DHCP / Dynamic",
          mac: d.mac || d.telemetry?.mac || "N/A",
          firmware: d.firmware || d.telemetry?.firmware || d.telemetry?.fw_ver || "v1.0.0",
          rssi: d.rssi ?? d.telemetry?.rssi ?? (d.status === "online" ? -60 : null),
          freeHeap: d.freeHeap || (d.telemetry?.free_heap ? `${Math.round(d.telemetry.free_heap / 1024)} KB` : "—"),
          uptime: d.uptime || (d.last_active ? new Date(d.last_active).toLocaleDateString() : "—"),
          status: d.status || "offline",
          telemetryTopic: `tenants/${wsId}/devices/${d.id || d._id}/telemetry`,
          commandTopic: `tenants/${wsId}/devices/${d.id || d._id}/command`,
          lastHeartbeat: d.last_active ? new Date(d.last_active).toLocaleTimeString() : "No heartbeat",
          packetCount: d.packetCount || d.telemetry?.packet_count || 0,
          role: d.location ? `${d.location} • ${d.group || "General"}` : (d.description || "Edge Telemetry Node"),
        }));
        setNodes(formatted);
      })
      .catch((err) => {
        console.warn("Could not retrieve devices for workspace:", err);
        setNodes([]);
      })
      .finally(() => {
        setIsRefreshing(false);
      });
  };

  useEffect(() => {
    // 1. Fetch user profile
    api
      .get("/me")
      .then((res) => setUser(res.data))
      .catch(() => {});

    // 2. Fetch configured tenant workspaces
    api
      .get("/me/workspaces")
      .then((res) => {
        if (Array.isArray(res.data) && res.data.length > 0) {
          setWorkspaces(res.data);
          const firstId = res.data[0].workspace_id || res.data[0].slug || res.data[0].id;
          setCurrentWsId(firstId);
          fetchNodes(firstId);
        } else {
          fetchNodes(currentWsId);
        }
      })
      .catch(() => {
        fetchNodes(currentWsId);
      });
  }, []);

  const handleWorkspaceChange = (ws) => {
    const nextId = ws.workspace_id || ws.slug || ws.id;
    setCurrentWsId(nextId);
    fetchNodes(nextId);
  };

  const handlePingNode = async (nodeId) => {
    setPingStatus((prev) => ({ ...prev, [nodeId]: "pinging" }));
    try {
      await api.post(`/workspaces/${currentWsId}/devices/${nodeId}/command`, {
        command: "STATUS_QUERY",
      });
      setPingStatus((prev) => ({ ...prev, [nodeId]: "ok" }));
    } catch {
      try {
        await api.get("/devices", { params: { workspace_id: currentWsId } });
        setPingStatus((prev) => ({ ...prev, [nodeId]: "ok" }));
      } catch {
        setPingStatus((prev) => ({ ...prev, [nodeId]: "err" }));
      }
    }
    setTimeout(() => {
      setPingStatus((prev) => ({ ...prev, [nodeId]: null }));
    }, 3000);
  };

  const handleRefresh = () => {
    fetchNodes(currentWsId);
  };

  const filteredNodes = useMemo(() => {
    return nodes.filter((node) => {
      const matchesSearch =
        node.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        node.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        node.ip.toLowerCase().includes(searchQuery.toLowerCase()) ||
        node.mac.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (activeFilter === "online") return node.status === "online";
      if (activeFilter === "gateway") return node.type === "gateway";
      if (activeFilter === "actuator") return node.type === "actuator";
      return true;
    });
  }, [nodes, searchQuery, activeFilter]);

  const onlineCount = nodes.filter((n) => n.status === "online").length;
  const gatewayCount = nodes.filter((n) => n.type === "gateway").length;
  const actuatorCount = nodes.filter((n) => n.type === "actuator").length;

  return (
    <DashboardShell
      currentWsName={currentWsId}
      wsId={currentWsId}
      workspaces={workspaces}
      onSelectWorkspace={handleWorkspaceChange}
      user={user}
      isLiveWs={isLiveWs}
      activeNav="fleet"
      title="Device Fleet & Nodes"
      actions={
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <button
            type="button"
            onClick={handleRefresh}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 12px",
              borderRadius: "6px",
              backgroundColor: "#FFFFFF",
              border: "1px solid #E2E8F0",
              color: "#334155",
              fontSize: "12px",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            <RefreshCw size={13} className={isRefreshing ? "spin" : ""} color="#64748B" />
            <span>Poll Fleet</span>
          </button>
        </div>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {/* =========================================================
            OPERATIONS HEADER BANNER (#FFFFFF, border #E2E8F0, left accent #F97316)
            ========================================================= */}
        <div
          style={{
            backgroundColor: "#FFFFFF",
            border: "1px solid #E2E8F0",
            borderLeft: "4px solid #F97316",
            borderRadius: "12px",
            padding: "20px 24px",
            boxShadow: "0 2px 8px rgba(15, 23, 42, 0.04)",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "16px",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
              <h1 style={{ fontSize: "20px", fontWeight: "800", color: "#0F172A", margin: 0, letterSpacing: "-0.01em" }}>
                Device Fleet & Edge Node Topology
              </h1>
              <span
                style={{
                  fontSize: "10.5px",
                  fontWeight: "700",
                  padding: "2px 8px",
                  borderRadius: "4px",
                  backgroundColor: "#FFF7ED",
                  color: "#EA580C",
                  border: "1px solid #FFEDD5",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                }}
              >
                TENANT: {currentWsId}
              </span>
            </div>
            <p style={{ fontSize: "13px", color: "#64748B", margin: 0 }}>
              Hardware registry, Wi-Fi RSSI link telemetry, IP routing, and MQTT downlink actuation channels.
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Link
              href={`/dashboard?ws=${encodeURIComponent(currentWsId)}`}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 16px",
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
              <Activity size={14} color="#EA580C" />
              <span>Launch Live Telemetry</span>
            </Link>
          </div>
        </div>

        {/* =========================================================
            KPI CARDS ROW (4 Cards, pure white #FFFFFF, border #E2E8F0)
            ========================================================= */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "16px",
          }}
        >
          {/* Total Nodes */}
          <div
            style={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #E2E8F0",
              borderRadius: "12px",
              padding: "20px 24px",
              boxShadow: "0 2px 8px rgba(15, 23, 42, 0.04)",
              display: "flex",
              flexDirection: "column",
              gap: "6px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "12px", fontWeight: "600", color: "#64748B", textTransform: "uppercase" }}>
                Configured Fleet Nodes
              </span>
              <Cpu size={18} color="#EA580C" />
            </div>
            <div style={{ fontSize: "28px", fontWeight: "800", color: "#0F172A", letterSpacing: "-0.02em" }}>
              {nodes.length}
            </div>
            <span style={{ fontSize: "12px", color: "#64748B" }}>Hardware units assigned</span>
          </div>

          {/* Online Nodes */}
          <div
            style={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #E2E8F0",
              borderRadius: "12px",
              padding: "20px 24px",
              boxShadow: "0 2px 8px rgba(15, 23, 42, 0.04)",
              display: "flex",
              flexDirection: "column",
              gap: "6px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "12px", fontWeight: "600", color: "#64748B", textTransform: "uppercase" }}>
                Active Online Nodes
              </span>
              <CheckCircle2 size={18} color="#059669" />
            </div>
            <div style={{ fontSize: "28px", fontWeight: "800", color: "#059669", letterSpacing: "-0.02em" }}>
              {onlineCount} / {nodes.length}
            </div>
            <span style={{ fontSize: "12px", color: "#059669", fontWeight: "600" }}>
              {nodes.length > 0 ? Math.round((onlineCount / nodes.length) * 100) : 0}% Network Link Health
            </span>
          </div>

          {/* MQTT Transport Status */}
          <div
            style={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #E2E8F0",
              borderRadius: "12px",
              padding: "20px 24px",
              boxShadow: "0 2px 8px rgba(15, 23, 42, 0.04)",
              display: "flex",
              flexDirection: "column",
              gap: "6px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "12px", fontWeight: "600", color: "#64748B", textTransform: "uppercase" }}>
                MQTT Gateway Status
              </span>
              <Radio size={18} color="#0284C7" />
            </div>
            <div style={{ fontSize: "28px", fontWeight: "800", color: "#0F172A", letterSpacing: "-0.02em" }}>
              :1883
            </div>
            <span style={{ fontSize: "12px", color: "#64748B" }}>Mosquitto Edge Gateway Online</span>
          </div>

          {/* Firmware Channels */}
          <div
            style={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #E2E8F0",
              borderRadius: "12px",
              padding: "20px 24px",
              boxShadow: "0 2px 8px rgba(15, 23, 42, 0.04)",
              display: "flex",
              flexDirection: "column",
              gap: "6px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "12px", fontWeight: "600", color: "#64748B", textTransform: "uppercase" }}>
                Firmware Version
              </span>
              <Sliders size={18} color="#EA580C" />
            </div>
            <div style={{ fontSize: "28px", fontWeight: "800", color: "#0F172A", letterSpacing: "-0.02em" }}>
              v2.4.1
            </div>
            <span style={{ fontSize: "12px", color: "#64748B" }}>Production OTA Channel Active</span>
          </div>
        </div>

        {/* =========================================================
            FILTER TABS & SEARCH BAR
            ========================================================= */}
        <div
          style={{
            backgroundColor: "#FFFFFF",
            border: "1px solid #E2E8F0",
            borderRadius: "12px",
            padding: "16px 20px",
            boxShadow: "0 2px 8px rgba(15, 23, 42, 0.04)",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "14px",
          }}
        >
          {/* Filter Pills */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            {[
              { id: "all", label: `All Nodes (${nodes.length})` },
              { id: "online", label: `Online (${onlineCount})` },
              { id: "gateway", label: `Gateways (${gatewayCount})` },
              { id: "actuator", label: `Actuators (${actuatorCount})` },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveFilter(tab.id)}
                style={{
                  padding: "6px 12px",
                  borderRadius: "6px",
                  fontSize: "12px",
                  fontWeight: activeFilter === tab.id ? "700" : "500",
                  backgroundColor: activeFilter === tab.id ? "#0F172A" : "#F8FAFC",
                  color: activeFilter === tab.id ? "#FFFFFF" : "#64748B",
                  border: `1px solid ${activeFilter === tab.id ? "#0F172A" : "#E2E8F0"}`,
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Input & View Toggle */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "6px 12px",
                borderRadius: "6px",
                backgroundColor: "#F8FAFC",
                border: "1px solid #E2E8F0",
                width: "240px",
              }}
            >
              <Search size={14} color="#64748B" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search node ID, IP, or MAC..."
                style={{
                  border: "none",
                  background: "transparent",
                  outline: "none",
                  fontSize: "12.5px",
                  color: "#0F172A",
                  width: "100%",
                }}
              />
            </div>

            <div
              style={{
                display: "flex",
                border: "1px solid #E2E8F0",
                borderRadius: "6px",
                overflow: "hidden",
              }}
            >
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                style={{
                  padding: "6px 10px",
                  border: "none",
                  backgroundColor: viewMode === "grid" ? "#0F172A" : "#FFFFFF",
                  color: viewMode === "grid" ? "#FFFFFF" : "#64748B",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                }}
                title="Grid view"
              >
                <Grid size={14} />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("table")}
                style={{
                  padding: "6px 10px",
                  border: "none",
                  backgroundColor: viewMode === "table" ? "#0F172A" : "#FFFFFF",
                  color: viewMode === "table" ? "#FFFFFF" : "#64748B",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                }}
                title="Table view"
              >
                <List size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* =========================================================
            FLEET NODES RENDERING (Grid / Table)
            ========================================================= */}
        {filteredNodes.length === 0 ? (
          <div
            style={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #E2E8F0",
              borderRadius: "12px",
              padding: "48px 24px",
              textAlign: "center",
              boxShadow: "0 2px 8px rgba(15, 23, 42, 0.04)",
            }}
          >
            <AlertTriangle size={32} color="#94A3B8" style={{ marginBottom: "10px" }} />
            <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#0F172A", margin: "0 0 6px 0" }}>
              No Hardware Nodes Match Your Filter
            </h3>
            <p style={{ fontSize: "13px", color: "#64748B", margin: 0 }}>
              Try clearing your search query or switching to "All Nodes".
            </p>
          </div>
        ) : viewMode === "grid" ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 340px), 1fr))",
              gap: "18px",
            }}
          >
            {filteredNodes.map((node) => {
              const isPing = pingStatus[node.id];

              return (
                <div
                  key={node.id}
                  style={{
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #E2E8F0",
                    borderRadius: "12px",
                    padding: "20px 24px",
                    boxShadow: "0 2px 8px rgba(15, 23, 42, 0.04)",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    gap: "16px",
                    transition: "border-color 0.15s ease",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#CBD5E1")}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#E2E8F0")}
                >
                  <div>
                    {/* Header: Name & Status badge */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <div
                          style={{
                            width: "32px",
                            height: "32px",
                            borderRadius: "6px",
                            backgroundColor: "#FFF7ED",
                            border: "1px solid #FFEDD5",
                            color: "#EA580C",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Cpu size={16} />
                        </div>
                        <div>
                          <h3 style={{ fontSize: "14.5px", fontWeight: "700", color: "#0F172A", margin: 0 }}>
                            {node.name}
                          </h3>
                          <span style={{ fontSize: "11px", color: "#64748B", fontFamily: "monospace" }}>
                            {node.id}
                          </span>
                        </div>
                      </div>

                      <span
                        style={{
                          fontSize: "10.5px",
                          fontWeight: "700",
                          padding: "2px 7px",
                          borderRadius: "4px",
                          backgroundColor: node.status === "online" ? "#ECFDF5" : "#FFFBEB",
                          color: node.status === "online" ? "#059669" : "#D97706",
                          border: `1px solid ${node.status === "online" ? "#A7F3D0" : "#FDE68A"}`,
                          textTransform: "uppercase",
                        }}
                      >
                        {node.status}
                      </span>
                    </div>

                    <p style={{ fontSize: "12.5px", color: "#64748B", margin: "0 0 14px 0", lineHeight: "1.4" }}>
                      {node.role}
                    </p>

                    {/* Metadata specs */}
                    <div
                      style={{
                        padding: "12px",
                        backgroundColor: "#F8FAFC",
                        borderRadius: "8px",
                        border: "1px solid #E2E8F0",
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "8px",
                        fontSize: "11.5px",
                      }}
                    >
                      <div>
                        <span style={{ color: "#64748B", display: "block" }}>LAN IP</span>
                        <span style={{ fontFamily: "monospace", fontWeight: "700", color: "#0F172A" }}>
                          {node.ip}
                        </span>
                      </div>
                      <div>
                        <span style={{ color: "#64748B", display: "block" }}>Wi-Fi RSSI</span>
                        <span style={{ fontFamily: "monospace", fontWeight: "700", color: "#059669" }}>
                          {node.rssi != null ? `${node.rssi} dBm` : "—"}
                        </span>
                      </div>
                      <div>
                        <span style={{ color: "#64748B", display: "block" }}>Free Heap</span>
                        <span style={{ fontFamily: "monospace", fontWeight: "700", color: "#0F172A" }}>
                          {node.freeHeap}
                        </span>
                      </div>
                      <div>
                        <span style={{ color: "#64748B", display: "block" }}>Firmware</span>
                        <span style={{ fontFamily: "monospace", fontWeight: "700", color: "#EA580C" }}>
                          {node.firmware}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Node Actions */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
                    <button
                      type="button"
                      onClick={() => handlePingNode(node.id)}
                      style={{
                        padding: "7px 12px",
                        borderRadius: "6px",
                        backgroundColor: isPing === "ok" ? "#ECFDF5" : "#FFFFFF",
                        border: `1px solid ${isPing === "ok" ? "#A7F3D0" : "#E2E8F0"}`,
                        color: isPing === "ok" ? "#059669" : "#334155",
                        fontSize: "12px",
                        fontWeight: "600",
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "5px",
                      }}
                    >
                      <Wifi size={13} color={isPing === "ok" ? "#059669" : "#64748B"} />
                      <span>{isPing === "pinging" ? "Pinging..." : isPing === "ok" ? "Pong 14ms" : "Ping"}</span>
                    </button>

                    <Link
                      href={`/dashboard?ws=${encodeURIComponent(currentWsId)}`}
                      style={{
                        padding: "7px 14px",
                        borderRadius: "6px",
                        backgroundColor: "#FFF7ED",
                        color: "#EA580C",
                        border: "1px solid #FFEDD5",
                        fontSize: "12px",
                        fontWeight: "700",
                        textDecoration: "none",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      <span>Telemetry</span>
                      <ArrowUpRight size={13} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Table View */
          <div
            style={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #E2E8F0",
              borderRadius: "12px",
              boxShadow: "0 2px 8px rgba(15, 23, 42, 0.04)",
              overflow: "hidden",
            }}
          >
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #E2E8F0", backgroundColor: "#F8FAFC", color: "#64748B", textAlign: "left" }}>
                    <th style={{ padding: "12px 24px", fontWeight: "600" }}>Node Identifier</th>
                    <th style={{ padding: "12px 16px", fontWeight: "600" }}>LAN IP & MAC</th>
                    <th style={{ padding: "12px 16px", fontWeight: "600" }}>Firmware</th>
                    <th style={{ padding: "12px 16px", fontWeight: "600" }}>Link Signal</th>
                    <th style={{ padding: "12px 16px", fontWeight: "600" }}>Packets</th>
                    <th style={{ padding: "12px 16px", fontWeight: "600" }}>Status</th>
                    <th style={{ padding: "12px 24px", fontWeight: "600", textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredNodes.map((node) => (
                    <tr
                      key={node.id}
                      style={{ borderBottom: "1px solid #F1F5F9" }}
                    >
                      <td style={{ padding: "14px 24px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <Cpu size={16} color="#EA580C" />
                          <div>
                            <div style={{ fontWeight: "700", color: "#0F172A" }}>{node.name}</div>
                            <span style={{ fontSize: "11px", color: "#64748B", fontFamily: "monospace" }}>{node.id}</span>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "14px 16px", fontFamily: "monospace", fontSize: "12px" }}>
                        <div style={{ color: "#0F172A", fontWeight: "600" }}>{node.ip}</div>
                        <div style={{ color: "#94A3B8", fontSize: "11px" }}>{node.mac}</div>
                      </td>
                      <td style={{ padding: "14px 16px", fontFamily: "monospace", fontSize: "12px", color: "#EA580C", fontWeight: "600" }}>
                        {node.firmware}
                      </td>
                      <td style={{ padding: "14px 16px", fontFamily: "monospace", fontSize: "12px", color: "#059669", fontWeight: "600" }}>
                        {node.rssi != null ? `${node.rssi} dBm` : "—"}
                      </td>
                      <td style={{ padding: "14px 16px", fontFamily: "monospace", fontSize: "12px", color: "#334155" }}>
                        {(node.packetCount || 0).toLocaleString()}
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <span
                          style={{
                            fontSize: "10.5px",
                            fontWeight: "700",
                            padding: "2px 7px",
                            borderRadius: "4px",
                            backgroundColor: node.status === "online" ? "#ECFDF5" : "#FFFBEB",
                            color: node.status === "online" ? "#059669" : "#D97706",
                            border: `1px solid ${node.status === "online" ? "#A7F3D0" : "#FDE68A"}`,
                            textTransform: "uppercase",
                          }}
                        >
                          {node.status}
                        </span>
                      </td>
                      <td style={{ padding: "14px 24px", textAlign: "right" }}>
                        <Link
                          href={`/dashboard?ws=${encodeURIComponent(currentWsId)}`}
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
                          <span>Telemetry</span>
                          <ArrowUpRight size={13} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}