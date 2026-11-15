"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import BottomNav from "@/components/BottomNav";
import { captureAndShareVoucher } from "@/lib/shareVoucher";

interface Account {
  id: number;
  name: string;
  curr: string;
  bal: string;
  num: string;
}

const DEFAULT_ACCOUNTS: Account[] = [
  { id: 1, name: "Cuenta Simple Soles", curr: "S/", bal: "1000.00", num: "191 2058 9510 88" },
  { id: 2, name: "Cuenta Simple Dolares", curr: "US$", bal: "1000.00", num: "191 2058 9566 25" },
  { id: 3, name: "Cuenta de Ahorros", curr: "S/", bal: "1000.00", num: "191 1111 1111 11" },
];

const TEMPLATE_DEFAULTS = {
  empresa: "SEDAPAL",
  servicio: "Agua Potable",
  titular: "Juan Perez",
  codigo: "7482910",
  monto: "120.00",
  vencimiento: "25/02",
};

const MONTH_NAMES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

const DAYS_OF_WEEK = ["Lu", "Ma", "Mi", "Ju", "Vi", "Sa", "Do"];

interface ServFlowProps {
  initialView?: "form" | "exito";
}

export default function ServFlow({ initialView = "form" }: ServFlowProps) {
  const router = useRouter();

  // Navigation views: form -> cuentas -> confirmacion -> loading -> exito
  const [currentView, setCurrentView] = useState<"form" | "cuentas" | "confirmacion" | "exito">(
    initialView === "exito" ? "exito" : "form"
  );
  const [isLoading, setIsLoading] = useState(false);

  // Form Fields - Start empty as requested (plantilla en segundo plano)
  const [empresa, setEmpresa] = useState("");
  const [servicio, setServicio] = useState("");
  const [titular, setTitular] = useState("");
  const [codigo, setCodigo] = useState("");
  const [monto, setMonto] = useState("");
  const [vencimiento, setVencimiento] = useState("");

  // Date Picker State
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [pickerDate, setPickerDate] = useState(() => new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const dateContainerRef = useRef<HTMLDivElement>(null);

  // Accounts State
  const [accounts, setAccounts] = useState<Account[]>(DEFAULT_ACCOUNTS);
  const [selectedAccount, setSelectedAccount] = useState<Account>(DEFAULT_ACCOUNTS[0]);

  // Exito Data
  const [exitoData, setExitoData] = useState({
    empresa: TEMPLATE_DEFAULTS.empresa,
    servicio: TEMPLATE_DEFAULTS.servicio,
    cargoNombre: "Cuenta Simple Soles",
    cargoNumMasked: "191 20** **** 1088",
    titular: TEMPLATE_DEFAULTS.titular,
    codigo: TEMPLATE_DEFAULTS.codigo,
    moneda: "S/",
    monto: TEMPLATE_DEFAULTS.monto,
    vencimiento: TEMPLATE_DEFAULTS.vencimiento,
    opCode: "80599827",
    fechaHora: "15 nov 2026   07:24 PM",
  });

  // Push Notification state
  const [showPush, setShowPush] = useState(false);
  const [pushDismissed, setPushDismissed] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Captura y compartir de constancia
  const [isCapturing, setIsCapturing] = useState(false);
  const captureRef = useRef<HTMLDivElement>(null);

  // Load stored accounts & default initial data
  useEffect(() => {
    try {
      const loadedAccounts: Account[] = DEFAULT_ACCOUNTS.map((def) => {
        const savedName = localStorage.getItem(`ibk_acc${def.id}_name`) || def.name;
        const savedCurr = localStorage.getItem(`ibk_acc${def.id}_curr`) || def.curr;
        const savedBal = localStorage.getItem(`ibk_acc${def.id}_bal`) || def.bal;
        const savedNum = localStorage.getItem(`ibk_acc${def.id}_num`) || def.num;
        return {
          id: def.id,
          name: savedName,
          curr: savedCurr,
          bal: savedBal,
          num: savedNum,
        };
      });
      setAccounts(loadedAccounts);
      setSelectedAccount(loadedAccounts[0]);

      // If initialView is exito, load stored values from localStorage or fallback template
      if (initialView === "exito") {
        const savedEmpresa = localStorage.getItem("ibk_serv_empresa") || TEMPLATE_DEFAULTS.empresa;
        const savedServicio = localStorage.getItem("ibk_serv_servicio") || TEMPLATE_DEFAULTS.servicio;
        const savedCargoNombre = localStorage.getItem("ibk_serv_cargo_name") || "Cuenta Simple Soles";
        const savedCargoNum = localStorage.getItem("ibk_serv_cargo_num") || "191 2058 9510 88";
        const savedTitular = localStorage.getItem("ibk_serv_titular") || TEMPLATE_DEFAULTS.titular;
        const savedCodigo = localStorage.getItem("ibk_serv_codigo") || TEMPLATE_DEFAULTS.codigo;
        const savedMoneda = localStorage.getItem("ibk_serv_currency") || "S/";
        const savedMonto = localStorage.getItem("ibk_serv_monto") || TEMPLATE_DEFAULTS.monto;
        const savedFecha = localStorage.getItem("ibk_serv_fecha") || TEMPLATE_DEFAULTS.vencimiento;
        const savedOpCode = localStorage.getItem("ibk_serv_opCode") || "80599827";
        const savedFechaHora = localStorage.getItem("ibk_serv_fechaHora") || getFormattedDateTime();

        let maskedNum = savedCargoNum;
        const clean = savedCargoNum.replace(/\s/g, "");
        if (clean.length >= 10) {
          maskedNum = `${clean.substring(0, 4)} ${clean.substring(4, 6)}** **** ${clean.substring(clean.length - 4)}`;
        }

        setExitoData({
          empresa: savedEmpresa,
          servicio: savedServicio,
          cargoNombre: savedCargoNombre,
          cargoNumMasked: maskedNum,
          titular: savedTitular,
          codigo: savedCodigo,
          moneda: savedMoneda,
          monto: parseFloat(savedMonto).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
          vencimiento: savedFecha,
          opCode: savedOpCode,
          fechaHora: savedFechaHora,
        });

        triggerNotification();
      }
    } catch (e) {
      console.error(e);
    }
  }, [initialView]);

  // Click outside to close datepicker
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dateContainerRef.current && !dateContainerRef.current.contains(event.target as Node)) {
        setShowDatePicker(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Format date helper
  function getFormattedDateTime() {
    const now = new Date();
    const months = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
    const day = now.getDate().toString().padStart(2, "0");
    const month = months[now.getMonth()];
    const year = now.getFullYear();

    let hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12;
    const timeStr = `${hours.toString().padStart(2, "0")}:${minutes} ${ampm}`;

    return `${day} ${month} ${year}   ${timeStr}`;
  }

  // Helper to obtain effective data with background template
  const getEffectiveData = () => {
    const finalEmpresa = empresa.trim() || TEMPLATE_DEFAULTS.empresa;
    const finalServicio = servicio.trim() || TEMPLATE_DEFAULTS.servicio;
    const finalTitular = titular.trim() || TEMPLATE_DEFAULTS.titular;
    const finalCodigo = codigo.trim() || TEMPLATE_DEFAULTS.codigo;
    const num = parseFloat(monto);
    const finalMontoNum = num > 0 ? num : parseFloat(TEMPLATE_DEFAULTS.monto);
    const finalMontoStr = finalMontoNum.toFixed(2);
    const finalVencimiento = vencimiento.trim() || TEMPLATE_DEFAULTS.vencimiento;

    return {
      finalEmpresa,
      finalServicio,
      finalTitular,
      finalCodigo,
      finalMontoNum,
      finalMontoStr,
      finalVencimiento,
    };
  };

  // Trigger push notification & sound
  const triggerNotification = () => {
    setShowPush(true);
    setPushDismissed(false);
    try {
      const audio = new Audio("/noti.mp3");
      audio.play().catch(() => {});
    } catch {}

    const timer = setTimeout(() => {
      setShowPush(false);
    }, 6000);
    return () => clearTimeout(timer);
  };

  // Back button handling
  const handleBack = () => {
    if (currentView === "confirmacion") {
      setCurrentView("cuentas");
    } else if (currentView === "cuentas") {
      setCurrentView("form");
    } else if (currentView === "exito") {
      router.push("/inicio");
    } else {
      router.push("/inicio");
    }
  };

  // Calendar render helpers
  const year = pickerDate.getFullYear();
  const month = pickerDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  // Monday as first day (0=Lu, 6=Do)
  const offset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const prevMonthCells = [];
  for (let i = offset - 1; i >= 0; i--) {
    prevMonthCells.push(daysInPrevMonth - i);
  }

  const currentMonthCells = [];
  for (let i = 1; i <= daysInMonth; i++) {
    currentMonthCells.push(i);
  }

  const totalCellsSoFar = offset + daysInMonth;
  const remainingCells = 42 - totalCellsSoFar;
  const nextMonthCells = [];
  for (let i = 1; i <= remainingCells; i++) {
    nextMonthCells.push(i);
  }

  const handleSelectDay = (day: number) => {
    setSelectedDay(day);
    setSelectedMonth(month);
    const dd = day.toString().padStart(2, "0");
    const mm = (month + 1).toString().padStart(2, "0");
    setVencimiento(`${dd}/${mm}`);
    setShowDatePicker(false);
  };

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPickerDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPickerDate(new Date(year, month + 1, 1));
  };

  // Flow Navigation
  const handleGoToCuentas = () => {
    setCurrentView("cuentas");
  };

  const handleSelectAccount = (acc: Account) => {
    setSelectedAccount(acc);
    setCurrentView("confirmacion");
  };

  const handleProcessPayment = () => {
    setIsLoading(true);

    const eff = getEffectiveData();
    const formattedMonto = eff.finalMontoNum.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    const opCodeGenerated = `0${Math.floor(10000000 + Math.random() * 90000000)}`.slice(-8);
    const currentDateTime = getFormattedDateTime();

    let maskedNum = selectedAccount.num;
    const cleanNum = selectedAccount.num.replace(/\s/g, "");
    if (cleanNum.length >= 10) {
      maskedNum = `${cleanNum.substring(0, 4)} ${cleanNum.substring(4, 6)}** **** ${cleanNum.substring(cleanNum.length - 4)}`;
    }

    try {
      // 1. Save visual details to localStorage
      localStorage.setItem("ibk_serv_empresa", eff.finalEmpresa);
      localStorage.setItem("ibk_serv_servicio", eff.finalServicio);
      localStorage.setItem("ibk_serv_cargo_name", selectedAccount.name);
      localStorage.setItem("ibk_serv_cargo_num", selectedAccount.num);
      localStorage.setItem("ibk_serv_titular", eff.finalTitular);
      localStorage.setItem("ibk_serv_codigo", eff.finalCodigo);
      localStorage.setItem("ibk_serv_fecha", eff.finalVencimiento);
      localStorage.setItem("ibk_serv_currency", selectedAccount.curr);
      localStorage.setItem("ibk_serv_monto", eff.finalMontoNum.toFixed(2));
      localStorage.setItem("ibk_serv_opCode", opCodeGenerated);
      localStorage.setItem("ibk_serv_fechaHora", currentDateTime);

      // 2. Deduct money from the selected account
      const currentBalStr = localStorage.getItem(`ibk_acc${selectedAccount.id}_bal`) || selectedAccount.bal;
      const currentBalNum = parseFloat(currentBalStr) || 0;
      const newBal = Math.max(0, currentBalNum - eff.finalMontoNum);
      localStorage.setItem(`ibk_acc${selectedAccount.id}_bal`, newBal.toFixed(2));

      // 3. Register transaction into ibk_movimientos
      try {
        const movimientosPrevios = JSON.parse(localStorage.getItem("ibk_movimientos") || "[]");
        const nuevoMovimiento = {
          id: Date.now().toString(),
          title: eff.finalEmpresa.toUpperCase(),
          subtitle: `Pago de servicio - ${eff.finalServicio}`,
          amount: `-${eff.finalMontoNum.toFixed(2)}`,
          currency: selectedAccount.curr,
          date: currentDateTime,
          opCode: opCodeGenerated,
          accountId: String(selectedAccount.id),
          accountName: selectedAccount.name,
          serviceCode: eff.finalCodigo,
          titular: eff.finalTitular,
        };
        movimientosPrevios.unshift(nuevoMovimiento);
        localStorage.setItem("ibk_movimientos", JSON.stringify(movimientosPrevios));
      } catch (errMov) {
        console.error("Error al registrar movimiento:", errMov);
      }

      setExitoData({
        empresa: eff.finalEmpresa,
        servicio: eff.finalServicio,
        cargoNombre: selectedAccount.name,
        cargoNumMasked: maskedNum,
        titular: eff.finalTitular,
        codigo: eff.finalCodigo,
        moneda: selectedAccount.curr,
        monto: formattedMonto,
        vencimiento: eff.finalVencimiento,
        opCode: opCodeGenerated,
        fechaHora: currentDateTime,
      });
    } catch (e) {
      console.error(e);
    }

    // 4. Transition after 1.8 seconds
    setTimeout(() => {
      setIsLoading(false);
      setCurrentView("exito");
      triggerNotification();
    }, 1800);
  };

  const handleShareConstancia = async () => {
    const cleanEmpresa = (exitoData.empresa || "Servicio").replace(/[^a-zA-Z0-9]/g, "_");
    await captureAndShareVoucher({
      captureElement: captureRef.current,
      fileName: `Constancia_${cleanEmpresa}.png`,
      title: `Pago de servicio a ${exitoData.empresa}`,
      text: `Pago de servicio exitoso de ${exitoData.moneda} ${exitoData.monto} a ${exitoData.empresa}. Op: ${exitoData.opCode}`,
      onBeforeCapture: () => {
        setIsCapturing(true);
        setShowPush(false);
      },
      onAfterCapture: () => {
        setIsCapturing(false);
      },
    });
  };

  const effValues = getEffectiveData();

  return (
    <div className="min-h-screen bg-[#F4F6F9] flex justify-center text-[#333333] font-sans select-none">
      <div className="w-full max-w-[480px] bg-white h-[100dvh] flex flex-col relative overflow-hidden shadow-2xl">
        {/* ========================================================
            LOADING SPINNER OVERLAY
        ======================================================== */}
        {isLoading && (
          <div className="absolute inset-0 bg-white/95 z-[9999] flex flex-col items-center justify-center">
            <div className="relative w-[75px] h-[75px] flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-[#F0F0F0]"></div>
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#00B14F] animate-spin"></div>
              <img
                src="/img/icon.webp"
                alt="Cargando"
                className="w-8 h-8 object-contain z-10 pointer-events-none"
              />
            </div>
            <p className="mt-4 text-[13px] font-semibold text-[#666666]">Procesando pago...</p>
          </div>
        )}

        {/* ========================================================
            SIMULATED PUSH NOTIFICATION BANNER (EXITOSERV)
        ======================================================== */}
        {currentView === "exito" && showPush && !pushDismissed && (
          <div
            onClick={() => setPushDismissed(true)}
            className="absolute top-3 left-1/2 -translate-x-1/2 w-[92%] max-w-[395px] bg-white rounded-[14px] shadow-[0_10px_30px_rgba(0,0,0,0.18)] border border-[#EDEDED] flex items-center p-3 z-[9999] cursor-pointer transition-all duration-300 animate-in slide-in-from-top-6"
          >
            <img
              src="/img/interbank_wrdgas.webp"
              alt="Interbank"
              className="w-10 h-10 rounded-[10px] object-cover mr-3 flex-shrink-0 shadow-sm"
            />
            <div className="flex-1 min-w-0 pr-2">
              <div className="text-[12px] font-extrabold text-[#111827] leading-tight">Interbank</div>
              <div className="text-[12px] text-[#4B5563] font-medium leading-tight truncate">
                Pago de servicio a {exitoData.empresa} exitoso
              </div>
            </div>
            <div className="text-[10px] text-[#9CA3AF] font-medium flex-shrink-0 self-start mt-0.5">
              Ahora
            </div>
          </div>
        )}

        {/* TOAST FEEDBACK */}
        {toastMessage && (
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-[#111827] text-white text-[12px] font-semibold px-4 py-2 rounded-full shadow-lg z-[9999] animate-fade-in">
            {toastMessage}
          </div>
        )}

        {/* ========================================================
            HEADER
        ======================================================== */}
        <header className="h-[54px] flex items-center justify-between px-4 bg-white border-b border-[#F0F0F0] flex-shrink-0 z-20">
          {currentView !== "exito" ? (
            <button
              type="button"
              onClick={handleBack}
              className="w-8 h-8 flex items-center justify-center rounded-full active:bg-[#F3F4F6] transition text-[#00B14F]"
            >
              <svg className="w-5 h-5 stroke-current stroke-[2.5] fill-none" viewBox="0 0 24 24">
                <polyline points="15 18 9 12 15 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          ) : (
            <div className="w-8" />
          )}

          <div className="text-[15px] font-bold text-[#111827] text-center flex-1">
            {currentView === "exito" ? "Constancia" : "Servicios"}
          </div>

          <div className="w-8" />
        </header>

        {/* ========================================================
            VIEW 1: FORMULARIO SERVICIOS
        ======================================================== */}
        {currentView === "form" && (
          <div className="flex-1 overflow-y-auto px-5 py-6 flex flex-col justify-between">
            <div className="space-y-5">
              {/* Empresa */}
              <div className="space-y-1">
                <label className="block text-[13px] font-bold text-[#111827]">Empresa</label>
                <input
                  type="text"
                  value={empresa}
                  onChange={(e) => setEmpresa(e.target.value)}
                  placeholder="Ej: SEDAPAL"
                  className="w-full border-b border-[#E5E7EB] focus:border-[#00B14F] py-2 text-[14px] text-[#333333] placeholder-[#9CA3AF] outline-none transition bg-transparent"
                  autoComplete="off"
                />
              </div>

              {/* Servicio */}
              <div className="space-y-1">
                <label className="block text-[13px] font-bold text-[#111827]">Servicio</label>
                <input
                  type="text"
                  value={servicio}
                  onChange={(e) => setServicio(e.target.value)}
                  placeholder="Ej: Agua Potable"
                  className="w-full border-b border-[#E5E7EB] focus:border-[#00B14F] py-2 text-[14px] text-[#333333] placeholder-[#9CA3AF] outline-none transition bg-transparent"
                  autoComplete="off"
                />
              </div>

              {/* Datos (Titular + Código) */}
              <div className="space-y-1">
                <label className="block text-[13px] font-bold text-[#111827]">Datos</label>
                <input
                  type="text"
                  value={titular}
                  onChange={(e) => setTitular(e.target.value)}
                  placeholder="Titular"
                  className="w-full border-b border-[#E5E7EB] focus:border-[#00B14F] py-2 text-[14px] text-[#333333] placeholder-[#9CA3AF] outline-none transition bg-transparent mb-2"
                  autoComplete="off"
                />
                <input
                  type="text"
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value)}
                  placeholder="Código"
                  className="w-full border-b border-[#E5E7EB] focus:border-[#00B14F] py-2 text-[14px] text-[#333333] placeholder-[#9CA3AF] outline-none transition bg-transparent"
                  autoComplete="off"
                />
              </div>

              {/* Monto & Vencimiento Row */}
              <div className="flex gap-4 relative" ref={dateContainerRef}>
                {/* Monto */}
                <div className="flex-1 space-y-1">
                  <label className="block text-[13px] font-bold text-[#111827]">Monto</label>
                  <input
                    type="number"
                    step="0.01"
                    value={monto}
                    onChange={(e) => setMonto(e.target.value)}
                    onBlur={() => {
                      if (monto && !isNaN(Number(monto)) && Number(monto) > 0) {
                        setMonto(parseFloat(monto).toFixed(2));
                      }
                    }}
                    placeholder="0.00"
                    className="w-full border-b border-[#E5E7EB] focus:border-[#00B14F] py-2 text-[14px] text-[#333333] placeholder-[#9CA3AF] outline-none transition bg-transparent"
                  />
                </div>

                {/* Vencimiento & Calendar Trigger */}
                <div className="flex-1 space-y-1 relative">
                  <label className="block text-[13px] font-bold text-[#111827]">Vencimiento</label>
                  <input
                    type="text"
                    value={vencimiento}
                    readOnly
                    onClick={() => setShowDatePicker(!showDatePicker)}
                    placeholder="dd/mm"
                    className="w-full border-b border-[#E5E7EB] focus:border-[#00B14F] py-2 text-[14px] text-[#333333] placeholder-[#9CA3AF] outline-none transition bg-transparent cursor-pointer"
                  />

                  {/* FLOATING CALENDAR POPOVER */}
                  {showDatePicker && (
                    <div className="absolute top-full right-0 mt-2 w-[270px] bg-white rounded-[14px] shadow-[0_8px_30px_rgba(0,0,0,0.18)] border border-[#EDEDED] p-3.5 z-50 animate-in fade-in zoom-in-95">
                      <div className="flex items-center justify-between mb-3 px-1">
                        <button
                          type="button"
                          onClick={handlePrevMonth}
                          className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-[#F3F4F6] text-[#4B5563] text-[16px] font-bold"
                        >
                          ‹
                        </button>
                        <span className="text-[13px] font-bold text-[#111827]">
                          {MONTH_NAMES[month]} {year}
                        </span>
                        <button
                          type="button"
                          onClick={handleNextMonth}
                          className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-[#F3F4F6] text-[#4B5563] text-[16px] font-bold"
                        >
                          ›
                        </button>
                      </div>

                      <div className="grid grid-cols-7 gap-1 text-center">
                        {DAYS_OF_WEEK.map((d) => (
                          <div
                            key={d}
                            className="text-[11px] font-bold text-[#6B7280] pb-1 border-b border-[#F0F0F0]"
                          >
                            {d}
                          </div>
                        ))}

                        {/* Previous month cells */}
                        {prevMonthCells.map((d, idx) => (
                          <div
                            key={`prev-${idx}`}
                            className="text-[12px] text-[#D1D5DB] py-1.5 cursor-default"
                          >
                            {d}
                          </div>
                        ))}

                        {/* Current month cells */}
                        {currentMonthCells.map((d) => {
                          const isSelected = d === selectedDay && month === selectedMonth;
                          return (
                            <button
                              key={`curr-${d}`}
                              type="button"
                              onClick={() => handleSelectDay(d)}
                              className={`text-[12px] py-1.5 rounded-full transition ${
                                isSelected
                                  ? "bg-[#00B14F] text-white font-bold"
                                  : "text-[#333333] hover:bg-[#F3F4F6]"
                              }`}
                            >
                              {d}
                            </button>
                          );
                        })}

                        {/* Next month cells */}
                        {nextMonthCells.map((d, idx) => (
                          <div
                            key={`next-${idx}`}
                            className="text-[12px] text-[#D1D5DB] py-1.5 cursor-default"
                          >
                            {d}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Siguiente Button - Active and functional with background template */}
            <div className="pt-6 pb-2">
              <button
                type="button"
                onClick={handleGoToCuentas}
                className="w-full py-3.5 rounded-[10px] text-[14px] font-bold transition shadow-sm bg-[#00B14F] text-white hover:bg-[#009E45] active:scale-[0.99] cursor-pointer"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}

        {/* ========================================================
            VIEW 2: SELECCIÓN DE CUENTA DE CARGO
        ======================================================== */}
        {currentView === "cuentas" && (
          <div className="flex-1 overflow-y-auto px-4 py-5 bg-[#FAFBFC]">
            <div className="text-[14px] font-bold text-[#111827] mb-3 px-1">
              Elige la cuenta de cargo
            </div>

            <div className="space-y-3">
              {accounts.map((acc) => {
                const formattedBal = parseFloat(acc.bal).toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                });
                return (
                  <div
                    key={acc.id}
                    onClick={() => handleSelectAccount(acc)}
                    className="bg-white rounded-[12px] p-4 flex items-center border border-[#F0F0F0] shadow-[0_2px_8px_rgba(0,0,0,0.03)] cursor-pointer active:bg-[#F9FAFB] transition"
                  >
                    <img
                      src="/img/target.jpg"
                      alt="Cuenta"
                      className="w-[52px] h-[36px] object-cover rounded-[6px] mr-3.5 shadow-sm border border-black/5"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-medium text-[#111827] truncate">
                        {acc.name}
                      </div>
                      <div className="text-[15px] font-bold text-[#111827]">
                        {acc.curr} {formattedBal}
                      </div>
                    </div>
                    <div className="text-[#00B14F] text-[22px] font-bold ml-2 leading-none">›</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================
            VIEW 3: CONFIRMACIÓN
        ======================================================== */}
        {currentView === "confirmacion" && (
          <div className="flex-1 overflow-y-auto px-5 py-6 bg-white flex flex-col justify-between">
            <div>
              <div className="text-center my-2 mb-6">
                <div className="text-[16px] text-[#111827] font-normal leading-snug">
                  Estás a un paso de
                  <br />
                  <strong className="font-extrabold">realizar el pago de tus servicios</strong>
                </div>
              </div>

              <div className="text-[14px] font-bold text-[#111827] mb-4">Confirma la información</div>

              {/* Data Table */}
              <div className="space-y-3">
                <div className="border-b border-[#F0F0F0] pb-2.5">
                  <div className="text-[11px] font-bold text-[#888888] tracking-wider uppercase mb-1">
                    INSTITUCIÓN O EMPRESA
                  </div>
                  <div className="text-[14px] text-[#111827] font-medium">{effValues.finalEmpresa}</div>
                </div>

                <div className="border-b border-[#F0F0F0] pb-2.5">
                  <div className="text-[11px] font-bold text-[#888888] tracking-wider uppercase mb-1">
                    SERVICIO
                  </div>
                  <div className="text-[14px] text-[#111827] font-medium">{effValues.finalServicio}</div>
                </div>

                <div className="border-b border-[#F0F0F0] pb-2.5">
                  <div className="text-[11px] font-bold text-[#888888] tracking-wider uppercase mb-1">
                    CUENTA A CARGO
                  </div>
                  <div className="text-[14px] text-[#111827] font-medium leading-tight">
                    {selectedAccount.name}
                  </div>
                  <div className="text-[12px] text-[#6B7280] mt-0.5">{selectedAccount.num}</div>
                </div>

                <div className="border-b border-[#F0F0F0] pb-2.5">
                  <div className="text-[11px] font-bold text-[#888888] tracking-wider uppercase mb-1">
                    DATOS
                  </div>
                  <div className="text-[14px] text-[#111827] font-medium leading-tight">{effValues.finalTitular}</div>
                  <div className="text-[12px] text-[#6B7280] mt-0.5">{effValues.finalCodigo}</div>
                </div>

                <div className="pb-2">
                  <div className="text-[11px] font-bold text-[#888888] tracking-wider uppercase mb-1">
                    MONEDA Y MONTO
                  </div>
                  <div className="text-[15px] font-bold text-[#111827]">
                    {selectedAccount.curr}{" "}
                    {parseFloat(effValues.finalMontoStr).toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 pb-2">
              <button
                type="button"
                onClick={handleProcessPayment}
                className="w-full py-3.5 rounded-[10px] bg-[#00B14F] hover:bg-[#009E45] text-white text-[14px] font-bold active:scale-[0.99] transition shadow-md cursor-pointer"
              >
                Confirmar
              </button>
            </div>
          </div>
        )}

        {/* ========================================================
            VIEW 4: ÉXITO (CONSTANCIA / EXITOSERV)
        ======================================================== */}
        {currentView === "exito" && (
          <div ref={captureRef} className="flex-1 flex flex-col justify-between overflow-y-auto no-scrollbar pb-[75px] bg-white">
            <div className="flex flex-col items-center px-4 pt-4">
              {/* Header de Éxito */}
              <div className="flex flex-col items-center mt-2 mb-3">
                <div className="w-[46px] h-[46px] bg-[#2BD071] rounded-full flex items-center justify-center mb-2 shadow-sm">
                  <svg className="w-6 h-6 stroke-white stroke-[3] fill-none" viewBox="0 0 24 24">
                    <polyline points="20 6 9 17 4 12" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div className="text-[14px] text-[#4B5563] font-normal mb-0.5">Pagaste</div>
                <div className="flex items-center text-[#00B14F] mb-0.5">
                  <span className="text-[20px] font-semibold mr-1">{exitoData.moneda}</span>
                  <span className="text-[24px] font-extrabold">{exitoData.monto}</span>
                </div>
                <div className="text-[14px] font-bold text-[#111827]">
                  a {exitoData.empresa.toUpperCase()}
                </div>
              </div>

              {/* TICKET CON BORDES ONDULADOS (SCALLOPED) */}
              <div className="relative bg-[#F3F5F4] w-[88%] max-w-[360px] px-5 py-5 my-3 rounded-[3px] shadow-[0_2px_8px_rgba(0,0,0,0.03)]">
                {/* Ondas superiores */}
                <div
                  className="absolute -top-[8px] left-0 right-0 h-[8px]"
                  style={{
                    backgroundImage:
                      "radial-gradient(circle at 8px 8px, #F3F5F4 8px, transparent 9px)",
                    backgroundSize: "16px 16px",
                  }}
                />

                {/* Ondas inferiores */}
                <div
                  className="absolute -bottom-[8px] left-0 right-0 h-[8px]"
                  style={{
                    backgroundImage:
                      "radial-gradient(circle at 8px 0, #F3F5F4 8px, transparent 9px)",
                    backgroundSize: "16px 16px",
                  }}
                />

                <div className="space-y-3">
                  {/* Cuenta a Cargo */}
                  <div>
                    <div className="text-[13px] font-bold text-[#111827] leading-tight">
                      Cuenta a Cargo:
                    </div>
                    <div className="text-[13px] text-[#374151] font-normal mt-0.5">
                      {exitoData.cargoNombre}
                    </div>
                    <div className="text-[12px] text-[#6B7280]">{exitoData.cargoNumMasked}</div>
                  </div>

                  {/* Servicio */}
                  <div>
                    <div className="text-[13px] font-bold text-[#111827] leading-tight">Servicio:</div>
                    <div className="text-[13px] text-[#374151] font-normal mt-0.5">
                      {exitoData.servicio}
                    </div>
                  </div>

                  {/* Recibo */}
                  <div>
                    <div className="text-[13px] font-bold text-[#111827] leading-tight">Recibo:</div>
                    <div className="text-[13px] text-[#374151] font-normal mt-0.5">
                      {exitoData.moneda} {exitoData.monto}
                    </div>
                    <div className="text-[12px] text-[#6B7280]">
                      Vence: {exitoData.vencimiento}
                    </div>
                  </div>

                  {/* Datos */}
                  <div>
                    <div className="text-[13px] font-bold text-[#111827] leading-tight">Datos:</div>
                    <div className="text-[13px] text-[#374151] font-normal mt-0.5">
                      {exitoData.titular}
                    </div>
                    <div className="text-[12px] text-[#6B7280]">{exitoData.codigo}</div>
                  </div>

                  {/* Fecha y hora */}
                  <div>
                    <div className="text-[13px] font-bold text-[#111827] leading-tight">
                      Fecha y hora:
                    </div>
                    <div className="text-[13px] text-[#374151] font-normal mt-0.5">
                      {exitoData.fechaHora}
                    </div>
                  </div>

                  {/* Código de operación */}
                  <div>
                    <div className="text-[13px] font-bold text-[#111827] leading-tight">
                      Código de operación:
                    </div>
                    <div className="text-[13px] text-[#374151] font-normal mt-0.5">
                      {exitoData.opCode}
                    </div>
                  </div>
                </div>
              </div>

              {/* Botón Enviar constancia */}
              <button
                type="button"
                id="actionButton"
                onClick={handleShareConstancia}
                className={`mt-2 mb-4 text-[#00B14F] text-[14px] font-bold hover:underline active:opacity-75 transition cursor-pointer ${
                  isCapturing ? "hidden pointer-events-none" : "block"
                }`}
              >
                Enviar constancia
              </button>
            </div>
          </div>
        )}

        {/* ========================================================
            BARRA DE NAVEGACIÓN INFERIOR (COMPONENTE COMPARTIDO 100% IDÉNTICO A INICIO)
            Visible en la constancia (exitoserv)
        ======================================================== */}
        {currentView === "exito" && !isCapturing && (
          <BottomNav activeTab="inicio" />
        )}
      </div>
    </div>
  );
}
