"use client";

import { useEffect } from "react";
import {
  getAppZoom,
  applyZoomToDOM,
  ZOOM_EVENT_NAME,
  ZOOM_STORAGE_KEY,
} from "@/lib/zoom";

/**
 * ZoomManager se monta en el RootLayout para garantizar que:
 * 1. El nivel de zoom se aplique instantáneamente al montar en el cliente.
 * 2. Se sincronicen cambios en tiempo real a través de eventos personalizados y entre pestañas.
 */
export default function ZoomManager() {
  useEffect(() => {
    // Aplicar zoom inicial guardado
    const initial = getAppZoom();
    applyZoomToDOM(initial);

    // Escuchar eventos en la misma pestaña
    const handleZoomEvent = (e: Event) => {
      const custom = e as CustomEvent<{ zoom: number }>;
      if (custom.detail && typeof custom.detail.zoom === "number") {
        applyZoomToDOM(custom.detail.zoom);
      } else {
        applyZoomToDOM(getAppZoom());
      }
    };

    // Escuchar cambios de localStorage en otras pestañas
    const handleStorageEvent = (e: StorageEvent) => {
      if (e.key === ZOOM_STORAGE_KEY) {
        applyZoomToDOM(getAppZoom());
      }
    };

    window.addEventListener(ZOOM_EVENT_NAME, handleZoomEvent);
    window.addEventListener("storage", handleStorageEvent);

    return () => {
      window.removeEventListener(ZOOM_EVENT_NAME, handleZoomEvent);
      window.removeEventListener("storage", handleStorageEvent);
    };
  }, []);

  return null;
}
