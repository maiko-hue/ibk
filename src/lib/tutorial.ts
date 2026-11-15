"use client";

export interface TutorialStep {
  id: number;
  route: string;
  subview?: "config" | "settings" | "contactos";
  targetSelector: string;
  title: string;
  description: string;
  actionType?: "type_cuentas" | "type_contactos" | "toggle_bot";
  position?: "top" | "bottom" | "center";
}

export const TUTORIAL_STORAGE_KEY = "ibk_tutorial_completed";
export const TUTORIAL_ACTIVE_KEY = "ibk_tutorial_active";
export const TUTORIAL_STEP_KEY = "ibk_tutorial_step";
export const TUTORIAL_EVENT_NAME = "ibk_tutorial_change";

export const TUTORIAL_STEPS: TutorialStep[] = [
  // PASO 1: En Inicio -> Botón menú de Configuración
  {
    id: 1,
    route: "/inicio",
    targetSelector: '[data-tour="inicio-menu-btn"]',
    title: "Menú de Configuración",
    description: "Toca aquí para acceder a todos los ajustes de tus cuentas, contactos, accesibilidad y seguridad.",
    position: "bottom",
  },

  // PASO 2: En Config -> Botón Configuración (Datos de mi cuenta)
  {
    id: 2,
    route: "/config",
    subview: "config",
    targetSelector: '[data-tour="config-settings-btn"]',
    title: "Configuración",
    description: "Ingresa aquí para personalizar tus datos personales, cuentas bancarias y CCI.",
    position: "bottom",
  },

  // PASO 3: Dentro de Settings -> Perfil de Usuario
  {
    id: 3,
    route: "/config",
    subview: "settings",
    targetSelector: '[data-tour="settings-perfil-input"]',
    title: "Perfil de usuario",
    description: "Acá podrás colocar tu nombre para futuras funciones.",
    position: "bottom",
  },

  // PASO 4: Dentro de Settings -> Edición de cuentas
  {
    id: 4,
    route: "/config",
    subview: "settings",
    targetSelector: '[data-tour="settings-cuentas-section"]',
    title: "Edición de cuentas",
    description: "Acá editas tus nros de cuenta y cci, te colocaremos datos randoms para que empieces.",
    actionType: "type_cuentas",
    position: "bottom",
  },

  // PASO 5: Dentro de Settings -> Guardar Cambios
  {
    id: 5,
    route: "/config",
    subview: "settings",
    targetSelector: '[data-tour="settings-save-btn"]',
    title: "Guardar cambios",
    description: "Recuerda presionar Guardar cambios para que todas tus modificaciones se apliquen correctamente.",
    position: "top",
  },

  // PASO 6: En Config -> Mis Contactos
  {
    id: 6,
    route: "/config",
    subview: "config",
    targetSelector: '[data-tour="config-contactos-btn"]',
    title: "Mis contactos",
    description: "Ingresa aquí para guardar contactos frecuentes y acelerar tus operaciones.",
    position: "bottom",
  },

  // PASO 7: Dentro de Contactos -> Titular y celular (con máquina de escribir y guardado en Firebase)
  {
    id: 7,
    route: "/config",
    subview: "contactos",
    targetSelector: '[data-tour="contactos-inputs-section"]',
    title: "Titular y celular",
    description: "Acá podrás guardar contactos para que funcionen dentro del auto completado. Hemos registrado a Maikol Torres Vargas (999999999).",
    actionType: "type_contactos",
    position: "bottom",
  },

  // PASO 8: En Config -> Accesibilidad (/sobre)
  {
    id: 8,
    route: "/config",
    subview: "config",
    targetSelector: '[data-tour="config-accesibilidad-btn"]',
    title: "Accesibilidad (Información de App)",
    description: "Toca este botón de 'Accesibilidad' para ingresar a la pantalla de 'Información de App', donde se configuran tus datos de acceso, el zoom y las notificaciones.",
    position: "bottom",
  },

  // PASO 9: En Sobre -> Mi cuenta
  {
    id: 9,
    route: "/sobre",
    targetSelector: '[data-tour="sobre-micuenta-btn"]',
    title: "Información de App: Mi cuenta",
    description: "Ya estamos dentro de 'Información de App'. Acá podrás ver tus datos de acceso y suscripción.",
    position: "bottom",
  },

  // PASO 10: En Sobre -> Zoom de la app
  {
    id: 10,
    route: "/sobre",
    targetSelector: '[data-tour="sobre-zoom-btn"]',
    title: "Información de App: Zoom",
    description: "Acá podrás modificar el zoom de toda la app manualmente, esto aplica para todas las secciones.",
    position: "bottom",
  },

  // PASO 11: En Sobre -> Administrar noti falsa
  {
    id: 11,
    route: "/sobre",
    targetSelector: '[data-tour="sobre-noti-btn"]',
    title: "Información de App: Noti falsa",
    description: "Personaliza notificaciones push simuladas. Al tocar la campana en Inicio, saldrá una notificación de Plin con sonido y depósito real a tu saldo.",
    position: "top",
  },

  // PASO 12: En Config -> Auto completado (se activa automáticamente)
  {
    id: 12,
    route: "/config",
    subview: "config",
    targetSelector: '[data-tour="config-autocompletado-switch"]',
    title: "Auto completado",
    description: "Esta opción es importante si lo que quieres es consultar el titular de un número. La hemos activado automáticamente para ti.",
    actionType: "toggle_bot",
    position: "bottom",
  },

  // PASO 13: En Config -> Definir PIN
  {
    id: 13,
    route: "/config",
    subview: "config",
    targetSelector: '[data-tour="config-definirpin-btn"]',
    title: "Definir PIN",
    description: "Configura tu clave de seguridad de 6 dígitos para bloquear y proteger el ingreso a tu app.",
    position: "bottom",
  },

  // PASO 14: En Config -> Actualizar APP
  {
    id: 14,
    route: "/config",
    subview: "config",
    targetSelector: '[data-tour="config-actualizarapp-btn"]',
    title: "Actualizar APP",
    description: "Fuerza la actualización de la aplicación a la última versión disponible para recibir todas las mejoras.",
    position: "bottom",
  },

  // PASO 15: Fin del Tutorial
  {
    id: 15,
    route: "/config",
    subview: "config",
    targetSelector: "",
    title: "¡Tutorial completado!",
    description: "Ya conoces todas las funciones esenciales del sistema. Recuerda que puedes repetir este recorrido cuando quieras desde Accesibilidad > Tutorial.",
    position: "center",
  },
];

export function isTutorialCompleted(): boolean {
  if (typeof window === "undefined") return true;
  return localStorage.getItem(TUTORIAL_STORAGE_KEY) === "true";
}

export function isTutorialActive(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(TUTORIAL_ACTIVE_KEY) === "true";
}

export function getCurrentTutorialStep(): number {
  if (typeof window === "undefined") return 1;
  const raw = localStorage.getItem(TUTORIAL_STEP_KEY);
  const num = parseInt(raw || "1", 10);
  return isNaN(num) || num < 1 ? 1 : num;
}

export function setTutorialStep(step: number): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(TUTORIAL_STEP_KEY, String(step));
  window.dispatchEvent(
    new CustomEvent(TUTORIAL_EVENT_NAME, {
      detail: { step, active: true },
    })
  );
}

export function startTutorial(): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(TUTORIAL_ACTIVE_KEY, "true");
  localStorage.setItem(TUTORIAL_STEP_KEY, "1");
  window.dispatchEvent(
    new CustomEvent(TUTORIAL_EVENT_NAME, {
      detail: { step: 1, active: true },
    })
  );
}

export function finishTutorial(): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(TUTORIAL_ACTIVE_KEY, "false");
  localStorage.setItem(TUTORIAL_STORAGE_KEY, "true");
  localStorage.removeItem(TUTORIAL_STEP_KEY);
  window.dispatchEvent(
    new CustomEvent(TUTORIAL_EVENT_NAME, {
      detail: { step: 0, active: false },
    })
  );
}
