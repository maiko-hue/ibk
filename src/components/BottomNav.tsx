"use client";

import React from "react";
import { useRouter } from "next/navigation";

interface BottomNavProps {
  activeTab?: "inicio" | "movimientos" | "beneficios" | "para_ti";
  onInicioClick?: () => void;
}

export default function BottomNav({
  activeTab = "inicio",
  onInicioClick,
}: BottomNavProps) {
  const router = useRouter();

  const handleInicio = () => {
    if (onInicioClick) {
      onInicioClick();
    } else {
      router.push("/inicio");
    }
  };

  const handleMovimientos = () => {
    router.push("/infoc");
  };

  const handleQR = () => {
    router.push("/trcontac");
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-[480px] mx-auto bg-white flex justify-around items-center pt-2.5 pb-4 px-1 shadow-[0_-4px_15px_rgba(0,0,0,0.05)] z-50 select-none">
      {/* 1. Inicio */}
      <button
        type="button"
        onClick={handleInicio}
        className={`flex flex-col items-center flex-1 transition ${
          activeTab === "inicio" ? "text-[#015A1A] relative" : "text-[#434446] hover:text-[#015A1A]"
        }`}
      >
        {activeTab === "inicio" && (
          <span className="absolute -top-[10px] left-1/2 -translate-x-1/2 w-[35px] h-[4px] bg-[#015A1A] rounded-[2px]"></span>
        )}
        <svg className="w-5 h-5 fill-current mb-1" viewBox="0 0 24 24">
          <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
        </svg>
        <span className="text-[10px] font-bold">Inicio</span>
      </button>

      {/* 2. Movimientos (Icono original de transferencia de flechas) */}
      <button
        type="button"
        onClick={handleMovimientos}
        className={`flex flex-col items-center flex-1 transition ${
          activeTab === "movimientos" ? "text-[#015A1A] relative" : "text-[#434446] hover:text-[#015A1A]"
        }`}
      >
        {activeTab === "movimientos" && (
          <span className="absolute -top-[10px] left-1/2 -translate-x-1/2 w-[35px] h-[4px] bg-[#015A1A] rounded-[2px]"></span>
        )}
        <svg className="w-5 h-5 mb-1 stroke-current fill-none stroke-2" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8 7h12m0 0l-4-4m4 4l-4 4m4 6H4m0 0l4 4m-4-4l4-4"
          />
        </svg>
        <span className="text-[10px] font-bold">Movimientos</span>
      </button>

      {/* 3. Centro: QR Flotante azul con imagen qr.png oficial */}
      <div className="flex flex-col items-center flex-1 relative -top-5">
        <div
          onClick={handleQR}
          className="w-[55px] h-[55px] rounded-full bg-[#0137AB] flex items-center justify-center text-white shadow-[0_4px_10px_rgba(1,55,171,0.4)] border-4 border-white active:scale-95 transition cursor-pointer"
        >
          <img
            src="/img/qr.png"
            alt="QR"
            className="w-[26px] h-[26px] object-contain pointer-events-none"
          />
        </div>
      </div>

      {/* 4. Beneficios */}
      <button
        type="button"
        className={`flex flex-col items-center flex-1 transition ${
          activeTab === "beneficios" ? "text-[#015A1A] relative" : "text-[#434446] hover:text-[#015A1A]"
        }`}
      >
        {activeTab === "beneficios" && (
          <span className="absolute -top-[10px] left-1/2 -translate-x-1/2 w-[35px] h-[4px] bg-[#015A1A] rounded-[2px]"></span>
        )}
        <img
          src="/img/beneficios.webp"
          alt="Beneficios"
          className="w-5 h-5 object-contain mb-1 grayscale opacity-60 mix-blend-multiply pointer-events-none"
        />
        <span className="text-[10px] font-bold">Beneficios</span>
      </button>

      {/* 5. Para ti */}
      <button
        type="button"
        className={`flex flex-col items-center flex-1 transition ${
          activeTab === "para_ti" ? "text-[#015A1A] relative" : "text-[#434446] hover:text-[#015A1A]"
        }`}
      >
        {activeTab === "para_ti" && (
          <span className="absolute -top-[10px] left-1/2 -translate-x-1/2 w-[35px] h-[4px] bg-[#015A1A] rounded-[2px]"></span>
        )}
        <img
          src="/img/para_ti.webp"
          alt="Para ti"
          className="w-5 h-5 object-contain mb-1 grayscale opacity-60 mix-blend-multiply pointer-events-none"
        />
        <span className="text-[10px] font-bold">Para ti</span>
      </button>
    </nav>
  );
}
