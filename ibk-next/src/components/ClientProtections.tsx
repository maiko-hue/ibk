"use client";

import { useEffect } from "react";

export default function ClientProtections() {
  useEffect(() => {
    // 1. Bloquear menú contextual (clic derecho y mantener presionado para guardar imagen)
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    // 2. Bloquear arrastrar imágenes
    const handleDragStart = (e: DragEvent) => {
      e.preventDefault();
      return false;
    };

    window.addEventListener("contextmenu", handleContextMenu, { capture: true });
    window.addEventListener("dragstart", handleDragStart, { capture: true });

    return () => {
      window.removeEventListener("contextmenu", handleContextMenu, { capture: true });
      window.removeEventListener("dragstart", handleDragStart, { capture: true });
    };
  }, []);

  return null;
}
