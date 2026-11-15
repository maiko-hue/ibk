"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BALANCE_UPDATED_EVENT } from "@/lib/fakeNotification";

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
  accountId?: string;
  opCode?: string;
  accountName?: string;
  phone?: string;
  message?: string;
  tipo?: string;
  monto?: string;
  senderName?: string;
  isFakeNoti?: boolean;
  operationType?: string;
  fechaCorta?: string;
  horaCorta?: string;
  fechaCompleta?: string;
}

const DEFAULTS = {
  acc1: {
    id: "1",
    name: "Cuenta Simple Soles",
    curr: "S/",
    bal: "1000.00",
    num: "1912 0589 5108 88",
    cci: "0021 9100 2058 9510 8812",
  },
  acc2: {
    id: "2",
    name: "Cuenta Simple Dolares",
    curr: "US$",
    bal: "1000.00",
    num: "1912 0589 5662 25",
    cci: "0021 9100 2058 9566 2515",
  },
  acc3: {
    id: "3",
    name: "Cuenta de Ahorros",
    curr: "S/",
    bal: "1000.00",
    num: "1911 1111 1111 11",
    cci: "0021 9111 1111 1100 0000",
  },
};

function formatAccountNum(val: string) {
  if (!val) return "";
  const cleaned = val.replace(/\s+/g, "");
  const parts = cleaned.match(/.{1,4}/g);
  return parts ? parts.join(" ") : val;
}

function formatBalance(val: string) {
  const num = parseFloat((val || "0").replace(/,/g, ""));
  if (isNaN(num)) return "0.00";
  return num.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function InfocView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialAccountId = searchParams.get("id") || "1";

  const [currentAccountId, setCurrentAccountId] = useState<string>(initialAccountId);
  const [account, setAccount] = useState<AccountDetail>(
    initialAccountId === "2"
      ? DEFAULTS.acc2
      : initialAccountId === "3"
      ? DEFAULTS.acc3
      : DEFAULTS.acc1
  );

  const [activeTab, setActiveTab] = useState<"movimientos" | "alcancia">("movimientos");
  const [movements, setMovements] = useState<Movimiento[]>([]);
  const [selectedMovement, setSelectedMovement] = useState<Movimiento | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Selector de Cuentas (Flecha abajo en tarjeta principal)
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [allAccounts, setAllAccounts] = useState<AccountDetail[]>([]);

  // Función para cargar los movimientos de una cuenta específica
  const loadMovementsForAccount = (accId: string) => {
    try {
      const rawMovs =
        localStorage.getItem("ibk_movimientos") ||
        localStorage.getItem("ibk_global_movements") ||
        "[]";
      const parsed: Movimiento[] = JSON.parse(rawMovs);
      const filtered = (Array.isArray(parsed) ? parsed : []).filter((m) => {
        if (m.accountId) {
          return String(m.accountId) === String(accId);
        }
        if (m.accountName) {
          const accLower = m.accountName.toLowerCase();
          if (accId === "1") {
            return (
              accLower.includes("soles") ||
              (!accLower.includes("dolar") &&
                !accLower.includes("dólar") &&
                !accLower.includes("ahorro") &&
                !accLower.includes("invers"))
            );
          } else if (accId === "2") {
            return accLower.includes("dolar") || accLower.includes("dólar");
          } else if (accId === "3") {
            return accLower.includes("ahorro") || accLower.includes("invers");
          }
        }
        return accId === "1";
      });
      setMovements(filtered);
    } catch (e) {
      console.error("Error al cargar movimientos:", e);
    }
  };

  // Función para cargar los datos de una cuenta activa
  const loadAccountData = (accId: string) => {
    const defaultData =
      accId === "2" ? DEFAULTS.acc2 : accId === "3" ? DEFAULTS.acc3 : DEFAULTS.acc1;
    const savedName = localStorage.getItem(`ibk_acc${accId}_name`) || defaultData.name;
    const savedCurr = localStorage.getItem(`ibk_acc${accId}_curr`) || defaultData.curr;
    const savedBal = localStorage.getItem(`ibk_acc${accId}_bal`) || defaultData.bal;
    const savedNum = formatAccountNum(localStorage.getItem(`ibk_acc${accId}_num`) || defaultData.num);
    const savedCci = formatAccountNum(localStorage.getItem(`ibk_acc${accId}_cci`) || defaultData.cci);

    setAccount({
      id: accId,
      name: savedName,
      curr: savedCurr,
      bal: savedBal,
      num: savedNum,
      cci: savedCci,
    });
    setCurrentAccountId(accId);
    loadMovementsForAccount(accId);
  };

  // Función para obtener las 3 cuentas del sistema
  const refreshAllAccounts = () => {
    const list: AccountDetail[] = (["1", "2", "3"] as const).map((id) => {
      const def = DEFAULTS[`acc${id}` as keyof typeof DEFAULTS];
      return {
        id,
        name: localStorage.getItem(`ibk_acc${id}_name`) || def.name,
        curr: localStorage.getItem(`ibk_acc${id}_curr`) || def.curr,
        bal: localStorage.getItem(`ibk_acc${id}_bal`) || def.bal,
        num: formatAccountNum(localStorage.getItem(`ibk_acc${id}_num`) || def.num),
        cci: formatAccountNum(localStorage.getItem(`ibk_acc${id}_cci`) || def.cci),
      };
    });
    setAllAccounts(list);
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      refreshAllAccounts();
      loadAccountData(initialAccountId);

      const handleBalanceUpdated = () => {
        refreshAllAccounts();
        loadAccountData(currentAccountId);
      };

      window.addEventListener(BALANCE_UPDATED_EVENT, handleBalanceUpdated);
      return () => {
        window.removeEventListener(BALANCE_UPDATED_EVENT, handleBalanceUpdated);
      };
    }
  }, [initialAccountId]);

  // Manejador al seleccionar una cuenta desde el modal
  const handleSelectAccount = (targetId: string) => {
    setIsAccountModalOpen(false);
    loadAccountData(targetId);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("id", targetId);
      window.history.replaceState({}, "", url.toString());
    }
  };

  const handleShareAccount = () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      navigator
        .share({
          title: account.name,
          text: `${account.name}\nNúmero de cuenta: ${account.num}\nCCI: ${account.cci}`,
        })
        .catch(() => {});
    } else if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(
        `${account.name}\nNúmero de cuenta: ${account.num}\nCCI: ${account.cci}`
      );
    }
  };

  return (
    <div className="h-[100dvh] flex flex-col bg-[#EAF7F3] text-[#333] select-none overflow-hidden">
      {/* HEADER EXACTO AL ORIGINAL */}
      <header className="flex justify-between items-center px-5 py-3.5 bg-white border-b border-[#f0f0f0] flex-shrink-0 z-20">
        <button
          type="button"
          onClick={() => router.push("/inicio")}
          className="w-[30px] h-[30px] flex items-center justify-center bg-transparent border-none cursor-pointer active:scale-90 transition p-0"
        >
          <svg className="w-[20px] h-[20px] stroke-[#00B14F] stroke-[2.5] fill-none stroke-linecap-round stroke-linejoin-round pointer-events-none" viewBox="0 0 24 24">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
        <div className="text-[15px] font-extrabold text-black flex-grow text-center ml-4">
          Mi Cuenta
        </div>
        <div className="flex items-center gap-[15px]">
          <img
            src="/img/for_you.jpg"
            alt="Para ti"
            className="w-[24px] h-[24px] object-contain pointer-events-none"
          />
          <svg className="w-[20px] h-[20px] stroke-[#00B14F] stroke-2 fill-none stroke-linecap-round stroke-linejoin-round pointer-events-none" viewBox="0 0 24 24">
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
            <div
              onClick={() => setIsAccountModalOpen(true)}
              className="flex-1 min-w-0 cursor-pointer"
            >
              <div className="text-[13px] font-bold text-black leading-[1.2] truncate">
                {account.name}
              </div>
              <div className="text-[11.5px] text-[#666] mt-[2px]">
                {account.num}
              </div>
            </div>
            <div className="flex items-center gap-[6px]">
              {/* Icono Compartir */}
              <button
                type="button"
                onClick={handleShareAccount}
                className="w-[30px] h-[30px] rounded-full flex items-center justify-center bg-transparent hover:bg-gray-100 active:scale-90 transition border-none cursor-pointer p-0"
                title="Compartir cuenta"
              >
                <svg className="w-[18px] h-[18px] stroke-[#00B14F] stroke-[2.5] fill-none stroke-linecap-round stroke-linejoin-round" viewBox="0 0 24 24">
                  <circle cx="18" cy="5" r="3"></circle>
                  <circle cx="6" cy="12" r="3"></circle>
                  <circle cx="18" cy="19" r="3"></circle>
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                </svg>
              </button>

              {/* Icono Flecha Abajo (Selector de Cuentas) */}
              <button
                type="button"
                onClick={() => setIsAccountModalOpen((prev) => !prev)}
                className="w-[30px] h-[30px] rounded-full flex items-center justify-center bg-transparent hover:bg-gray-100 active:scale-90 transition border-none cursor-pointer p-0"
                title="Cambiar de cuenta"
              >
                <svg
                  className={`w-[18px] h-[18px] stroke-[#00B14F] stroke-[2.5] fill-none stroke-linecap-round stroke-linejoin-round transition-transform duration-200 ${
                    isAccountModalOpen ? "rotate-180" : ""
                  }`}
                  viewBox="0 0 24 24"
                >
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>
            </div>
          </div>

          {/* Saldos: Saldo Disponible y Mi Alcancía */}
          <div className="flex justify-between px-[25px] pt-[5px] pb-[10px]">
            <div className="flex flex-col">
              <div className="text-[18px] font-bold text-[#0039A6] tracking-[-0.5px]">
                {account.curr} {formatBalance(account.bal)}
              </div>
              <div className="text-[10.5px] text-[#555] mt-[2px] font-medium">Saldo disponible</div>
            </div>
            <div className="flex flex-col items-end">
              <div className="text-[18px] font-bold text-[#0039A6] tracking-[-0.5px]">
                {account.curr} 0.00
              </div>
              <div className="text-[10.5px] text-[#555] mt-[2px] font-medium">Mi alcancía</div>
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
            <div className="relative flex-1 max-w-[215px] h-[40px] bg-[#0039A6] rounded-[25px] flex justify-between items-center px-[15px] mx-[15px] text-white/80 text-[13px] font-bold tracking-[2px] shadow-inner">
              <span>&lt; &lt; &lt;</span>
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[66px] h-[66px] bg-white rounded-full flex items-center justify-center z-[1]">
                <div className="w-[44px] h-[44px] bg-[#00B14F] rounded-full flex items-center justify-center text-white font-extrabold text-[16px] z-[2] shadow-[0_0_15px_4px_rgba(0,181,81,0.4)]">
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
              <div className="w-[64px] h-[64px] rounded-full border-[2px] border-[#50d28b] bg-white flex justify-center items-center mb-[8px] relative overflow-hidden shadow-[0_0_15px_3px_rgba(0,181,81,0.35)]">
                <div className="absolute w-[48px] h-[48px] rounded-full bg-[#C6E3F7]" />
                <img
                  src="/img/pig-bg.png"
                  alt="Pig"
                  className="w-[34px] h-[34px] object-cover rounded-full relative z-[2] pointer-events-none"
                />
              </div>
              <div className="text-[10.5px] leading-[1.2] font-semibold text-[#001e60]">
                {account.curr} 0<br />Mi alcancía
              </div>
            </div>

            {/* 2. Agregar categoría */}
            <div className="flex flex-col items-center text-center flex-1 min-w-0 cursor-pointer active:scale-95 transition">
              <div className="w-[64px] h-[64px] rounded-full border-[2px] border-[#50d28b] bg-white flex justify-center items-center mb-[8px] relative overflow-hidden">
                <div className="absolute w-[48px] h-[48px] rounded-full bg-[#E9FAF0]" />
                <svg className="w-[30px] h-[30px] stroke-[#00B14F] stroke-[2.5] stroke-linecap-round relative z-[2] pointer-events-none" viewBox="0 0 24 24">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
              </div>
              <div className="text-[10.5px] leading-[1.2] font-semibold text-[#00B14F]">
                Agregar<br />categoría
              </div>
            </div>

            {/* 3. Agregar categoría */}
            <div className="flex flex-col items-center text-center flex-1 min-w-0 cursor-pointer active:scale-95 transition">
              <div className="w-[64px] h-[64px] rounded-full border-[2px] border-[#50d28b] bg-white flex justify-center items-center mb-[8px] relative overflow-hidden">
                <div className="absolute w-[48px] h-[48px] rounded-full bg-[#E9FAF0]" />
                <svg className="w-[30px] h-[30px] stroke-[#00B14F] stroke-[2.5] stroke-linecap-round relative z-[2] pointer-events-none" viewBox="0 0 24 24">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
              </div>
              <div className="text-[10.5px] leading-[1.2] font-semibold text-[#00B14F]">
                Agregar<br />categoría
              </div>
            </div>

            {/* 4. Agregar categoría */}
            <div className="flex flex-col items-center text-center flex-1 min-w-0 cursor-pointer active:scale-95 transition">
              <div className="w-[64px] h-[64px] rounded-full border-[2px] border-[#50d28b] bg-white flex justify-center items-center mb-[8px] relative overflow-hidden">
                <div className="absolute w-[48px] h-[48px] rounded-full bg-[#E9FAF0]" />
                <svg className="w-[30px] h-[30px] stroke-[#00B14F] stroke-[2.5] stroke-linecap-round relative z-[2] pointer-events-none" viewBox="0 0 24 24">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
              </div>
              <div className="text-[10.5px] leading-[1.2] font-semibold text-[#00B14F]">
                Agregar<br />categoría
              </div>
            </div>
          </div>

          {/* Sombra Divisoria */}
          <div className="h-[14px] bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.12)_0%,transparent_75%)] mb-0" />

          {/* Botón Revisar mis categorías */}
          <button
            type="button"
            className="bg-[#00B14F] text-white border-none flex justify-center items-center h-[34px] w-[calc(100%-200px)] mx-auto -mt-[10px] mb-[15px] rounded-b-[8px] text-[13px] font-bold cursor-pointer shadow-[0_4px_10px_rgba(0,181,81,0.2)] active:scale-95 transition"
          >
            Revisar mis categorías
          </button>

          {/* Acciones Rápidas (Ver datos, Condiciones de mi cuenta, Google Play) */}
          <div className="flex gap-[12px] px-[20px] items-start">
            <div className="flex-1 flex flex-col items-center cursor-pointer active:scale-95 transition">
              <div className="w-full bg-white rounded-[10px] py-[13px] flex justify-center items-center shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-[#f0f0f0] mb-[6px]">
                <img src="/img/datos.webp" alt="Datos" className="w-[26px] h-[26px] object-contain pointer-events-none" />
              </div>
              <div className="text-[11px] text-black text-center leading-[1.2] font-medium">
                Ver datos
              </div>
            </div>

            <div className="flex-1 flex flex-col items-center cursor-pointer active:scale-95 transition">
              <div className="w-full bg-white rounded-[10px] py-[13px] flex justify-center items-center shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-[#f0f0f0] mb-[6px]">
                <img src="/img/condiciones.webp" alt="Condiciones" className="w-[26px] h-[26px] object-contain pointer-events-none" />
              </div>
              <div className="text-[11px] text-black text-center leading-[1.2] font-medium">
                Condiciones<br />de mi cuenta
              </div>
            </div>

            <div className="flex-1 flex flex-col items-center cursor-pointer active:scale-95 transition">
              <div className="w-full bg-white rounded-[10px] py-[13px] flex justify-center items-center shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-[#f0f0f0] mb-[6px]">
                <img src="/img/google.webp" alt="Google Play" className="w-[26px] h-[26px] object-contain pointer-events-none" />
              </div>
              <div className="text-[11px] text-black text-center leading-[1.2] font-medium">
                Google Play
              </div>
            </div>
          </div>
        </div>

        {/* ==================================================
            SECCIÓN MOVIMIENTOS (Tarjetón Blanco sobre Fondo Verde Claro)
            ================================================== */}
        <div className="bg-white rounded-[8px] mx-[20px] mb-[30px] shadow-[0_2px_12px_rgba(0,0,0,0.08)] border border-[#f0f0f0] min-h-[420px] pb-[16px] flex flex-col">
          {/* Pestañas Movimientos */}
          <div className="flex border-b border-[#f0f0f0]">
            <div
              onClick={() => setActiveTab("movimientos")}
              className={`flex-1 text-center py-[13px] text-[13px] font-bold cursor-pointer transition ${
                activeTab === "movimientos"
                  ? "text-[#00B14F] border-b-[2.5px] border-[#00B14F]"
                  : "text-[#666]"
              }`}
            >
              Movimientos
            </div>
            <div
              onClick={() => setActiveTab("alcancia")}
              className={`flex-1 text-center py-[13px] text-[13px] font-bold cursor-pointer transition ${
                activeTab === "alcancia"
                  ? "text-[#00B14F] border-b-[2.5px] border-[#00B14F]"
                  : "text-[#666]"
              }`}
            >
              Movimientos alcancía
            </div>
          </div>

          {/* En movimientos de alcancía SIEMPRE aparece sin movimientos */}
          {activeTab === "alcancia" ? (
            <div className="flex-1 flex flex-col justify-center items-center py-[35px] px-[20px] my-auto">
              <img
                src="/img/box-movements.webp"
                alt="Sin movimientos"
                className="w-[110px] h-[110px] object-contain mb-[15px] pointer-events-none"
              />
              <div className="text-[13px] text-black font-bold text-center leading-normal">
                No tienes ningún movimiento<br />registrado
              </div>
            </div>
          ) : movements.length === 0 ? (
            <div className="flex-1 flex flex-col justify-center items-center py-[35px] px-[20px] my-auto">
              <img
                src="/img/box-movements.webp"
                alt="Sin movimientos"
                className="w-[110px] h-[110px] object-contain mb-[15px] pointer-events-none"
              />
              <div className="text-[13px] text-black font-bold text-center leading-normal">
                No tienes ningún movimiento<br />registrado
              </div>
            </div>
          ) : (
            <div className="flex flex-col px-[18px] py-[3px]">
              {movements.map((mov, idx) => {
                const isFakeNoti =
                  mov.isFakeNoti === true ||
                  mov.tipo === "plin_in" ||
                  mov.tipo === "Pago a contactos" ||
                  (typeof mov.amount === "string" && mov.amount.includes("+")) ||
                  mov.subtitle === "Plineo recibido";

                // En vez de "plin_in" tiene que salir el nombre del remitente
                let title = mov.title;
                if (!title || title === "plin_in") {
                  title = mov.senderName || (mov.tipo && mov.tipo !== "plin_in" ? mov.tipo : "Hernan Torres Vargas");
                }

                const dateText = mov.fechaCorta
                  ? `${mov.fechaCorta} | ${mov.horaCorta || ""}`
                  : mov.subtitle || mov.date || "Fecha reciente";

                // Si viene de la noti falsa, SOLO debe mostrar el signo "+" (ej: S/ +25.00), NUNCA "-+"
                // Si es un egreso o pago normal (como SEDAPAL), muestra "-" (ej: S/ -120.00)
                const rawAmount = (mov.monto || mov.amount || "0.00").toString();
                const cleanAmount = rawAmount.replace(/^[+-]+/, "");
                const displaySign = isFakeNoti ? `+${cleanAmount}` : `-${cleanAmount}`;

                return (
                  <div
                    key={mov.id || idx}
                    onClick={() => {
                      setSelectedMovement(mov);
                      setIsDetailOpen(true);
                    }}
                    className="flex justify-between items-center py-[13px] border-b border-[#f0f0f0] cursor-pointer active:bg-gray-50 transition"
                  >
                    <div className="flex flex-col gap-[3px] min-w-0 pr-3">
                      <div className="text-[13px] font-bold text-[#111] truncate">{title}</div>
                      <div className="text-[11px] text-[#777]">{dateText}</div>
                    </div>
                    <div className="flex items-center gap-[8px] flex-shrink-0">
                      <div className="text-[13px] font-bold text-[#000]">
                        {account.curr} {displaySign}
                      </div>
                      <div className="text-[#00B14F] font-bold text-[15px]">›</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ==================================================
          MODAL / BOTTOM SHEET DE CAMBIO DE CUENTA (3 CUENTAS)
          ================================================== */}
      {isAccountModalOpen && (
        <div
          className="fixed inset-0 bg-black/45 backdrop-blur-xs z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={() => setIsAccountModalOpen(false)}
        >
          <div
            className="bg-white w-full sm:max-w-[420px] rounded-t-[24px] sm:rounded-[24px] p-5 shadow-[0_-10px_30px_rgba(0,0,0,0.15)] flex flex-col animate-slideUp max-h-[85vh] overflow-y-auto no-scrollbar"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Tirador táctil */}
            <div className="w-10 h-1 bg-[#D1D5DB] rounded-full mx-auto mb-3 sm:hidden" />

            <div className="flex items-center justify-between mb-4 px-1">
              <div>
                <span className="text-[16px] font-bold text-[#111111] block">
                  Mis Cuentas
                </span>
                <span className="text-[11.5px] text-[#666666]">
                  Selecciona una cuenta para ver sus movimientos
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsAccountModalOpen(false)}
                className="w-7 h-7 rounded-full bg-[#F1F5F9] text-[#64748B] hover:text-[#0F172A] flex items-center justify-center text-[12px] font-bold border-none cursor-pointer transition active:scale-95"
              >
                ✕
              </button>
            </div>

            {/* Lista de las 3 Cuentas del Sistema */}
            <div className="flex flex-col gap-2.5">
              {allAccounts.map((acc) => {
                const isSelected = String(acc.id) === String(account.id);
                return (
                  <div
                    key={acc.id}
                    onClick={() => handleSelectAccount(acc.id)}
                    className={`flex items-center justify-between p-3.5 rounded-[14px] border cursor-pointer transition active:scale-[0.99] ${
                      isSelected
                        ? "border-[#00B14F] bg-[#F0FDF4] shadow-xs"
                        : "border-[#E5E7EB] bg-white hover:bg-[#F9FAFB]"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-[42px] h-[32px] rounded-[6px] overflow-hidden flex-shrink-0 shadow-xs border border-gray-100">
                        <img
                          src="/img/target.jpg"
                          alt="Cuenta"
                          className="w-full h-full object-cover pointer-events-none"
                        />
                      </div>
                      <div className="min-w-0">
                        <div
                          className={`text-[13px] font-bold truncate leading-tight ${
                            isSelected ? "text-[#00B14F]" : "text-[#111111]"
                          }`}
                        >
                          {acc.name}
                        </div>
                        <div className="text-[11px] text-[#666666] font-medium mt-0.5">
                          {acc.num}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 flex-shrink-0 pl-2">
                      <div className="text-right">
                        <div className="text-[13.5px] font-bold text-[#0039A6]">
                          {acc.curr} {formatBalance(acc.bal)}
                        </div>
                        <div className="text-[10px] text-[#888888]">Disponible</div>
                      </div>
                      {isSelected ? (
                        <div className="w-5 h-5 rounded-full bg-[#00B14F] flex items-center justify-center text-white text-[11px] font-bold shadow-xs">
                          ✓
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full border border-[#D1D5DB]" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ==================================================
          MODAL DETALLE DE MOVIMIENTO (Fondo Verde Oficial)
          ================================================== */}
      {isDetailOpen && selectedMovement && (() => {
        const isModalFakeNoti =
          selectedMovement.isFakeNoti === true ||
          selectedMovement.tipo === "plin_in" ||
          selectedMovement.tipo === "Pago a contactos" ||
          (typeof selectedMovement.amount === "string" && selectedMovement.amount.includes("+")) ||
          selectedMovement.subtitle === "Plineo recibido";

        const rawModalAmount = (selectedMovement.monto || selectedMovement.amount || "0.00").toString();
        const cleanModalAmount = rawModalAmount.replace(/^[+-]+/, "");
        const modalDisplaySign = isModalFakeNoti ? `+${cleanModalAmount}` : `-${cleanModalAmount}`;

        return (
          <div className="fixed inset-0 bg-[#00B14F] z-[99999] flex flex-col justify-between animate-slideUp">
            <div className="bg-white rounded-b-[16px] mx-[12px] pt-[20px] px-[20px] pb-[25px] flex flex-col items-center shadow-[0_4px_15px_rgba(0,0,0,0.1)]">
              {/* Header del modal con botón atrás */}
              <div className="w-full flex items-center mb-[10px]">
                <button
                  type="button"
                  onClick={() => setIsDetailOpen(false)}
                  className="bg-transparent border-none cursor-pointer text-[#00B14F] p-[5px] -ml-[5px] active:scale-90 transition"
                >
                  <svg className="w-[22px] h-[22px] stroke-[#00B14F] stroke-[2.5] fill-none stroke-linecap-round stroke-linejoin-round" viewBox="0 0 24 24">
                    <line x1="19" y1="12" x2="5" y2="12"></line>
                    <polyline points="12 19 5 12 12 5"></polyline>
                  </svg>
                </button>
              </div>

              <div className="text-[13.5px] text-[#001e60] font-semibold mb-[10px] text-center w-full -mt-[26px]">
                Detalle de movimiento
              </div>

              {/* Monto Grande y Checkmark: SOLO "+" cuando viene de noti falsa */}
              <div className="flex items-center justify-center gap-[8px] mb-[4px] w-full">
                <div className="text-[30px] font-extrabold text-[#001e60] tracking-[-0.5px]">
                  {account.curr} {modalDisplaySign}
                </div>
                <div className="w-[20px] h-[20px] bg-[#00B14F] rounded-full flex justify-center items-center text-white text-[11px] font-bold">
                  ✓
                </div>
              </div>

              <div className="text-[11px] text-[#888] mb-[24px] text-center">
                {selectedMovement.fechaCorta && selectedMovement.horaCorta
                  ? `${selectedMovement.fechaCorta} | ${selectedMovement.horaCorta}`
                  : selectedMovement.date || "Fecha reciente"}
              </div>

              {/* Filas de Información Oficial */}
              <div className="w-full mb-[12px] text-left">
                <div className="text-[11.5px] text-[#888] mb-[2px]">Tipo de operación</div>
                <div className="text-[13px] text-[#222] font-semibold">
                  {/* Tipo de operación estático "Pago a contactos" */}
                  Pago a contactos
                </div>
              </div>

              <div className="w-full mb-[12px] text-left">
                <div className="text-[11.5px] text-[#888] mb-[2px]">Fecha del proceso</div>
                <div className="text-[13px] text-[#222] font-semibold">
                  {selectedMovement.fechaCompleta || selectedMovement.date || "Procesado"}
                </div>
              </div>

              <div className="w-full text-left">
                <div className="text-[11.5px] text-[#888] mb-[2px]">Origen</div>
                <div className="text-[13px] text-[#222] font-semibold">
                  Gest De Procesos Tc
                </div>
              </div>
            </div>

            {/* Botones Compartir y Descargar */}
            <div className="mt-auto p-[18px] flex flex-col gap-[12px]">
              <button
                type="button"
                onClick={() => {
                  if (typeof navigator !== "undefined" && navigator.share) {
                    navigator
                      .share({
                        title: "Detalle de movimiento",
                        text: `Pago a contactos: ${account.curr} ${modalDisplaySign}`,
                      })
                      .catch(() => {});
                  }
                }}
                className="bg-white text-[#00B14F] border-none w-full p-[14px] rounded-[8px] text-[14px] font-bold flex justify-center items-center gap-[8px] cursor-pointer shadow active:scale-[0.98] transition"
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
                className="bg-transparent text-white border-[1.5px] border-white w-full p-[14px] rounded-[8px] text-[14px] font-bold flex justify-center items-center gap-[8px] cursor-pointer active:scale-[0.98] transition"
              >
                <span>Descargar</span>
              </button>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
