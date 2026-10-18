"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api, { getPublicAppConfig } from "../../lib/api";
import { getToken, logout } from "../../lib/auth";

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
          // If workspaces call fails or is empty, gracefully continue
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

  // Fetch dashboards whenever selected workspace changes
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
  }, [selectedWorkspace]);

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          paddingTop: "80px",
          fontFamily: "system-ui, sans-serif",
          color: "#4b5563",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              border: "4px solid #e5e7eb",
              borderTopColor: "#2563eb",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto 16px",
            }}
          />
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
          <p style={{ fontSize: "16px", fontWeight: "500" }}>Loading your ThingsNXT workspace...</p>
        </div>
      </div>
    );
  }

  const displayName = user?.display_name || user?.full_name || user?.username || "Valued User";
  const userRole = user?.role || "User";

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f8fafc",
        padding: "110px 20px 80px",
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      <div style={{ maxWidth: "1140px", margin: "0 auto" }}>
        {/* Top Header Card */}
        <div
          style={{
            background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
            borderRadius: "20px",
            padding: "36px",
            color: "#ffffff",
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
            marginBottom: "32px",
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "20px",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
              <span
                style={{
                  background: "rgba(37, 99, 235, 0.2)",
                  color: "#60a5fa",
                  border: "1px solid rgba(96, 165, 250, 0.3)",
                  fontSize: "12px",
                  fontWeight: "600",
                  padding: "4px 10px",
                  borderRadius: "9999px",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                {userRole} Portal
              </span>
              <span style={{ color: "#94a3b8", fontSize: "14px" }}>• Account ID: {user?.id?.slice(0, 8)}...</span>
            </div>
            <h1 style={{ fontSize: "2rem", fontWeight: "700", margin: "0 0 8px 0" }}>
              Welcome back, {displayName}!
            </h1>
            <p style={{ margin: 0, color: "#94a3b8", fontSize: "15px" }}>
              Connected to ThingsNXT Cloud. Manage your IoT devices, access documentation, and view platform features.
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <button
              onClick={() => logout("/login")}
              style={{
                backgroundColor: "rgba(239, 68, 68, 0.15)",
                color: "#f87171",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                padding: "10px 20px",
                borderRadius: "12px",
                fontWeight: "600",
                fontSize: "14px",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(239, 68, 68, 0.25)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(239, 68, 68, 0.15)";
              }}
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Platform Maintenance Notice */}
        {(platformConfig?.mobile_app?.maintenance_mode || platformConfig?.mobile_app?.maintenance_blocking) && (
          <div
            style={{
              backgroundColor: platformConfig?.mobile_app?.maintenance_blocking ? "#fef2f2" : "#fffbeb",
              border: `1px solid ${platformConfig?.mobile_app?.maintenance_blocking ? "#f87171" : "#fcd34d"}`,
              color: platformConfig?.mobile_app?.maintenance_blocking ? "#991b1b" : "#92400e",
              padding: "14px 20px",
              borderRadius: "14px",
              marginBottom: "24px",
              fontSize: "14px",
              display: "flex",
              alignItems: "center",
              gap: "14px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            }}
          >
            <span style={{ fontSize: "22px" }}>
              {platformConfig?.mobile_app?.maintenance_blocking ? "🛑" : "⚠️"}
            </span>
            <div>
              <strong style={{ display: "block", fontSize: "14px", marginBottom: "2px" }}>
                {platformConfig?.mobile_app?.maintenance_blocking
                  ? "Platform Hard Maintenance Active"
                  : "Platform Maintenance Announcement"}
              </strong>
              <span>
                {platformConfig?.mobile_app?.maintenance_message || "All services has been paused."}
              </span>
            </div>
          </div>
        )}

        {error && (
          <div
            style={{
              backgroundColor: "#fee2e2",
              border: "1px solid #f87171",
              color: "#991b1b",
              padding: "14px 18px",
              borderRadius: "12px",
              marginBottom: "24px",
              fontSize: "14px",
            }}
          >
            {error}
          </div>
        )}

        {/* Stats Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "20px",
            marginBottom: "32px",
          }}
        >
          <div
            style={{
              backgroundColor: "#ffffff",
              padding: "24px",
              borderRadius: "16px",
              border: "1px solid #e2e8f0",
              boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.05)",
            }}
          >
            <div style={{ color: "#64748b", fontSize: "13px", fontWeight: "600", textTransform: "uppercase" }}>
              User Role
            </div>
            <div style={{ fontSize: "24px", fontWeight: "700", color: "#0f172a", marginTop: "8px" }}>
              {userRole}
            </div>
            <div style={{ color: "#10b981", fontSize: "13px", marginTop: "6px" }}>● Active Client Session</div>
          </div>

          <div
            style={{
              backgroundColor: "#ffffff",
              padding: "24px",
              borderRadius: "16px",
              border: "1px solid #e2e8f0",
              boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.05)",
            }}
          >
            <div style={{ color: "#64748b", fontSize: "13px", fontWeight: "600", textTransform: "uppercase" }}>
              Workspaces Accessible
            </div>
            <div style={{ fontSize: "24px", fontWeight: "700", color: "#0f172a", marginTop: "8px" }}>
              {workspaces.length > 0 ? workspaces.length : "Default"}
            </div>
            <div style={{ color: "#64748b", fontSize: "13px", marginTop: "6px" }}>Tenant isolation enabled</div>
          </div>

          <div
            style={{
              backgroundColor: "#ffffff",
              padding: "24px",
              borderRadius: "16px",
              border: "1px solid #e2e8f0",
              boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.05)",
            }}
          >
            <div style={{ color: "#64748b", fontSize: "13px", fontWeight: "600", textTransform: "uppercase" }}>
              Username
            </div>
            <div style={{ fontSize: "22px", fontWeight: "700", color: "#0f172a", marginTop: "8px", overflow: "hidden", textOverflow: "ellipsis" }}>
              {user?.username || "—"}
            </div>
            <div style={{ color: "#64748b", fontSize: "13px", marginTop: "6px" }}>{user?.email || "No email"}</div>
          </div>

          <div
            style={{
              backgroundColor: "#ffffff",
              padding: "24px",
              borderRadius: "16px",
              border: "1px solid #e2e8f0",
              boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.05)",
            }}
          >
            <div style={{ color: "#64748b", fontSize: "13px", fontWeight: "600", textTransform: "uppercase" }}>
              Security Status
            </div>
            <div style={{ fontSize: "24px", fontWeight: "700", color: "#10b981", marginTop: "8px" }}>
              Verified
            </div>
            <div style={{ color: "#64748b", fontSize: "13px", marginTop: "6px" }}>OAuth2 Bearer Token active</div>
          </div>
        </div>

        {/* Content Section: Workspaces & Actions */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "24px" }}>
          {/* Workspaces list */}
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "16px",
              padding: "28px",
              border: "1px solid #e2e8f0",
              boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.05)",
            }}
          >
            <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#0f172a", margin: "0 0 16px 0" }}>
              Your Workspaces
            </h3>
            {workspaces.length === 0 ? (
              <div style={{ padding: "24px", textAlign: "center", backgroundColor: "#f8fafc", borderRadius: "12px", border: "1px dashed #cbd5e1" }}>
                <p style={{ color: "#64748b", fontSize: "14px", margin: 0 }}>
                  You are participating as a Member in the Default workspace.
                </p>
                <p style={{ color: "#94a3b8", fontSize: "12px", marginTop: "6px" }}>
                  Workspace administrative features are managed in the Admin Console by Workspace Owners.
                </p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {workspaces.map((ws, idx) => (
                  <div
                    key={ws.id || ws._id || idx}
                    style={{
                      padding: "16px",
                      borderRadius: "12px",
                      backgroundColor: "#f8fafc",
                      border: "1px solid #e2e8f0",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: "600", color: "#1e293b", fontSize: "15px" }}>
                        {ws.name || ws.slug || "Workspace"}
                      </div>
                      <div style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>
                        Role: <span style={{ fontWeight: "600", color: "#2563eb" }}>{ws.role || "Member"}</span>
                      </div>
                    </div>
                    <span
                      style={{
                        padding: "4px 8px",
                        borderRadius: "6px",
                        fontSize: "11px",
                        fontWeight: "600",
                        backgroundColor: "#e2e8f0",
                        color: "#475569",
                      }}
                    >
                      Active
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Access */}
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "16px",
              padding: "28px",
              border: "1px solid #e2e8f0",
              boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.05)",
            }}
          >
            <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#0f172a", margin: "0 0 16px 0" }}>
              Quick Navigation
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <Link
                href="/products"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "16px",
                  borderRadius: "12px",
                  backgroundColor: "#eff6ff",
                  border: "1px solid #bfdbfe",
                  color: "#1d4ed8",
                  textDecoration: "none",
                  fontWeight: "600",
                  fontSize: "14px",
                }}
              >
                <span>📦 Explore IoT Products & Features</span>
                <span>→</span>
              </Link>

              <Link
                href="/documentation"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "16px",
                  borderRadius: "12px",
                  backgroundColor: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  color: "#334155",
                  textDecoration: "none",
                  fontWeight: "600",
                  fontSize: "14px",
                }}
              >
                <span>📚 Device SDK & API Documentation</span>
                <span>→</span>
              </Link>

              <Link
                href="/support"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "16px",
                  borderRadius: "12px",
                  backgroundColor: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  color: "#334155",
                  textDecoration: "none",
                  fontWeight: "600",
                  fontSize: "14px",
                }}
              >
                <span>💬 Contact Technical Support</span>
                <span>→</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Configured Dashboards Section */}
        <div
          style={{
            backgroundColor: "#ffffff",
            borderRadius: "20px",
            padding: "32px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.05)",
            marginTop: "32px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "16px",
              marginBottom: "24px",
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "20px" }}>📊</span>
                <h3 style={{ fontSize: "20px", fontWeight: "700", color: "#0f172a", margin: 0 }}>
                  Workspace Telemetry Dashboards
                </h3>
              </div>
              <p style={{ color: "#64748b", fontSize: "13px", marginTop: "4px", marginBottom: 0 }}>
                Live dashboards configured for{" "}
                <strong style={{ color: "#0f172a" }}>{selectedWorkspace?.name || "your workspace"}</strong> (Read-Only Viewer)
              </p>
            </div>

            {/* Workspace Selector Pills if multiple exist */}
            {workspaces.length > 1 && (
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {workspaces.map((ws) => {
                  const isSelected =
                    (ws.id || ws.slug) === (selectedWorkspace?.id || selectedWorkspace?.slug);
                  return (
                    <button
                      key={ws.id || ws.slug}
                      type="button"
                      onClick={() => setSelectedWorkspace(ws)}
                      style={{
                        padding: "6px 14px",
                        borderRadius: "20px",
                        fontSize: "12px",
                        fontWeight: "600",
                        border: isSelected ? "1px solid #2563eb" : "1px solid #cbd5e1",
                        backgroundColor: isSelected ? "#eff6ff" : "#ffffff",
                        color: isSelected ? "#1d4ed8" : "#475569",
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                      }}
                    >
                      {ws.name || ws.slug} ({ws.role || "member"})
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Dashboards grid */}
          {loadingDashboards ? (
            <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  border: "3px solid #e2e8f0",
                  borderTopColor: "#2563eb",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite",
                  margin: "0 auto 12px",
                }}
              />
              <p style={{ fontSize: "13px", margin: 0 }}>Fetching configured dashboards...</p>
            </div>
          ) : dashboards.length === 0 ? (
            <div
              style={{
                padding: "36px 24px",
                textAlign: "center",
                backgroundColor: "#f8fafc",
                borderRadius: "14px",
                border: "1px dashed #cbd5e1",
              }}
            >
              <div style={{ fontSize: "28px", marginBottom: "8px" }}>📈</div>
              <div style={{ fontWeight: "600", color: "#334155", fontSize: "15px" }}>
                No Dashboards Configured Yet
              </div>
              <p style={{ color: "#64748b", fontSize: "13px", maxWidth: "480px", margin: "6px auto 0" }}>
                Your workspace administrator hasn't published any telemetry dashboards for this workspace yet. When dashboards are created, they will automatically appear here for real-time monitoring.
              </p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" }}>
              {dashboards.map((dash) => {
                const wsId =
                  selectedWorkspace?.workspace_id ||
                  selectedWorkspace?.slug ||
                  selectedWorkspace?.id;
                const dashId = dash.id || dash._id;
                return (
                  <div
                    key={dashId}
                    style={{
                      border: "1px solid #e2e8f0",
                      borderRadius: "16px",
                      padding: "24px",
                      backgroundColor: "#ffffff",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      boxShadow: "0 2px 4px 0 rgba(0, 0, 0, 0.04)",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          gap: "10px",
                          marginBottom: "12px",
                        }}
                      >
                        <div
                          style={{
                            width: "40px",
                            height: "40px",
                            borderRadius: "10px",
                            backgroundColor: "#eff6ff",
                            border: "1px solid #bfdbfe",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "18px",
                          }}
                        >
                          📊
                        </div>
                        <span
                          style={{
                            padding: "4px 8px",
                            borderRadius: "6px",
                            fontSize: "11px",
                            fontWeight: "600",
                            backgroundColor: "#f1f5f9",
                            color: "#475569",
                          }}
                        >
                          {dash.widget_count || dash.widgets || 0} Widgets
                        </span>
                      </div>

                      <h4
                        style={{
                          fontSize: "16px",
                          fontWeight: "700",
                          color: "#0f172a",
                          margin: "0 0 6px 0",
                        }}
                      >
                        {dash.name || "Untitled Dashboard"}
                      </h4>
                      <p style={{ fontSize: "12px", color: "#64748b", margin: 0, lineHeight: "1.5" }}>
                        {dash.description || "Real-time telemetry and device monitoring dashboard."}
                      </p>
                    </div>

                    <div style={{ marginTop: "20px", paddingTop: "16px", borderTop: "1px solid #f1f5f9" }}>
                      <Link
                        href={`/dashboard/${dashId}?ws=${encodeURIComponent(wsId)}`}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: "100%",
                          padding: "10px 16px",
                          borderRadius: "10px",
                          backgroundColor: "#2563eb",
                          color: "#ffffff",
                          fontSize: "13px",
                          fontWeight: "600",
                          textDecoration: "none",
                          boxShadow: "0 2px 4px rgba(37, 99, 235, 0.2)",
                          boxSizing: "border-box",
                        }}
                      >
                        <span>View Live Dashboard →</span>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
