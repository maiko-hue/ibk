"use client";

import { useEffect } from "react";

export default function ClientProtections() {
  useEffect(() => {
    // 1. Bloquear menú contextual (clic derecho y mantener presionado para guardar imagen)
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    // 2. Bloquear arrastrar imágenes y elementos
    const handleDragStart = (e: DragEvent) => {
      e.preventDefault();
      return false;
    };

    // 3. Bloquear pull-to-refresh táctil en navegadores móviles al tirar hacia abajo
    let startY = 0;
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        startY = e.touches[0].clientY;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        const currentY = e.touches[0].clientY;
        const pageScrollTop =
          window.scrollY ||
          document.documentElement.scrollTop ||
          document.body.scrollTop ||
          0;

        // Si el usuario desliza hacia abajo cuando la página está en el tope superior
        if (pageScrollTop <= 0 && currentY > startY) {
          const target = e.target as HTMLElement | null;
          const scrollable = target?.closest?.(".overflow-y-auto, .overflow-auto") as HTMLElement | null;
          if (!scrollable || scrollable.scrollTop <= 0) {
            if (e.cancelable) {
              e.preventDefault();
            }
          }
        }
      }
    };

    window.addEventListener("contextmenu", handleContextMenu, { capture: true });
    window.addEventListener("dragstart", handleDragStart, { capture: true });
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: false });

    return () => {
      window.removeEventListener("contextmenu", handleContextMenu, { capture: true });
      window.removeEventListener("dragstart", handleDragStart, { capture: true });
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
    };
  }, []);

  return null;
}
