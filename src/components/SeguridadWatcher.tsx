"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";

export default function SeguridadWatcher() {
  const pathname = usePathname();
  const router = useRouter();

  // Estados para los dos modales de seguridad
  const [modalSesionCerrada, setModalSesionCerrada] = useState(false);
  const [modalCuentaInactiva, setModalCuentaInactiva] = useState(false);
  const [inactivoDisplayName, setInactivoDisplayName] = useState("Usuario");

  const expulsarUsuario = async () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("pase_vip_ibk");
      localStorage.removeItem("sesion_iniciada");
      localStorage.removeItem("sesion_token_ibk");
    }
    try {
      await signOut(auth);
    } catch (e) {
      console.error("Error cerrando sesión:", e);
    }
    if (typeof window !== "undefined") {
      window.location.href = "/";
    }
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    const esPuertaPrincipal = pathname === "/config" || pathname.startsWith("/config");
    const esIndex = pathname === "/" || pathname === "";

    let unsubscribeSnapshot: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (user: User | null) => {
      // 1. Si NO hay usuario logueado
      if (!user) {
        if (!esIndex) {
          // Si no está en el index y no hay usuario autenticado, expulsar
          expulsarUsuario();
        }
        return;
      }

      // 2. REGLA SALVAVIDAS: Si estamos en el Index, el Vigilante NO interviene.
      // Solo verifica si el usuario ya era VIP para mandarlo directo al PIN.
      if (esIndex) {
        if (
          localStorage.getItem("pase_vip_ibk") === "true" ||
          localStorage.getItem("sesion_iniciada") === "true"
        ) {
          router.replace("/login_pin");
        }
        return;
      }

      // Solo vigilar estrictamente en la puerta principal (config) exactamente como en el seguridad.js original
      if (!esPuertaPrincipal) return;

      // 3. LÓGICA DE PUERTAS PRINCIPALES (Vigilancia Estricta con onSnapshot)
      const miTicket = localStorage.getItem("sesion_token_ibk");

      try {
        const userRef = doc(db, "clientes_ibk", user.email || "");

        unsubscribeSnapshot = onSnapshot(userRef, (userSnap) => {
          if (!userSnap.exists()) {
            expulsarUsuario();
            return;
          }

          const userData = userSnap.data();

          // Detección de doble dispositivo / cambio de token
          if (userData.sesion_token && miTicket && userData.sesion_token !== miTicket) {
            setModalSesionCerrada(true);
            if (unsubscribeSnapshot) {
              unsubscribeSnapshot();
              unsubscribeSnapshot = null;
            }
            return;
          }

          if (userData.estado === "activo") {
            localStorage.setItem("pase_vip_ibk", "true");
            setModalCuentaInactiva(false);
          } else {
            setInactivoDisplayName(user.displayName || "Usuario");
            setModalCuentaInactiva(true);
            localStorage.removeItem("pase_vip_ibk");
          }
        });
      } catch (error) {
        console.error("Error en vigilancia de seguridad:", error);
        expulsarUsuario();
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
      }
    };
  }, [pathname, router]);

  // Si no hay modal activo, no renderiza nada en la vista
  if (!modalSesionCerrada && !modalCuentaInactiva) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/85 z-[10000] flex justify-center items-center backdrop-blur-[5px] select-none p-4">
      {/* Modal 1: Sesión Cerrada por otro dispositivo */}
      {modalSesionCerrada && (
        <div className="bg-white w-[85%] max-w-[320px] rounded-[20px] p-[30px_20px] text-center shadow-[0_15px_35px_rgba(0,0,0,0.4)] animate-slideUp">
          <i
            className="fa-solid fa-right-from-bracket text-[55px] text-[#ef4444] mb-5 block"
            style={{ fontSize: "55px", color: "#ef4444" }}
          ></i>
          <div className="text-[20px] font-bold text-[#333] mb-3">Sesión Cerrada</div>
          <div className="text-[14px] text-[#666] mb-[25px] leading-relaxed">
            Tu sesión se ha cerrado por actividad en otro dispositivo.
          </div>
          <button
            type="button"
            onClick={expulsarUsuario}
            className="w-full p-[15px] rounded-[15px] text-[16px] font-bold text-white bg-[#ef4444] border-none cursor-pointer active:scale-95 transition"
          >
            Entendido
          </button>
        </div>
      )}

      {/* Modal 2: Cuenta Inactiva */}
      {modalCuentaInactiva && !modalSesionCerrada && (
        <div className="bg-white w-[85%] max-w-[320px] rounded-[20px] p-[30px_20px] text-center shadow-[0_15px_35px_rgba(0,0,0,0.4)] animate-slideUp">
          <i
            className="fa-solid fa-circle-user text-[55px] text-[#00b551] mb-5 block"
            style={{ fontSize: "55px", color: "#00b551" }}
          ></i>
          <div className="text-[20px] font-bold text-[#333] mb-3">¡Cuenta no activada!</div>
          <div className="text-[14px] text-[#666] mb-[25px] leading-relaxed">
            Hola <strong>{inactivoDisplayName}</strong>, tu acceso a Interbank Premium se encuentra{" "}
            <strong>inactivo</strong>. Contacta a soporte.
          </div>
          <a
            href="https://t.me/MaikolEsleiter"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full p-[15px] rounded-[15px] text-[16px] font-bold text-white bg-[#00b551] border-none cursor-pointer block text-center mb-3 no-underline active:scale-95 transition"
          >
            Contactar Soporte
          </a>
          <button
            type="button"
            onClick={expulsarUsuario}
            className="bg-transparent border-none text-[#888] text-[14px] font-semibold cursor-pointer active:underline"
          >
            Volver al inicio
          </button>
        </div>
      )}
    </div>
  );
}
