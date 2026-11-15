"use client";

import React, { useState, useEffect, useRef } from "react";
import BottomNav from "@/components/BottomNav";
import { captureAndShareVoucher } from "@/lib/shareVoucher";

export default function ExitoTransView() {
  const [cargoNombre, setCargoNombre] = useState("Cuenta Simple Soles");
  const [cargoNumMasked, setCargoNumMasked] = useState("191 20** **** 1088");
  const [destNombre, setDestNombre] = useState("Cuenta Simple Dolares");
  const [destNum, setDestNum] = useState("191 2058956625");
  const [moneda, setMoneda] = useState("S/");
  const [monto, setMonto] = useState("0.00");
  const [opCode, setOpCode] = useState("89149851");
  const [fechaHora, setFechaHora] = useState("");

  // Push notification state
  const [showNotification, setShowNotification] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Captura de constancia
  const [isCapturing, setIsCapturing] = useState(false);
  const captureRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedCargo = localStorage.getItem("ibk_trans_cargo_name") || "Cuenta Simple Soles";
      const savedCargoNum = localStorage.getItem("ibk_trans_cargo_num") || "1912058951088";
      const savedDest = localStorage.getItem("ibk_trans_dest_name") || "Cuenta Simple Dolares";
      const savedDestNum = localStorage.getItem("ibk_trans_dest_num") || "191 2058956625";
      const savedMoneda = localStorage.getItem("ibk_trans_currency") || "S/";
      const savedMonto = localStorage.getItem("ibk_trans_monto") || "0.00";

      // Formatear número de cuenta con máscara
      const cleanNum = savedCargoNum.replace(/\s/g, "");
      let masked = savedCargoNum;
      if (cleanNum.length >= 10) {
        masked = `${cleanNum.substring(0, 4)} ${cleanNum.substring(4, 6)}** **** ${cleanNum.substring(cleanNum.length - 4)}`;
      }

      setCargoNombre(savedCargo);
      setCargoNumMasked(masked);
      setDestNombre(savedDest);
      setDestNum(savedDestNum);
      setMoneda(savedMoneda);

      const parsedMonto = parseFloat(savedMonto);
      setMonto(!isNaN(parsedMonto) ? parsedMonto.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00");

      // Código de operación
      const code = Math.floor(10000000 + Math.random() * 90000000).toString();
      setOpCode(code);

      // Fecha y hora formateadas
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

      setFechaHora(`${day} ${month} ${year}    ${timeStr}`);

      // Notificación push con sonido
      const timer = setTimeout(() => {
        try {
          audioRef.current?.play().catch(() => {});
        } catch (_) {}
        setShowNotification(true);

        const autoHide = setTimeout(() => {
          setShowNotification(false);
        }, 4000);

        return () => clearTimeout(autoHide);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, []);

  const handleEnviarConstancia = async () => {
    const cleanNombre = (destNombre || "Transferencia").replace(/[^a-zA-Z0-9]/g, "_");
    await captureAndShareVoucher({
      captureElement: captureRef.current,
      fileName: `Constancia_Transf_${cleanNombre}.png`,
      title: `Transferencia a ${destNombre}`,
      text: `Transferencia exitosa de ${moneda} ${monto} a ${destNombre}. Op: ${opCode}`,
      onBeforeCapture: () => {
        setIsCapturing(true);
        setShowNotification(false);
      },
      onAfterCapture: () => {
        setIsCapturing(false);
      },
    });
  };

  return (
    <div ref={captureRef} className="flex flex-col h-[100dvh] bg-white text-[#333333] select-none relative overflow-hidden font-sans">
      <audio ref={audioRef} src="/noti.mp3" preload="auto" />

      {/* ==================================================
          NOTIFICACIÓN PUSH SUPERIOR (DESLIZABLE)
          ================================================== */}
      <div
        onClick={() => setShowNotification(false)}
        className={`fixed top-4 left-1/2 -translate-x-1/2 w-[92%] max-w-[420px] bg-white rounded-[14px] shadow-[0_8px_25px_rgba(0,0,0,0.15)] flex items-center p-3 z-[9999] transition-all duration-500 ease-out cursor-pointer ${
          isCapturing
            ? "hidden pointer-events-none"
            : showNotification
            ? "translate-y-0 opacity-100"
            : "-translate-y-32 opacity-0 pointer-events-none"
        }`}
      >
        <img
          src="/img/interbank_wrdgas.webp"
          alt="Interbank"
          className="w-9 h-9 rounded-[8px] object-cover mr-3 flex-shrink-0"
        />
        <div className="flex-1 min-w-0 pr-1">
          <div className="text-[12px] font-extrabold text-[#111] leading-tight mb-0.5">Interbank</div>
          <div className="text-[11px] text-[#333] font-medium leading-snug break-words">
            {destNombre} te ha transferido {moneda} {monto}
          </div>
        </div>
        <div className="text-[10px] text-[#888] font-medium self-start flex-shrink-0 ml-1">Ahora</div>
      </div>

      {/* ==================================================
          HEADER
          ================================================== */}
      <header className="flex justify-center items-center py-4 bg-white flex-shrink-0 shadow-[0_4px_10px_rgba(0,0,0,0.06)] z-10">
        <div className="text-[16px] font-bold text-[#111]">Constancia</div>
      </header>

      {/* ==================================================
          CONTENIDO CONSTANCIA (TICKET)
          ================================================== */}
      <div className="flex-1 overflow-y-auto no-scrollbar pb-36 flex flex-col items-center px-4 pt-4 w-full">
        {/* Cabecera Éxito */}
        <div className="flex flex-col items-center mb-4 text-center w-[92%] max-w-[420px] flex-shrink-0">
          <div className="w-[50px] h-[50px] rounded-full bg-[#2BD071] flex justify-center items-center mb-2.5 shadow-sm">
            <svg className="w-7 h-7 stroke-white stroke-[3] fill-none stroke-linecap-round stroke-linejoin-round" viewBox="0 0 24 24">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
          <div className="text-[16px] font-medium text-[#111] mb-1">Transferiste</div>
          <div className="text-[#00B551] flex items-baseline justify-center mb-1">
            <span className="text-[22px] font-bold mr-1">{moneda}</span>
            <span className="text-[28px] font-black leading-none">{monto}</span>
          </div>
          <div className="text-[14px] font-bold text-[#111]">Gratis e inmediato</div>
        </div>

        {/* Ticket Recibo con corte dentado sic-sac exacto */}
        <div className="ticket-voucher shadow-sm flex-shrink-0">
          <div className="flex flex-col gap-3.5">
            {/* Cuenta a Cargo */}
            <div className="flex flex-col gap-0.5">
              <div className="text-[13.5px] font-bold text-[#111]">Cuenta a Cargo:</div>
              <div className="text-[14px] text-[#222] font-medium">{cargoNombre}</div>
              <div className="text-[13px] text-[#666]">{cargoNumMasked}</div>
            </div>

            {/* Cuenta Destino */}
            <div className="flex flex-col gap-0.5">
              <div className="text-[13.5px] font-bold text-[#111]">Cuenta destino:</div>
              <div className="text-[14px] text-[#222] font-medium">{destNombre}</div>
              <div className="text-[13px] text-[#666]">{destNum}</div>
            </div>

            {/* Destino */}
            <div className="flex flex-col gap-0.5">
              <div className="text-[13.5px] font-bold text-[#111]">Destino:</div>
              <div className="text-[14px] text-[#222] font-medium">Interbank</div>
            </div>

            {/* Fecha y hora */}
            <div className="flex flex-col gap-0.5">
              <div className="text-[13.5px] font-bold text-[#111]">Fecha y hora:</div>
              <div className="text-[13.5px] text-[#222] font-medium tracking-wide">{fechaHora}</div>
            </div>

            {/* Código de operación */}
            <div className="flex flex-col gap-0.5">
              <div className="text-[13.5px] font-bold text-[#111]">Código de operación:</div>
              <div className="text-[14px] text-[#222] font-semibold">{opCode}</div>
            </div>
          </div>
        </div>

        {/* Botón Enviar constancia */}
        <button
          type="button"
          id="actionButton"
          onClick={handleEnviarConstancia}
          className={`text-[#00B551] text-[15px] font-semibold bg-transparent border-none cursor-pointer py-2.5 px-6 mb-8 hover:underline active:opacity-75 transition z-10 flex-shrink-0 ${
            isCapturing ? "hidden pointer-events-none" : "block"
          }`}
        >
          Enviar constancia
        </button>
      </div>

      {/* ==================================================
          BARRA DE NAVEGACIÓN INFERIOR (COMPONENTE CENTRALIZADO)
          ================================================== */}
      {!isCapturing && <BottomNav activeTab="inicio" />}
    </div>
  );
}
