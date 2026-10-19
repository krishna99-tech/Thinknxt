"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { getToken } from "./auth";

export function getWebSocketBaseUrl() {
  if (typeof window !== "undefined") {
    const isHttps = window.location.protocol === "https:";
    const wsProto = isHttps ? "wss:" : "ws:";

    if (process.env.NEXT_PUBLIC_WS_URL) {
      let url = process.env.NEXT_PUBLIC_WS_URL;
      // Upgrade ws: to wss: if the client portal is loaded via https: to avoid Mixed Content errors
      if (isHttps && url.startsWith("ws://")) {
        url = url.replace(/^ws:\/\//, "wss://");
      }
      return url;
    }

    const host = window.location.hostname || "100.77.110.74";
    return `${wsProto}//${host}:4001/ws`;
  }

  return process.env.NEXT_PUBLIC_WS_URL || "ws://100.77.110.74:4001/ws";
}

/**
 * React hook to connect to the Fastify Real-Time Streaming WebSocket
 * @param {Function} onMessage - Callback for incoming messages
 * @param {Array<string>} channels - Optional channel subscriptions e.g. ['workspace:default', 'device:esp32_01']
 */
export function useWebSocket(onMessage, channels = []) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState(null);
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const pingIntervalRef = useRef(null);
  const onMessageRef = useRef(onMessage);
  const channelsRef = useRef(channels);
  const isMountedRef = useRef(true);

  // Keep callback fresh without triggering reconnect
  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  // Keep channels fresh and subscribe dynamically over the open socket
  const serializedChannels = JSON.stringify(channels || []);
  useEffect(() => {
    channelsRef.current = channels || [];
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN && channels && channels.length > 0) {
      try {
        wsRef.current.send(JSON.stringify({ type: "subscribe", channels }));
      } catch (err) {
        console.warn("[Fastify WS] Failed to subscribe to channels:", err);
      }
    }
  }, [serializedChannels]);

  useEffect(() => {
    isMountedRef.current = true;

    function connect() {
      if (!isMountedRef.current) return;

      const token = getToken();
      const baseWs = getWebSocketBaseUrl();
      const wsUrl = token ? `${baseWs}?token=${encodeURIComponent(token)}` : baseWs;

      // Avoid creating multiple sockets if already active or connecting
      if (
        wsRef.current &&
        (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING)
      ) {
        return;
      }

      try {
        console.log("[Fastify WS] Connecting to:", wsUrl);
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          if (!isMountedRef.current) {
            ws.close();
            return;
          }
          console.log("[Fastify WS] ✅ Stream Connected");
          setIsConnected(true);

          // Heartbeat ping every 25s
          if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
          pingIntervalRef.current = setInterval(() => {
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({ type: "ping" }));
            }
          }, 25000);

          // Subscribe to channels if already defined
          const currentChannels = channelsRef.current;
          if (currentChannels && currentChannels.length > 0) {
            ws.send(JSON.stringify({ type: "subscribe", channels: currentChannels }));
          }
        };

        ws.onmessage = (event) => {
          try {
            const parsed = JSON.parse(event.data);
            if (parsed.type === "pong") return; // Heartbeat ack
            setLastMessage(parsed);
            if (onMessageRef.current) {
              onMessageRef.current(parsed);
            }
          } catch {
            setLastMessage(event.data);
            if (onMessageRef.current) {
              onMessageRef.current(event.data);
            }
          }
        };

        ws.onclose = (event) => {
          if (!isMountedRef.current) return;
          console.warn(`[Fastify WS] ⚠️ Disconnected (code: ${event.code}, reason: ${event.reason || "none"})`);
          setIsConnected(false);
          if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);

          if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = setTimeout(() => {
            if (isMountedRef.current) {
              connect();
            }
          }, 4000);
        };

        ws.onerror = (err) => {
          console.error("[Fastify WS] Socket Error:", err);
          setIsConnected(false);
        };
      } catch (err) {
        console.error("[Fastify WS] Connection initialization failed:", err);
        setIsConnected(false);
        if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = setTimeout(() => {
          if (isMountedRef.current) {
            connect();
          }
        }, 5000);
      }
    }

    connect();

    return () => {
      isMountedRef.current = false;
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, []); // Run once on component mount!

  const sendMessage = useCallback((msg) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(typeof msg === "string" ? msg : JSON.stringify(msg));
    }
  }, []);

  return { isConnected, lastMessage, sendMessage };
}
