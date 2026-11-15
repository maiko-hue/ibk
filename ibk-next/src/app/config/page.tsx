"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface AccountData {
  name: string;
  curr: string;
  bal: string;
  num: string;
  cci: string;
}

const formatGroupsOf4 = (val: string) => {
  const digits = val.replace(/\D/g, "");
  if (!digits) return "";
  const parts = digits.match(/.{1,4}/g);
  return parts ? parts.join(" ") : digits;
};

const DEFAULTS = {
  name: "Usuario",
  acc1: {
    name: "Cuenta Simple Soles",
    curr: "S/",
    bal: "1000.00",
    num: "1912 0589 5108 88",
    cci: "0021 9100 2058 9510 8812",
  },
  acc2: {
    name: "Cuenta Simple Dolares",
    curr: "US$",
    bal: "1000.00",
    num: "1912 0589 5662 25",
    cci: "0021 9100 2058 9566 2515",
  },
  acc3: {
    name: "Cuenta de Ahorros",
    curr: "S/",
    bal: "1000.00",
    num: "1911 1111 1111 11",
    cci: "0021 9111 1111 1100 0000",
  },
};

export default function ConfigPage() {
  const router = useRouter();

  // Vista activa: "config" | "contactos" | "settings" | "pin"
  const [currentView, setCurrentView] = useState<"config" | "contactos" | "settings" | "pin">("config");

  // Usuario y Cuentas
  const [userName, setUserName] = useState(DEFAULTS.name);
  const [acc1, setAcc1] = useState<AccountData>(DEFAULTS.acc1);
  const [acc2, setAcc2] = useState<AccountData>(DEFAULTS.acc2);
  const [acc3, setAcc3] = useState<AccountData>(DEFAULTS.acc3);

  // Bot Titulares
  const [isBotActive, setIsBotActive] = useState(false);

  // Contactos
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");

  // PIN
  const [hasCustomPin, setHasCustomPin] = useState(false);
  const [pinStep, setPinStep] = useState<"new" | "confirm">("new");
  const [tempPin, setTempPin] = useState("");
  const [inputPinValue, setInputPinValue] = useState("");

  // Modales
  const [modalLogout, setModalLogout] = useState(false);
  const [modalBorrar, setModalBorrar] = useState(false);
  const [modalActualizando, setModalActualizando] = useState(false);
  const [modalConfirmPin, setModalConfirmPin] = useState(false);
  const [modalInputPin, setModalInputPin] = useState(false);
  const [modalExitoPin, setModalExitoPin] = useState(false);
  const [modalBorrarPin, setModalBorrarPin] = useState(false);
  const [alerta, setAlerta] = useState<{ open: boolean; title: string; message: string; isError: boolean }>({
    open: false,
    title: "Aviso",
    message: "",
    isError: true,
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedName = localStorage.getItem("ibk_user_name") || DEFAULTS.name;
      setUserName(savedName);

      setAcc1({
        name: localStorage.getItem("ibk_acc1_name") || DEFAULTS.acc1.name,
        curr: localStorage.getItem("ibk_acc1_curr") || DEFAULTS.acc1.curr,
        bal: localStorage.getItem("ibk_acc1_bal") || DEFAULTS.acc1.bal,
        num: formatGroupsOf4(localStorage.getItem("ibk_acc1_num") || DEFAULTS.acc1.num),
        cci: formatGroupsOf4(localStorage.getItem("ibk_acc1_cci") || DEFAULTS.acc1.cci),
      });

      setAcc2({
        name: localStorage.getItem("ibk_acc2_name") || DEFAULTS.acc2.name,
        curr: localStorage.getItem("ibk_acc2_curr") || DEFAULTS.acc2.curr,
        bal: localStorage.getItem("ibk_acc2_bal") || DEFAULTS.acc2.bal,
        num: formatGroupsOf4(localStorage.getItem("ibk_acc2_num") || DEFAULTS.acc2.num),
        cci: formatGroupsOf4(localStorage.getItem("ibk_acc2_cci") || DEFAULTS.acc2.cci),
      });

      setAcc3({
        name: localStorage.getItem("ibk_acc3_name") || DEFAULTS.acc3.name,
        curr: localStorage.getItem("ibk_acc3_curr") || DEFAULTS.acc3.curr,
        bal: localStorage.getItem("ibk_acc3_bal") || DEFAULTS.acc3.bal,
        num: formatGroupsOf4(localStorage.getItem("ibk_acc3_num") || DEFAULTS.acc3.num),
        cci: formatGroupsOf4(localStorage.getItem("ibk_acc3_cci") || DEFAULTS.acc3.cci),
      });

      setIsBotActive(localStorage.getItem("ibk_bot_telegram_activo") === "true");
      setHasCustomPin(!!localStorage.getItem("ibk_custom_pin"));
    }
  }, []);

  const showAlert = (title: string, message: string, isError = true) => {
    setAlerta({ open: true, title, message, isError });
  };

  const handleToggleBot = () => {
    const nextState = !isBotActive;
    setIsBotActive(nextState);
    if (typeof window !== "undefined") {
      localStorage.setItem("ibk_bot_telegram_activo", String(nextState));
    }
  };

  const handleForzarActualizacion = () => {
    setModalActualizando(true);
    setTimeout(() => {
      if (typeof window !== "undefined") {
        window.location.reload();
      }
    }, 1200);
  };

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("sesion_iniciada");
      localStorage.removeItem("sesion_token_ibk");
      router.replace("/");
    }
  };

  const handleEjecutarBorradoMovimientos = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("ibk_movimientos");
      setModalBorrar(false);
      showAlert("Movimientos borrados", "El historial de transferencias se ha restablecido.", false);
    }
  };

  const formatAccountInput = (val: string) => {
    const digits = val.replace(/\D/g, "");
    if (digits.length > 0) {
      const parts = digits.match(/.{1,4}/g);
      return parts ? parts.join(" ") : digits;
    }
    return "";
  };

  const formatAtmInput = (val: string) => {
    const digits = val.replace(/\D/g, "");
    if (digits === "") return "0.00";
    const num = parseInt(digits, 10);
    return (num / 100).toFixed(2);
  };

  const handleGuardarConfiguracionGlobal = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("ibk_user_name", userName);

      localStorage.setItem("ibk_acc1_name", acc1.name);
      localStorage.setItem("ibk_acc1_curr", acc1.curr);
      localStorage.setItem("ibk_acc1_bal", acc1.bal);
      localStorage.setItem("ibk_acc1_num", acc1.num);
      localStorage.setItem("ibk_acc1_cci", acc1.cci);

      localStorage.setItem("ibk_acc2_name", acc2.name);
      localStorage.setItem("ibk_acc2_curr", acc2.curr);
      localStorage.setItem("ibk_acc2_bal", acc2.bal);
      localStorage.setItem("ibk_acc2_num", acc2.num);
      localStorage.setItem("ibk_acc2_cci", acc2.cci);

      localStorage.setItem("ibk_acc3_name", acc3.name);
      localStorage.setItem("ibk_acc3_curr", acc3.curr);
      localStorage.setItem("ibk_acc3_bal", acc3.bal);
      localStorage.setItem("ibk_acc3_num", acc3.num);
      localStorage.setItem("ibk_acc3_cci", acc3.cci);

      showAlert("¡Éxito!", "Configuración guardada correctamente.", false);
      setCurrentView("config");
    }
  };

  const handleGuardarContacto = () => {
    if (!contactName.trim() || !contactPhone.trim()) {
      showAlert("Campos vacíos", "Completa el titular y el número de celular.", true);
      return;
    }
    if (typeof window !== "undefined") {
      const saved = JSON.parse(localStorage.getItem("ibk_contactos") || "[]");
      saved.push({ name: contactName.trim(), phone: contactPhone.trim() });
      localStorage.setItem("ibk_contactos", JSON.stringify(saved));
      setContactName("");
      setContactPhone("");
      showAlert("Contacto guardado", "El contacto fue agregado correctamente.", false);
    }
  };

  const handleIniciarCreacionPin = () => {
    setModalConfirmPin(false);
    setPinStep("new");
    setInputPinValue("");
    setModalInputPin(true);
  };

  const handleProcesarPinPaso = () => {
    if (inputPinValue.length !== 6) return;

    if (pinStep === "new") {
      setTempPin(inputPinValue);
      setPinStep("confirm");
      setInputPinValue("");
    } else {
      if (inputPinValue === tempPin) {
        if (typeof window !== "undefined") {
          localStorage.setItem("ibk_custom_pin", inputPinValue);
          setHasCustomPin(true);
        }
        setModalInputPin(false);
        setModalExitoPin(true);
      } else {
        setModalInputPin(false);
        showAlert("PIN incorrecto", "Los 6 dígitos ingresados no coinciden. Inténtalo de nuevo.", true);
      }
    }
  };

  const handleBorrarPin = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("ibk_custom_pin");
      setHasCustomPin(false);
      setModalBorrarPin(false);
      showAlert("PIN eliminado", "Se eliminó el PIN de seguridad.", false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#f2f4f7] text-[#333333] select-none overflow-x-hidden font-sans">
      {/* ==================================================
          FONDO VERDE CURVO EXACTO (ibk/config.html)
          ================================================== */}
      <div
        className="fixed top-0 left-0 right-0 max-w-[480px] mx-auto h-[210px] bg-[#04B84D] z-[1] pointer-events-none"
        style={{ borderBottomLeftRadius: "35px", borderBottomRightRadius: "35px" }}
      />

      <div className="relative z-[2] min-h-screen flex flex-col">
        {/* ==================================================
            VISTA 1: MENÚ DE CONFIGURACIÓN
            ================================================== */}
        {currentView === "config" && (
          <div className="flex-1 flex flex-col">
            <header className="flex justify-between items-center px-4 pt-3.5 pb-1 bg-transparent flex-shrink-0 z-[100]">
              <Link
                href="/inicio"
                className="bg-white/20 border-none cursor-pointer flex items-center justify-center p-1.5 rounded-full w-[34px] h-[34px] active:scale-90 transition"
              >
                <svg className="w-5 h-5 stroke-white stroke-[2.5] stroke-linecap-round stroke-linejoin-round fill-none" viewBox="0 0 24 24">
                  <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
              </Link>
              <div className="w-[34px]"></div>
            </header>

            {/* Logo de la app centrado arriba del contenedor blanco */}
            <div className="flex justify-center items-center -mt-6 mb-3 z-[10]">
              <img
                src="/img/secondlogo.png"
                alt="Logo de la app"
                className="w-[70px] h-[70px] object-contain drop-shadow-sm pointer-events-none"
              />
            </div>

            <div className="bg-white rounded-[20px] mx-[15px] mb-[90px] shadow-[0_4px_15px_rgba(0,0,0,0.06)] pb-5 overflow-hidden">
              {/* Sección Perfil */}
              <div
                onClick={() => setCurrentView("settings")}
                className="flex items-center px-4 py-4 cursor-pointer active:bg-gray-50 transition border-b border-[#f5f5f5]"
              >
                <div className="w-[50px] h-[50px] rounded-full bg-[#dbeaff] text-[#0039a6] text-[24px] font-bold flex justify-center items-center mr-3 flex-shrink-0">
                  {userName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[17px] font-bold text-black mb-0.5 truncate">{userName}</div>
                  <div className="text-[12px] text-[#888888] flex items-center gap-1 whitespace-nowrap">
                    Editar tus datos <span>&rarr;</span>
                  </div>
                </div>
              </div>

              {/* Lista de Opciones (Mismos SVG e Iconos de config.html) */}
              <div className="px-4 pt-3 flex flex-col gap-2.5">
                {/* 1. Grupo Oficial (Telegram) */}
                <a
                  href="https://t.me/appsreborn"
                  target="_blank"
                  rel="noreferrer"
                  className="bg-white rounded-[10px] py-3 px-3.5 flex items-center shadow-[0_2px_8px_rgba(0,0,0,0.03)] border border-[#f0f0f0] cursor-pointer no-underline text-black active:bg-[#f9f9f9]"
                >
                  <svg className="w-5 h-5 mr-3 stroke-[#00b551] stroke-2 fill-none stroke-linecap-round stroke-linejoin-round flex-shrink-0" viewBox="0 0 24 24">
                    <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"></path>
                  </svg>
                  <div className="flex-1 text-[13px] text-black font-semibold whitespace-nowrap overflow-hidden text-ellipsis">Grupo oficial</div>
                  <div className="text-[#00b551] text-[18px] font-bold ml-2">›</div>
                </a>

                {/* 2. Actualizar APP */}
                <div
                  onClick={handleForzarActualizacion}
                  className="bg-white rounded-[10px] py-3 px-3.5 flex items-center shadow-[0_2px_8px_rgba(0,0,0,0.03)] border border-[#f0f0f0] cursor-pointer active:bg-[#f9f9f9]"
                >
                  <svg className="w-5 h-5 mr-3 stroke-[#00b551] stroke-2 fill-none stroke-linecap-round stroke-linejoin-round flex-shrink-0" viewBox="0 0 24 24">
                    <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.59-9.21l-3.23 3.06"></path>
                  </svg>
                  <div className="flex-1 text-[13px] text-black font-semibold whitespace-nowrap overflow-hidden text-ellipsis">Actualizar APP</div>
                  <div className="text-[#00b551] text-[18px] font-bold ml-2">›</div>
                </div>

                {/* 3. Mis Contactos */}
                <div
                  onClick={() => setCurrentView("contactos")}
                  className="bg-white rounded-[10px] py-3 px-3.5 flex items-center shadow-[0_2px_8px_rgba(0,0,0,0.03)] border border-[#f0f0f0] cursor-pointer active:bg-[#f9f9f9]"
                >
                  <svg className="w-5 h-5 mr-3 stroke-[#00b551] stroke-2 fill-none stroke-linecap-round stroke-linejoin-round flex-shrink-0" viewBox="0 0 24 24">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  </svg>
                  <div className="flex-1 text-[13px] text-black font-semibold whitespace-nowrap overflow-hidden text-ellipsis">Mis contactos</div>
                  <div className="text-[#00b551] text-[18px] font-bold ml-2">›</div>
                </div>

                {/* 4. Definir PIN con badge NUEVO */}
                <div
                  onClick={() => setCurrentView("pin")}
                  className="relative bg-white rounded-[10px] py-3 px-3.5 flex items-center shadow-[0_2px_8px_rgba(0,0,0,0.03)] border border-[#f0f0f0] cursor-pointer active:bg-[#f9f9f9]"
                >
                  <div className="absolute -top-2 -right-1 bg-[#d32f2f] text-white text-[9px] font-extrabold px-1.5 py-[2px] rounded-[8px] border-2 border-white z-[2]">
                    NUEVO
                  </div>
                  <svg className="w-5 h-5 mr-3 stroke-[#00b551] stroke-2 fill-none stroke-linecap-round stroke-linejoin-round flex-shrink-0" viewBox="0 0 24 24">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                  <div className="flex-1 text-[13px] text-black font-semibold whitespace-nowrap overflow-hidden text-ellipsis">Definir PIN</div>
                  <div className="text-[#00b551] text-[18px] font-bold ml-2">›</div>
                </div>

                {/* 5. Accesibilidad */}
                <Link
                  href="/sobre"
                  className="bg-white rounded-[10px] py-3 px-3.5 flex items-center shadow-[0_2px_8px_rgba(0,0,0,0.03)] border border-[#f0f0f0] cursor-pointer no-underline text-black active:bg-[#f9f9f9]"
                >
                  <svg className="w-5 h-5 mr-3 stroke-[#00b551] stroke-2 fill-none stroke-linecap-round stroke-linejoin-round flex-shrink-0" viewBox="0 0 24 24">
                    <circle cx="12" cy="7" r="4"></circle>
                    <path d="M5.5 21v-2a6.5 6.5 0 0 1 13 0v2"></path>
                  </svg>
                  <div className="flex-1 text-[13px] text-black font-semibold whitespace-nowrap overflow-hidden text-ellipsis">Accesibilidad</div>
                  <div className="text-[#00b551] text-[18px] font-bold ml-2">›</div>
                </Link>

                {/* 6. Búsqueda Titulares con Switch exacto */}
                <div
                  onClick={handleToggleBot}
                  className="bg-white rounded-[10px] py-3 px-3.5 flex items-center shadow-[0_2px_8px_rgba(0,0,0,0.03)] border border-[#f0f0f0] cursor-pointer active:bg-[#f9f9f9]"
                >
                  <svg className="w-5 h-5 mr-3 stroke-[#00b551] stroke-2 fill-none stroke-linecap-round stroke-linejoin-round flex-shrink-0" viewBox="0 0 24 24">
                    <rect x="3" y="11" width="18" height="10" rx="2"></rect>
                    <path d="M12 11V7"></path>
                    <circle cx="12" cy="5" r="2"></circle>
                    <line x1="9" y1="15" x2="10" y2="15"></line>
                    <line x1="14" y1="15" x2="15" y2="15"></line>
                  </svg>
                  <div className="flex-1 text-[13px] text-black font-semibold whitespace-nowrap mr-2">
                    Búsqueda Titulares
                  </div>
                  <div className={`text-[11px] mr-2 whitespace-nowrap font-medium transition-colors ${isBotActive ? "text-[#00b551] font-bold" : "text-[#888888]"}`}>
                    {isBotActive ? "Activado" : "Desactivado"}
                  </div>
                  <div className={`w-[38px] h-[22px] rounded-[20px] relative transition-colors duration-300 flex-shrink-0 ${isBotActive ? "bg-[#00b551]" : "bg-[#e0e0e0]"}`}>
                    <div className={`w-[16px] h-[16px] bg-white rounded-full absolute top-[3px] transition-all duration-300 shadow-[0_2px_4px_rgba(0,0,0,0.2)] ${isBotActive ? "left-[19px]" : "left-[3px]"}`} />
                  </div>
                </div>

                {/* 7. Configuración de Cuentas */}
                <div
                  onClick={() => setCurrentView("settings")}
                  className="bg-white rounded-[10px] py-3 px-3.5 flex items-center shadow-[0_2px_8px_rgba(0,0,0,0.03)] border border-[#f0f0f0] cursor-pointer active:bg-[#f9f9f9]"
                >
                  <svg className="w-5 h-5 mr-3 stroke-[#00b551] stroke-2 fill-none stroke-linecap-round stroke-linejoin-round flex-shrink-0" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="3"></circle>
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                  </svg>
                  <div className="flex-1 text-[13px] text-black font-semibold whitespace-nowrap overflow-hidden text-ellipsis">Configuración</div>
                  <div className="text-[#00b551] text-[18px] font-bold ml-2">›</div>
                </div>

                {/* 8. Borrar Movimientos */}
                <div
                  onClick={() => setModalBorrar(true)}
                  className="bg-white rounded-[10px] py-3 px-3.5 flex items-center shadow-[0_2px_8px_rgba(0,0,0,0.03)] border border-[#f0f0f0] cursor-pointer active:bg-[#f9f9f9]"
                >
                  <svg className="w-5 h-5 mr-3 stroke-[#00b551] stroke-2 fill-none stroke-linecap-round stroke-linejoin-round flex-shrink-0" viewBox="0 0 24 24">
                    <path d="M3 6h18"></path>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                  <div className="flex-1 text-[13px] text-black font-semibold whitespace-nowrap overflow-hidden text-ellipsis">Borrar movimientos</div>
                </div>

                {/* 9. Cerrar Sesión */}
                <div
                  onClick={() => setModalLogout(true)}
                  className="bg-white rounded-[10px] py-3 px-3.5 flex items-center shadow-[0_2px_8px_rgba(0,0,0,0.03)] border border-[#f0f0f0] cursor-pointer active:bg-[#f9f9f9]"
                >
                  <svg className="w-5 h-5 mr-3 stroke-[#00b551] stroke-2 fill-none stroke-linecap-round stroke-linejoin-round flex-shrink-0" viewBox="0 0 24 24">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                    <polyline points="16 17 21 12 16 7"></polyline>
                    <line x1="21" y1="12" x2="9" y2="12"></line>
                  </svg>
                  <div className="flex-1 text-[13px] text-black font-semibold whitespace-nowrap overflow-hidden text-ellipsis">Cerrar Sesión</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================
            VISTA PIN (EXACTA A INICIO CON FONDOPIN.WEBP)
            ================================================== */}
        {currentView === "pin" && (
          <div className="relative min-h-screen bg-white flex flex-col">
            <div
              className="absolute top-0 left-0 w-full h-[45vh] bg-cover bg-bottom z-[1]"
              style={{ backgroundImage: "url('/img/fondopin.webp')" }}
            />
            <div className="absolute top-0 left-0 w-full p-[15px_20px] flex items-center z-[2]">
              <button
                type="button"
                onClick={() => setCurrentView("config")}
                className="bg-transparent border-none cursor-pointer p-1.5 flex items-center justify-center"
              >
                <svg className="w-5 h-5 stroke-white stroke-[2.5] stroke-linecap-round stroke-linejoin-round fill-none" viewBox="0 0 24 24">
                  <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
              </button>
              <div className="text-white text-[18px] font-bold ml-[15px]">Cambiar PIN</div>
            </div>

            <div className="absolute top-[45vh] left-0 w-full p-[30px_20px] flex flex-col gap-[15px] z-[2]">
              <button
                type="button"
                onClick={() => setModalConfirmPin(true)}
                className="w-full bg-[#00b551] text-white border-none p-4 rounded-[12px] text-[16px] font-bold cursor-pointer active:bg-[#009e47] transition"
              >
                Cambiar contraseña
              </button>

              {hasCustomPin && (
                <button
                  type="button"
                  onClick={() => setModalBorrarPin(true)}
                  className="w-full bg-white text-[#d32f2f] border-2 border-[#d32f2f] p-4 rounded-[12px] text-[16px] font-bold cursor-pointer active:bg-[#ffebee] transition"
                >
                  Borrar PIN definido
                </button>
              )}

              <Link
                href="/inicio"
                className="w-full bg-transparent text-[#0039a6] text-[15px] p-3 text-center underline font-medium"
              >
                Ir al inicio
              </Link>
            </div>
          </div>
        )}

        {/* ==================================================
            VISTA CONTACTOS
            ================================================== */}
        {currentView === "contactos" && (
          <div className="flex-1 flex flex-col">
            <header className="flex justify-between items-center px-5 py-3.5 bg-transparent flex-shrink-0 z-[100]">
              <button
                type="button"
                onClick={() => setCurrentView("config")}
                className="bg-white/20 border-none cursor-pointer flex items-center justify-center p-1.5 rounded-full w-[34px] h-[34px]"
              >
                <svg className="w-5 h-5 stroke-white stroke-[2.5] stroke-linecap-round stroke-linejoin-round fill-none" viewBox="0 0 24 24">
                  <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
              </button>
              <div className="text-[18px] font-bold text-white flex-grow text-center">Mis contactos</div>
              <div className="w-[34px]"></div>
            </header>

            <div className="bg-white rounded-[20px] mx-[15px] mt-3.5 mb-[90px] shadow-[0_4px_15px_rgba(0,0,0,0.06)] p-5">
              <div className="flex gap-2.5 mb-[15px]">
                <input
                  type="text"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="Titular"
                  className="flex-1 p-[14px_15px] border border-[#e0e0e0] rounded-[8px] text-[15px] text-[#333] outline-none"
                />
                <button
                  type="button"
                  className="w-[48px] h-[48px] bg-[#f5f6f8] border border-[#e0e0e0] rounded-[8px] flex justify-center items-center flex-shrink-0 cursor-pointer"
                >
                  <svg className="w-5 h-5 stroke-[#666] stroke-2 fill-none stroke-linecap-round stroke-linejoin-round" viewBox="0 0 24 24">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                    <circle cx="12" cy="13" r="4"></circle>
                  </svg>
                </button>
              </div>

              <div className="mb-[15px]">
                <input
                  type="tel"
                  maxLength={9}
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value.replace(/[^0-9]/g, ""))}
                  placeholder="Celular"
                  className="w-full p-[14px_15px] border border-[#e0e0e0] rounded-[8px] text-[15px] text-[#333] outline-none"
                />
              </div>

              <button
                type="button"
                onClick={handleGuardarContacto}
                className="w-full bg-[#00b551] text-white border-none p-[15px] rounded-[8px] text-[16px] font-bold cursor-pointer mb-5 active:bg-[#009e47] transition"
              >
                Guardar
              </button>

              <div className="bg-[#f0f7ff] rounded-[8px] p-[15px] flex items-start gap-3">
                <svg className="w-5 h-5 stroke-[#0039a6] stroke-2 fill-none flex-shrink-0 mt-0.5" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="16" x2="12" y2="12"></line>
                  <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
                <div className="text-[13px] text-[#0039a6] leading-snug">
                  <p className="mb-2">Los números que registres formarán parte del autocompletado.</p>
                  <p className="font-bold text-[#00b551]">Recuerda que todas las apps de @appsreborn comparten la misma base de datos.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================
            VISTA CONFIGURACIÓN MAESTRA (CUENTAS)
            ================================================== */}
        {currentView === "settings" && (
          <div className="flex-1 flex flex-col">
            <header className="flex justify-between items-center px-5 py-3.5 bg-transparent flex-shrink-0 z-[100]">
              <button
                type="button"
                onClick={() => setCurrentView("config")}
                className="bg-white/20 border-none cursor-pointer flex items-center justify-center p-1.5 rounded-full w-[34px] h-[34px]"
              >
                <svg className="w-5 h-5 stroke-white stroke-[2.5] stroke-linecap-round stroke-linejoin-round fill-none" viewBox="0 0 24 24">
                  <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
              </button>
              <div className="text-[18px] font-bold text-white flex-grow text-center">Configuración</div>
              <div className="w-[34px]"></div>
            </header>

            <div className="bg-white rounded-[20px] mx-[15px] mt-3.5 mb-[90px] shadow-[0_4px_15px_rgba(0,0,0,0.06)] p-4 sm:p-5">
              <div className="text-[12px] font-extrabold text-[#00b551] uppercase mb-2 tracking-[0.5px]">
                Perfil de Usuario
              </div>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Nombre completo"
                className="w-full py-2.5 px-3 border-[1.5px] border-[#eef0f5] rounded-[10px] text-[13px] text-[#333] font-medium outline-none bg-[#fafbfc] mb-3 focus:border-[#00b551] focus:bg-white"
              />

              <div className="text-[12px] font-extrabold text-[#00b551] uppercase mb-2 mt-4 tracking-[0.5px]">
                Edición de Cuentas
              </div>

              {/* Cuenta 1 */}
              <div className="bg-white border border-[#eef0f5] rounded-[12px] p-3.5 mb-4 shadow-[0_4px_10px_rgba(0,0,0,0.02)]">
                <div className="text-[13px] font-extrabold text-[#0039a6] mb-2.5">Cuenta 1 (Soles)</div>
                <input
                  type="text"
                  value={acc1.name}
                  onChange={(e) => setAcc1({ ...acc1, name: e.target.value })}
                  placeholder="Nombre de la cuenta"
                  className="w-full py-2.5 px-3 border-[1.5px] border-[#eef0f5] rounded-[10px] text-[13px] text-[#333] font-medium outline-none bg-[#fafbfc] mb-2.5 focus:border-[#00b551] focus:bg-white"
                />
                <div className="flex gap-2.5 mb-2.5 w-full">
                  <div className="w-[36%] py-2.5 px-1 border-[1.5px] border-[#eef0f5] rounded-[10px] text-[12px] text-[#666] font-bold bg-[#f5f6f8] flex items-center justify-center whitespace-nowrap pointer-events-none">
                    {acc1.curr === "S/" ? "Soles (S/)" : "Dólares (US$)"}
                  </div>
                  <input
                    type="tel"
                    inputMode="numeric"
                    value={acc1.bal}
                    onChange={(e) => setAcc1({ ...acc1, bal: formatAtmInput(e.target.value) })}
                    placeholder="0.00"
                    className="w-[64%] py-2.5 px-3 border-[1.5px] border-[#eef0f5] rounded-[10px] text-[14px] text-[#0039a6] font-bold outline-none bg-[#fafbfc] focus:border-[#00b551] focus:bg-white"
                  />
                </div>
                <input
                  type="tel"
                  inputMode="numeric"
                  value={acc1.num}
                  onChange={(e) => setAcc1({ ...acc1, num: formatGroupsOf4(e.target.value) })}
                  placeholder="Número de cuenta"
                  className="w-full py-2.5 px-3 border-[1.5px] border-[#eef0f5] rounded-[10px] text-[13px] text-[#333] font-medium outline-none bg-[#fafbfc] mb-2.5 focus:border-[#00b551] focus:bg-white"
                />
                <input
                  type="tel"
                  inputMode="numeric"
                  value={acc1.cci}
                  onChange={(e) => setAcc1({ ...acc1, cci: formatGroupsOf4(e.target.value) })}
                  placeholder="CCI"
                  className="w-full py-2.5 px-3 border-[1.5px] border-[#eef0f5] rounded-[10px] text-[13px] text-[#333] font-medium outline-none bg-[#fafbfc] focus:border-[#00b551] focus:bg-white"
                />
              </div>

              {/* Cuenta 2 */}
              <div className="bg-white border border-[#eef0f5] rounded-[12px] p-3.5 mb-4 shadow-[0_4px_10px_rgba(0,0,0,0.02)]">
                <div className="text-[13px] font-extrabold text-[#0039a6] mb-2.5">Cuenta 2 (Dólares)</div>
                <input
                  type="text"
                  value={acc2.name}
                  onChange={(e) => setAcc2({ ...acc2, name: e.target.value })}
                  placeholder="Nombre de la cuenta"
                  className="w-full py-2.5 px-3 border-[1.5px] border-[#eef0f5] rounded-[10px] text-[13px] text-[#333] font-medium outline-none bg-[#fafbfc] mb-2.5 focus:border-[#00b551] focus:bg-white"
                />
                <div className="flex gap-2.5 mb-2.5 w-full">
                  <div className="w-[36%] py-2.5 px-1 border-[1.5px] border-[#eef0f5] rounded-[10px] text-[12px] text-[#666] font-bold bg-[#f5f6f8] flex items-center justify-center whitespace-nowrap pointer-events-none">
                    {acc2.curr === "US$" ? "Dólares (US$)" : "Soles (S/)"}
                  </div>
                  <input
                    type="tel"
                    inputMode="numeric"
                    value={acc2.bal}
                    onChange={(e) => setAcc2({ ...acc2, bal: formatAtmInput(e.target.value) })}
                    placeholder="0.00"
                    className="w-[64%] py-2.5 px-3 border-[1.5px] border-[#eef0f5] rounded-[10px] text-[14px] text-[#0039a6] font-bold outline-none bg-[#fafbfc] focus:border-[#00b551] focus:bg-white"
                  />
                </div>
                <input
                  type="tel"
                  inputMode="numeric"
                  value={acc2.num}
                  onChange={(e) => setAcc2({ ...acc2, num: formatGroupsOf4(e.target.value) })}
                  placeholder="Número de cuenta"
                  className="w-full py-2.5 px-3 border-[1.5px] border-[#eef0f5] rounded-[10px] text-[13px] text-[#333] font-medium outline-none bg-[#fafbfc] mb-2.5 focus:border-[#00b551] focus:bg-white"
                />
                <input
                  type="tel"
                  inputMode="numeric"
                  value={acc2.cci}
                  onChange={(e) => setAcc2({ ...acc2, cci: formatGroupsOf4(e.target.value) })}
                  placeholder="CCI"
                  className="w-full py-2.5 px-3 border-[1.5px] border-[#eef0f5] rounded-[10px] text-[13px] text-[#333] font-medium outline-none bg-[#fafbfc] focus:border-[#00b551] focus:bg-white"
                />
              </div>

              {/* Cuenta 3 */}
              <div className="bg-white border border-[#eef0f5] rounded-[12px] p-3.5 mb-4 shadow-[0_4px_10px_rgba(0,0,0,0.02)]">
                <div className="text-[13px] font-extrabold text-[#0039a6] mb-2.5">Cuenta 3 (Soles)</div>
                <input
                  type="text"
                  value={acc3.name}
                  onChange={(e) => setAcc3({ ...acc3, name: e.target.value })}
                  placeholder="Nombre de la cuenta"
                  className="w-full py-2.5 px-3 border-[1.5px] border-[#eef0f5] rounded-[10px] text-[13px] text-[#333] font-medium outline-none bg-[#fafbfc] mb-2.5 focus:border-[#00b551] focus:bg-white"
                />
                <div className="flex gap-2.5 mb-2.5 w-full">
                  <div className="w-[36%] py-2.5 px-1 border-[1.5px] border-[#eef0f5] rounded-[10px] text-[12px] text-[#666] font-bold bg-[#f5f6f8] flex items-center justify-center whitespace-nowrap pointer-events-none">
                    {acc3.curr === "S/" ? "Soles (S/)" : "Dólares (US$)"}
                  </div>
                  <input
                    type="tel"
                    inputMode="numeric"
                    value={acc3.bal}
                    onChange={(e) => setAcc3({ ...acc3, bal: formatAtmInput(e.target.value) })}
                    placeholder="0.00"
                    className="w-[64%] py-2.5 px-3 border-[1.5px] border-[#eef0f5] rounded-[10px] text-[14px] text-[#0039a6] font-bold outline-none bg-[#fafbfc] focus:border-[#00b551] focus:bg-white"
                  />
                </div>
                <input
                  type="tel"
                  inputMode="numeric"
                  value={acc3.num}
                  onChange={(e) => setAcc3({ ...acc3, num: formatGroupsOf4(e.target.value) })}
                  placeholder="Número de cuenta"
                  className="w-full py-2.5 px-3 border-[1.5px] border-[#eef0f5] rounded-[10px] text-[13px] text-[#333] font-medium outline-none bg-[#fafbfc] mb-2.5 focus:border-[#00b551] focus:bg-white"
                />
                <input
                  type="tel"
                  inputMode="numeric"
                  value={acc3.cci}
                  onChange={(e) => setAcc3({ ...acc3, cci: formatGroupsOf4(e.target.value) })}
                  placeholder="CCI"
                  className="w-full py-2.5 px-3 border-[1.5px] border-[#eef0f5] rounded-[10px] text-[13px] text-[#333] font-medium outline-none bg-[#fafbfc] focus:border-[#00b551] focus:bg-white"
                />
              </div>

              <button
                type="button"
                onClick={handleGuardarConfiguracionGlobal}
                className="w-full bg-[#00b551] text-white border-none py-3.5 rounded-[10px] text-[14px] font-bold cursor-pointer active:bg-[#009e47] transition mt-2"
              >
                Guardar Cambios
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ==================================================
          MODALES EXACTOS A CONFIG.HTML
          ================================================== */}

      {/* Modal Cerrar Sesión */}
      {modalLogout && (
        <div className="fixed inset-0 bg-black/60 z-[1000] flex justify-center items-center p-[30px] backdrop-blur-[2px]">
          <div className="bg-white rounded-[16px] p-[25px] w-full max-w-[320px] text-center shadow-[0_10px_25px_rgba(0,0,0,0.2)] animate-slideUp">
            <div className="text-[#0039a6] text-[18px] font-extrabold mb-2.5">Cerrar Sesión</div>
            <div className="text-[#555] text-[15px] mb-[25px] leading-snug">¿En verdad quieres cerrar sesión?</div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setModalLogout(false)}
                className="flex-1 p-[14px] rounded-[8px] text-[15px] font-bold border-none bg-[#f2f2f2] text-[#666]"
              >
                No
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="flex-1 p-[14px] rounded-[8px] text-[15px] font-bold border-none bg-[#00b551] text-white"
              >
                Sí
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Borrar Movimientos */}
      {modalBorrar && (
        <div className="fixed inset-0 bg-black/60 z-[1000] flex justify-center items-center p-[30px] backdrop-blur-[2px]">
          <div className="bg-white rounded-[16px] p-[25px] w-full max-w-[320px] text-center shadow-[0_10px_25px_rgba(0,0,0,0.2)] animate-slideUp">
            <div className="text-[#d32f2f] text-[18px] font-extrabold mb-2.5">Borrar Movimientos</div>
            <div className="text-[#555] text-[15px] mb-[25px] leading-snug">
              ¿Estás seguro que deseas eliminar todo el historial de movimientos de la cuenta? Esta acción no se puede deshacer.
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setModalBorrar(false)}
                className="flex-1 p-[14px] rounded-[8px] text-[15px] font-bold border-none bg-[#f2f2f2] text-[#666]"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleEjecutarBorradoMovimientos}
                className="flex-1 p-[14px] rounded-[8px] text-[15px] font-bold border-none bg-[#d32f2f] text-white"
              >
                Sí, borrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Actualizando */}
      {modalActualizando && (
        <div className="fixed inset-0 bg-black/60 z-[1000] flex justify-center items-center p-[30px] backdrop-blur-[2px]">
          <div className="bg-white rounded-[16px] p-[25px] w-full max-w-[320px] text-center shadow-[0_10px_25px_rgba(0,0,0,0.2)] animate-slideUp">
            <div className="w-6 h-6 border-[3px] border-[#f3f3f3] border-t-[#00b551] rounded-full animate-spin mx-auto mb-[15px]" />
            <div className="text-[#0039a6] text-[18px] font-extrabold mb-[5px]">Actualizando...</div>
            <div className="text-[#555] text-[13px]">Obteniendo los últimos datos de la app.</div>
          </div>
        </div>
      )}

      {/* Modal Confirmar PIN */}
      {modalConfirmPin && (
        <div className="fixed inset-0 bg-black/60 z-[1000] flex justify-center items-center p-[30px] backdrop-blur-[2px]">
          <div className="bg-white rounded-[16px] p-[25px] w-full max-w-[320px] text-center shadow-[0_10px_25px_rgba(0,0,0,0.2)] animate-slideUp">
            <div className="text-[#0039a6] text-[18px] font-extrabold mb-2.5">Cambiar PIN</div>
            <div className="text-[#555] text-[15px] mb-[25px] leading-snug">¿Estás a punto de cambiar tu pin de acceso. ¿Estás seguro?</div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setModalConfirmPin(false)}
                className="flex-1 p-[14px] rounded-[8px] text-[15px] font-bold border-none bg-[#f2f2f2] text-[#666]"
              >
                No
              </button>
              <button
                type="button"
                onClick={handleIniciarCreacionPin}
                className="flex-1 p-[14px] rounded-[8px] text-[15px] font-bold border-none bg-[#00b551] text-white"
              >
                Sí
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Input PIN (6 dígitos) */}
      {modalInputPin && (
        <div className="fixed inset-0 bg-black/60 z-[1000] flex justify-center items-center p-[30px] backdrop-blur-[2px]">
          <div className="bg-white rounded-[16px] p-[25px] w-full max-w-[320px] text-center shadow-[0_10px_25px_rgba(0,0,0,0.2)] animate-slideUp">
            <div className="text-[#0039a6] text-[18px] font-extrabold mb-2.5">
              {pinStep === "new" ? "Nuevo PIN" : "Confirmar PIN"}
            </div>
            <div className="text-[#555] text-[15px] mb-[20px] leading-snug">
              {pinStep === "new" ? "Ingresa un PIN de 6 dígitos" : "Repite los 6 dígitos"}
            </div>
            <input
              type="tel"
              maxLength={6}
              inputMode="numeric"
              value={inputPinValue}
              onChange={(e) => setInputPinValue(e.target.value.replace(/[^0-9]/g, ""))}
              autoFocus
              className="w-full p-[14px] border-[1.5px] border-[#ccc] rounded-[8px] text-[18px] text-center mb-5 outline-none tracking-[5px] font-bold focus:border-[#00b551] masked-input"
            />
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setModalInputPin(false)}
                className="flex-1 p-[14px] rounded-[8px] text-[15px] font-bold border-none bg-[#f2f2f2] text-[#666]"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleProcesarPinPaso}
                disabled={inputPinValue.length !== 6}
                className={`flex-1 p-[14px] rounded-[8px] text-[15px] font-bold border-none text-white ${
                  inputPinValue.length === 6 ? "bg-[#00b551]" : "bg-gray-300 opacity-60"
                }`}
              >
                Continuar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Éxito PIN */}
      {modalExitoPin && (
        <div className="fixed inset-0 bg-black/60 z-[1000] flex justify-center items-center p-[30px] backdrop-blur-[2px]">
          <div className="bg-white rounded-[16px] p-[25px] w-full max-w-[320px] text-center shadow-[0_10px_25px_rgba(0,0,0,0.2)] animate-slideUp">
            <i className="fa-solid fa-circle-check text-[40px] text-[#00b551] mb-[15px] block"></i>
            <div className="text-[#0039a6] text-[18px] font-extrabold mb-2.5">¡Éxito!</div>
            <div className="text-[#555] text-[15px] mb-[25px]">Pin definido correctamente.</div>
            <button
              type="button"
              onClick={() => setModalExitoPin(false)}
              className="w-full p-[14px] rounded-[8px] text-[15px] font-bold border-none bg-[#00b551] text-white"
            >
              Entendido
            </button>
          </div>
        </div>
      )}

      {/* Modal Confirmar Borrar PIN */}
      {modalBorrarPin && (
        <div className="fixed inset-0 bg-black/60 z-[1000] flex justify-center items-center p-[30px] backdrop-blur-[2px]">
          <div className="bg-white rounded-[16px] p-[25px] w-full max-w-[320px] text-center shadow-[0_10px_25px_rgba(0,0,0,0.2)] animate-slideUp">
            <div className="text-[#d32f2f] text-[18px] font-extrabold mb-2.5">Borrar PIN</div>
            <div className="text-[#555] text-[15px] mb-[25px] leading-snug">
              ¿Estás seguro que deseas eliminar el PIN de acceso? Cualquiera podrá ingresar a la app.
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setModalBorrarPin(false)}
                className="flex-1 p-[14px] rounded-[8px] text-[15px] font-bold border-none bg-[#f2f2f2] text-[#666]"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleBorrarPin}
                className="flex-1 p-[14px] rounded-[8px] text-[15px] font-bold border-none bg-[#d32f2f] text-white"
              >
                Sí, borrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Alerta Genérica */}
      {alerta.open && (
        <div className="fixed inset-0 bg-black/60 z-[2000] flex justify-center items-center p-[30px] backdrop-blur-[2px]">
          <div className="bg-white rounded-[16px] p-[25px] w-full max-w-[320px] text-center shadow-[0_10px_25px_rgba(0,0,0,0.2)] animate-slideUp">
            <div className={`text-[18px] font-extrabold mb-2.5 ${alerta.isError ? "text-[#d32f2f]" : "text-[#00b551]"}`}>
              {alerta.title}
            </div>
            <div className="text-[#555] text-[15px] mb-[25px] leading-snug">{alerta.message}</div>
            <button
              type="button"
              onClick={() => setAlerta({ ...alerta, open: false })}
              className={`w-full p-[14px] rounded-[8px] text-[15px] font-bold border-none text-white ${
                alerta.isError ? "bg-[#0039a6]" : "bg-[#00b551]"
              }`}
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
