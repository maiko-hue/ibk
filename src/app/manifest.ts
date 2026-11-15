import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Interbank",
    short_name: "Interbank",
    description: "Banca Móvil Interbank",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#00b551",
    icons: [
      {
        src: "/img/favicon.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/img/favicon.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
