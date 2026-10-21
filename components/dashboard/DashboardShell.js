"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "../../lib/api";
import { logout } from "../../lib/auth";
import WorkspacesModal from "./WorkspacesModal";
import ProfileModal from "./ProfileModal";
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
  LogOut,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
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
  User as UserIcon,
  Menu,
  X,
  MoreHorizontal,
} from "../common/Icons";

export default function DashboardShell({
  children,
  currentWsName,
  wsId,
  workspaces = [],
  onSelectWorkspace,
  user,
  isLiveWs,
  title,
  subtitle,
  actions,
  activeNav = "dashboards",
  timeRange = "Live",
  onTimeRangeChange,
  dashboards = [],
  activeDashboardId = null,
}) {
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [workspacesModalOpen, setWorkspacesModalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [loadedDashboards, setLoadedDashboards] = useState(dashboards || []);
  const [dashboardsExpanded, setDashboardsExpanded] = useState(true);
  const [wsDropdownOpen, setWsDropdownOpen] = useState(false);
  const [wsSearch, setWsSearch] = useState("");
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    if (dashboards && dashboards.length > 0) {
      setLoadedDashboards(dashboards);
    } else if (wsId) {
      api
        .get(`/admin/workspaces/${wsId}/dashboards`)
        .then((res) => {
          if (Array.isArray(res.data)) {
            setLoadedDashboards(res.data);
          }
        })
        .catch(() => {});
    }
  }, [dashboards, wsId]);

  useEffect(() => {
    if (activeDashboardId) {
      setDashboardsExpanded(true);
    }
  }, [activeDashboardId]);

  const displayName = user?.display_name || user?.full_name || user?.username || "Enterprise Operator";
  const userRole = user?.role || "Admin";
  const userEmail = user?.email || "operator@thingsnxt.internal";
  const userInitials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const sidebarWidth = sidebarCollapsed ? 68 : 250;
  const timeRanges = ["Live", "15m", "1h", "24h", "7d"];

  const handleNavClick = () => {
    setMobileMenuOpen(false);
    setWsDropdownOpen(false);
    setUserMenuOpen(false);
  };

  const handleSwitchWorkspace = (ws) => {
    setWsDropdownOpen(false);
    if (onSelectWorkspace) {
      onSelectWorkspace(ws);
    } else {
      const id = ws.workspace_id || ws.slug || ws.id;
      router.push(`/dashboard?ws=${encodeURIComponent(id)}`);
    }
  };

  const filteredWorkspaces = workspaces.filter((ws) => {
    if (!wsSearch.trim()) return true;
    const name = ws.name || ws.slug || ws.workspace_id || ws.id || "";
    return name.toLowerCase().includes(wsSearch.toLowerCase());
  });

  const wsMonogram = String(currentWsName || wsId || "W").charAt(0).toUpperCase();

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        width: "100%",
        backgroundColor: "#F5F7FA",
        color: "#0F172A",
        fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        position: "relative",
      }}
    >
      <style>{`
        @media (max-width: 768px) {
          .shell-sidebar {
            transform: translateX(-100%) !important;
            width: 270px !important;
            position: fixed !important;
            top: 0 !important;
            bottom: 0 !important;
            left: 0 !important;
            z-index: 300 !important;
            box-shadow: 0 0 40px rgba(15, 23, 42, 0.4) !important;
            transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1) !important;
          }
          .shell-sidebar.mobile-open {
            transform: translateX(0) !important;
          }
          .shell-main-viewport {
            margin-left: 0 !important;
            width: 100% !important;
          }
          .shell-hamburger-btn {
            display: inline-flex !important;
          }
          .shell-header {
            padding: 0 16px !important;
          }
          .shell-content {
            padding: 16px 14px 40px !important;
          }
          .shell-hide-mobile {
            display: none !important;
          }
        }
        @media (min-width: 769px) {
          .shell-hamburger-btn {
            display: none !important;
          }
          .shell-mobile-overlay {
            display: none !important;
          }
        }
        @media (max-width: 480px) {
          .shell-hide-xs {
            display: none !important;
          }
        }

        /* ── Modern Interactive Hover & Focus States (Palette #111827 / #1F2937 / #F97316) ── */
        .shell-nav-link {
          transition: background-color 0.15s ease, color 0.15s ease, border-left-color 0.15s ease !important;
          outline: none;
        }
        .shell-nav-link:focus-visible {
          outline: 2px solid #F97316 !important;
          outline-offset: -2px !important;
        }
        .shell-nav-link:hover:not(.active) {
          background-color: #1F2937 !important;
          color: #F9FAFB !important;
        }
        .shell-nav-link.active {
          background-color: #292524 !important;
          color: #FDBA74 !important;
          border-left: 3px solid #F97316 !important;
        }
        .shell-nav-link.active:hover {
          background-color: #332D2B !important;
          color: #FDBA74 !important;
        }
        .shell-subnav-link {
          transition: background-color 0.15s ease, color 0.15s ease !important;
          outline: none;
        }
        .shell-subnav-link:focus-visible {
          outline: 2px solid #F97316 !important;
          outline-offset: -2px !important;
        }
        .shell-subnav-link:hover:not(.active) {
          background-color: #1F2937 !important;
          color: #F9FAFB !important;
        }
        .shell-subnav-link.active {
          background-color: #292524 !important;
          color: #FDBA74 !important;
        }
        .shell-subnav-link.active:hover {
          background-color: #332D2B !important;
          color: #FDBA74 !important;
        }
        .shell-ws-switcher {
          outline: none;
          transition: background-color 0.15s ease, border-color 0.15s ease;
        }
        .shell-ws-switcher:hover {
          background-color: #242F3E !important;
          border-color: #374151 !important;
        }
        .shell-ws-switcher:focus-visible {
          outline: 2px solid #F97316 !important;
          outline-offset: 1px !important;
        }
        .shell-user-card-btn {
          outline: none;
          transition: background-color 0.15s ease !important;
        }
        .shell-user-card-btn:hover {
          background-color: #1F2937 !important;
        }
        .shell-user-card-btn:focus-visible {
          outline: 2px solid #F97316 !important;
          outline-offset: -1px !important;
        }
        .shell-logout-btn {
          transition: background-color 0.15s ease, color 0.15s ease !important;
        }
        .shell-logout-btn:hover {
          background-color: #1F2937 !important;
          color: #F87171 !important;
        }
        .shell-collapse-btn {
          outline: none;
          transition: background-color 0.15s ease, color 0.15s ease !important;
        }
        .shell-collapse-btn:hover {
          background-color: #1F2937 !important;
          color: #FFFFFF !important;
        }
        .shell-collapse-btn:focus-visible {
          outline: 2px solid #F97316 !important;
        }
        .shell-topbar-ws-btn {
          transition: all 0.15s ease !important;
        }
        .shell-topbar-ws-btn:hover {
          background-color: #F1F5F9 !important;
          border-color: #CBD5E1 !important;
          color: #0F172A !important;
        }
        .shell-topbar-timer-btn {
          transition: all 0.15s ease !important;
        }
        .shell-topbar-timer-btn:hover {
          background-color: #F1F5F9 !important;
          border-color: #CBD5E1 !important;
        }
        .shell-admin-btn {
          transition: all 0.15s ease !important;
        }
        .shell-admin-btn:hover {
          background-color: #EA580C !important;
          border-color: #EA580C !important;
        }
      `}</style>

      {/* ──────────────────────────────────────────────────────────
          MOBILE OVERLAY BACKDROP
          ────────────────────────────────────────────────────────── */}
      {mobileMenuOpen && (
        <div
          className="shell-mobile-overlay"
          onClick={() => setMobileMenuOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(15, 23, 42, 0.6)",
            backdropFilter: "blur(4px)",
            zIndex: 290,
          }}
        />
      )}

      {/* ──────────────────────────────────────────────────────────
          LEFT NAVIGATION SIDEBAR (Linear/Vercel Enterprise #111827)
          ────────────────────────────────────────────────────────── */}
      <aside
        className={`shell-sidebar ${mobileMenuOpen ? "mobile-open" : ""}`}
        style={{
          width: `${sidebarWidth}px`,
          height: "100vh",
          position: "fixed",
          top: 0,
          left: 0,
          backgroundColor: "#111827",
          borderRight: "1px solid #273244",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          zIndex: 100,
          transition: "width 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
          overflow: "hidden",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
          {/* ── A. Brand Header (Height 68px, subtle divider #273244) ── */}
          <div
            style={{
              padding: sidebarCollapsed ? "16px 12px" : "16px 16px",
              borderBottom: "1px solid #273244",
              display: "flex",
              alignItems: "center",
              justifyContent: sidebarCollapsed ? "center" : "space-between",
              height: "68px",
              flexShrink: 0,
            }}
          >
            {sidebarCollapsed ? (
              <button
                type="button"
                onClick={() => setSidebarCollapsed(false)}
                className="shell-collapse-btn"
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  padding: "0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                title="Expand sidebar"
              >
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "8px",
                    backgroundColor: "#F97316",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#FFFFFF",
                    boxShadow: "0 2px 8px rgba(249, 115, 22, 0.35)",
                    transition: "transform 0.15s ease",
                  }}
                >
                  <Zap size={18} strokeWidth={2.5} color="#FFFFFF" />
                </div>
              </button>
            ) : (
              <Link
                href="/dashboard"
                onClick={handleNavClick}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  textDecoration: "none",
                  color: "#F9FAFB",
                }}
              >
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "8px",
                    backgroundColor: "#F97316",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#FFFFFF",
                    boxShadow: "0 2px 8px rgba(249, 115, 22, 0.35)",
                    flexShrink: 0,
                  }}
                >
                  <Zap size={18} strokeWidth={2.5} color="#FFFFFF" />
                </div>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ fontSize: "14px", fontWeight: "800", letterSpacing: "-0.01em", color: "#F9FAFB" }}>
                      ThingsNXT
                    </span>
                    <span
                      style={{
                        fontSize: "9.5px",
                        fontWeight: "700",
                        padding: "1px 5px",
                        borderRadius: "4px",
                        backgroundColor: "rgba(249, 115, 22, 0.2)",
                        color: "#FDBA74",
                        border: "1px solid rgba(249, 115, 22, 0.35)",
                      }}
                    >
                      PRO
                    </span>
                  </div>
                  <span style={{ fontSize: "10.5px", color: "#9CA3AF", fontWeight: "500" }}>Industrial IoT Suite</span>
                </div>
              </Link>
            )}

            {/* Desktop Collapse Toggle Button */}
            {!sidebarCollapsed && (
              <button
                type="button"
                onClick={() => setSidebarCollapsed(true)}
                className="shell-collapse-btn shell-hide-mobile"
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#9CA3AF",
                  cursor: "pointer",
                  padding: "6px",
                  borderRadius: "5px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                title="Collapse sidebar"
              >
                <ChevronLeft size={16} />
              </button>
            )}

            {/* Mobile Close Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="shell-hamburger-btn"
              style={{
                background: "transparent",
                border: "none",
                color: "#9CA3AF",
                cursor: "pointer",
                padding: "6px",
              }}
            >
              <X size={18} />
            </button>
          </div>

          {/* ── B. Workspace Switcher (Immediately below Brand Header) ── */}
          <div style={{ padding: sidebarCollapsed ? "10px 8px 6px" : "10px 12px 6px", position: "relative", flexShrink: 0 }}>
            {sidebarCollapsed ? (
              <button
                type="button"
                onClick={() => setSidebarCollapsed(false)}
                className="shell-ws-switcher"
                style={{
                  width: "100%",
                  height: "36px",
                  borderRadius: "8px",
                  backgroundColor: "#1F2937",
                  border: "1px solid #273244",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#FDBA74",
                  cursor: "pointer",
                  fontWeight: "700",
                  fontSize: "12px",
                }}
                title={`Workspace: ${currentWsName || wsId}`}
              >
                {wsMonogram}
              </button>
            ) : (
              <div>
                <button
                  type="button"
                  onClick={() => {
                    setWsDropdownOpen(!wsDropdownOpen);
                    setUserMenuOpen(false);
                  }}
                  className="shell-ws-switcher"
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "7px 10px",
                    borderRadius: "8px",
                    backgroundColor: "#1F2937",
                    border: `1px solid ${wsDropdownOpen ? "#F97316" : "#273244"}`,
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.15s ease",
                  }}
                  title="Switch workspace partition"
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "9px", overflow: "hidden" }}>
                    <div
                      style={{
                        width: "24px",
                        height: "24px",
                        borderRadius: "6px",
                        backgroundColor: "#111827",
                        border: "1px solid #273244",
                        color: "#FDBA74",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "11px",
                        fontWeight: "800",
                        flexShrink: 0,
                      }}
                    >
                      {wsMonogram}
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
                      <span
                        style={{
                          fontSize: "12px",
                          fontWeight: "600",
                          color: "#F9FAFB",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {currentWsName || wsId}
                      </span>
                      <span style={{ fontSize: "9.5px", color: "#9CA3AF", letterSpacing: "0.04em", textTransform: "uppercase" }}>
                        TENANT: {wsId}
                      </span>
                    </div>
                  </div>
                  <ChevronDown
                    size={13}
                    color="#9CA3AF"
                    style={{
                      transform: wsDropdownOpen ? "rotate(180deg)" : "rotate(0deg)",
                      transition: "transform 0.15s ease",
                      flexShrink: 0,
                    }}
                  />
                </button>

                {/* Workspace Dropdown Popover */}
                {wsDropdownOpen && (
                  <div
                    style={{
                      position: "absolute",
                      top: "calc(100% + 4px)",
                      left: "12px",
                      right: "12px",
                      backgroundColor: "#1F2937",
                      border: "1px solid #273244",
                      borderRadius: "8px",
                      boxShadow: "0 14px 30px rgba(0, 0, 0, 0.5)",
                      zIndex: 150,
                      overflow: "hidden",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    {/* Search if multiple workspaces */}
                    {workspaces.length > 3 && (
                      <div style={{ padding: "8px 10px", borderBottom: "1px solid #273244" }}>
                        <input
                          type="text"
                          value={wsSearch}
                          onChange={(e) => setWsSearch(e.target.value)}
                          placeholder="Filter workspaces..."
                          style={{
                            width: "100%",
                            padding: "5px 8px",
                            backgroundColor: "#111827",
                            border: "1px solid #273244",
                            borderRadius: "5px",
                            color: "#F9FAFB",
                            fontSize: "11px",
                            outline: "none",
                          }}
                        />
                      </div>
                    )}

                    <div style={{ maxHeight: "190px", overflowY: "auto", padding: "4px" }}>
                      {filteredWorkspaces.length === 0 ? (
                        <div style={{ padding: "10px", fontSize: "11.5px", color: "#9CA3AF", textAlign: "center" }}>
                          No workspaces found
                        </div>
                      ) : (
                        filteredWorkspaces.map((ws) => {
                          const id = ws.workspace_id || ws.slug || ws.id;
                          const name = ws.name || ws.slug || id;
                          const isCurrent = id === wsId;
                          const initial = String(name).charAt(0).toUpperCase();

                          return (
                            <button
                              key={id}
                              type="button"
                              onClick={() => handleSwitchWorkspace(ws)}
                              style={{
                                width: "100%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                padding: "7px 9px",
                                borderRadius: "6px",
                                backgroundColor: isCurrent ? "#292524" : "transparent",
                                border: "none",
                                cursor: "pointer",
                                textAlign: "left",
                                transition: "background 0.1s ease",
                              }}
                              onMouseEnter={(e) => {
                                if (!isCurrent) e.currentTarget.style.backgroundColor = "#242F3E";
                              }}
                              onMouseLeave={(e) => {
                                if (!isCurrent) e.currentTarget.style.backgroundColor = "transparent";
                              }}
                            >
                              <div style={{ display: "flex", alignItems: "center", gap: "8px", overflow: "hidden" }}>
                                <div
                                  style={{
                                    width: "20px",
                                    height: "20px",
                                    borderRadius: "4px",
                                    backgroundColor: isCurrent ? "#F97316" : "#111827",
                                    color: isCurrent ? "#FFFFFF" : "#FDBA74",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "10px",
                                    fontWeight: "800",
                                    flexShrink: 0,
                                  }}
                                >
                                  {initial}
                                </div>
                                <div style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
                                  <span
                                    style={{
                                      fontSize: "12px",
                                      fontWeight: isCurrent ? "700" : "500",
                                      color: isCurrent ? "#FDBA74" : "#F9FAFB",
                                      whiteSpace: "nowrap",
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                    }}
                                  >
                                    {name}
                                  </span>
                                  <span style={{ fontSize: "9.5px", color: "#9CA3AF" }}>
                                    {ws.role || "Tenant Member"}
                                  </span>
                                </div>
                              </div>
                              {isCurrent && <CheckCircle2 size={13} color="#10B981" />}
                            </button>
                          );
                        })
                      )}
                    </div>

                    <div style={{ padding: "6px 8px", borderTop: "1px solid #273244", backgroundColor: "#17202E" }}>
                      <button
                        type="button"
                        onClick={() => {
                          setWsDropdownOpen(false);
                          setWorkspacesModalOpen(true);
                        }}
                        style={{
                          width: "100%",
                          padding: "6px 8px",
                          borderRadius: "5px",
                          border: "none",
                          background: "transparent",
                          color: "#FDBA74",
                          fontSize: "11.5px",
                          fontWeight: "600",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "6px",
                        }}
                      >
                        <Folder size={12} color="#FDBA74" />
                        <span>Manage All Workspaces ({workspaces.length})</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── C. Main Navigation Groups ── */}
          <nav
            style={{
              padding: sidebarCollapsed ? "8px 6px" : "8px 10px",
              display: "flex",
              flexDirection: "column",
              gap: "2px",
              flex: 1,
              overflowY: "auto",
            }}
          >
            {/* GROUP: MONITORING */}
            {!sidebarCollapsed && (
              <div
                style={{
                  fontSize: "10px",
                  fontWeight: "700",
                  color: "#6B7280",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  padding: "12px 10px 4px",
                }}
              >
                Monitoring
              </div>
            )}

            {/* Overview & Dashboards Item with Sub-Dashboard Links */}
            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  borderRadius: "6px",
                  backgroundColor:
                    (activeNav === "overview" || activeNav === "dashboards") && !activeDashboardId
                      ? "#292524"
                      : "transparent",
                  borderLeft:
                    (activeNav === "overview" || activeNav === "dashboards") && !activeDashboardId
                      ? "3px solid #F97316"
                      : "3px solid transparent",
                  transition: "all 0.15s ease",
                }}
              >
                <Link
                  href={`/dashboard?ws=${encodeURIComponent(wsId || "beta")}`}
                  onClick={handleNavClick}
                  className={`shell-nav-link ${(activeNav === "overview" || activeNav === "dashboards") && !activeDashboardId ? "active" : ""}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "8px 10px",
                    flex: 1,
                    fontSize: "13px",
                    fontWeight: (activeNav === "overview" || activeNav === "dashboards") && !activeDashboardId ? "600" : "500",
                    color: (activeNav === "overview" || activeNav === "dashboards") && !activeDashboardId ? "#FDBA74" : "#F9FAFB",
                    textDecoration: "none",
                    justifyContent: sidebarCollapsed ? "center" : "flex-start",
                  }}
                  title="Overview & Dashboards"
                >
                  <Activity
                    size={16}
                    color={(activeNav === "overview" || activeNav === "dashboards") && !activeDashboardId ? "#FDBA74" : "#9CA3AF"}
                  />
                  {!sidebarCollapsed && <span>Overview & Dashboards</span>}
                </Link>

                {!sidebarCollapsed && loadedDashboards.length > 0 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDashboardsExpanded(!dashboardsExpanded);
                    }}
                    className="shell-collapse-btn"
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "#9CA3AF",
                      cursor: "pointer",
                      padding: "8px 8px",
                      display: "flex",
                      alignItems: "center",
                      borderRadius: "4px",
                    }}
                    title={dashboardsExpanded ? "Collapse dashboards" : "Expand dashboards"}
                  >
                    {dashboardsExpanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                  </button>
                )}
              </div>

              {/* Indented Sub-Dashboards List */}
              {!sidebarCollapsed && dashboardsExpanded && loadedDashboards.length > 0 && (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "2px",
                    marginLeft: "18px",
                    paddingLeft: "10px",
                    borderLeft: "1px solid #273244",
                    marginTop: "2px",
                    marginBottom: "4px",
                  }}
                >
                  {/* All Dashboards Link */}
                  <Link
                    href={`/dashboard?ws=${encodeURIComponent(wsId || "beta")}`}
                    onClick={handleNavClick}
                    className={`shell-subnav-link ${!activeDashboardId && (activeNav === "overview" || activeNav === "dashboards") ? "active" : ""}`}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "5px 8px",
                      borderRadius: "4px",
                      fontSize: "12px",
                      fontWeight: !activeDashboardId && (activeNav === "overview" || activeNav === "dashboards") ? "700" : "500",
                      color: !activeDashboardId && (activeNav === "overview" || activeNav === "dashboards") ? "#FDBA74" : "#9CA3AF",
                      backgroundColor: !activeDashboardId && (activeNav === "overview" || activeNav === "dashboards") ? "#292524" : "transparent",
                      textDecoration: "none",
                    }}
                  >
                    <Grid size={12} color={!activeDashboardId && (activeNav === "overview" || activeNav === "dashboards") ? "#F97316" : "#6B7280"} />
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>All Dashboards</span>
                  </Link>

                  {/* Individual Loaded Dashboards */}
                  {loadedDashboards.map((dash) => {
                    const dashId = dash.id || dash._id;
                    const isSelected = activeDashboardId === dashId;
                    const name = dash.name || "Telemetry Viewer";

                    return (
                      <Link
                        key={dashId}
                        href={`/dashboard/${dashId}?ws=${encodeURIComponent(wsId || "beta")}`}
                        onClick={handleNavClick}
                        className={`shell-subnav-link ${isSelected ? "active" : ""}`}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          padding: "5px 8px",
                          borderRadius: "4px",
                          fontSize: "12px",
                          fontWeight: isSelected ? "700" : "500",
                          color: isSelected ? "#FDBA74" : "#9CA3AF",
                          backgroundColor: isSelected ? "#292524" : "transparent",
                          textDecoration: "none",
                        }}
                        title={name}
                      >
                        <div
                          style={{
                            width: "6px",
                            height: "6px",
                            borderRadius: "50%",
                            backgroundColor: isSelected ? "#F97316" : "#4B5563",
                            flexShrink: 0,
                          }}
                        />
                        <span
                          style={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            flex: 1,
                          }}
                        >
                          {name}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Device Fleet & Nodes */}
            <Link
              href="/products"
              onClick={handleNavClick}
              className={`shell-nav-link ${activeNav === "fleet" ? "active" : ""}`}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "8px 10px",
                borderRadius: "6px",
                fontSize: "13px",
                fontWeight: activeNav === "fleet" ? "600" : "500",
                color: activeNav === "fleet" ? "#FDBA74" : "#F9FAFB",
                backgroundColor: activeNav === "fleet" ? "#292524" : "transparent",
                borderLeft: activeNav === "fleet" ? "3px solid #F97316" : "3px solid transparent",
                textDecoration: "none",
                justifyContent: sidebarCollapsed ? "center" : "flex-start",
              }}
              title="Device Fleet & Nodes"
            >
              <Cpu size={16} color={activeNav === "fleet" ? "#FDBA74" : "#9CA3AF"} />
              {!sidebarCollapsed && <span>Device Fleet & Nodes</span>}
            </Link>

            {/* Live Telemetry Direct Link */}
            <Link
              href={`/dashboard?ws=${encodeURIComponent(wsId || "beta")}`}
              onClick={handleNavClick}
              className="shell-nav-link"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "8px 10px",
                borderRadius: "6px",
                fontSize: "13px",
                fontWeight: "500",
                color: "#F9FAFB",
                backgroundColor: "transparent",
                borderLeft: "3px solid transparent",
                textDecoration: "none",
                justifyContent: sidebarCollapsed ? "center" : "flex-start",
              }}
              title="Live Telemetry Gateway"
            >
              <Radio size={16} color="#9CA3AF" />
              {!sidebarCollapsed && (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flex: 1 }}>
                  <span>Live Telemetry</span>
                  <span
                    style={{
                      fontSize: "9px",
                      fontWeight: "700",
                      color: isLiveWs ? "#10B981" : "#F59E0B",
                      padding: "1px 5px",
                      borderRadius: "3px",
                      backgroundColor: isLiveWs ? "rgba(16, 185, 129, 0.15)" : "rgba(245, 158, 11, 0.15)",
                    }}
                  >
                    {isLiveWs ? "LIVE" : "WS"}
                  </span>
                </div>
              )}
            </Link>

            {/* GROUP: DEVELOPMENT */}
            {!sidebarCollapsed && (
              <div
                style={{
                  fontSize: "10px",
                  fontWeight: "700",
                  color: "#6B7280",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  padding: "16px 10px 4px",
                }}
              >
                Development
              </div>
            )}

            <Link
              href="/documentation"
              onClick={handleNavClick}
              className={`shell-nav-link ${activeNav === "docs" ? "active" : ""}`}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "8px 10px",
                borderRadius: "6px",
                fontSize: "13px",
                fontWeight: activeNav === "docs" ? "600" : "500",
                color: activeNav === "docs" ? "#FDBA74" : "#F9FAFB",
                backgroundColor: activeNav === "docs" ? "#292524" : "transparent",
                borderLeft: activeNav === "docs" ? "3px solid #F97316" : "3px solid transparent",
                textDecoration: "none",
                justifyContent: sidebarCollapsed ? "center" : "flex-start",
              }}
              title="Firmware & SDK Documentation"
            >
              <Layers size={16} color={activeNav === "docs" ? "#FDBA74" : "#9CA3AF"} />
              {!sidebarCollapsed && <span>Firmware & SDK</span>}
            </Link>

            {/* GROUP: PLATFORM */}
            {!sidebarCollapsed && (
              <div
                style={{
                  fontSize: "10px",
                  fontWeight: "700",
                  color: "#6B7280",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  padding: "16px 10px 4px",
                }}
              >
                Platform
              </div>
            )}

            {/* Workspaces & Tenants */}
            <button
              type="button"
              onClick={() => {
                setWorkspacesModalOpen(true);
                setMobileMenuOpen(false);
              }}
              className="shell-nav-link"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "8px 10px",
                borderRadius: "6px",
                fontSize: "13px",
                fontWeight: "500",
                color: "#F9FAFB",
                backgroundColor: "transparent",
                border: "none",
                cursor: "pointer",
                width: "100%",
                textAlign: "left",
                justifyContent: sidebarCollapsed ? "center" : "flex-start",
              }}
              title="Configured Workspaces & Tenants"
            >
              <Folder size={16} color="#9CA3AF" />
              {!sidebarCollapsed && (
                <>
                  <span style={{ flex: 1 }}>Workspaces & Tenants</span>
                  <span
                    style={{
                      fontSize: "10px",
                      color: "#9CA3AF",
                      fontFamily: "monospace",
                      padding: "1px 6px",
                      borderRadius: "3px",
                      background: "#1F2937",
                      border: "1px solid #273244",
                    }}
                  >
                    {workspaces.length}
                  </span>
                </>
              )}
            </button>

            {/* Admin Console */}
            <a
              href="http://localhost:3000"
              target="_blank"
              rel="noreferrer"
              onClick={handleNavClick}
              className="shell-nav-link"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "8px 10px",
                borderRadius: "6px",
                fontSize: "13px",
                fontWeight: "500",
                color: "#F9FAFB",
                backgroundColor: "transparent",
                border: "none",
                textDecoration: "none",
                justifyContent: sidebarCollapsed ? "center" : "flex-start",
              }}
              title="Admin Console (Port 3000)"
            >
              <Settings size={16} color="#9CA3AF" />
              {!sidebarCollapsed && (
                <>
                  <span style={{ flex: 1 }}>Admin Console</span>
                  <ExternalLink size={12} color="#9CA3AF" style={{ marginRight: "4px" }} />
                  <span
                    style={{
                      fontSize: "9.5px",
                      color: "#FDBA74",
                      fontFamily: "monospace",
                      padding: "1px 5px",
                      borderRadius: "3px",
                      background: "rgba(249, 115, 22, 0.15)",
                      border: "1px solid rgba(249, 115, 22, 0.25)",
                    }}
                  >
                    :3000
                  </span>
                </>
              )}
            </a>
          </nav>

          {/* ── D. Infrastructure Section (Separated by subtle #273244 divider) ── */}
          <div
            style={{
              padding: sidebarCollapsed ? "8px 6px" : "10px 12px",
              borderTop: "1px solid #273244",
              display: "flex",
              flexDirection: "column",
              gap: "4px",
              flexShrink: 0,
            }}
          >
            {!sidebarCollapsed && (
              <div
                style={{
                  fontSize: "9.5px",
                  fontWeight: "700",
                  color: "#6B7280",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  marginBottom: "4px",
                  padding: "0 4px",
                }}
              >
                Infrastructure
              </div>
            )}

            {/* Fastify WS Indicator */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "6px 8px",
                borderRadius: "5px",
                fontSize: "11.5px",
                color: "#9CA3AF",
                justifyContent: sidebarCollapsed ? "center" : "space-between",
                backgroundColor: "rgba(31, 41, 55, 0.4)",
              }}
              title={isLiveWs ? "Fastify Ingest WS: Connected (:4001)" : "Fastify WS: Offline"}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Radio size={13} color="#9CA3AF" />
                {!sidebarCollapsed && <span>Fastify WS</span>}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                {!sidebarCollapsed && <span style={{ fontSize: "10px", color: "#6B7280", fontFamily: "monospace" }}>:4001</span>}
                <span
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    backgroundColor: isLiveWs ? "#10B981" : "#EF4444",
                    boxShadow: isLiveWs ? "0 0 6px #10B981" : "none",
                  }}
                />
              </div>
            </div>

            {/* Mosquitto MQTT Indicator */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "6px 8px",
                borderRadius: "5px",
                fontSize: "11.5px",
                color: "#9CA3AF",
                justifyContent: sidebarCollapsed ? "center" : "space-between",
                backgroundColor: "rgba(31, 41, 55, 0.4)",
              }}
              title="Mosquitto MQTT: Port 1883 Active"
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Server size={13} color="#9CA3AF" />
                {!sidebarCollapsed && <span>Mosquitto MQTT</span>}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                {!sidebarCollapsed && <span style={{ fontSize: "10px", color: "#38BDF8", fontFamily: "monospace" }}>:1883</span>}
                <span
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    backgroundColor: "#10B981",
                    boxShadow: "0 0 6px #10B981",
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── E. User Profile Footer (Anchored at the bottom) ── */}
        <div
          style={{
            padding: sidebarCollapsed ? "10px 8px" : "10px 12px",
            borderTop: "1px solid #273244",
            backgroundColor: "#111827",
            position: "relative",
            flexShrink: 0,
          }}
        >
          {/* User Popover Dropdown Menu */}
          {userMenuOpen && !sidebarCollapsed && (
            <div
              style={{
                position: "absolute",
                bottom: "calc(100% + 6px)",
                left: "12px",
                right: "12px",
                backgroundColor: "#1F2937",
                border: "1px solid #273244",
                borderRadius: "8px",
                boxShadow: "0 -12px 30px rgba(0, 0, 0, 0.5)",
                zIndex: 150,
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div style={{ padding: "10px 12px", borderBottom: "1px solid #273244" }}>
                <div style={{ fontSize: "12.5px", fontWeight: "700", color: "#F9FAFB" }}>{displayName}</div>
                <div style={{ fontSize: "11px", color: "#9CA3AF", fontFamily: "monospace" }}>{userEmail}</div>
              </div>

              <div style={{ padding: "4px" }}>
                <button
                  type="button"
                  onClick={() => {
                    setUserMenuOpen(false);
                    setProfileModalOpen(true);
                  }}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "7px 10px",
                    borderRadius: "5px",
                    border: "none",
                    backgroundColor: "transparent",
                    color: "#F9FAFB",
                    fontSize: "12px",
                    fontWeight: "500",
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#242F3E")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                >
                  <UserIcon size={14} color="#FDBA74" />
                  <span>Clearance & Profile Info</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setUserMenuOpen(false);
                    setWorkspacesModalOpen(true);
                  }}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "7px 10px",
                    borderRadius: "5px",
                    border: "none",
                    backgroundColor: "transparent",
                    color: "#F9FAFB",
                    fontSize: "12px",
                    fontWeight: "500",
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#242F3E")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                >
                  <Folder size={14} color="#9CA3AF" />
                  <span>Workspaces & Partitions</span>
                </button>
              </div>

              <div style={{ padding: "4px", borderTop: "1px solid #273244" }}>
                <button
                  type="button"
                  onClick={() => logout("/login")}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "7px 10px",
                    borderRadius: "5px",
                    border: "none",
                    backgroundColor: "transparent",
                    color: "#F87171",
                    fontSize: "12px",
                    fontWeight: "600",
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(239, 68, 68, 0.15)")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                >
                  <LogOut size={14} color="#F87171" />
                  <span>Sign Out Session</span>
                </button>
              </div>
            </div>
          )}

          {/* User Button */}
          <button
            type="button"
            onClick={() => {
              if (sidebarCollapsed) {
                setProfileModalOpen(true);
              } else {
                setUserMenuOpen(!userMenuOpen);
                setWsDropdownOpen(false);
              }
            }}
            className="shell-user-card-btn"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              justifyContent: sidebarCollapsed ? "center" : "space-between",
              background: "transparent",
              border: "none",
              padding: "5px",
              borderRadius: "6px",
              cursor: "pointer",
              textAlign: "left",
              width: "100%",
            }}
            title="Account clearance & sign out"
          >
            <div style={{ display: "flex", alignItems: "center", gap: "9px", overflow: "hidden" }}>
              <div
                style={{
                  width: "30px",
                  height: "30px",
                  borderRadius: "7px",
                  backgroundColor: "#1F2937",
                  border: "1px solid #273244",
                  color: "#FDBA74",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "11.5px",
                  fontWeight: "700",
                  flexShrink: 0,
                }}
              >
                {userInitials || "OP"}
              </div>
              {!sidebarCollapsed && (
                <div style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: "600",
                      color: "#F9FAFB",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {displayName}
                  </span>
                  <span style={{ fontSize: "10px", color: "#9CA3AF" }}>
                    {userRole}
                  </span>
                </div>
              )}
            </div>

            {!sidebarCollapsed && (
              <MoreHorizontal size={14} color="#9CA3AF" style={{ flexShrink: 0 }} />
            )}
          </button>
        </div>
      </aside>

      {/* ──────────────────────────────────────────────────────────
          MAIN VIEWPORT & CLEAN TOPBAR (#FFFFFF, border #E2E8F0)
          ────────────────────────────────────────────────────────── */}
      <div
        className="shell-main-viewport"
        style={{
          marginLeft: `${sidebarWidth}px`,
          flex: 1,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          transition: "margin-left 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
          backgroundColor: "#F5F7FA",
        }}
      >
        {/* Top Navigation Bar */}
        <header
          className="shell-header"
          style={{
            height: "56px",
            position: "sticky",
            top: 0,
            zIndex: 90,
            backgroundColor: "#FFFFFF",
            borderBottom: "1px solid #E2E8F0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 24px",
            boxShadow: "0 1px 3px rgba(15, 23, 42, 0.03)",
          }}
        >
          {/* Left: Mobile Hamburger & Breadcrumbs & Workspace Switcher */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {/* Mobile Hamburger Button */}
            <button
              type="button"
              className="shell-hamburger-btn"
              onClick={() => setMobileMenuOpen(true)}
              style={{
                background: "#F8FAFC",
                border: "1px solid #E2E8F0",
                borderRadius: "6px",
                color: "#334155",
                cursor: "pointer",
                padding: "6px",
                display: "none",
                alignItems: "center",
                justifyContent: "center",
              }}
              title="Open Navigation Menu"
            >
              <Menu size={18} />
            </button>

            <Link
              href="/dashboard"
              className="shell-hide-mobile"
              style={{
                fontSize: "13px",
                fontWeight: "600",
                color: "#64748B",
                textDecoration: "none",
              }}
            >
              ThingsNXT
            </Link>
            <span className="shell-hide-mobile" style={{ color: "#CBD5E1", fontSize: "12px" }}>/</span>

            {/* Workspace Selector Button */}
            <button
              type="button"
              onClick={() => setWorkspacesModalOpen(true)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "5px 10px",
                borderRadius: "6px",
                backgroundColor: "#F8FAFC",
                border: "1px solid #E2E8F0",
                color: "#0F172A",
                fontSize: "12.5px",
                fontWeight: "600",
                cursor: "pointer",
              }}
              title="Click to view & switch workspaces"
            >
              <Folder size={13} color="#F97316" />
              <span>{currentWsName || wsId}</span>
              <ChevronDown size={12} color="#64748B" />
            </button>

            {/* Dynamic Hierarchical Breadcrumbs */}
            {activeDashboardId ? (
              <>
                <span className="shell-hide-xs" style={{ color: "#CBD5E1", fontSize: "12px" }}>/</span>
                <Link
                  href={`/dashboard?ws=${encodeURIComponent(wsId || "beta")}`}
                  className="shell-hide-xs"
                  style={{
                    fontSize: "13px",
                    fontWeight: "600",
                    color: "#64748B",
                    textDecoration: "none",
                  }}
                  title="Return to all dashboards"
                >
                  Dashboards
                </Link>
                <span className="shell-hide-xs" style={{ color: "#CBD5E1", fontSize: "12px" }}>/</span>
                <span className="shell-hide-xs" style={{ fontSize: "13px", fontWeight: "700", color: "#0F172A" }}>
                  {title}
                </span>
              </>
            ) : title ? (
              <>
                <span className="shell-hide-xs" style={{ color: "#CBD5E1", fontSize: "12px" }}>/</span>
                <span className="shell-hide-xs" style={{ fontSize: "13px", fontWeight: "700", color: "#0F172A" }}>
                  {title}
                </span>
              </>
            ) : null}
          </div>

          {/* Right Header: Status Pill, Time Range, Admin Shortcut, Profile Trigger */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {/* Live Socket Status */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "4px 9px",
                borderRadius: "9999px",
                backgroundColor: isLiveWs ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)",
                border: `1px solid ${isLiveWs ? "rgba(16, 185, 129, 0.25)" : "rgba(239, 68, 68, 0.25)"}`,
                color: isLiveWs ? "#059669" : "#DC2626",
                fontSize: "11px",
                fontWeight: "600",
              }}
            >
              <span
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  backgroundColor: isLiveWs ? "#10B981" : "#EF4444",
                }}
              />
              <span className="shell-hide-xs">{isLiveWs ? "WS Live :4001" : "Offline"}</span>
            </div>

            {/* Time range selector if onTimeRangeChange provided */}
            {onTimeRangeChange && (
              <div
                className="shell-hide-mobile"
                style={{
                  display: "flex",
                  alignItems: "center",
                  backgroundColor: "#F1F5F9",
                  border: "1px solid #E2E8F0",
                  borderRadius: "6px",
                  padding: "2px",
                }}
              >
                {timeRanges.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => onTimeRangeChange(r)}
                    style={{
                      padding: "3px 8px",
                      borderRadius: "4px",
                      border: "none",
                      fontSize: "11px",
                      fontWeight: timeRange === r ? "700" : "500",
                      backgroundColor: timeRange === r ? "#F97316" : "transparent",
                      color: timeRange === r ? "#FFFFFF" : "#64748B",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                  >
                    {r}
                  </button>
                ))}
              </div>
            )}

            {/* Admin Console Shortcut Button */}
            <a
              href="http://localhost:3000"
              target="_blank"
              rel="noreferrer"
              className="shell-hide-xs"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                padding: "5px 10px",
                borderRadius: "6px",
                backgroundColor: "rgba(249, 115, 22, 0.1)",
                color: "#EA580C",
                border: "1px solid rgba(249, 115, 22, 0.3)",
                fontSize: "12px",
                fontWeight: "600",
                textDecoration: "none",
              }}
            >
              <span>Admin</span>
              <ExternalLink size={12} />
            </a>

            {/* Profile Avatar Trigger in Header */}
            <button
              type="button"
              onClick={() => setProfileModalOpen(true)}
              style={{
                width: "30px",
                height: "30px",
                borderRadius: "6px",
                backgroundColor: "#F1F5F9",
                border: "1px solid #CBD5E1",
                color: "#0F172A",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "11px",
                fontWeight: "700",
                cursor: "pointer",
              }}
              title="View profile & clearance"
            >
              {userInitials || "OP"}
            </button>

            {/* Header Actions slot */}
            {actions}
          </div>
        </header>

        {/* Page Content Container (#F5F7FA) */}
        <main
          className="shell-content"
          style={{
            flex: 1,
            padding: "24px",
            maxWidth: "1600px",
            width: "100%",
            margin: "0 auto",
            backgroundColor: "#F5F7FA",
          }}
        >
          {children}
        </main>
      </div>

      {/* ──────────────────────────────────────────────────────────
          MODALS & DRAWERS
          ────────────────────────────────────────────────────────── */}
      <WorkspacesModal
        isOpen={workspacesModalOpen}
        onClose={() => setWorkspacesModalOpen(false)}
        workspaces={workspaces}
        currentWsId={wsId}
        onSelectWorkspace={onSelectWorkspace}
      />

      <ProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        user={user}
        workspaces={workspaces}
        onLogout={() => logout("/login")}
      />
    </div>
  );
}
