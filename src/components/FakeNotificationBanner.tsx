"use client";

import React, { useState, useEffect, useRef } from "react";
import { NOTI_TRIGGER_EVENT } from "@/lib/fakeNotification";

interface NotificationData {
  senderName: string;
  formattedAmount: string;
  isDarkMode: boolean;
}

export default function FakeNotificationBanner() {
  const [data, setData] = useState<NotificationData | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [exitDirection, setExitDirection] = useState<"left" | "right">("left");
  const [dragOffset, setDragOffset] = useState(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const touchStartXRef = useRef(0);
  const isDraggingRef = useRef(false);

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const closeNotification = (direction: "left" | "right" = "left") => {
    clearTimer();
    setExitDirection(direction);
    setIsVisible(false);
    setTimeout(() => {
      setData(null);
      setDragOffset(0);
    }, 350);
  };

  useEffect(() => {
    const handlePushEvent = (e: Event) => {
      const custom = e as CustomEvent<NotificationData>;
      if (custom.detail) {
        clearTimer();
        setData(custom.detail);
        setDragOffset(0);
        setExitDirection("left");
        // Forzar reflow para animación de entrada
        setTimeout(() => {
          setIsVisible(true);
        }, 30);

        // Duración de 3 segundos en pantalla, luego se desliza hacia la izquierda
        timerRef.current = setTimeout(() => {
          closeNotification("left");
        }, 3000);
      }
    };

    window.addEventListener(NOTI_TRIGGER_EVENT, handlePushEvent);
    return () => {
      window.removeEventListener(NOTI_TRIGGER_EVENT, handlePushEvent);
      clearTimer();
    };
  }, []);

  // Gestos táctiles de deslizamiento (Swipe izquierda o derecha)
  const handleTouchStart = (e: React.TouchEvent) => {
    clearTimer();
    touchStartXRef.current = e.touches[0].clientX;
    isDraggingRef.current = true;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDraggingRef.current) return;
    const currentX = e.touches[0].clientX;
    const diff = currentX - touchStartXRef.current;
    setDragOffset(diff);
  };

  const handleTouchEnd = () => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    const SWIPE_THRESHOLD = 45;

    if (dragOffset < -SWIPE_THRESHOLD) {
      closeNotification("left");
    } else if (dragOffset > SWIPE_THRESHOLD) {
      closeNotification("right");
    } else {
      // Regresar a posición si no superó el umbral
      setDragOffset(0);
      // Reanudar temporizador de cierre
      timerRef.current = setTimeout(() => {
        closeNotification("left");
      }, 2000);
    }
  };

  if (!data) return null;

  const isDark = data.isDarkMode;

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onClick={() => closeNotification("left")}
      style={{
        transform: !isVisible
          ? exitDirection === "left"
            ? "translateX(-130%) translateY(-20px)"
            : "translateX(130%) translateY(-20px)"
          : `translateX(${dragOffset}px) translateY(0)`,
        transition: isDraggingRef.current
          ? "none"
          : "transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease",
      }}
      className={`fixed top-3 left-3 right-3 sm:max-w-[440px] sm:mx-auto z-[999999] rounded-[18px] p-3.5 flex items-center shadow-2xl cursor-pointer select-none active:scale-[0.99] ${
        isVisible ? "opacity-100" : "opacity-0"
      } ${
        isDark
          ? "bg-[#202020] text-white border border-white/10 shadow-[0_12px_35px_rgba(0,0,0,0.65)]"
          : "bg-white/95 backdrop-blur-md text-[#111111] border border-black/5 shadow-[0_12px_35px_rgba(0,0,0,0.18)]"
      }`}
    >
      {/* Icono oficial Interbank */}
      <img
        src="/img/interbank_wrdgas.webp"
        alt="Interbank"
        className="w-[38px] h-[38px] rounded-[10px] object-cover mr-3 flex-shrink-0 shadow-sm pointer-events-none"
      />

      {/* Contenido Notificación */}
      <div className="flex-1 min-w-0 pr-1">
        <div className="flex justify-between items-center mb-0.5">
          <span
            className={`text-[12.5px] font-bold ${
              isDark ? "text-white" : "text-[#111111]"
            }`}
          >
            Interbank
          </span>
          <span
            className={`text-[10.5px] font-semibold ${
              isDark ? "text-[#AAAAAA]" : "text-[#888888]"
            }`}
          >
            Ahora
          </span>
        </div>
        <div
          className={`text-[12.5px] leading-snug font-medium break-words ${
            isDark ? "text-[#E5E5E5]" : "text-[#333333]"
          }`}
        >
          {data.senderName} te ha plineado S/ {data.formattedAmount}
        </div>
      </div>
    </div>
  );
}
