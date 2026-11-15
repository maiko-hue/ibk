// Service Worker para IBK - Precaché automático de iconos y assets
const CACHE_NAME = 'ibk-icons-v1';

// Lista de todos los iconos y assets visuales para precargar automáticamente en la primera visita
const ASSETS_TO_PRECACHE = [
  '/manifest.json',
  '/noti.mp3',
  '/cuenta_credito.png',
  '/img/1646695785444.png',
  '/img/banner_finanzas.png',
  '/img/beneficios.webp',
  '/img/box-movements.webp',
  '/img/cambios.jpg',
  '/img/cards.png',
  '/img/close-eye.svg',
  '/img/condiciones.webp',
  '/img/cono.webp',
  '/img/cuenta_ahorro.png',
  '/img/cuenta_credito.png',
  '/img/cuenta_inversion.png',
  '/img/datos.webp',
  '/img/favicon.png',
  '/img/finanzas.png',
  '/img/flecha-icon.png',
  '/img/fondopin.webp',
  '/img/for_you.jpg',
  '/img/google.webp',
  '/img/huella-dactilar.png',
  '/img/icon.webp',
  '/img/icon_accesibilidad_3d.svg',
  '/img/icon_contactos_3d.svg',
  '/img/icon_door_3d.svg',
  '/img/icon_eye_3d.svg',
  '/img/icon_gear_3d.svg',
  '/img/icon_pin_3d.svg',
  '/img/icon_robot_3d.svg',
  '/img/icon_tarjetas_3d.svg',
  '/img/icon_telegram.svg',
  '/img/icon_trash_3d.svg',
  '/img/icon_update_3d.svg',
  '/img/interbank_wrdgas.webp',
  '/img/inversiones.png',
  '/img/lapiz2.svg',
  '/img/logo.png',
  '/img/logo.svg',
  '/img/millas.png',
  '/img/noti.mp3',
  '/img/ojoabierto.svg',
  '/img/ojocerrado.svg',
  '/img/open-eye.svg',
  '/img/other.jpg',
  '/img/para_ti.webp',
  '/img/pencil-simple.svg',
  '/img/pig-bg.png',
  '/img/pig.png',
  '/img/plane.png',
  '/img/plin-voucher.webp',
  '/img/plin.jpg',
  '/img/plin.png',
  '/img/qr.png',
  '/img/recargas.png',
  '/img/recargas.svg',
  '/img/retiros.jpg',
  '/img/secondlogo.png',
  '/img/servicios.jpg',
  '/img/servicios.png',
  '/img/symbol-money.svg',
  '/img/target.jpg',
  '/img/tarjeta.jpg',
  '/img/test.svg',
  '/img/transferencias.jpg',
  '/img/transferencias.png',
  '/img/ver_datos.png',
  '/img/ver_datos_2.png',
  '/img/ver_mas.png',
  '/img/whatsapp.png',
  '/img/whatsapp1.png'
];

// 1. INSTALACIÓN: Descarga todos los iconos a la memoria en segundo plano
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Descargamos de forma resiliente cada asset sin detener el SW si alguno falla
      return Promise.allSettled(
        ASSETS_TO_PRECACHE.map((url) =>
          fetch(url, { cache: 'no-cache' })
            .then((response) => {
              if (response.ok) {
                return cache.put(url, response);
              }
            })
            .catch(() => {})
        )
      );
    })
  );
});

// 2. ACTIVACIÓN: Limpia versiones antiguas del caché cuando se actualice el nombre
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. INTERCEPTOR (FETCH): Entrega instantánea desde la memoria local (Cache-First para imágenes)
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Solo interceptamos recursos estáticos de imágenes, iconos y audios
  const isImageOrAsset =
    url.pathname.startsWith('/img/') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.jpg') ||
    url.pathname.endsWith('.webp') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.mp3');

  if (isImageOrAsset && event.request.method === 'GET') {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          // Devuelve el icono inmediatamente desde la memoria del teléfono en 0ms
          return cachedResponse;
        }

        // Si no estaba en caché, lo descarga y lo guarda para las siguientes veces
        return fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        }).catch(() => {
          // Fallback silencioso si está offline y no está en caché
          return cachedResponse || new Response('', { status: 404 });
        });
      })
    );
  }
});
