"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  getAppZoom,
  setAppZoom,
  MIN_ZOOM,
  MAX_ZOOM,
  STEP_ZOOM,
  DEFAULT_ZOOM,
  ZOOM_EVENT_NAME,
} from "@/lib/zoom";
import {
  getFakeNotiConfig,
  saveFakeNotiConfig,
  FakeNotiConfig,
  DEFAULT_NOTI_CONFIG,
  DEFAULT_RANDOM_NAMES,
} from "@/lib/fakeNotification";
import { startTutorial, startMiniNotiTutorial } from "@/lib/tutorial";

export default function SobreView() {
  const router = useRouter();

  // Vista: "menu" | "cuenta" | "noti"
  const [currentView, setCurrentView] = useState<"menu" | "cuenta" | "noti">("menu");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleProbarNoti = () => {
    saveFakeNotiConfig(notiConfig);
    startMiniNotiTutorial();
    router.push("/inicio");
  };

  // Configuración de Notificación Falsa
  const [notiConfig, setNotiConfig] = useState<FakeNotiConfig>(DEFAULT_NOTI_CONFIG);
  const [newSenderInput, setNewSenderInput] = useState("");

  // Zoom de la app
  const [zoomLevel, setZoomLevel] = useState<number>(DEFAULT_ZOOM);
  const [showZoomModal, setShowZoomModal] = useState<boolean>(false);

  // Variables extraídas en el index (sin consultas repetitivas a Firebase para evitar bloqueos)
  const [email, setEmail] = useState("maikolecrisanto@gmail.com");
  const [estado, setEstado] = useState("Activo");
  const [registradoPor, setRegistradoPor] = useState("Dueño");
  const [fecha, setFecha] = useState("2026-11-15T15:30:59.562Z");
  const [token, setToken] = useState("token_1709317262827_692323");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setZoomLevel(getAppZoom());

      const handleZoomChange = (e: Event) => {
        const custom = e as CustomEvent<{ zoom: number }>;
        if (custom.detail && typeof custom.detail.zoom === "number") {
          setZoomLevel(custom.detail.zoom);
        } else {
          setZoomLevel(getAppZoom());
        }
      };

      window.addEventListener(ZOOM_EVENT_NAME, handleZoomChange);

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

      setNotiConfig(getFakeNotiConfig());

      return () => {
        window.removeEventListener(ZOOM_EVENT_NAME, handleZoomChange);
      };
    }
  }, []);

  const handleToggleRandomData = () => {
    setNotiConfig((prev) => {
      const next = { ...prev, randomDataEnabled: !prev.randomDataEnabled };
      saveFakeNotiConfig(next);
      return next;
    });
  };

  const handleToggleDarkMode = () => {
    setNotiConfig((prev) => {
      const next = { ...prev, darkModeEnabled: !prev.darkModeEnabled };
      saveFakeNotiConfig(next);
      return next;
    });
  };

  const handleAddSender = () => {
    const clean = newSenderInput.trim();
    if (!clean) return;
    if (notiConfig.customSenders.length >= 10) {
      showToast("Máximo 10 remitentes permitidos");
      return;
    }
    if (notiConfig.customSenders.some((n) => n.toLowerCase() === clean.toLowerCase())) {
      showToast("Ese remitente ya existe");
      return;
    }
    setNotiConfig((prev) => {
      const next = { ...prev, customSenders: [...prev.customSenders, clean] };
      saveFakeNotiConfig(next);
      return next;
    });
    setNewSenderInput("");
  };

  const handleRemoveSender = (nameToRemove: string) => {
    setNotiConfig((prev) => {
      const next = {
        ...prev,
        customSenders: prev.customSenders.filter((n) => n !== nameToRemove),
      };
      saveFakeNotiConfig(next);
      return next;
    });
  };

  const handleAmountTypeChange = (type: "range" | "fixed") => {
    setNotiConfig((prev) => {
      const next = { ...prev, amountType: type };
      saveFakeNotiConfig(next);
      return next;
    });
  };

  const handleMinChange = (val: string) => {
    const num = parseFloat(val) || 0;
    setNotiConfig((prev) => {
      const next = { ...prev, amountMin: num };
      saveFakeNotiConfig(next);
      return next;
    });
  };

  const handleMaxChange = (val: string) => {
    const num = parseFloat(val) || 0;
    setNotiConfig((prev) => {
      const next = { ...prev, amountMax: num };
      saveFakeNotiConfig(next);
      return next;
    });
  };

  const handleFixedAmountChange = (val: string) => {
    const num = parseFloat(val) || 0;
    setNotiConfig((prev) => {
      const next = { ...prev, fixedAmount: num };
      saveFakeNotiConfig(next);
      return next;
    });
  };

  const handleAumentarZoom = () => {
    const next = Math.min(MAX_ZOOM, zoomLevel + STEP_ZOOM);
    const applied = setAppZoom(next);
    setZoomLevel(applied);
  };

  const handleDisminuirZoom = () => {
    const next = Math.max(MIN_ZOOM, zoomLevel - STEP_ZOOM);
    const applied = setAppZoom(next);
    setZoomLevel(applied);
  };

  const handleRestablecerZoom = () => {
    const applied = setAppZoom(DEFAULT_ZOOM);
    setZoomLevel(applied);
    showToast("Zoom restablecido al 100%");
  };

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
          TOAST DE NOTIFICACIÓN (EN LA PARTE INFERIOR)
          ================================================== */}
      {toastMessage && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-[#111111]/90 text-white text-[13px] px-5 py-2.5 rounded-full shadow-2xl z-[99999] transition-all animate-fadeIn pointer-events-none whitespace-nowrap">
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
            if (currentView === "cuenta" || currentView === "noti") {
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
          {currentView === "cuenta"
            ? "Mi cuenta"
            : currentView === "noti"
            ? "Configurar notificación"
            : "Información de App"}
        </div>
        {currentView === "noti" ? (
          <button
            type="button"
            onClick={handleProbarNoti}
            className="bg-[#E8F8EE] text-[#00B14F] hover:bg-[#00B14F] hover:text-white px-2.5 py-1 rounded-[8px] text-[12px] font-extrabold transition active:scale-95 cursor-pointer border border-[#00B14F]/30 flex items-center gap-1 shadow-2xs"
            title="Probar notificación en Inicio"
          >
            <span>Probar</span>
          </button>
        ) : (
          <div className="w-8"></div>
        )}
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
              data-tour="sobre-micuenta-btn"
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
              data-tour="sobre-zoom-btn"
              onClick={() => setShowZoomModal(true)}
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
                <div className="flex items-center gap-2">
                  <span className="text-[15px] font-bold text-[#111111]">Zoom de la App</span>
                  <span className="text-[11px] font-extrabold text-[#00B14F] bg-[#E8F8EE] px-2 py-0.5 rounded-full">
                    {zoomLevel}%
                  </span>
                </div>
                <div className="text-[12px] text-[#777777] truncate">Ajustar tamaño visual de toda la app</div>
              </div>
              <div className="text-[#00B14F] text-[22px] font-extrabold ml-2 scale-y-125">›</div>
            </div>

            {/* BOTÓN 3: Administrar noti falsa */}
            <div
              data-tour="sobre-noti-btn"
              onClick={() => setCurrentView("noti")}
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
                <div className="text-[12px] text-[#777777] truncate">
                  {notiConfig.randomDataEnabled
                    ? "Datos aleatorios activos"
                    : `Personalizado (${notiConfig.customSenders.length} remitentes)`}
                </div>
              </div>
              <div className="text-[#00B14F] text-[22px] font-extrabold ml-2 scale-y-125">›</div>
            </div>

            {/* BOTÓN 4: Tutorial (Reanudar o Iniciar Tutorial) */}
            <div
              data-tour="sobre-tutorial-btn"
              onClick={() => {
                startTutorial();
                router.push("/inicio");
              }}
              className="bg-white rounded-[14px] p-4 flex items-center shadow-[0_2px_8px_rgba(0,0,0,0.03)] border border-[#f0f0f0] cursor-pointer active:bg-[#f5f7f9] transition"
            >
              <div className="w-10 h-10 rounded-full bg-[#E8F8EE] flex items-center justify-center mr-3.5 flex-shrink-0">
                <svg className="w-5 h-5 stroke-[#00B14F] stroke-2 fill-none stroke-linecap-round stroke-linejoin-round" viewBox="0 0 24 24">
                  <polygon points="5 3 19 12 5 21 5 3"></polygon>
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[15px] font-bold text-[#111111]">Tutorial</div>
                <div className="text-[12px] text-[#777777] truncate">Aprende a usar todas las funciones</div>
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

      {/* ==================================================
          CONTENIDO: VISTA CONFIGURAR NOTIFICACIÓN
          ================================================== */}
      {currentView === "noti" && (
        <div className="flex-1 overflow-y-auto no-scrollbar p-5 flex flex-col justify-between">
          <div className="flex flex-col gap-4">
            {/* Banner pequeño de Prueba Rápida */}
            <div className="bg-[#E8F8EE] border border-[#00B14F]/25 rounded-[14px] p-3 flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0 pr-2">
                <div className="w-7 h-7 rounded-full bg-[#00B14F] text-white flex items-center justify-center flex-shrink-0">
                  <svg className="w-3.5 h-3.5 stroke-white stroke-[2.5] fill-none" viewBox="0 0 24 24">
                    <polygon points="5 3 19 12 5 21 5 3"></polygon>
                  </svg>
                </div>
                <div className="min-w-0">
                  <div className="text-[12.5px] font-bold text-[#0D5B2C] truncate">¿Quieres ver cómo funciona?</div>
                  <div className="text-[11px] text-[#2E7D4E] truncate">Pruébalo en la pantalla de inicio</div>
                </div>
              </div>
              <button
                type="button"
                onClick={handleProbarNoti}
                className="bg-[#00B14F] hover:bg-[#009E43] text-white text-[12px] font-bold px-3 py-1.5 rounded-[8px] border-none cursor-pointer active:scale-95 transition shadow-2xs flex-shrink-0"
              >
                Probar
              </button>
            </div>

            {/* Switch 1: Notificaciones con datos randoms */}
            <div className="bg-white rounded-[16px] p-4 flex items-center justify-between shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-[#f0f0f0]">
              <div className="pr-3">
                <div className="text-[14.5px] font-bold text-[#111111]">
                  Notificaciones con datos randoms
                </div>
                <div className="text-[11.5px] text-[#777777] mt-0.5">
                  Nombres aleatorios y monto entre S/ 10 y S/ 500
                </div>
              </div>
              <div
                onClick={handleToggleRandomData}
                className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-200 ease-in-out flex-shrink-0 ${
                  notiConfig.randomDataEnabled ? "bg-[#00B14F]" : "bg-[#D1D5DB]"
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                    notiConfig.randomDataEnabled ? "translate-x-6" : "translate-x-0"
                  }`}
                />
              </div>
            </div>

            {/* Switch 2: Modo Oscuro (#202020) */}
            <div className="bg-white rounded-[16px] p-4 flex items-center justify-between shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-[#f0f0f0]">
              <div className="pr-3">
                <div className="text-[14.5px] font-bold text-[#111111]">
                  Modo Oscuro (#202020)
                </div>
                <div className="text-[11.5px] text-[#777777] mt-0.5">
                  Estilo oscuro para la notificación push simulada
                </div>
              </div>
              <div
                onClick={handleToggleDarkMode}
                className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-200 ease-in-out flex-shrink-0 ${
                  notiConfig.darkModeEnabled ? "bg-[#00B14F]" : "bg-[#D1D5DB]"
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                    notiConfig.darkModeEnabled ? "translate-x-6" : "translate-x-0"
                  }`}
                />
              </div>
            </div>

            {/* SI ESTÁ DESACTIVADO MODO RANDOM: Mostrar configuración personalizada */}
            {!notiConfig.randomDataEnabled && (
              <div className="bg-white rounded-[16px] p-4 shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-[#f0f0f0] flex flex-col gap-4">
                {/* 1. Remitentes Personalizados */}
                <div>
                  <div className="text-[14.5px] font-bold text-[#111111] mb-0.5">
                    Remitentes Personalizados
                  </div>
                  <div className="text-[11.5px] text-[#777777] mb-2.5">
                    Máximo 10 nombres. Solo 1 o 2 palabras (Ej: Juan Perez).
                  </div>

                  {/* Input + Añadir (Botón Verde perfectamente contenido) */}
                  <div className="flex items-center gap-2 mb-3 w-full">
                    <input
                      type="text"
                      value={newSenderInput}
                      onChange={(e) => setNewSenderInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleAddSender()}
                      placeholder="Ingresa un nombre"
                      maxLength={30}
                      className="flex-1 min-w-0 bg-[#FBFBFB] border border-[#E0E4E8] rounded-[10px] px-3.5 py-2.5 text-[14px] text-[#222222] focus:border-[#00B14F] focus:bg-white transition box-border"
                    />
                    <button
                      type="button"
                      onClick={handleAddSender}
                      className="bg-[#00B14F] hover:bg-[#009E43] text-white px-4 py-2.5 rounded-[10px] font-bold text-[13.5px] active:scale-95 transition cursor-pointer border-none shadow-xs flex-shrink-0 whitespace-nowrap"
                    >
                      Añadir
                    </button>
                  </div>

                  {/* Lista de Remitentes */}
                  {notiConfig.customSenders.length === 0 ? (
                    <div className="text-[12px] text-[#888888] italic py-1">
                      Sin remitentes registrados aún. Escribe un nombre y pulsa Añadir.
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {notiConfig.customSenders.map((s, idx) => (
                        <span
                          key={idx}
                          className="bg-[#F1F3F5] text-[#222222] text-[12px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5 border border-[#E5E7EB]"
                        >
                          <span>{s}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveSender(s)}
                            className="w-4 h-4 rounded-full bg-[#D1D5DB] text-[#444] hover:bg-[#EF4444] hover:text-white flex items-center justify-center text-[10px] font-bold transition border-none cursor-pointer"
                          >
                            ✕
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="text-[11px] text-[#888888] font-medium mt-1.5">
                    {notiConfig.customSenders.length}/10 remitentes registrados
                  </div>
                </div>

                <div className="w-full h-[1px] bg-[#F0F0F0]" />

                {/* 2. Configuración de Monto */}
                <div>
                  <div className="text-[14.5px] font-bold text-[#111111] mb-2">
                    Configuración de Monto
                  </div>

                  {/* Selector: Rango aleatorio vs Monto fijo */}
                  <select
                    value={notiConfig.amountType}
                    onChange={(e) => handleAmountTypeChange(e.target.value as "range" | "fixed")}
                    className="w-full bg-[#FBFBFB] border border-[#E0E4E8] rounded-[10px] p-3 text-[14px] text-[#222222] font-semibold mb-3 cursor-pointer focus:border-[#00B14F] focus:bg-white"
                  >
                    <option value="range">Rango de monto aleatorio</option>
                    <option value="fixed">Monto fijo</option>
                  </select>

                  {/* Inputs según el tipo seleccionado */}
                  {notiConfig.amountType === "range" ? (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11.5px] font-bold text-[#666666] block mb-1">
                          Mínimo (S/)
                        </label>
                        <input
                          type="number"
                          value={notiConfig.amountMin}
                          onChange={(e) => handleMinChange(e.target.value)}
                          className="w-full bg-[#FBFBFB] border border-[#E0E4E8] rounded-[10px] p-2.5 text-[14px] text-[#222222] font-semibold focus:border-[#00B14F] focus:bg-white"
                        />
                      </div>
                      <div>
                        <label className="text-[11.5px] font-bold text-[#666666] block mb-1">
                          Máximo (S/)
                        </label>
                        <input
                          type="number"
                          value={notiConfig.amountMax}
                          onChange={(e) => handleMaxChange(e.target.value)}
                          className="w-full bg-[#FBFBFB] border border-[#E0E4E8] rounded-[10px] p-2.5 text-[14px] text-[#222222] font-semibold focus:border-[#00B14F] focus:bg-white"
                        />
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label className="text-[11.5px] font-bold text-[#666666] block mb-1">
                        Monto fijo (S/)
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        value={notiConfig.fixedAmount}
                        onChange={(e) => handleFixedAmountChange(e.target.value)}
                        className="w-full bg-[#FBFBFB] border border-[#E0E4E8] rounded-[10px] p-2.5 text-[14px] text-[#222222] font-semibold focus:border-[#00B14F] focus:bg-white"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Botón Listo */}
          <button
            type="button"
            onClick={() => {
              setCurrentView("menu");
              showToast("Configuración de notificación guardada");
            }}
            className="w-full py-4 rounded-[12px] text-[16px] font-bold bg-[#00B14F] text-white active:bg-[#009e43] transition cursor-pointer border-none shadow-sm mt-5 mb-2"
          >
            Listo
          </button>
        </div>
      )}

      {/* ==================================================
          MODAL DE CONTROL DE ZOOM (MINIMALISTA Y PROFESIONAL)
          ================================================== */}
      {showZoomModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] w-full max-w-[340px] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.12)] border border-[#EAEAEA] flex flex-col items-center animate-slideUp">
            {/* Header del Modal */}
            <div className="w-full flex justify-between items-center mb-1">
              <span className="text-[17px] font-bold text-[#0F172A] tracking-tight">
                Zoom de la interfaz
              </span>
              <button
                type="button"
                onClick={() => setShowZoomModal(false)}
                className="w-7 h-7 rounded-full bg-[#F1F5F9] text-[#64748B] hover:text-[#0F172A] flex items-center justify-center text-[12px] font-bold active:scale-95 transition border-none cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-[12.5px] text-[#64748B] text-center mb-5 leading-relaxed">
              Ajusta la escala visual para toda la app
            </p>

            {/* Selector Central Minimalista con (-) y (+) */}
            <div className="flex items-center justify-between w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-[20px] p-2 mb-4">
              <button
                type="button"
                onClick={handleDisminuirZoom}
                disabled={zoomLevel <= MIN_ZOOM}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition cursor-pointer border ${
                  zoomLevel <= MIN_ZOOM
                    ? "bg-transparent border-transparent text-[#CBD5E1] cursor-not-allowed"
                    : "bg-white border-[#E2E8F0] text-[#0F172A] shadow-xs hover:border-[#CBD5E1] active:scale-90"
                }`}
                title="Reducir zoom"
              >
                <svg className="w-5 h-5 stroke-current stroke-2 fill-none" viewBox="0 0 24 24">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
              </button>

              <div className="flex flex-col items-center px-4">
                <span className="text-[32px] font-black text-[#0F172A] tracking-tight leading-none font-sans">
                  {zoomLevel}%
                </span>
                <span className="text-[10.5px] font-bold text-[#00B14F] tracking-wide mt-1">
                  {zoomLevel === DEFAULT_ZOOM
                    ? "100% Estándar"
                    : zoomLevel < DEFAULT_ZOOM
                    ? `Reducido (${zoomLevel}%)`
                    : `Ampliado (${zoomLevel}%)`}
                </span>
              </div>

              <button
                type="button"
                onClick={handleAumentarZoom}
                disabled={zoomLevel >= MAX_ZOOM}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition cursor-pointer border ${
                  zoomLevel >= MAX_ZOOM
                    ? "bg-transparent border-transparent text-[#CBD5E1] cursor-not-allowed"
                    : "bg-white border-[#E2E8F0] text-[#0F172A] shadow-xs hover:border-[#CBD5E1] active:scale-90"
                }`}
                title="Aumentar zoom"
              >
                <svg className="w-5 h-5 stroke-current stroke-2 fill-none" viewBox="0 0 24 24">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
              </button>
            </div>

            {/* Pills de Acceso Rápido Minimalistas */}
            <div className="flex justify-center items-center gap-1.5 mb-5 w-full">
              {[80, 90, 100, 110, 120].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => {
                    const applied = setAppZoom(preset);
                    setZoomLevel(applied);
                  }}
                  className={`flex-1 py-1.5 rounded-[8px] text-[11px] font-bold transition cursor-pointer border ${
                    zoomLevel === preset
                      ? "bg-[#00B14F] text-white border-[#00B14F] shadow-xs"
                      : "bg-white text-[#64748B] border-[#E2E8F0] hover:bg-[#F8FAFC]"
                  }`}
                >
                  {preset}%
                </button>
              ))}
            </div>

            {/* Botón Aplicar */}
            <button
              type="button"
              onClick={() => {
                setShowZoomModal(false);
                showToast(`Zoom fijado al ${zoomLevel}%`);
              }}
              className="w-full py-3.5 rounded-[14px] text-[15px] font-bold bg-[#00B14F] text-white hover:bg-[#009E43] active:scale-[0.99] transition cursor-pointer border-none shadow-sm"
            >
              Aplicar
            </button>

            {/* Botón Restablecer */}
            {zoomLevel !== DEFAULT_ZOOM && (
              <button
                type="button"
                onClick={handleRestablecerZoom}
                className="text-[12px] font-semibold text-[#64748B] hover:text-[#00B14F] transition mt-3 cursor-pointer bg-transparent border-none p-1"
              >
                Restablecer al 100%
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
