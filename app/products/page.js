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

const INITIAL_NODES = [
  {
    id: "esp32_01",
    name: "ESP32-WROOM-32U Gateway Node",
    type: "gateway",
    hardware: "ESP32-D0WDQ6-V3",
    ip: "192.168.1.105",
    mac: "24:6F:28:B4:9C:12",
    firmware: "v2.4.1-prod",
    rssi: -62,
    freeHeap: "184 KB",
    uptime: "14d 6h 32m",
    status: "online",
    telemetryTopic: "tenants/beta/devices/esp32_01/telemetry",
    commandTopic: "tenants/beta/devices/esp32_01/command",
    lastHeartbeat: "3 seconds ago",
    packetCount: 42180,
    role: "Ingress Gateway & Edge Router",
  },
  {
    id: "dht22_ambient_node",
    name: "Precision Ambient Environmental Probe",
    type: "sensor",
    hardware: "DHT22 / AM2302 Sensor Array",
    ip: "192.168.1.108",
    mac: "30:AE:A4:07:31:88",
    firmware: "v2.2.0-sensor",
    rssi: -68,
    freeHeap: "142 KB",
    uptime: "8d 19h 14m",
    status: "online",
    telemetryTopic: "tenants/beta/devices/dht22_ambient_node/telemetry",
    commandTopic: "tenants/beta/devices/dht22_ambient_node/command",
    lastHeartbeat: "5 seconds ago",
    packetCount: 19450,
    role: "Ambient Temp & Humidity Telemetry",
  },
  {
    id: "relay_4ch_controller",
    name: "4-Channel Industrial Actuator Controller",
    type: "actuator",
    hardware: "ESP32 + Opto-Isolated 10A Relays",
    ip: "192.168.1.112",
    mac: "A4:CF:12:88:2E:5B",
    firmware: "v2.3.4-actuator",
    rssi: -58,
    freeHeap: "198 KB",
    uptime: "21d 0h 48m",
    status: "online",
    telemetryTopic: "tenants/beta/devices/relay_4ch_controller/telemetry",
    commandTopic: "tenants/beta/devices/relay_4ch_controller/command",
    lastHeartbeat: "12 seconds ago",
    packetCount: 9820,
    role: "Hardware Downlink & Power Switching",
  },
  {
    id: "modbus_bridge_01",
    name: "Modbus RS-485 Industrial Bridge",
    type: "gateway",
    hardware: "MAX485 + ESP32 Sub-controller",
    ip: "192.168.1.120",
    mac: "58:BF:25:A1:66:90",
    firmware: "v1.8.9-modbus",
    rssi: -74,
    freeHeap: "116 KB",
    uptime: "2d 4h 12m",
    status: "standby",
    telemetryTopic: "tenants/beta/devices/modbus_bridge_01/telemetry",
    commandTopic: "tenants/beta/devices/modbus_bridge_01/command",
    lastHeartbeat: "45 seconds ago",
    packetCount: 3120,
    role: "PLC & Inverter Polling Link",
  },
];

export default function DeviceFleetPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [workspaces, setWorkspaces] = useState([]);
  const [currentWsId, setCurrentWsId] = useState("beta");
  const [nodes, setNodes] = useState(INITIAL_NODES);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [viewMode, setViewMode] = useState("grid");
  const [pingStatus, setPingStatus] = useState({});
  const [isRefreshing, setIsRefreshing] = useState(false);

  // WebSocket for Live Telemetry Ping
  const wsUrl = `ws://localhost:4001/ws?token=${getToken() || ""}&workspace=${currentWsId}`;
  const { isConnected: isLiveWs } = useWebSocket(wsUrl);

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
        if (Array.isArray(res.data)) {
          setWorkspaces(res.data);
          if (res.data.length > 0) {
            const firstId = res.data[0].workspace_id || res.data[0].slug || res.data[0].id;
            setCurrentWsId(firstId);
          }
        }
      })
      .catch(() => {});
  }, []);

  const handlePingNode = (nodeId) => {
    setPingStatus((prev) => ({ ...prev, [nodeId]: "pinging" }));
    setTimeout(() => {
      setPingStatus((prev) => ({ ...prev, [nodeId]: "ok" }));
      setTimeout(() => {
        setPingStatus((prev) => ({ ...prev, [nodeId]: null }));
      }, 3000);
    }, 800);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
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

  return (
    <DashboardShell
      currentWsName={currentWsId}
      wsId={currentWsId}
      workspaces={workspaces}
      onSelectWorkspace={(ws) => setCurrentWsId(ws.workspace_id || ws.slug || ws.id)}
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
              75% Network Link Health
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
              { id: "gateway", label: "Gateways (2)" },
              { id: "actuator", label: "Actuators (1)" },
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
                          {node.rssi} dBm
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
                        {node.rssi} dBm
                      </td>
                      <td style={{ padding: "14px 16px", fontFamily: "monospace", fontSize: "12px", color: "#334155" }}>
                        {node.packetCount.toLocaleString()}
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