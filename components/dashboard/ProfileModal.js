"use client";

import { useState, useEffect } from "react";
import { User, ShieldCheck, Mail, Key, Clock, CheckCircle2, XCircle, LogOut, Folder, Pin } from "../common/Icons";
import api from "../../lib/api";

export default function ProfileModal({
  isOpen,
  onClose,
  user,
  workspaces = [],
  onLogout,
}) {
  const [pinnedInfo, setPinnedInfo] = useState(null);

  useEffect(() => {
    if (!isOpen) return;
    try {
      const savedStr = typeof window !== "undefined" ? localStorage.getItem("thingsnxt_pinned_dashboard") : null;
      if (savedStr) {
        setPinnedInfo(JSON.parse(savedStr));
      }
    } catch {}

    api.get("/admin/users/me/preferences")
      .then((res) => {
        if (res.data?.pinned_dashboard) {
          setPinnedInfo(res.data.pinned_dashboard);
        }
      })
      .catch(() => {});
  }, [isOpen]);

  if (!isOpen) return null;

  const displayName = user?.display_name || user?.full_name || user?.username || "Enterprise Operator";
  const username = user?.username || "operator";
  const email = user?.email || "operator@thingsnxt.internal";
  const role = user?.role || "User";
  const userId = user?.id || user?._id || "usr_enterprise_01";
  const isAdmin = Boolean(user?.is_admin || role.toLowerCase().includes("admin"));
  const createdAt = user?.created_at ? new Date(user.created_at).toLocaleDateString() : "Active Session";

  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(15, 23, 42, 0.5)",
        backdropFilter: "blur(4px)",
        zIndex: 200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "580px",
          backgroundColor: "#FFFFFF",
          border: "1px solid #E2E8F0",
          borderRadius: "12px",
          boxShadow: "0 20px 40px rgba(15, 23, 42, 0.15)",
          display: "flex",
          flexDirection: "column",
          maxHeight: "85vh",
          overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: "18px 24px",
            borderBottom: "1px solid #E2E8F0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "8px",
                backgroundColor: "#FFF7ED",
                border: "1px solid #FFEDD5",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#EA580C",
              }}
            >
              <User size={18} />
            </div>
            <div>
              <h2 style={{ fontSize: "16px", fontWeight: "700", color: "#0F172A", margin: 0 }}>
                Operator Profile & Clearance
              </h2>
              <p style={{ fontSize: "12px", color: "#64748B", margin: "2px 0 0" }}>
                Identity details, access level, and multi-tenant partition assignments.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              color: "#64748B",
              cursor: "pointer",
              padding: "4px",
              borderRadius: "4px",
            }}
          >
            <XCircle size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: "24px", overflowY: "auto", flex: 1, display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Identity Card */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              padding: "18px",
              borderRadius: "8px",
              backgroundColor: "#F8FAFC",
              border: "1px solid #E2E8F0",
            }}
          >
            <div
              style={{
                width: "52px",
                height: "52px",
                borderRadius: "10px",
                backgroundColor: "#111827",
                color: "#FDBA74",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "18px",
                fontWeight: "800",
                boxShadow: "0 2px 8px rgba(15, 23, 42, 0.15)",
                flexShrink: 0,
              }}
            >
              {initials}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "16px", fontWeight: "800", color: "#0F172A" }}>
                  {displayName}
                </span>
                <span
                  style={{
                    fontSize: "10px",
                    fontWeight: "700",
                    padding: "2px 7px",
                    borderRadius: "4px",
                    backgroundColor: isAdmin ? "#F3E8FF" : "#FFF7ED",
                    color: isAdmin ? "#7E22CE" : "#EA580C",
                    border: `1px solid ${isAdmin ? "#E9D5FF" : "#FFEDD5"}`,
                    textTransform: "uppercase",
                  }}
                >
                  {isAdmin ? "Super Administrator" : `${role} Clearance`}
                </span>
              </div>
              <span style={{ fontSize: "12px", color: "#64748B" }}>@{username}</span>
            </div>
          </div>

          {/* Details Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
              gap: "12px",
            }}
          >
            <div
              style={{
                padding: "14px",
                borderRadius: "8px",
                backgroundColor: "#F8FAFC",
                border: "1px solid #E2E8F0",
                display: "flex",
                flexDirection: "column",
                gap: "4px",
              }}
            >
              <span style={{ fontSize: "11px", fontWeight: "600", color: "#64748B", textTransform: "uppercase" }}>
                Email Address
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Mail size={13} color="#64748B" />
                <span style={{ fontSize: "12.5px", color: "#0F172A", fontFamily: "monospace", fontWeight: "600" }}>
                  {email}
                </span>
              </div>
            </div>

            <div
              style={{
                padding: "14px",
                borderRadius: "8px",
                backgroundColor: "#F8FAFC",
                border: "1px solid #E2E8F0",
                display: "flex",
                flexDirection: "column",
                gap: "4px",
              }}
            >
              <span style={{ fontSize: "11px", fontWeight: "600", color: "#64748B", textTransform: "uppercase" }}>
                Account User ID
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Key size={13} color="#64748B" />
                <span style={{ fontSize: "12.5px", color: "#EA580C", fontFamily: "monospace", fontWeight: "600" }}>
                  {String(userId).slice(0, 16)}...
                </span>
              </div>
            </div>

            <div
              style={{
                padding: "14px",
                borderRadius: "8px",
                backgroundColor: "#F8FAFC",
                border: "1px solid #E2E8F0",
                display: "flex",
                flexDirection: "column",
                gap: "4px",
              }}
            >
              <span style={{ fontSize: "11px", fontWeight: "600", color: "#64748B", textTransform: "uppercase" }}>
                Active Session
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <CheckCircle2 size={13} color="#059669" />
                <span style={{ fontSize: "12.5px", color: "#059669", fontWeight: "600" }}>
                  JWT Bearer Active
                </span>
              </div>
            </div>

            <div
              style={{
                padding: "14px",
                borderRadius: "8px",
                backgroundColor: "#F8FAFC",
                border: "1px solid #E2E8F0",
                display: "flex",
                flexDirection: "column",
                gap: "4px",
              }}
            >
              <span style={{ fontSize: "11px", fontWeight: "600", color: "#64748B", textTransform: "uppercase" }}>
                Member Since
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Clock size={13} color="#64748B" />
                <span style={{ fontSize: "12.5px", color: "#334155", fontWeight: "600" }}>
                  {createdAt}
                </span>
              </div>
            </div>
          </div>

          {/* Pinned Dashboard Preference Section */}
          <div
            style={{
              padding: "12px 16px",
              borderRadius: "8px",
              backgroundColor: pinnedInfo ? "#FFF7ED" : "#F8FAFC",
              border: `1px solid ${pinnedInfo ? "#FFEDD5" : "#E2E8F0"}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "12px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "6px",
                  backgroundColor: pinnedInfo ? "#EA580C" : "#E2E8F0",
                  color: pinnedInfo ? "#FFFFFF" : "#64748B",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Pin size={15} color={pinnedInfo ? "#FFFFFF" : "#64748B"} />
              </div>
              <div>
                <span style={{ fontSize: "11px", fontWeight: "700", color: "#64748B", textTransform: "uppercase" }}>
                  Default Login Dashboard
                </span>
                <div style={{ fontSize: "13px", fontWeight: "700", color: "#0F172A" }}>
                  {pinnedInfo ? pinnedInfo.name : "None (Displays dashboard gallery)"}
                </div>
              </div>
            </div>
            {pinnedInfo && (
              <button
                type="button"
                onClick={async () => {
                  try {
                    await api.put("/admin/users/me/preferences", { pinned_dashboard: null });
                  } catch {}
                  try {
                    localStorage.removeItem("thingsnxt_pinned_dashboard");
                  } catch {}
                  setPinnedInfo(null);
                }}
                style={{
                  padding: "5px 12px",
                  borderRadius: "5px",
                  border: "1px solid #FDBA74",
                  backgroundColor: "#FFFFFF",
                  color: "#9A3412",
                  fontSize: "11.5px",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                Unpin
              </button>
            )}
          </div>

          {/* Assigned Workspaces Section */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "12px", fontWeight: "700", color: "#0F172A", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                Assigned Tenant Workspaces ({workspaces.length})
              </span>
            </div>

            <div
              style={{
                borderRadius: "8px",
                border: "1px solid #E2E8F0",
                backgroundColor: "#F8FAFC",
                overflow: "hidden",
                maxHeight: "180px",
                overflowY: "auto",
              }}
            >
              {workspaces.length === 0 ? (
                <div style={{ padding: "16px", textAlign: "center", color: "#64748B", fontSize: "12px" }}>
                  No isolated workspaces configured for this account.
                </div>
              ) : (
                workspaces.map((ws) => {
                  const id = ws.workspace_id || ws.slug || ws.id;
                  const name = ws.name || ws.slug || id;
                  const role = ws.role || "Member";

                  return (
                    <div
                      key={id}
                      style={{
                        padding: "10px 14px",
                        borderBottom: "1px solid #E2E8F0",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        fontSize: "12px",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <Folder size={14} color="#EA580C" />
                        <span style={{ fontWeight: "600", color: "#0F172A" }}>{name}</span>
                        <span style={{ color: "#64748B", fontFamily: "monospace", fontSize: "11px" }}>({id})</span>
                      </div>
                      <span
                        style={{
                          fontSize: "10.5px",
                          fontWeight: "700",
                          padding: "2px 7px",
                          borderRadius: "4px",
                          backgroundColor: "#FFF7ED",
                          color: "#EA580C",
                          border: "1px solid #FFEDD5",
                          textTransform: "capitalize",
                        }}
                      >
                        {role}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "14px 24px",
            borderTop: "1px solid #E2E8F0",
            backgroundColor: "#F8FAFC",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <button
            type="button"
            onClick={onLogout}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "7px 14px",
              borderRadius: "6px",
              backgroundColor: "#FEF2F2",
              border: "1px solid #FECACA",
              color: "#DC2626",
              fontSize: "12px",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            <LogOut size={13} />
            <span>Sign Out Session</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            style={{
              padding: "7px 16px",
              borderRadius: "6px",
              backgroundColor: "#0F172A",
              border: "1px solid #0F172A",
              color: "#FFFFFF",
              fontSize: "12px",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
