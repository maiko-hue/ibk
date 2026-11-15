"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";

interface AccountData {
  id: string;
  name: string;
  curr: string;
  bal: string;
  icon: string;
  subtitle: string;
}

const DEFAULTS = {
  acc1: { name: "Cuenta Simple Soles", curr: "S/", bal: "1000.00" },
  acc2: { name: "Cuenta Simple Dolares", curr: "$", bal: "1000.00" },
};

export default function InicioPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"operaciones" | "productos">("operaciones");
  const [isBalancesHidden, setIsBalancesHidden] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  const [accounts, setAccounts] = useState<AccountData[]>([
    {
      id: "1",
      name: DEFAULTS.acc1.name,
      curr: DEFAULTS.acc1.curr,
      bal: DEFAULTS.acc1.bal,
      icon: "/img/cuenta_ahorro.png",
      subtitle: "Saldo disponible",
    },
    {
      id: "2",
      name: DEFAULTS.acc2.name,
      curr: DEFAULTS.acc2.curr,
      bal: DEFAULTS.acc2.bal,
      icon: "/img/cuenta_ahorro.png",
      subtitle: "Saldo disponible",
    },
  ]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const acc1Name = localStorage.getItem("ibk_acc1_name") || DEFAULTS.acc1.name;
      const acc1Curr = localStorage.getItem("ibk_acc1_curr") || DEFAULTS.acc1.curr;
      const acc1Bal = localStorage.getItem("ibk_acc1_bal") || DEFAULTS.acc1.bal;

      const acc2Name = localStorage.getItem("ibk_acc2_name") || DEFAULTS.acc2.name;
      const acc2Curr = localStorage.getItem("ibk_acc2_curr") || DEFAULTS.acc2.curr;
      const acc2Bal = localStorage.getItem("ibk_acc2_bal") || DEFAULTS.acc2.bal;

      setAccounts([
        {
          id: "1",
          name: acc1Name,
          curr: acc1Curr,
          bal: acc1Bal,
          icon: "/img/cuenta_ahorro.png",
          subtitle: "Saldo disponible",
        },
        {
          id: "2",
          name: acc2Name,
          curr: acc2Curr,
          bal: acc2Bal,
          icon: "/img/cuenta_ahorro.png",
          subtitle: "Saldo disponible",
        },
      ]);
    }
  }, []);

  const formatBalance = (amountStr: string) => {
    const num = parseFloat(amountStr) || 0;
    return num.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const toggleBalances = () => {
    setIsBalancesHidden(!isBalancesHidden);
  };

  const handleTabChange = (tab: "operaciones" | "productos") => {
    setActiveTab(tab);
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-[#00B14F] text-[#333333] select-none relative overflow-hidden">
      {/* ==================================================
          HEADER VERDE INICIO
          ================================================== */}
      <header className="bg-[#00B14F] px-4 pt-3 pb-7 flex justify-between items-center text-white z-10 flex-shrink-0">
        <button
          type="button"
          onClick={() => router.push("/config")}
          className="bg-[#038A36] rounded-full w-[38px] h-[38px] flex items-center justify-center text-white border-none active:scale-95 transition cursor-pointer pointer-events-auto"
        >
          <svg className="w-5 h-5 stroke-white fill-none stroke-[2.5] pointer-events-none" viewBox="0 0 24 24">
            <path strokeLinecap="round" d="M3 12h18M3 6h18M3 18h18" />
          </svg>
        </button>

        {/* LOGO OFICIAL INTERBANK */}
        <div className="flex-1 flex justify-center items-center px-2">
          <img
            src="/img/logo.svg"
            alt="Interbank"
            className="w-full max-w-[170px] h-[46px] object-contain drop-shadow-sm pointer-events-none"
          />
        </div>

        <button
          type="button"
          className="bg-transparent border-none p-1 flex items-center justify-center active:scale-95 transition"
        >
          <svg className="w-6 h-6 stroke-white fill-none stroke-[2.5]" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"
            />
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
        </button>
      </header>

      {/* ==================================================
          PESTAÑAS (TABS) - EXACTAS A INICIO.HTML
          ================================================== */}
      <div className="flex bg-white rounded-t-[20px] -mt-5 pt-1.5 z-20 flex-shrink-0 shadow-[0_4px_10px_rgba(0,0,0,0.03)]">
        <button
          type="button"
          onClick={() => handleTabChange("operaciones")}
          className={`flex-1 text-center py-[15px] text-[14px] font-bold transition-all border-b-[3px] ${
            activeTab === "operaciones"
              ? "text-[#002D72] border-[#002D72]"
              : "text-[#666666] border-[#E5E5E5]"
          }`}
        >
          Mis operaciones
        </button>

        <button
          type="button"
          onClick={() => handleTabChange("productos")}
          className={`flex-1 text-center py-[15px] text-[14px] font-bold transition-all border-b-[3px] ${
            activeTab === "productos"
              ? "text-[#002D72] border-[#002D72]"
              : "text-[#666666] border-[#E5E5E5]"
          }`}
        >
          Mis productos
        </button>
      </div>

      {/* ==================================================
          CONTENEDOR SCROLL CON DESLIZAMIENTO PERFECTO
          ================================================== */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto no-scrollbar bg-white pb-24 overscroll-contain"
        style={{ scrollbarWidth: "none" }}
      >
        {/* ==================================================
            VISTA 1: MIS OPERACIONES
            ================================================== */}
        <div className={activeTab === "operaciones" ? "block" : "hidden"}>
          {/* T.C. Referencial */}
          <div className="text-center text-[11px] text-[#888888] pt-3.5 pb-1">
            T.C. referencial: Compra: 3.323 | Venta: 3.474
          </div>

          {/* Grid de Operaciones (4 columnas) */}
          <div className="grid grid-cols-4 gap-y-4 gap-x-2 px-3 py-3">
            {/* 1. Plin */}
            <Link href="/trcontac" className="flex flex-col items-center text-center group no-underline">
              <div className="w-[54px] h-[54px] rounded-[16px] bg-white border-[1.5px] border-[#F0F0F0] flex items-center justify-center shadow-[0_4px_10px_rgba(0,0,0,0.04)] mb-2 relative group-active:scale-95 transition">
                <img src="/img/plin.png" alt="Plin" className="w-[30px] h-[30px] object-contain pointer-events-none" />
              </div>
              <div className="text-[11px] font-semibold text-[#333333] leading-tight">
                Plinear
              </div>
            </Link>

            {/* 2. Transferir */}
            <div className="flex flex-col items-center text-center cursor-pointer group">
              <div className="w-[54px] h-[54px] rounded-[16px] bg-white border-[1.5px] border-[#F0F0F0] flex items-center justify-center shadow-[0_4px_10px_rgba(0,0,0,0.04)] mb-2 relative group-active:scale-95 transition">
                <img
                  src="/img/transferencias.png"
                  alt="Transferir"
                  className="w-[30px] h-[30px] object-contain pointer-events-none"
                />
              </div>
              <div className="text-[11px] font-semibold text-[#333333] leading-tight">
                Transferir dinero
              </div>
            </div>

            {/* 3. Servicios */}
            <div
              onClick={() => router.push('/serv')}
              className="flex flex-col items-center text-center cursor-pointer group"
            >
              <div className="w-[54px] h-[54px] rounded-[16px] bg-white border-[1.5px] border-[#F0F0F0] flex items-center justify-center shadow-[0_4px_10px_rgba(0,0,0,0.04)] mb-2 relative group-active:scale-95 transition">
                <img
                  src="/img/servicios.png"
                  alt="Servicios"
                  className="w-[30px] h-[30px] object-contain pointer-events-none"
                />
              </div>
              <div className="text-[11px] font-semibold text-[#333333] leading-tight">
                Pagar servicios
              </div>
            </div>

            {/* 4. Ver datos de tarjeta */}
            <div className="flex flex-col items-center text-center cursor-pointer group">
              <div className="w-[54px] h-[54px] rounded-[16px] bg-white border-[1.5px] border-[#F0F0F0] flex items-center justify-center shadow-[0_4px_10px_rgba(0,0,0,0.04)] mb-2 relative group-active:scale-95 transition">
                <img
                  src="/img/ver_datos.png"
                  alt="Ver datos"
                  className="w-[30px] h-[30px] object-contain pointer-events-none"
                />
                <div className="absolute -top-2 -right-2 bg-[#002D72] text-white text-[8.5px] font-extrabold px-[6px] py-[2px] rounded-full border border-white">
                  Nuevo
                </div>
              </div>
              <div className="text-[11px] font-semibold text-[#333333] leading-tight">
                Ver datos de tarjeta
              </div>
            </div>

            {/* 5. Recargas */}
            <div className="flex flex-col items-center text-center cursor-pointer group">
              <div className="w-[54px] h-[54px] rounded-[16px] bg-white border-[1.5px] border-[#F0F0F0] flex items-center justify-center shadow-[0_4px_10px_rgba(0,0,0,0.04)] mb-2 relative group-active:scale-95 transition">
                <img
                  src="/img/recargas.png"
                  alt="Recargas"
                  className="w-[30px] h-[30px] object-contain pointer-events-none"
                />
              </div>
              <div className="text-[11px] font-semibold text-[#333333] leading-tight">
                Recargar celular
              </div>
            </div>

            {/* 6. Transporte */}
            <div className="flex flex-col items-center text-center cursor-pointer group">
              <div className="w-[54px] h-[54px] rounded-[16px] bg-white border-[1.5px] border-[#F0F0F0] flex items-center justify-center shadow-[0_4px_10px_rgba(0,0,0,0.04)] mb-2 relative group-active:scale-95 transition">
                <img
                  src="/img/retiros.jpg"
                  alt="Transporte"
                  className="w-[30px] h-[30px] object-contain pointer-events-none"
                />
              </div>
              <div className="text-[11px] font-semibold text-[#333333] leading-tight">
                Recargar transporte
              </div>
            </div>

            {/* 7. Agregar producto */}
            <div className="flex flex-col items-center text-center cursor-pointer group">
              <div className="w-[54px] h-[54px] rounded-[16px] bg-white border-[1.5px] border-[#F0F0F0] flex items-center justify-center shadow-[0_4px_10px_rgba(0,0,0,0.04)] mb-2 relative group-active:scale-95 transition">
                <img
                  src="/cuenta_credito.png"
                  alt="Agregar producto"
                  className="w-[30px] h-[30px] object-contain pointer-events-none"
                />
              </div>
              <div className="text-[11px] font-semibold text-[#333333] leading-tight">
                Agregar producto
              </div>
            </div>

            {/* 8. Ver más */}
            <div className="flex flex-col items-center text-center cursor-pointer group">
              <div className="w-[54px] h-[54px] rounded-[16px] bg-white border-[1.5px] border-[#F0F0F0] flex items-center justify-center shadow-[0_4px_10px_rgba(0,0,0,0.04)] mb-2 relative group-active:scale-95 transition">
                <img
                  src="/img/ver_mas.png"
                  alt="Ver más"
                  className="w-[30px] h-[30px] object-contain pointer-events-none"
                />
              </div>
              <div className="text-[11px] font-semibold text-[#333333] leading-tight">
                Ver más opciones
              </div>
            </div>
          </div>

          {/* Shared Bottom Section */}
          <SharedBottom />
        </div>

        {/* ==================================================
            VISTA 2: MIS PRODUCTOS
            ================================================== */}
        <div className={activeTab === "productos" ? "block" : "hidden"}>
          {/* Card Header Bar */}
          <div className="flex justify-between items-center py-4 px-4 border-b-2 border-[#F0F0F0]">
            <div className="flex items-center gap-2 text-[13.5px] font-bold text-[#333333]">
              <img src="/img/ver_datos_2.png" alt="Card" className="w-5 h-5 object-contain pointer-events-none" />
              Ver datos de tarjeta
            </div>
            <div className="flex items-center gap-3">
              <button type="button" className="p-0 border-none bg-transparent">
                <img src="/img/lapiz2.svg" alt="Edit" className="w-7 h-7 object-contain cursor-pointer pointer-events-none" />
              </button>
              <button
                type="button"
                onClick={toggleBalances}
                className="p-0 border-none bg-transparent"
              >
                <img
                  src={isBalancesHidden ? "/img/ojocerrado.svg" : "/img/ojoabierto.svg"}
                  alt="Toggle Eye"
                  className="w-7 h-7 object-contain cursor-pointer pointer-events-none"
                />
              </button>
            </div>
          </div>

          {/* Accounts List */}
          <div className="px-4 divide-y divide-[#F0F0F0]">
            {accounts.map((account) => (
              <div
                key={account.id}
                onClick={() => router.push(`/infoc?id=${account.id}`)}
                className="flex items-center py-3.5 cursor-pointer active:bg-gray-50 transition"
              >
                <div className="w-[36px] h-[36px] rounded-full bg-[#FED7E4] flex items-center justify-center mr-3.5 flex-shrink-0 overflow-hidden">
                  <img
                    src={account.icon}
                    alt={account.name}
                    className="w-[22px] h-[22px] object-contain pointer-events-none"
                  />
                </div>
                <div className="flex-1">
                  <div className="text-[13px] font-semibold text-[#333333] mb-0.5">{account.name}</div>
                  <div className="text-[16px] font-extrabold text-[#333333] mb-0.5 tracking-[0.5px]">
                    {isBalancesHidden ? (
                      `${account.curr} ••••••••`
                    ) : (
                      `${account.curr} ${formatBalance(account.bal)}`
                    )}
                  </div>
                  <div className="text-[11px] text-[#666666]">{account.subtitle}</div>
                </div>
                <div className="text-[18px] text-[#CCCCCC] font-bold">›</div>
              </div>
            ))}

            {/* Inversiones */}
            <div className="flex items-center py-3.5 cursor-pointer active:bg-gray-50 transition">
              <div className="w-[36px] h-[36px] rounded-full bg-[#FEECD7] flex items-center justify-center mr-3.5 flex-shrink-0 overflow-hidden">
                <img
                  src="/img/cuenta_inversion.png"
                  alt="Inversiones"
                  className="w-[22px] h-[22px] object-contain pointer-events-none"
                />
              </div>
              <div className="flex-1">
                <div className="text-[13px] font-semibold text-[#333333] mb-0.5">Mis Inversiones</div>
                <div className="text-[11px] text-[#666666]">Explorar productos</div>
              </div>
              <div className="text-[18px] text-[#CCCCCC] font-bold">›</div>
            </div>
          </div>

          {/* Agregar nuevo producto (Dashed) */}
          <div className="mx-4 my-3 border-2 border-dashed border-[#E0E0E0] rounded-[12px] p-4 flex items-center gap-4 cursor-pointer active:scale-[0.99] transition hover:bg-[#fafafa]">
            <div className="text-[22px] font-bold text-[#333333] flex items-center justify-center">
              +
            </div>
            <div>
              <div className="text-[13px] font-bold text-[#333333] mb-0.5">Agregar nuevo producto</div>
              <div className="text-[11px] text-[#666666]">Obtén una cuenta, tarjeta y más.</div>
            </div>
          </div>

          {/* Shared Bottom Section */}
          <SharedBottom />
        </div>
      </div>

      {/* ==================================================
          BOTTOM NAV & BOTÓN FLOTANTE QR EXACTO A INICIO.HTML
          ================================================== */}
      <BottomNav activeTab="inicio" onInicioClick={() => handleTabChange("operaciones")} />
    </div>
  );
}

function SharedBottom() {
  return (
    <div className="px-4 py-5">
      {/* Pills (Whatsapp & Millas) */}
      <div className="flex gap-2.5 mb-6">
        <button
          type="button"
          className="flex-1 bg-[#EBF8F2] text-[#00B14F] flex items-center justify-center gap-1.5 py-3 px-2 rounded-full text-[12px] font-bold active:scale-[0.98] transition whitespace-nowrap min-w-0"
        >
          <img src="/img/whatsapp.png" alt="WA" className="w-6 h-6 object-contain flex-shrink-0 pointer-events-none" />
          <span className="truncate">¡Plinea por Whatsapp aquí!</span>
        </button>
        <button
          type="button"
          className="flex-1 bg-[#EBF8F2] text-[#00B14F] flex items-center justify-center gap-1.5 py-3 px-2 rounded-full text-[12px] font-bold active:scale-[0.98] transition whitespace-nowrap min-w-0"
        >
          <img src="/img/millas.png" alt="Millas" className="w-6 h-6 object-contain flex-shrink-0 pointer-events-none" />
          <span className="truncate">Millas Benefit</span>
        </button>
      </div>

      {/* Banner Mis Finanzas */}
      <div className="mb-6">
        <div className="text-[16px] font-extrabold text-[#333333] mb-3">Mis finanzas</div>
        <div className="rounded-[16px] overflow-hidden shadow-sm">
          <img
            src="/img/banner_finanzas.png"
            alt="Mis Finanzas"
            className="w-full object-cover rounded-[16px] pointer-events-none"
          />
        </div>
      </div>
    </div>
  );
}
