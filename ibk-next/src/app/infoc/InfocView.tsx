"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface AccountDetail {
  id: string;
  name: string;
  curr: string;
  bal: string;
  num: string;
  cci: string;
}

interface Movimiento {
  id: string;
  title: string;
  subtitle: string;
  amount: string;
  currency: string;
  date: string;
  opCode?: string;
  accountName?: string;
  phone?: string;
  message?: string;
  tipo?: string;
  monto?: string;
  fechaCorta?: string;
  horaCorta?: string;
  fechaCompleta?: string;
}

const DEFAULTS = {
  acc1: {
    name: "Cuenta Simple Soles",
    curr: "S/",
    bal: "1000.00",
    num: "1912058951088",
    cci: "00219100205895108812",
  },
  acc2: {
    name: "Cuenta Simple Dolares",
    curr: "US$",
    bal: "1000.00",
    num: "1912058956625",
    cci: "00219100205895662515",
  },
  acc3: {
    name: "Cuenta de Ahorros",
    curr: "S/",
    bal: "1000.00",
    num: "1911111111111",
    cci: "00219111111111000000",
  },
};

const formatBalance = (val: string) => {
  const num = parseFloat(val);
  if (isNaN(num)) return val;
  return num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

export default function InfocView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const accountId = searchParams?.get("id") || "1";

  const [account, setAccount] = useState<AccountDetail>({
    id: accountId,
    ...(accountId === "2" ? DEFAULTS.acc2 : DEFAULTS.acc1),
  });

  const [activeTab, setActiveTab] = useState<"movimientos" | "alcancia">("movimientos");
  const [movements, setMovements] = useState<Movimiento[]>([]);
  const [selectedMovement, setSelectedMovement] = useState<Movimiento | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const defaultData = accountId === "2" ? DEFAULTS.acc2 : DEFAULTS.acc1;
      const savedName = localStorage.getItem(`ibk_acc${accountId}_name`) || defaultData.name;
      const savedCurr = localStorage.getItem(`ibk_acc${accountId}_curr`) || defaultData.curr;
      const savedBal = localStorage.getItem(`ibk_acc${accountId}_bal`) || defaultData.bal;
      const savedNum = localStorage.getItem(`ibk_acc${accountId}_num`) || defaultData.num;
      const savedCci = localStorage.getItem(`ibk_acc${accountId}_cci`) || defaultData.cci;

      setAccount({
        id: accountId,
        name: savedName,
        curr: savedCurr,
        bal: savedBal,
        num: savedNum,
        cci: savedCci,
      });

      // Cargar historial de movimientos desde cualquiera de las dos claves utilizadas
      try {
        const rawMovs =
          localStorage.getItem("ibk_movimientos") ||
          localStorage.getItem("ibk_global_movements") ||
          "[]";
        const parsed = JSON.parse(rawMovs);
        setMovements(Array.isArray(parsed) ? parsed : []);
      } catch (e) {
        console.error("Error al cargar movimientos:", e);
      }
    }
  }, [accountId]);

  return (
    <div className="h-[100dvh] flex flex-col bg-[#EAF7F3] text-[#333] select-none overflow-hidden">
      {/* HEADER EXACTO AL ORIGINAL */}
      <header className="flex justify-between items-center px-5 py-3.5 bg-white border-b border-[#f0f0f0] flex-shrink-0 z-20">
        <button
          type="button"
          onClick={() => router.push("/inicio")}
          className="w-[30px] h-[30px] flex items-center justify-center bg-transparent border-none cursor-pointer active:scale-90 transition p-0"
        >
          <svg className="w-[22px] h-[22px] stroke-[#00B14F] stroke-[3] fill-none stroke-linecap-round stroke-linejoin-round pointer-events-none" viewBox="0 0 24 24">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
        <div className="text-[16px] font-extrabold text-black flex-grow text-center ml-4">
          Mi Cuenta
        </div>
        <div className="flex items-center gap-[15px]">
          {/* for_you.jpg SIN MARCO CIRCULAR (exacto a lo solicitado) */}
          <img
            src="/img/for_you.jpg"
            alt="Para ti"
            className="w-[24px] h-[24px] object-contain pointer-events-none"
          />
          <svg className="w-[22px] h-[22px] stroke-[#00B14F] stroke-2 fill-none stroke-linecap-round stroke-linejoin-round pointer-events-none" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="1.5"></circle>
            <circle cx="12" cy="5" r="1.5"></circle>
            <circle cx="12" cy="19" r="1.5"></circle>
          </svg>
        </div>
      </header>

      {/* CONTENEDOR CON DESLIZAMIENTO TÁCTIL NATIVO (SCROLL PERFECTO) */}
      <div
        className="flex-1 overflow-y-auto no-scrollbar pb-10 overscroll-contain"
        style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}
      >
        {/* ==================================================
            STICKY TOP SECTION (bg-[#EAF7F3])
            ================================================== */}
        <div className="bg-[#EAF7F3] pb-1">
          {/* Tarjeta Superior de la Cuenta */}
          <div className="bg-white rounded-[8px] mx-5 mt-[15px] mb-[10px] p-[12px_15px] flex items-center shadow-[0_4px_15px_rgba(0,0,0,0.03)]">
            <img
              src="/img/target.jpg"
              alt="Icono Cuenta"
              className="w-[45px] h-[35px] object-cover rounded-[6px] mr-[15px] shadow-[0_2px_5px_rgba(0,0,0,0.1)] pointer-events-none"
            />
            <div className="flex-1 min-w-0">
              <div className="text-[14px] font-bold text-black leading-[1.2] truncate">
                {account.name}
              </div>
              <div className="text-[12px] text-[#666] mt-[2px]">
                {account.num}
              </div>
            </div>
            <div className="flex items-center gap-[10px]">
              <svg className="w-[18px] h-[18px] stroke-[#00B14F] stroke-[2.5] fill-none stroke-linecap-round stroke-linejoin-round cursor-pointer" viewBox="0 0 24 24">
                <circle cx="18" cy="5" r="3"></circle>
                <circle cx="6" cy="12" r="3"></circle>
                <circle cx="18" cy="19" r="3"></circle>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
              </svg>
              <svg className="w-[18px] h-[18px] stroke-[#00B14F] stroke-[2.5] fill-none stroke-linecap-round stroke-linejoin-round cursor-pointer" viewBox="0 0 24 24">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </div>
          </div>

          {/* Saldos: Saldo Disponible y Mi Alcancía */}
          <div className="flex justify-between px-[25px] pt-[5px] pb-[10px]">
            <div className="flex flex-col">
              <div className="text-[20px] font-bold text-[#0039A6] tracking-[-0.5px]">
                {account.curr} {formatBalance(account.bal)}
              </div>
              <div className="text-[11px] text-[#555] mt-[2px]">Saldo disponible</div>
            </div>
            <div className="flex flex-col items-end">
              <div className="text-[20px] font-bold text-[#0039A6] tracking-[-0.5px]">
                {account.curr} 0.00
              </div>
              <div className="text-[11px] text-[#555] mt-[2px]">Mi alcancía</div>
            </div>
          </div>
        </div>

        {/* ==================================================
            HIDABLE TOP SECTION (bg-[#EAF7F3])
            ================================================== */}
        <div className="bg-[#EAF7F3] pb-[25px]">
          {/* Fila de Iconos del Medio: cards.png, Slider Transfer, pig-bg.png */}
          <div className="flex justify-between items-center px-[25px] -mt-[5px]">
            <img
              src="/img/cards.png"
              alt="Cards"
              className="w-[42px] h-[42px] object-contain pointer-events-none flex-shrink-0"
            />

            {/* Transfer Slider Exacto al Original */}
            <div className="relative flex-1 max-w-[215px] h-[42px] bg-[#0039A6] rounded-[25px] flex justify-between items-center px-[15px] mx-[15px] text-white/80 text-[15px] font-bold tracking-[2px] shadow-inner">
              <span>&lt; &lt; &lt;</span>
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[70px] h-[70px] bg-white rounded-full flex items-center justify-center z-[1]">
                <div className="w-[46px] h-[46px] bg-[#00B14F] rounded-full flex items-center justify-center text-white font-extrabold text-[18px] z-[2] shadow-[0_0_15px_4px_rgba(0,181,81,0.4)]">
                  {account.curr}
                </div>
              </div>
              <span>&gt; &gt; &gt;</span>
            </div>

            {/* Alcancía con Gradiente */}
            <div className="w-[42px] h-[42px] rounded-full bg-gradient-to-br from-[#85ACD3] to-[#CAC9DA] flex items-center justify-center overflow-hidden flex-shrink-0">
              <img
                src="/img/pig-bg.png"
                alt="Pig"
                className="w-full h-full object-cover rounded-full scale-[1.2] pointer-events-none"
              />
            </div>
          </div>

          {/* Categorías con 4 Items Exactos al Original */}
          <div className="flex justify-between gap-[8px] px-[20px] pt-[15px] pb-[10px] overflow-x-auto no-scrollbar">
            {/* 1. Mi alcancía */}
            <div className="flex flex-col items-center text-center flex-1 min-w-0 cursor-pointer active:scale-95 transition">
              <div className="w-[68px] h-[68px] rounded-full border-[2.5px] border-[#50d28b] bg-white flex justify-center items-center mb-[8px] relative overflow-hidden shadow-[0_0_15px_3px_rgba(0,181,81,0.35)]">
                <div className="absolute w-[50px] h-[50px] rounded-full bg-[#C6E3F7]" />
                <img
                  src="/img/pig-bg.png"
                  alt="Pig"
                  className="w-[36px] h-[36px] object-cover rounded-full relative z-[2] pointer-events-none"
                />
              </div>
              <div className="text-[11.5px] leading-[1.2] font-semibold text-[#001e60]">
                {account.curr} 0<br />Mi alcancía
              </div>
            </div>

            {/* 2. Agregar categoría */}
            <div className="flex flex-col items-center text-center flex-1 min-w-0 cursor-pointer active:scale-95 transition">
              <div className="w-[68px] h-[68px] rounded-full border-[2.5px] border-[#50d28b] bg-white flex justify-center items-center mb-[8px] relative overflow-hidden">
                <div className="absolute w-[50px] h-[50px] rounded-full bg-[#E9FAF0]" />
                <svg className="w-[34px] h-[34px] stroke-[#00B14F] stroke-[2.5] stroke-linecap-round relative z-[2] pointer-events-none" viewBox="0 0 24 24">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
              </div>
              <div className="text-[11.5px] leading-[1.2] font-semibold text-[#00B14F]">
                Agregar<br />categoría
              </div>
            </div>

            {/* 3. Agregar categoría */}
            <div className="flex flex-col items-center text-center flex-1 min-w-0 cursor-pointer active:scale-95 transition">
              <div className="w-[68px] h-[68px] rounded-full border-[2.5px] border-[#50d28b] bg-white flex justify-center items-center mb-[8px] relative overflow-hidden">
                <div className="absolute w-[50px] h-[50px] rounded-full bg-[#E9FAF0]" />
                <svg className="w-[34px] h-[34px] stroke-[#00B14F] stroke-[2.5] stroke-linecap-round relative z-[2] pointer-events-none" viewBox="0 0 24 24">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
              </div>
              <div className="text-[11.5px] leading-[1.2] font-semibold text-[#00B14F]">
                Agregar<br />categoría
              </div>
            </div>

            {/* 4. Agregar categoría */}
            <div className="flex flex-col items-center text-center flex-1 min-w-0 cursor-pointer active:scale-95 transition">
              <div className="w-[68px] h-[68px] rounded-full border-[2.5px] border-[#50d28b] bg-white flex justify-center items-center mb-[8px] relative overflow-hidden">
                <div className="absolute w-[50px] h-[50px] rounded-full bg-[#E9FAF0]" />
                <svg className="w-[34px] h-[34px] stroke-[#00B14F] stroke-[2.5] stroke-linecap-round relative z-[2] pointer-events-none" viewBox="0 0 24 24">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
              </div>
              <div className="text-[11.5px] leading-[1.2] font-semibold text-[#00B14F]">
                Agregar<br />categoría
              </div>
            </div>
          </div>

          {/* Sombra Divisoria */}
          <div className="h-[14px] bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.12)_0%,transparent_75%)] mb-0" />

          {/* Botón Revisar mis categorías */}
          <button
            type="button"
            className="bg-[#00B14F] text-white border-none flex justify-center items-center h-[35px] w-[calc(100%-200px)] mx-auto -mt-[10px] mb-[15px] rounded-b-[8px] text-[14px] font-bold cursor-pointer shadow-[0_4px_10px_rgba(0,181,81,0.2)] active:scale-95 transition"
          >
            Revisar mis categorías
          </button>

          {/* Acciones Rápidas (Ver datos, Condiciones de mi cuenta, Google Play) */}
          <div className="flex gap-[12px] px-[20px] items-start">
            <div className="flex-1 flex flex-col items-center cursor-pointer active:scale-95 transition">
              <div className="w-full bg-white rounded-[10px] py-[15px] flex justify-center items-center shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-[#f0f0f0] mb-[8px]">
                <img src="/img/datos.webp" alt="Datos" className="w-[28px] h-[28px] object-contain pointer-events-none" />
              </div>
              <div className="text-[11.5px] text-black text-center leading-[1.2] font-medium">
                Ver datos
              </div>
            </div>

            <div className="flex-1 flex flex-col items-center cursor-pointer active:scale-95 transition">
              <div className="w-full bg-white rounded-[10px] py-[15px] flex justify-center items-center shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-[#f0f0f0] mb-[8px]">
                <img src="/img/condiciones.webp" alt="Condiciones" className="w-[28px] h-[28px] object-contain pointer-events-none" />
              </div>
              <div className="text-[11.5px] text-black text-center leading-[1.2] font-medium">
                Condiciones<br />de mi cuenta
              </div>
            </div>

            <div className="flex-1 flex flex-col items-center cursor-pointer active:scale-95 transition">
              <div className="w-full bg-white rounded-[10px] py-[15px] flex justify-center items-center shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-[#f0f0f0] mb-[8px]">
                <img src="/img/google.webp" alt="Google Play" className="w-[28px] h-[28px] object-contain pointer-events-none" />
              </div>
              <div className="text-[11.5px] text-black text-center leading-[1.2] font-medium">
                Google Play
              </div>
            </div>
          </div>
        </div>

        {/* ==================================================
            SECCIÓN MOVIMIENTOS (Tarjetón Blanco sobre Fondo Verde Claro)
            ================================================== */}
        <div className="bg-white rounded-[8px] mx-[20px] mb-[30px] shadow-[0_2px_12px_rgba(0,0,0,0.08)] border border-[#f0f0f0] min-h-[450px] pb-[20px] flex flex-col">
          {/* Pestañas Movimientos */}
          <div className="flex border-b border-[#f0f0f0]">
            <div
              onClick={() => setActiveTab("movimientos")}
              className={`flex-1 text-center py-[18px] text-[14px] font-bold cursor-pointer transition ${
                activeTab === "movimientos"
                  ? "text-[#00B14F] border-b-[2.5px] border-[#00B14F]"
                  : "text-[#666]"
              }`}
            >
              Movimientos
            </div>
            <div
              onClick={() => setActiveTab("alcancia")}
              className={`flex-1 text-center py-[18px] text-[14px] font-bold cursor-pointer transition ${
                activeTab === "alcancia"
                  ? "text-[#00B14F] border-b-[2.5px] border-[#00B14F]"
                  : "text-[#666]"
              }`}
            >
              Movimientos alcancía
            </div>
          </div>

          {/* Estado Vacío / Lista de Movimientos Directa (Sin Skeleton) */}
          {movements.length === 0 ? (
            <div className="flex-1 flex flex-col justify-center items-center py-[40px] px-[20px] my-auto">
              <img
                src="/img/box-movements.webp"
                alt="Sin movimientos"
                className="w-[140px] h-[140px] object-contain mb-[20px] pointer-events-none"
              />
              <div className="text-[15px] text-black font-bold text-center leading-normal">
                No tienes ningún movimiento<br />registrado
              </div>
            </div>
          ) : (
            <div className="flex flex-col px-[20px] py-[5px]">
              {movements.map((mov, idx) => {
                const title = mov.tipo || mov.title || "Transferencia";
                const dateText = mov.fechaCorta
                  ? `${mov.fechaCorta} | ${mov.horaCorta || ""}`
                  : mov.subtitle || mov.date || "Fecha reciente";
                const rawAmount = mov.monto || mov.amount || "0.00";
                const cleanAmount = rawAmount.toString().replace(/^-/, "");

                return (
                  <div
                    key={mov.id || idx}
                    onClick={() => {
                      setSelectedMovement(mov);
                      setIsDetailOpen(true);
                    }}
                    className="flex justify-between items-center py-[18px] border-b border-[#f0f0f0] cursor-pointer active:bg-gray-50 transition"
                  >
                    <div className="flex flex-col gap-[5px] min-w-0 pr-3">
                      <div className="text-[14px] font-bold text-[#111] truncate">{title}</div>
                      <div className="text-[12px] text-[#888]">{dateText}</div>
                    </div>
                    <div className="flex items-center gap-[10px] flex-shrink-0">
                      <div className="text-[14px] font-semibold text-[#000]">
                        {account.curr} -{cleanAmount}
                      </div>
                      <div className="text-[#00B14F] font-bold text-[16px]">›</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ==================================================
          MODAL DETALLE DE MOVIMIENTO (Fondo Verde Oficial)
          ================================================== */}
      {isDetailOpen && selectedMovement && (
        <div className="fixed inset-0 bg-[#00B14F] z-[99999] flex flex-col justify-between animate-slideUp">
          <div className="bg-white rounded-b-[16px] mx-[12px] pt-[20px] px-[20px] pb-[30px] flex flex-col items-center shadow-[0_4px_15px_rgba(0,0,0,0.1)]">
            {/* Header del modal con botón atrás */}
            <div className="w-full flex items-center mb-[10px]">
              <button
                type="button"
                onClick={() => setIsDetailOpen(false)}
                className="bg-transparent border-none cursor-pointer text-[#00B14F] p-[5px] -ml-[5px] active:scale-90 transition"
              >
                <svg className="w-[24px] h-[24px] stroke-[#00B14F] stroke-[2.5] fill-none stroke-linecap-round stroke-linejoin-round" viewBox="0 0 24 24">
                  <line x1="19" y1="12" x2="5" y2="12"></line>
                  <polyline points="12 19 5 12 12 5"></polyline>
                </svg>
              </button>
            </div>

            <div className="text-[14.5px] text-[#001e60] font-semibold mb-[10px] text-center w-full -mt-[30px]">
              Detalle de movimiento
            </div>

            {/* Monto Grande y Checkmark */}
            <div className="flex items-center justify-center gap-[8px] mb-[5px] w-full">
              <div className="text-[38px] font-extrabold text-[#001e60] tracking-[-1px]">
                {account.curr} -{(selectedMovement.monto || selectedMovement.amount || "0.00").toString().replace(/^-/, "")}
              </div>
              <div className="w-[22px] h-[22px] bg-[#00B14F] rounded-full flex justify-center items-center text-white text-[12px] font-bold">
                ✓
              </div>
            </div>

            <div className="text-[12px] text-[#888] mb-[30px] text-center">
              {selectedMovement.fechaCorta && selectedMovement.horaCorta
                ? `${selectedMovement.fechaCorta} | ${selectedMovement.horaCorta}`
                : selectedMovement.date || "Fecha reciente"}
            </div>

            {/* Filas de Información Oficial */}
            <div className="w-full mb-[15px] text-left">
              <div className="text-[13px] text-[#888] mb-[2px]">Tipo de operación</div>
              <div className="text-[14px] text-[#333] font-semibold">
                {selectedMovement.tipo || selectedMovement.title || "Transferencia"}
              </div>
            </div>

            <div className="w-full mb-[15px] text-left">
              <div className="text-[13px] text-[#888] mb-[2px]">Fecha del proceso</div>
              <div className="text-[14px] text-[#333] font-semibold">
                {selectedMovement.fechaCompleta || selectedMovement.date || "Procesado"}
              </div>
            </div>

            <div className="w-full text-left">
              <div className="text-[13px] text-[#888] mb-[2px]">Origen</div>
              <div className="text-[14px] text-[#333] font-semibold">
                Gest De Procesos Tc
              </div>
            </div>
          </div>

          {/* Botones Compartir y Descargar */}
          <div className="mt-auto p-[20px] flex flex-col gap-[15px]">
            <button
              type="button"
              onClick={() => {
                if (typeof navigator !== "undefined" && navigator.share) {
                  navigator.share({
                    title: "Detalle de movimiento",
                    text: `${selectedMovement.tipo || selectedMovement.title}: ${account.curr} -${(selectedMovement.monto || selectedMovement.amount || "0.00").toString().replace(/^-/, "")}`,
                  }).catch(() => {});
                }
              }}
              className="bg-white text-[#00B14F] border-none w-full p-[16px] rounded-[8px] text-[15px] font-bold flex justify-center items-center gap-[8px] cursor-pointer shadow active:scale-[0.98] transition"
            >
              <span>Compartir</span>
              <svg className="w-4 h-4 stroke-[#00B14F] stroke-2 fill-none" viewBox="0 0 24 24">
                <circle cx="18" cy="5" r="3"></circle>
                <circle cx="6" cy="12" r="3"></circle>
                <circle cx="18" cy="19" r="3"></circle>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
              </svg>
            </button>

            <button
              type="button"
              onClick={() => setIsDetailOpen(false)}
              className="bg-transparent text-white border-[1.5px] border-white w-full p-[16px] rounded-[8px] text-[15px] font-bold flex justify-center items-center gap-[8px] cursor-pointer active:scale-[0.98] transition"
            >
              <span>Descargar</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
