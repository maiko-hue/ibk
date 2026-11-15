"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SobreView() {
  const router = useRouter();

  // Vista: "menu" | "cuenta"
  const [currentView, setCurrentView] = useState<"menu" | "cuenta">("menu");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Variables extraídas en el index (sin consultas repetitivas a Firebase para evitar bloqueos)
  const [email, setEmail] = useState("maikolecrisanto@gmail.com");
  const [estado, setEstado] = useState("Activo");
  const [registradoPor, setRegistradoPor] = useState("Dueño");
  const [fecha, setFecha] = useState("2026-11-15T15:30:59.562Z");
  const [token, setToken] = useState("token_1709317262827_692323");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedEmail = localStorage.getItem("ibk_user_email") || localStorage.getItem("user_email");
      const savedEstado = localStorage.getItem("ibk_user_estado") || localStorage.getItem("user_estado");
      const savedRegPor = localStorage.getItem("ibk_user_registrado_por") || localStorage.getItem("user_registrado_por");
      const savedFecha = localStorage.getItem("ibk_user_fecha") || localStorage.getItem("user_fecha");
      const savedToken = localStorage.getItem("ibk_user_token") || localStorage.getItem("sesion_token_ibk");

      if (savedEmail) setEmail(savedEmail);
      if (savedEstado) setEstado(savedEstado);
      if (savedRegPor) setRegistradoPor(savedRegPor);
      if (savedFecha) setFecha(savedFecha);
      if (savedToken) setToken(savedToken);
    }
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  // Obtener solo los últimos 6 dígitos del token
  const getUltimos6Digitos = (tokStr: string) => {
    if (!tokStr) return "000000";
    const digits = tokStr.replace(/\D/g, "");
    if (digits.length >= 6) {
      return digits.slice(-6);
    }
    return tokStr.slice(-6);
  };

  const formatFecha = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      if (isNaN(d.getTime())) return isoStr;
      return d.toLocaleDateString("es-PE", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }) + " " + d.toLocaleTimeString("es-PE", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch (_) {
      return isoStr;
    }
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-[#f8fafc] text-[#333333] select-none relative overflow-hidden font-sans">
      {/* ==================================================
          TOAST DE NOTIFICACIÓN
          ================================================== */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 bg-[#111111]/90 text-white text-[13px] px-4 py-2.5 rounded-full shadow-lg z-[9999] transition-all animate-fadeIn">
          {toastMessage}
        </div>
      )}

      {/* ==================================================
          HEADER
          ================================================== */}
      <header className="flex justify-between items-center px-4 py-3.5 bg-white flex-shrink-0 shadow-[0_4px_10px_rgba(0,0,0,0.06)] z-10 border-b border-[#f0f0f0]">
        <button
          type="button"
          onClick={() => {
            if (currentView === "cuenta") {
              setCurrentView("menu");
            } else {
              router.push("/config");
            }
          }}
          className="bg-transparent border-none cursor-pointer flex items-center justify-center p-1 w-8 h-8 active:scale-95 transition"
        >
          <svg className="w-5 h-5 stroke-[#00B14F] stroke-[2.5] fill-none stroke-linecap-round stroke-linejoin-round" viewBox="0 0 24 24">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
        <div className="text-[17px] font-bold text-[#111111] flex-grow text-center">
          {currentView === "cuenta" ? "Mi cuenta" : "Información de App"}
        </div>
        <div className="w-8"></div>
      </header>

      {/* ==================================================
          CONTENIDO: VISTA PRINCIPAL (MENÚ CON LOS 3 BOTONES)
          ================================================== */}
      {currentView === "menu" && (
        <div className="flex-1 overflow-y-auto no-scrollbar p-5 flex flex-col justify-between">
          <div className="flex flex-col gap-3.5">
            <div className="text-[12px] font-extrabold text-[#888888] uppercase tracking-wider px-1 mb-1">
              General
            </div>

            {/* BOTÓN 1: Mi cuenta */}
            <div
              onClick={() => setCurrentView("cuenta")}
              className="bg-white rounded-[14px] p-4 flex items-center shadow-[0_2px_8px_rgba(0,0,0,0.03)] border border-[#f0f0f0] cursor-pointer active:bg-[#f5f7f9] transition"
            >
              <div className="w-10 h-10 rounded-full bg-[#E8F8EE] flex items-center justify-center mr-3.5 flex-shrink-0">
                <svg className="w-5 h-5 stroke-[#00B14F] stroke-2 fill-none stroke-linecap-round stroke-linejoin-round" viewBox="0 0 24 24">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[15px] font-bold text-[#111111]">Mi cuenta</div>
                <div className="text-[12px] text-[#777777] truncate">Ver datos de acceso y suscripción</div>
              </div>
              <div className="text-[#00B14F] text-[22px] font-extrabold ml-2 scale-y-125">›</div>
            </div>

            {/* BOTÓN 2: Zoom de la App */}
            <div
              onClick={() => showToast("Zoom de la App: Próximamente")}
              className="bg-white rounded-[14px] p-4 flex items-center shadow-[0_2px_8px_rgba(0,0,0,0.03)] border border-[#f0f0f0] cursor-pointer active:bg-[#f5f7f9] transition"
            >
              <div className="w-10 h-10 rounded-full bg-[#E8F8EE] flex items-center justify-center mr-3.5 flex-shrink-0">
                <svg className="w-5 h-5 stroke-[#00B14F] stroke-2 fill-none stroke-linecap-round stroke-linejoin-round" viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  <line x1="11" y1="8" x2="11" y2="14"></line>
                  <line x1="8" y1="11" x2="14" y2="11"></line>
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[15px] font-bold text-[#111111]">Zoom de la App</div>
                <div className="text-[12px] text-[#777777] truncate">Ajustar tamaño de la interfaz (Próximamente)</div>
              </div>
              <div className="text-[#00B14F] text-[22px] font-extrabold ml-2 scale-y-125">›</div>
            </div>

            {/* BOTÓN 3: Administrar noti falsa */}
            <div
              onClick={() => showToast("Administrar noti falsa: Próximamente")}
              className="bg-white rounded-[14px] p-4 flex items-center shadow-[0_2px_8px_rgba(0,0,0,0.03)] border border-[#f0f0f0] cursor-pointer active:bg-[#f5f7f9] transition"
            >
              <div className="w-10 h-10 rounded-full bg-[#E8F8EE] flex items-center justify-center mr-3.5 flex-shrink-0">
                <svg className="w-5 h-5 stroke-[#00B14F] stroke-2 fill-none stroke-linecap-round stroke-linejoin-round" viewBox="0 0 24 24">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[15px] font-bold text-[#111111]">Administrar noti falsa</div>
                <div className="text-[12px] text-[#777777] truncate">Configurar notificaciones de prueba (Próximamente)</div>
              </div>
              <div className="text-[#00B14F] text-[22px] font-extrabold ml-2 scale-y-125">›</div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================
          CONTENIDO: VISTA MI CUENTA (UN SOLO CONTENEDOR)
          ================================================== */}
      {currentView === "cuenta" && (
        <div className="flex-1 overflow-y-auto no-scrollbar p-5 flex flex-col justify-between">
          <div>
            {/* Único contenedor con todos los datos integrados */}
            <div className="bg-white rounded-[16px] p-5 shadow-[0_4px_15px_rgba(0,0,0,0.04)] border border-[#f0f0f0] divide-y divide-[#f0f0f0]">
              {/* 1. APP (Estática) */}
              <div className="py-3.5 first:pt-0">
                <div className="text-[11px] font-extrabold text-[#888888] uppercase tracking-wider mb-1">APP</div>
                <div className="text-[15px] font-extrabold text-[#002D72]">IBK APPS REBORN 2026</div>
              </div>

              {/* 2. Email */}
              <div className="py-3.5">
                <div className="text-[11px] font-extrabold text-[#888888] uppercase tracking-wider mb-1">EMAIL</div>
                <div className="text-[15px] font-semibold text-[#111111] break-all">{email}</div>
              </div>

              {/* 3. Estado (Mostrado solo una vez) */}
              <div className="py-3.5">
                <div className="text-[11px] font-extrabold text-[#888888] uppercase tracking-wider mb-1">ESTADO</div>
                <div className="text-[15px] font-bold text-[#111111] capitalize">{estado}</div>
              </div>

              {/* 4. Registrado por */}
              <div className="py-3.5">
                <div className="text-[11px] font-extrabold text-[#888888] uppercase tracking-wider mb-1">REGISTRADO POR</div>
                <div className="text-[15px] font-semibold text-[#111111]">{registradoPor || "Dueño"}</div>
              </div>

              {/* 5. Fecha */}
              <div className="py-3.5">
                <div className="text-[11px] font-extrabold text-[#888888] uppercase tracking-wider mb-1">FECHA</div>
                <div className="text-[14px] font-medium text-[#222222]">{formatFecha(fecha)}</div>
                <div className="text-[11px] text-[#888888] mt-0.5 font-mono">{fecha}</div>
              </div>

              {/* 6. Token (Últimos 6 dígitos) */}
              <div className="py-3.5 last:pb-0">
                <div className="text-[11px] font-extrabold text-[#888888] uppercase tracking-wider mb-1">TOKEN</div>
                <div className="flex items-center gap-2">
                  <span className="text-[14px] font-mono text-[#888888]">••••••</span>
                  <span className="text-[14.5px] font-mono font-bold text-[#00B14F] bg-[#E8F8EE] px-2.5 py-0.5 rounded">
                    {getUltimos6Digitos(token)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Botón Volver */}
          <button
            type="button"
            onClick={() => setCurrentView("menu")}
            className="w-full py-4 rounded-[12px] text-[16px] font-bold bg-[#00B14F] text-white active:bg-[#009e43] transition cursor-pointer border-none shadow-sm mt-5 mb-2"
          >
            Volver
          </button>
        </div>
      )}
    </div>
  );
}
