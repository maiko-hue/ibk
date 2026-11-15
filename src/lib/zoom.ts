"use client";

export const MIN_ZOOM = 80;
export const MAX_ZOOM = 120;
export const STEP_ZOOM = 5;
export const DEFAULT_ZOOM = 100;
export const ZOOM_STORAGE_KEY = "ibk_app_zoom";
export const ZOOM_EVENT_NAME = "ibk_zoom_change";

export function getAppZoom(): number {
  if (typeof window === "undefined") return DEFAULT_ZOOM;
  try {
    const val = localStorage.getItem(ZOOM_STORAGE_KEY);
    if (!val) return DEFAULT_ZOOM;
    const parsed = parseInt(val, 10);
    if (isNaN(parsed)) return DEFAULT_ZOOM;
    return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, parsed));
  } catch (_) {
    return DEFAULT_ZOOM;
  }
}

export function applyZoomToDOM(zoomPercent: number): void {
  if (typeof document === "undefined") return;
  const clamped = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoomPercent));
  const factor = clamped / 100;

  // 1. Variable CSS global para cálculos proporcionales
  document.documentElement.style.setProperty("--app-zoom", String(factor));
  document.documentElement.style.setProperty("--app-zoom-percent", `${clamped}%`);

  // 2. Propiedad CSS zoom estándar en documentElement (soporta Chrome, Edge, Safari 17+, Firefox 126+)
  (document.documentElement.style as any).zoom = String(factor);

  // 3. Compensación de altura dinámica para que ninguna pantalla corte o deje franjas sin pintar abajo
  const comp = `calc(100dvh / ${factor})`;
  document.documentElement.style.minHeight = comp;
  document.documentElement.style.height = comp;

  if (document.body) {
    document.body.style.minHeight = comp;
    document.body.style.height = comp;
  }
}

export function setAppZoom(zoomPercent: number): number {
  if (typeof window === "undefined") return DEFAULT_ZOOM;
  const clamped = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoomPercent));
  try {
    localStorage.setItem(ZOOM_STORAGE_KEY, String(clamped));
  } catch (_) {}

  applyZoomToDOM(clamped);

  try {
    window.dispatchEvent(
      new CustomEvent(ZOOM_EVENT_NAME, { detail: { zoom: clamped } })
    );
  } catch (_) {}

  return clamped;
}
