"use client";

import { useEffect, useRef, useCallback } from "react";
import { useAuthStore } from "@/stores/authStore";

interface WSMessage {
  type: "payment_update" | "payment_expired" | "order_update";
  order_id: number;
  order_status: string;
  payment_status?: string;
}

export function useOrderWebSocket(onMessage: (msg: WSMessage) => void) {
  const { user } = useAuthStore();
  const wsRef = useRef<WebSocket | null>(null);
  const onMessageRef = useRef(onMessage);

  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  const connect = useCallback(() => {
    if (!user?.id) return;
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const wsUrl = `${process.env.NEXT_PUBLIC_WS_URL}/ws/${user.id}`;
    const ws = new WebSocket(wsUrl);

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onMessageRef.current(data);
      } catch {}
    };

    ws.onclose = () => {
      // Auto reconnect setelah 3 detik
      setTimeout(connect, 3000);
    };

    ws.onerror = () => {
      ws.close();
    };

    wsRef.current = ws;
  }, [user?.id]);

  useEffect(() => {
    connect();
    return () => {
      wsRef.current?.close();
    };
  }, [connect]);
}
