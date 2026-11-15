"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function WelcomePage() {
  const router = useRouter();

  const [showInstallScreen, setShowInstallScreen] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);
  const [showInactiveModal, setShowInactiveModal] = useState(false);
  const [userDisplayName, setUserDisplayName] = useState("Usuario");
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  useEffect(() => {
    // Si ya tiene sesión iniciada, enviar directo al login_pin
    if (typeof window !== "undefined") {
      if (localStorage.getItem("sesion_iniciada") === "true") {
        router.replace("/login_pin");
        return;
      }

      // Comprobar si ya está instalada o es standalone
      const isStandalone =
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as unknown as { standalone?: boolean }).standalone === true;

      if (!isStandalone) {
        setShowInstallScreen(true);
      }
    }
  }, [router]);

  const handleGoogleAuth = async () => {
    setIsGoogleLoading(true);

    try {
      // Intentar importar dinámicamente firebase si está disponible
      const { auth, db } = await import("@/lib/firebase");
      const { GoogleAuthProvider, signInWithPopup } = await import("firebase/auth");
      const { doc, getDoc, setDoc, updateDoc } = await import("firebase/firestore");

      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      setUserDisplayName(user.displayName || "Usuario");

      const userRef = doc(db, "clientes_ibk", user.email || "anonimo");
      const userSnap = await getDoc(userRef);

      const ticketSesion = "token_" + Date.now() + "_" + Math.floor(Math.random() * 10000);
      localStorage.setItem("sesion_token_ibk", ticketSesion);

      if (!userSnap.exists()) {
        // Nuevo: Guardamos datos, animamos y bloqueamos
        await setDoc(userRef, {
          nombre: user.displayName,
          email: user.email,
          estado: "inactivo",
          fecha: new Date().toISOString(),
          sesion_token: ticketSesion,
        });

        // Mostrar animación de avión y luego modal inactivo
        setShowSuccessOverlay(true);
        setTimeout(() => {
          setShowSuccessOverlay(false);
          setShowInactiveModal(true);
          setIsGoogleLoading(false);
        }, 3500);
      } else {
        await updateDoc(userRef, { sesion_token: ticketSesion });
        const userData = userSnap.data();

        if (userData?.estado === "activo") {
          localStorage.setItem("sesion_iniciada", "true");
          router.replace("/login_pin");
        } else {
          setShowInactiveModal(true);
          setIsGoogleLoading(false);
        }
      }
    } catch (error) {
      console.warn("Autenticación con Firebase fallback:", error);
      // Fallback local en caso de que no haya conexión a Firebase o sea cerrado por el usuario
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#F2F4F7] text-[#0039A6] flex flex-col justify-center items-center p-5 overflow-hidden select-none">
      {/* ==================================================
          FORMAS GEOMÉTRICAS DE FONDO
          ================================================== */}
      <div className="absolute -top-[100px] -left-[100px] w-[350px] h-[350px] bg-[#00B551] rounded-full flex justify-center items-center z-0 pointer-events-none shadow-sm">
        <img
          src="/img/secondlogo.png"
          alt="AppsReborn"
          className="w-[140px] mt-20 ml-20 object-contain"
        />
      </div>

      <div className="absolute -top-[80px] -right-[80px] w-[200px] h-[200px] bg-[#00B551] rounded-full flex justify-center items-center z-0 pointer-events-none shadow-sm">
        <img
          src="/img/icon.webp"
          alt="Logo"
          className="w-10 rounded-lg mt-14 mr-14 object-contain"
        />
      </div>

      {/* ==================================================
          PANTALLA DE INSTALACIÓN (PWA)
          ================================================== */}
      {showInstallScreen && (
        <div className="fixed inset-0 bg-[#F2F4F7] z-[9999] flex flex-col justify-center items-center p-5">
          {/* Formas repetidas */}
          <div className="absolute -top-[100px] -left-[100px] w-[350px] h-[350px] bg-[#00B551] rounded-full flex justify-center items-center z-0 pointer-events-none">
            <img
              src="/img/secondlogo.png"
              alt="AppsReborn"
              className="w-[140px] mt-20 ml-20 object-contain"
            />
          </div>
          <div className="absolute -top-[80px] -right-[80px] w-[200px] h-[200px] bg-[#00B551] rounded-full flex justify-center items-center z-0 pointer-events-none">
            <img
              src="/img/icon.webp"
              alt="Logo"
              className="w-10 rounded-lg mt-14 mr-14 object-contain"
            />
          </div>

          <div className="text-[22px] font-extrabold text-[#001E60] text-center leading-snug z-10 mb-8 mt-10">
            Antes de continuar;
            <br />
            instala la app en tu
            <br />
            dispositivo:
          </div>

          <div className="bg-white p-5 rounded-[16px] shadow-[0_4px_20px_rgba(0,0,0,0.06)] w-full max-w-[320px] flex flex-col gap-3.5 z-10">
            <button
              type="button"
              onClick={() => setShowInstallScreen(false)}
              className="btn-relief-green py-3.5 px-4 text-[15px] font-bold text-white flex items-center justify-center gap-2 cursor-pointer"
            >
              <i className="fa-solid fa-download"></i>
              Instalar ahora
            </button>
            <button
              type="button"
              onClick={() => setShowInstallScreen(false)}
              className="bg-transparent text-[#888888] text-[13.5px] font-semibold underline text-center cursor-pointer pt-1"
            >
              Omitir por ahora
            </button>
          </div>
        </div>
      )}

      {/* ==================================================
          CONTENIDO PANTALLA DE BIENVENIDA
          ================================================== */}
      <div className="text-[20px] font-extrabold text-[#001E60] text-center leading-snug z-10 relative mt-20 mb-8 max-w-[280px]">
        ¡Bienvenido!
        <br />
        Tenemos funciones nuevas
        <br />y mejoradas para ti...
      </div>

      {/* Caja de Acciones con relieve iOS */}
      <div className="bg-white p-5 rounded-[18px] shadow-[0_6px_25px_rgba(0,0,0,0.06)] border border-gray-100 w-full max-w-[320px] flex flex-col gap-3.5 z-10 relative">
        {/* Continuar con Google */}
        <button
          type="button"
          onClick={handleGoogleAuth}
          disabled={isGoogleLoading}
          className="btn-relief-card py-3.5 px-4 text-[15px] font-bold text-[#333333] flex items-center justify-center gap-3 cursor-pointer"
        >
          {isGoogleLoading ? (
            <i className="fa-solid fa-spinner fa-spin text-[16px]"></i>
          ) : (
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg"
              alt="G"
              className="w-5 h-5 object-contain"
            />
          )}
          <span>{isGoogleLoading ? "Conectando..." : "Continuar con Google"}</span>
        </button>

        {/* Obtén acceso */}
        <a
          href="https://t.me/vendedoresappsreborn"
          className="btn-relief-green py-3.5 px-4 text-[15px] font-bold text-white flex items-center justify-center gap-2.5 cursor-pointer no-underline"
        >
          <i className="fa-brands fa-telegram text-[18px]"></i>
          Obtén acceso
        </a>

        {/* Comprar acceso */}
        <a
          href="https://www.appsreborn.shop/"
          target="_blank"
          rel="noreferrer"
          className="btn-relief-blue py-3.5 px-4 text-[15px] font-bold text-white flex items-center justify-center gap-2.5 cursor-pointer no-underline"
        >
          <i className="fa-solid fa-cart-shopping text-[17px]"></i>
          Comprar acceso
        </a>
      </div>

      {/* Footer Links */}
      <div className="absolute bottom-8 w-full flex justify-center gap-5 text-[13.5px] font-semibold text-[#0039A6] z-10 opacity-80">
        <button
          type="button"
          onClick={() => setShowTermsModal(true)}
          className="bg-transparent border-none p-0 text-[#0039A6] hover:opacity-100 cursor-pointer"
        >
          Términos y Condiciones
        </button>
        <a
          href="https://t.me/MaikolEsleiter"
          target="_blank"
          rel="noreferrer"
          className="text-[#0039A6] hover:opacity-100 no-underline"
        >
          Centro de Ayuda
        </a>
      </div>

      {/* ==================================================
          MODAL TÉRMINOS Y CONDICIONES
          ================================================== */}
      {showTermsModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[2000] flex justify-center items-center p-5">
          <div className="bg-white text-[#333333] w-full max-w-[340px] rounded-[20px] p-6 text-center shadow-[0_15px_35px_rgba(0,0,0,0.2)] animate-slideUp">
            <div className="text-[18px] font-extrabold text-[#0039A6] mb-3">
              Términos y Condiciones
            </div>
            <div className="text-[13.5px] text-[#555555] leading-relaxed text-left mb-5">
              <strong className="block mb-2 text-[#333333]">Lee atentamente esto:</strong>
              El personal de administración no se hace responsable del mal uso de la app. No hay
              devoluciones ni cargos a enfrentar.
              <span className="block mt-3 p-3 bg-[#ffebee] border border-[#ffcdd2] rounded-[10px] text-[#d32f2f] text-[12.5px] font-bold">
                <i className="fa-solid fa-triangle-exclamation mr-1.5"></i>
                NO TOLERAMOS el uso de varios dispositivos enlazados. Si compartes acceso, tu cuenta
                quedará BANEADA DE FORMA PERMANENTE.
              </span>
              <span className="block mt-2 text-[#666]">
                Tendrás que comprar otro acceso para remediar eso. Avisados están.
              </span>
              <span className="block text-[11.5px] text-[#888888] font-bold text-center mt-3">
                Desarrollador/Dev: @MaikolEsleiter
              </span>
            </div>
            <a
              href="https://t.me/appsreborn"
              target="_blank"
              rel="noreferrer"
              className="w-full bg-[#229ED9] text-white py-3 px-4 rounded-[12px] font-bold text-[14.5px] flex items-center justify-center gap-2 mb-2.5 no-underline shadow-sm"
            >
              <i className="fa-brands fa-telegram text-[17px]"></i>
              Grupo Oficial
            </a>
            <button
              type="button"
              onClick={() => setShowTermsModal(false)}
              className="w-full bg-[#F0F4F8] text-[#0039A6] py-3 px-4 rounded-[12px] font-extrabold text-[14.5px] cursor-pointer active:bg-gray-200 transition"
            >
              Entendido
            </button>
          </div>
        </div>
      )}

      {/* ==================================================
          OVERLAY DE ÉXITO (AVIONCITO VERDE)
          ================================================== */}
      {showSuccessOverlay && (
        <div className="fixed inset-0 bg-[#00B551] z-[3000] flex flex-col justify-center items-center text-white text-center p-6 animate-fadeIn">
          <i className="fa-solid fa-paper-plane text-[65px] mb-6 animate-bounce"></i>
          <div className="text-[24px] font-extrabold mb-3 tracking-tight">¡Solicitud enviada!</div>
          <div className="text-[15px] font-medium leading-relaxed max-w-[280px] opacity-95">
            Si ya adquiriste tu acceso, te aprobaremos pronto. Verificando...
          </div>
        </div>
      )}

      {/* ==================================================
          MODAL DE CUENTA NO ACTIVADA
          ================================================== */}
      {showInactiveModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-[5px] z-[10000] flex justify-center items-center p-5">
          <div className="bg-white w-[88%] max-w-[320px] rounded-[24px] p-7 text-center shadow-[0_15px_35px_rgba(0,0,0,0.4)] animate-slideUp">
            <i className="fa-solid fa-circle-user text-[55px] text-[#00B551] mb-4 inline-block"></i>
            <div className="text-[20px] font-bold text-[#333333] mb-3">¡Cuenta no activada!</div>
            <div className="text-[13.5px] text-[#666666] leading-relaxed mb-6">
              Hola <strong>{userDisplayName}</strong>, tu acceso al ibk se encuentra{" "}
              <strong className="text-[#d32f2f]">inactivo</strong>. Contacta a soporte para
              validarlo.
            </div>
            <a
              href="https://t.me/MaikolEsleiter"
              target="_blank"
              rel="noreferrer"
              className="btn-relief-green py-3.5 px-4 text-[15px] font-bold text-white block text-center mb-3 no-underline"
            >
              Contactar Soporte
            </a>
            <button
              type="button"
              onClick={() => setShowInactiveModal(false)}
              className="bg-transparent border-none text-[#888888] text-[13.5px] font-semibold cursor-pointer"
            >
              Volver al inicio
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
