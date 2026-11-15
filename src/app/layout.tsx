import type { Metadata, Viewport } from "next";
import "./globals.css";
import ClientProtections from "@/components/ClientProtections";
import SeguridadWatcher from "@/components/SeguridadWatcher";
import RegisterServiceWorker from "@/components/RegisterServiceWorker";
import ZoomManager from "@/components/ZoomManager";
import FakeNotificationBanner from "@/components/FakeNotificationBanner";
import TutorialTour from "@/components/TutorialTour";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#00B14F",
};

export const metadata: Metadata = {
  title: {
    default: "ibk -AppsReborn",
    template: "%s",
  },
  description: "Banca Móvil Interbank",
  manifest: "/manifest.json",
  icons: {
    icon: "/img/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var z = localStorage.getItem('ibk_app_zoom');
                  if (z) {
                    var val = parseInt(z, 10);
                    if (!isNaN(val) && val >= 80 && val <= 120) {
                      var f = val / 100;
                      document.documentElement.style.setProperty('--app-zoom', String(f));
                      document.documentElement.style.setProperty('--app-zoom-percent', val + '%');
                      document.documentElement.style.zoom = String(f);
                      var comp = 'calc(100dvh / ' + f + ')';
                      document.documentElement.style.minHeight = comp;
                      document.documentElement.style.height = comp;
                    }
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="font-sans antialiased bg-[#f8fafc] text-[#333333] selection:bg-transparent overflow-x-hidden">
        <ZoomManager />
        <FakeNotificationBanner />
        <TutorialTour />
        <ClientProtections />
        <SeguridadWatcher />
        <RegisterServiceWorker />
        <div className="w-full sm:max-w-[480px] mx-auto min-h-screen min-h-[100dvh] relative shadow-2xl flex flex-col flex-1">
          {children}
        </div>
      </body>
    </html>
  );
}
