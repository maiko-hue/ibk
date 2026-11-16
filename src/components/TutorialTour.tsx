"use client";

import React, { useState, useEffect, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  TUTORIAL_STEPS,
  TUTORIAL_EVENT_NAME,
  isTutorialActive,
  isTutorialCompleted,
  getCurrentTutorialStep,
  setTutorialStep,
  startTutorial,
  finishTutorial,
  isMiniNotiActive,
  finishMiniNotiTutorial,
  MINI_TUTORIAL_EVENT_NAME,
} from "@/lib/tutorial";
import { getAppZoom, ZOOM_EVENT_NAME } from "@/lib/zoom";
import { executeFakePlinDeposit } from "@/lib/fakeNotification";

interface SpotlightRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export default function TutorialTour() {
  const router = useRouter();
  const pathname = usePathname();

  const [active, setActive] = useState<boolean>(false);
  const [miniNotiActive, setMiniNotiActive] = useState<boolean>(false);
  const [stepIndex, setStepIndex] = useState<number>(1);
  const [spotlight, setSpotlight] = useState<SpotlightRect | null>(null);
  const [zoomFactor, setZoomFactor] = useState<number>(1);

  const step = TUTORIAL_STEPS.find((s) => s.id === stepIndex) || TUTORIAL_STEPS[0];
  const totalSteps = TUTORIAL_STEPS.length;

  const isIndexOrAuthPage = pathname === "/" || pathname === "" || pathname === "/login_pin";

  // Auto-iniciar la primera vez SOLO cuando el usuario está en /inicio
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (isIndexOrAuthPage) {
      setActive(false);
      setMiniNotiActive(false);
      return;
    }

    const isMini = isMiniNotiActive();
    setMiniNotiActive(isMini);

    if (isMini) {
      setActive(false);
      if (pathname !== "/inicio") {
        router.push("/inicio");
      }
      return;
    }

    if (pathname === "/inicio") {
      const completed = isTutorialCompleted();
      const isAct = isTutorialActive();

      if (!completed && !isAct) {
        // Iniciar tutorial por primera vez solo cuando el usuario ya llegó a /inicio
        const timer = setTimeout(() => {
          startTutorial();
        }, 700);
        return () => clearTimeout(timer);
      } else if (isAct) {
        setActive(true);
        setStepIndex(getCurrentTutorialStep());
      }
    } else {
      const isAct = isTutorialActive();
      if (isAct) {
        setActive(true);
        setStepIndex(getCurrentTutorialStep());
      } else {
        setActive(false);
      }
    }
  }, [pathname, isIndexOrAuthPage, router]);

  // Escuchar cambios de zoom y eventos del tutorial / mini tutorial
  useEffect(() => {
    if (typeof window === "undefined") return;

    const updateZoom = () => {
      setZoomFactor(getAppZoom() / 100);
    };
    updateZoom();

    const handleTutorialEvent = (e: Event) => {
      const custom = e as CustomEvent<{ step: number; active: boolean }>;
      if (custom.detail) {
        setActive(custom.detail.active && !isIndexOrAuthPage && !isMiniNotiActive());
        if (custom.detail.step > 0) {
          setStepIndex(custom.detail.step);
        }
      } else {
        setActive(isTutorialActive() && !isIndexOrAuthPage && !isMiniNotiActive());
        setStepIndex(getCurrentTutorialStep());
      }
    };

    const handleMiniEvent = (e: Event) => {
      const custom = e as CustomEvent<{ active: boolean }>;
      const isMini = custom.detail ? custom.detail.active : isMiniNotiActive();
      setMiniNotiActive(isMini && !isIndexOrAuthPage);
      if (isMini) {
        setActive(false);
      }
    };

    window.addEventListener(TUTORIAL_EVENT_NAME, handleTutorialEvent);
    window.addEventListener(MINI_TUTORIAL_EVENT_NAME, handleMiniEvent);
    window.addEventListener(ZOOM_EVENT_NAME, updateZoom);
    window.addEventListener("resize", updateZoom);

    return () => {
      window.removeEventListener(TUTORIAL_EVENT_NAME, handleTutorialEvent);
      window.removeEventListener(MINI_TUTORIAL_EVENT_NAME, handleMiniEvent);
      window.removeEventListener(ZOOM_EVENT_NAME, updateZoom);
      window.removeEventListener("resize", updateZoom);
    };
  }, [isIndexOrAuthPage]);

  // Selector y ruta del paso o mini-tutorial activo
  const currentTargetSelector = miniNotiActive
    ? '[data-tour="inicio-bell-noti-btn"]'
    : active
    ? step.targetSelector
    : "";

  const currentTargetRoute = miniNotiActive
    ? "/inicio"
    : active
    ? step.route
    : "";

  // Actualizar posición del elemento objetivo
  const updateSpotlightPosition = useCallback(() => {
    const isShowing = (active || miniNotiActive) && !isIndexOrAuthPage;
    if (!isShowing || !currentTargetSelector) {
      setSpotlight(null);
      return;
    }

    // Solo medir si estamos en la ruta correcta del paso
    if (currentTargetRoute && pathname !== currentTargetRoute) {
      setSpotlight(null);
      return;
    }

    const el = document.querySelector(currentTargetSelector);
    if (!el) {
      setSpotlight(null);
      return;
    }

    // Centrar suavemente en pantalla
    el.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });

    const measure = () => {
      const target = document.querySelector(currentTargetSelector);
      if (!target) return;
      const raw = target.getBoundingClientRect();
      const z = getAppZoom() / 100;
      setSpotlight({
        top: raw.top / z,
        left: raw.left / z,
        width: raw.width / z,
        height: raw.height / z,
      });
    };

    // Medición inicial y refinamiento tras el scroll suave
    measure();
    const t1 = setTimeout(measure, 150);
    const t2 = setTimeout(measure, 350);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [active, miniNotiActive, isIndexOrAuthPage, currentTargetSelector, currentTargetRoute, pathname]);

  // Efecto del Mini Tutorial de Notificación
  useEffect(() => {
    if (!miniNotiActive || isIndexOrAuthPage) return;

    if (pathname !== "/inicio") {
      router.push("/inicio");
      return;
    }

    let attempts = 0;
    const interval = setInterval(() => {
      attempts++;
      const el = document.querySelector('[data-tour="inicio-bell-noti-btn"]');
      if (el) {
        updateSpotlightPosition();
        clearInterval(interval);
      }
      if (attempts > 20) clearInterval(interval);
    }, 100);

    // Si el usuario hace clic directamente en la campana, ejecutar y cerrar mini tutorial
    const bellEl = document.querySelector('[data-tour="inicio-bell-noti-btn"]');
    if (bellEl) {
      const handleBellClick = () => {
        setTimeout(() => {
          finishMiniNotiTutorial();
        }, 500);
      };
      bellEl.addEventListener("click", handleBellClick, { once: true });
    }

    return () => clearInterval(interval);
  }, [miniNotiActive, isIndexOrAuthPage, pathname, router, updateSpotlightPosition]);

  // Sincronización automática de ruta si el usuario navega a /sobre mientras estaba en el paso 8
  useEffect(() => {
    if (active && pathname === "/sobre" && stepIndex === 8) {
      setTutorialStep(9);
      setStepIndex(9);
    } else if (active && pathname === "/config" && stepIndex === 11) {
      setTutorialStep(12);
      setStepIndex(12);
    }
  }, [active, pathname, stepIndex]);

  // Manejar acciones del paso activo en la ruta actual
  useEffect(() => {
    if (!active || isIndexOrAuthPage || miniNotiActive) {
      if (!miniNotiActive) setSpotlight(null);
      return;
    }

    // Si no estamos en la ruta de este paso, no ejecutar acciones de este paso
    if (step.route && pathname !== step.route) {
      setSpotlight(null);
      return;
    }

    // Si el paso requiere subvista en /config
    if (step.subview && pathname === "/config") {
      window.dispatchEvent(
        new CustomEvent("ibk_tutorial_set_subview", {
          detail: { view: step.subview },
        })
      );
    }

    // Reintentar encontrar el elemento tras render
    let attempts = 0;
    const interval = setInterval(() => {
      attempts++;
      if (step.targetSelector) {
        const el = document.querySelector(step.targetSelector);
        if (el) {
          updateSpotlightPosition();
          clearInterval(interval);
        }
      } else {
        setSpotlight(null);
        clearInterval(interval);
      }
      if (attempts > 20) clearInterval(interval);
    }, 100);

    // Permitir avanzar si el usuario hace clic directamente en el elemento señalado
    if (step.targetSelector) {
      const el = document.querySelector(step.targetSelector);
      if (el) {
        const handleTargetClick = () => {
          setTimeout(() => {
            handleNext();
          }, 150);
        };
        el.addEventListener("click", handleTargetClick, { once: true });
      }
    }

    // Si el paso tiene acción interactiva automática
    if (step.actionType === "type_cuentas") {
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent("ibk_tutorial_type_cuentas"));
      }, 400);
    } else if (step.actionType === "type_contactos") {
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent("ibk_tutorial_type_contactos"));
      }, 500);
    } else if (step.actionType === "toggle_bot") {
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent("ibk_tutorial_toggle_bot"));
      }, 400);
    }

    return () => clearInterval(interval);
  }, [active, miniNotiActive, isIndexOrAuthPage, step, pathname, updateSpotlightPosition]);

  // Escuchar scroll para mantener el spotlight centrado
  useEffect(() => {
    const isShowing = (active || miniNotiActive) && !isIndexOrAuthPage;
    if (!isShowing) return;
    const handleScroll = () => {
      if (!currentTargetSelector) return;
      const target = document.querySelector(currentTargetSelector);
      if (!target) return;
      const raw = target.getBoundingClientRect();
      const z = getAppZoom() / 100;
      setSpotlight({
        top: raw.top / z,
        left: raw.left / z,
        width: raw.width / z,
        height: raw.height / z,
      });
    };
    window.addEventListener("scroll", handleScroll, true);
    return () => window.removeEventListener("scroll", handleScroll, true);
  }, [active, miniNotiActive, isIndexOrAuthPage, currentTargetSelector]);

  // Avanzar al siguiente paso (solo al hacer clic en Siguiente)
  const handleNext = () => {
    if (stepIndex >= totalSteps) {
      finishTutorial();
      return;
    }

    const nextStepNum = stepIndex + 1;
    const nextStep = TUTORIAL_STEPS.find((s) => s.id === nextStepNum);

    if (nextStep && nextStep.route && pathname !== nextStep.route) {
      router.push(nextStep.route);
    }

    setTutorialStep(nextStepNum);
  };

  const handleSkip = () => {
    finishTutorial();
  };

  // Si está inactivo o estamos en la página del index/login, no renderizar NADA
  if ((!active && !miniNotiActive) || isIndexOrAuthPage) return null;

  // Mini Tutorial de Notificación Falsa
  if (miniNotiActive) {
    if (pathname !== "/inicio") return null;

    return (
      <div className="fixed inset-0 z-[99990] pointer-events-none select-none">
        {/* 1. Fondo Oscuro con Recorte Spotlight en la Campana */}
        {spotlight ? (
          <div
            style={{
              position: "fixed",
              top: spotlight.top - 6,
              left: spotlight.left - 6,
              width: spotlight.width + 12,
              height: spotlight.height + 12,
              borderRadius: "14px",
              boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.60), 0 0 16px rgba(0, 177, 79, 0.45), inset 0 0 8px rgba(0, 177, 79, 0.15)",
              border: "2.5px solid #00B14F",
              pointerEvents: "none",
              transition: "top 0.45s cubic-bezier(0.22, 1, 0.36, 1), left 0.45s cubic-bezier(0.22, 1, 0.36, 1), width 0.45s cubic-bezier(0.22, 1, 0.36, 1), height 0.45s cubic-bezier(0.22, 1, 0.36, 1)",
            }}
          />
        ) : (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-[2px] pointer-events-auto transition-opacity duration-300" />
        )}

        {/* 2. Tarjeta del Mini Tutorial */}
        <div
          style={{
            position: "fixed",
            bottom: 24,
            left: "50%",
            transform: "translateX(-50%)",
            width: "calc(100% - 32px)",
            maxWidth: "340px",
            transition: "all 0.35s cubic-bezier(0.22, 1, 0.36, 1)",
          }}
          className="bg-white rounded-[20px] p-5 shadow-[0_12px_40px_rgba(0,0,0,0.25)] border border-[#E5E7EB] pointer-events-auto z-[99995] animate-fadeIn flex flex-col"
        >
          {/* Cabecera */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="bg-[#E8F8EE] text-[#00B14F] text-[11px] font-extrabold px-2.5 py-0.5 rounded-full">
                Prueba
              </span>
              <span className="text-[15px] font-extrabold text-[#111111] truncate">
                Simular notificación
              </span>
            </div>

            <button
              type="button"
              onClick={() => finishMiniNotiTutorial()}
              className="w-6 h-6 rounded-full bg-[#F3F4F6] text-[#6B7280] hover:text-[#111] flex items-center justify-center text-[11px] font-bold border-none cursor-pointer active:scale-90 transition p-0"
              title="Cerrar"
            >
              ✕
            </button>
          </div>

          {/* Mensaje exacto solicitado */}
          <p className="text-[13px] text-[#4B5563] leading-relaxed mb-4">
            Al clickear este icono recibiras una noti falsa, los datos varian segun tu configuracion
          </p>

          {/* Botones de acción */}
          <div className="flex items-center justify-between pt-2 border-t border-[#F3F4F6]">
            <button
              type="button"
              onClick={() => finishMiniNotiTutorial()}
              className="text-[13px] font-semibold text-[#888888] hover:text-[#111111] bg-transparent border-none cursor-pointer p-1 active:scale-95 transition"
            >
              Cerrar
            </button>

            <button
              type="button"
              onClick={() => {
                executeFakePlinDeposit();
                setTimeout(() => {
                  finishMiniNotiTutorial();
                }, 400);
              }}
              className="bg-[#00B14F] hover:bg-[#009E43] text-white px-4 py-2.5 rounded-[12px] font-bold text-[13px] cursor-pointer border-none shadow-xs active:scale-95 transition flex items-center gap-1.5"
            >
              <span>Probar ahora</span>
              <span className="text-[15px] leading-none">›</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Si el paso actual pertenece a otra página y aún estamos cargando la transición, no renderizar
  if (step.route && pathname !== step.route) return null;

  // Calcular posición del tooltip asegurando que NUNCA se salga de la pantalla
  const isCentered = step.position === "center" || !spotlight;
  let tooltipStyle: React.CSSProperties = {};

  if (!isCentered && spotlight) {
    const vh = typeof window !== "undefined" ? window.innerHeight : 800;
    const elementCenterY = spotlight.top + spotlight.height / 2;

    // Si el elemento está en la mitad inferior: tooltip se coloca arriba
    // Si el elemento está en la mitad superior: tooltip se coloca abajo
    if (elementCenterY > vh * 0.45) {
      tooltipStyle = {
        position: "fixed",
        top: 20,
        left: "50%",
        transform: "translateX(-50%)",
        width: "calc(100% - 32px)",
        maxWidth: "340px",
      };
    } else {
      tooltipStyle = {
        position: "fixed",
        bottom: 24,
        left: "50%",
        transform: "translateX(-50%)",
        width: "calc(100% - 32px)",
        maxWidth: "340px",
      };
    }
  }

  return (
    <div className="fixed inset-0 z-[99990] pointer-events-none select-none">
      {/* 1. Fondo Oscuro con Recorte Spotlight */}
      {spotlight ? (
        <div
          style={{
            position: "fixed",
            top: spotlight.top - 6,
            left: spotlight.left - 6,
            width: spotlight.width + 12,
            height: spotlight.height + 12,
            borderRadius: "14px",
            boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.60), 0 0 16px rgba(0, 177, 79, 0.45), inset 0 0 8px rgba(0, 177, 79, 0.15)",
            border: "2.5px solid #00B14F",
            pointerEvents: "none",
            transition: "top 0.45s cubic-bezier(0.22, 1, 0.36, 1), left 0.45s cubic-bezier(0.22, 1, 0.36, 1), width 0.45s cubic-bezier(0.22, 1, 0.36, 1), height 0.45s cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        />
      ) : (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-[2px] pointer-events-auto transition-opacity duration-300" />
      )}

      {/* 2. Tarjeta del Tutorial (Tooltip Flotante Minimalista) */}
      <div
        key={step.id}
        style={
          isCentered
            ? {
                position: "fixed",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: "90%",
                maxWidth: "340px",
                transition: "all 0.35s cubic-bezier(0.22, 1, 0.36, 1)",
              }
            : {
                ...tooltipStyle,
                transition: "all 0.35s cubic-bezier(0.22, 1, 0.36, 1)",
              }
        }
        className="bg-white rounded-[20px] p-5 shadow-[0_12px_40px_rgba(0,0,0,0.25)] border border-[#E5E7EB] pointer-events-auto z-[99995] animate-fadeIn flex flex-col"
      >
        {/* Cabecera del Tooltip */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="bg-[#E8F8EE] text-[#00B14F] text-[11px] font-extrabold px-2.5 py-0.5 rounded-full">
              Paso {step.id}/{totalSteps}
            </span>
            <span className="text-[15px] font-extrabold text-[#111111] truncate">
              {step.title}
            </span>
          </div>

          {/* Botón ✕ para omitir */}
          <button
            type="button"
            onClick={handleSkip}
            className="w-6 h-6 rounded-full bg-[#F3F4F6] text-[#6B7280] hover:text-[#111] flex items-center justify-center text-[11px] font-bold border-none cursor-pointer active:scale-90 transition p-0"
            title="Omitir tutorial"
          >
            ✕
          </button>
        </div>

        {/* Descripción */}
        <p className="text-[13px] text-[#4B5563] leading-relaxed mb-4">
          {step.description}
        </p>

        {/* Botones de Acción */}
        <div className="flex items-center justify-between pt-2 border-t border-[#F3F4F6]">
          <button
            type="button"
            onClick={handleSkip}
            className="text-[13px] font-semibold text-[#888888] hover:text-[#111111] bg-transparent border-none cursor-pointer p-1 active:scale-95 transition"
          >
            Omitir
          </button>

          <button
            type="button"
            onClick={handleNext}
            className="bg-[#00B14F] hover:bg-[#009E43] text-white px-5 py-2.5 rounded-[12px] font-bold text-[13px] cursor-pointer border-none shadow-xs active:scale-95 transition flex items-center gap-1.5"
          >
            <span>{stepIndex >= totalSteps ? "Comenzar" : "Siguiente"}</span>
            <span className="text-[15px] leading-none">›</span>
          </button>
        </div>
      </div>
    </div>
  );
}
