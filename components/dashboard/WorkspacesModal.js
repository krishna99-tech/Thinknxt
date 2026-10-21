"use client";

import { useState } from "react";
import { Folder, Search, CheckCircle2, ArrowUpRight, XCircle, ShieldCheck, ExternalLink, Plus } from "../common/Icons";

export default function WorkspacesModal({
  isOpen,
  onClose,
  workspaces = [],
  currentWsId,
  onSelectWorkspace,
}) {
  const [search, setSearch] = useState("");

  if (!isOpen) return null;

  const filtered = workspaces.filter((ws) => {
    const q = search.toLowerCase();
    const name = (ws.name || ws.slug || "").toLowerCase();
    const id = (ws.workspace_id || ws.slug || ws.id || "").toLowerCase();
    return name.includes(q) || id.includes(q);
  });

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
          maxWidth: "640px",
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
              <Folder size={18} />
            </div>
            <div>
              <h2 style={{ fontSize: "16px", fontWeight: "700", color: "#0F172A", margin: 0 }}>
                Configured Workspaces & Tenants
              </h2>
              <p style={{ fontSize: "12px", color: "#64748B", margin: "2px 0 0" }}>
                Switch active tenant partitions or review your assigned workspace roles.
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

        {/* Search Toolbar */}
        <div
          style={{
            padding: "14px 24px",
            borderBottom: "1px solid #E2E8F0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
            backgroundColor: "#F8FAFC",
          }}
        >
          <div style={{ position: "relative", flex: 1 }}>
            <Search
              size={14}
              color="#64748B"
              style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }}
            />
            <input
              type="text"
              placeholder="Search by workspace name or tenant ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%",
                backgroundColor: "#FFFFFF",
                border: "1px solid #CBD5E1",
                borderRadius: "6px",
                padding: "8px 12px 8px 34px",
                color: "#0F172A",
                fontSize: "12.5px",
                outline: "none",
              }}
              autoFocus
            />
          </div>

          <a
            href="http://localhost:3000"
            target="_blank"
            rel="noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "8px 14px",
              borderRadius: "6px",
              backgroundColor: "rgba(249, 115, 22, 0.1)",
              color: "#EA580C",
              border: "1px solid rgba(249, 115, 22, 0.3)",
              fontSize: "12px",
              fontWeight: "600",
              textDecoration: "none",
              whiteSpace: "nowrap",
            }}
          >
            <Plus size={13} />
            <span>New Tenant</span>
            <ExternalLink size={11} />
          </a>
        </div>

        {/* Workspaces List */}
        <div style={{ padding: "16px 24px", overflowY: "auto", flex: 1, display: "flex", flexDirection: "column", gap: "10px" }}>
          {filtered.length === 0 ? (
            <div style={{ padding: "40px 10px", textAlign: "center", color: "#64748B", fontSize: "13px" }}>
              No workspaces found matching "{search}".
            </div>
          ) : (
            filtered.map((ws) => {
              const id = ws.workspace_id || ws.slug || ws.id;
              const name = ws.name || ws.slug || id;
              const role = ws.role || (ws.owner_id ? "Member" : "Owner");
              const isSelected = id === currentWsId;

              return (
                <div
                  key={id}
                  style={{
                    backgroundColor: isSelected ? "#FFF7ED" : "#F8FAFC",
                    border: `1px solid ${isSelected ? "#FDBA74" : "#E2E8F0"}`,
                    borderRadius: "8px",
                    padding: "14px 16px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "14px",
                    transition: "all 0.15s ease",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div
                      style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "6px",
                        backgroundColor: isSelected ? "#FFEDD5" : "#FFFFFF",
                        border: `1px solid ${isSelected ? "#FDBA74" : "#E2E8F0"}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: isSelected ? "#EA580C" : "#64748B",
                      }}
                    >
                      <Folder size={18} />
                    </div>

                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontSize: "13.5px", fontWeight: "700", color: "#0F172A" }}>
                          {name}
                        </span>
                        {isSelected && (
                          <span
                            style={{
                              fontSize: "10px",
                              fontWeight: "700",
                              padding: "1px 6px",
                              borderRadius: "9999px",
                              backgroundColor: "#ECFDF5",
                              color: "#059669",
                              border: "1px solid #A7F3D0",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                            }}
                          >
                            <span style={{ width: "4px", height: "4px", borderRadius: "50%", backgroundColor: "#10B981" }} />
                            ACTIVE
                          </span>
                        )}
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "3px" }}>
                        <span style={{ fontSize: "11px", color: "#64748B", fontFamily: "monospace" }}>
                          ID: <span style={{ color: "#334155" }}>{id}</span>
                        </span>
                        <span style={{ color: "#CBD5E1" }}>•</span>
                        <span
                          style={{
                            fontSize: "10.5px",
                            fontWeight: "600",
                            color: "#EA580C",
                            textTransform: "capitalize",
                          }}
                        >
                          Role: {role}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    {isSelected ? (
                      <span
                        style={{
                          fontSize: "11.5px",
                          fontWeight: "600",
                          color: "#059669",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "5px",
                        }}
                      >
                        <CheckCircle2 size={13} />
                        <span>Selected</span>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          if (onSelectWorkspace) onSelectWorkspace(ws);
                          onClose();
                        }}
                        style={{
                          padding: "6px 14px",
                          borderRadius: "6px",
                          backgroundColor: "#FFFFFF",
                          border: "1px solid #CBD5E1",
                          color: "#0F172A",
                          fontSize: "12px",
                          fontWeight: "600",
                          cursor: "pointer",
                        }}
                      >
                        Switch
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
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
            fontSize: "12px",
            color: "#64748B",
          }}
        >
          <span>Total Workspaces: <strong>{workspaces.length}</strong></span>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: "6px 14px",
              borderRadius: "6px",
              backgroundColor: "#FFFFFF",
              border: "1px solid #CBD5E1",
              color: "#334155",
              fontSize: "12px",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
