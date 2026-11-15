"use client";

import html2canvas from "html2canvas";

interface ShareVoucherOptions {
  captureElement: HTMLElement | null;
  fileName: string;
  title: string;
  text?: string;
  onBeforeCapture?: () => void;
  onAfterCapture?: () => void;
}

interface ElementRestore {
  el: HTMLElement;
  overflow: string;
  overflowY: string;
  overflowX: string;
  height: string;
  maxHeight: string;
  minHeight: string;
  paddingBottom: string;
  scrollTop: number;
  scrollLeft: number;
  display: string;
}

export async function captureAndShareVoucher({
  captureElement,
  fileName,
  title,
  text,
  onBeforeCapture,
  onAfterCapture,
}: ShareVoucherOptions): Promise<void> {
  if (!captureElement || typeof window === "undefined") return;

  const toRestore: ElementRestore[] = [];
  const originalWindowScrollX = window.scrollX || window.pageXOffset || 0;
  const originalWindowScrollY = window.scrollY || window.pageYOffset || 0;

  try {
    // 1. Ocultar botones interactivos y barra de navegación antes de la captura
    onBeforeCapture?.();

    // Pequeño retardo para que React aplique el cambio visual en el DOM
    await new Promise((r) => setTimeout(r, 120));

    const recordAndPrepare = (el: HTMLElement) => {
      toRestore.push({
        el,
        overflow: el.style.overflow,
        overflowY: el.style.overflowY,
        overflowX: el.style.overflowX,
        height: el.style.height,
        maxHeight: el.style.maxHeight,
        minHeight: el.style.minHeight,
        paddingBottom: el.style.paddingBottom,
        scrollTop: el.scrollTop,
        scrollLeft: el.scrollLeft,
        display: el.style.display,
      });
    };

    // 2. Desrestringir el contenedor principal de la constancia
    recordAndPrepare(captureElement);
    captureElement.scrollTop = 0;
    captureElement.scrollLeft = 0;
    captureElement.style.setProperty("height", "auto", "important");
    captureElement.style.setProperty("max-height", "none", "important");
    captureElement.style.setProperty("overflow", "visible", "important");
    captureElement.style.setProperty("overflow-y", "visible", "important");
    captureElement.style.setProperty("overflow-x", "visible", "important");

    // 3. Desrestringir todos los elementos hijos scrollables para que ningún dato se corte
    const allDescendants = captureElement.querySelectorAll<HTMLElement>("*");
    allDescendants.forEach((child) => {
      const computed = window.getComputedStyle(child);
      const isScrollable =
        computed.overflowY === "auto" ||
        computed.overflowY === "scroll" ||
        computed.overflow === "hidden" ||
        child.classList.contains("overflow-y-auto") ||
        child.classList.contains("no-scrollbar");

      if (isScrollable) {
        recordAndPrepare(child);
        child.scrollTop = 0;
        child.scrollLeft = 0;
        child.style.setProperty("overflow", "visible", "important");
        child.style.setProperty("overflow-y", "visible", "important");
        child.style.setProperty("overflow-x", "visible", "important");
        child.style.setProperty("height", "auto", "important");
        child.style.setProperty("max-height", "none", "important");

        // Quitar paddings excesivos usados para el bottom nav en pantalla
        if (
          child.classList.contains("pb-36") ||
          child.classList.contains("pb-[75px]") ||
          child.classList.contains("pb-28")
        ) {
          child.style.setProperty("padding-bottom", "24px", "important");
        }
      }

      // Ocultar botones, notificaciones push, audios o navbars
      if (
        child.tagName === "BUTTON" ||
        child.id === "actionButton" ||
        child.id === "bottomNav" ||
        child.classList.contains("btn-enviar") ||
        child.classList.contains("btn-enviar-text") ||
        child.classList.contains("push-notification") ||
        child.tagName === "NAV" ||
        child.tagName === "AUDIO"
      ) {
        recordAndPrepare(child);
        child.style.setProperty("display", "none", "important");
      }
    });

    // Resetear el scroll de la ventana para sincronizar coordenadas en html2canvas
    window.scrollTo(0, 0);

    // Esperar un ciclo de renderizado para que el navegador recalcule el layout completo
    await new Promise((r) => setTimeout(r, 60));

    const fullWidth = Math.max(captureElement.scrollWidth, captureElement.offsetWidth);
    const fullHeight = Math.max(captureElement.scrollHeight, captureElement.offsetHeight);

    // 4. Tomar captura de alta resolución con html2canvas
    const canvas = await html2canvas(captureElement, {
      scale: 2,
      backgroundColor: "#ffffff",
      useCORS: true,
      logging: false,
      allowTaint: true,
      scrollX: 0,
      scrollY: 0,
      x: 0,
      y: 0,
      width: fullWidth,
      height: fullHeight,
      windowWidth: fullWidth,
      windowHeight: fullHeight,
      onclone: (clonedDoc, clonedEl) => {
        // En el iframe clonado, asegurar que nada quede restringido
        clonedEl.style.height = "auto";
        clonedEl.style.maxHeight = "none";
        clonedEl.style.overflow = "visible";

        // Ocultar elementos no deseados en la constancia clonada
        clonedDoc
          .querySelectorAll(
            "button, nav, #bottomNav, #actionButton, audio, .push-notification, [data-hide-capture]"
          )
          .forEach((el: any) => {
            el.style.display = "none";
          });

        // Desrestringir contenedores en el clon
        clonedEl
          .querySelectorAll(".overflow-y-auto, [class*='overflow']")
          .forEach((el: any) => {
            el.style.overflow = "visible";
            el.style.height = "auto";
            el.style.maxHeight = "none";
            el.style.paddingBottom = "24px";
          });

        // Blindar el badge de GRATIS en el clon para que mantenga proporciones exactas
        clonedDoc
          .querySelectorAll(".badge-gratis, [data-gratis-badge]")
          .forEach((badge: any) => {
            badge.style.display = "block";
            badge.style.width = "62px";
            badge.style.minWidth = "62px";
            badge.style.maxWidth = "62px";
            badge.style.height = "21px";
            badge.style.minHeight = "21px";
            badge.style.maxHeight = "21px";
            badge.style.lineHeight = "21px";
            badge.style.textAlign = "center";
            badge.style.backgroundColor = "#00b551";
            badge.style.color = "#ffffff";
            badge.style.borderRadius = "4px";
            badge.style.fontSize = "11px";
            badge.style.fontWeight = "800";
            badge.style.letterSpacing = "0.5px";
            badge.style.boxSizing = "border-box";
            badge.style.margin = "0";
            badge.style.padding = "0";
          });
      },
    });

    // 5. Convertir a Blob y archivo PNG
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/png")
    );

    if (blob) {
      const file = new File([blob], fileName, { type: "image/png" });

      // 6. Intentar compartir como archivo de imagen si el navegador lo soporta
      let sharedSuccessfully = false;
      if (
        navigator.share &&
        navigator.canShare &&
        navigator.canShare({ files: [file] })
      ) {
        try {
          await navigator.share({
            title,
            text: text || title,
            files: [file],
          });
          sharedSuccessfully = true;
        } catch (err: any) {
          // Si el usuario canceló el diálogo de compartir, no forzamos descarga
          if (err?.name === "AbortError") {
            sharedSuccessfully = true;
          }
        }
      }

      // 7. Si no se pudo compartir (ej. navegador de escritorio o PC), descargar la imagen
      if (!sharedSuccessfully) {
        downloadCanvasImage(canvas, fileName);
      }
    } else {
      downloadCanvasImage(canvas, fileName);
    }
  } catch (error) {
    console.error("Error al capturar constancia:", error);
  } finally {
    // 8. Restaurar estilos y posición de scroll exacta en el DOM
    for (const item of toRestore) {
      item.el.style.overflow = item.overflow;
      item.el.style.overflowY = item.overflowY;
      item.el.style.overflowX = item.overflowX;
      item.el.style.height = item.height;
      item.el.style.maxHeight = item.maxHeight;
      item.el.style.minHeight = item.minHeight;
      item.el.style.paddingBottom = item.paddingBottom;
      item.el.style.display = item.display;
      item.el.scrollTop = item.scrollTop;
      item.el.scrollLeft = item.scrollLeft;
    }

    window.scrollTo(originalWindowScrollX, originalWindowScrollY);

    onAfterCapture?.();
  }
}

function downloadCanvasImage(canvas: HTMLCanvasElement, fileName: string) {
  try {
    const link = document.createElement("a");
    link.download = fileName;
    link.href = canvas.toDataURL("image/png");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (err) {
    console.error("Error descargando imagen de la constancia:", err);
  }
}
