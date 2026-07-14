import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SecretPub — signalétique, print et textile",
    short_name: "SecretPub",
    description:
      "Toute votre communication physique, un seul partenaire. Signalétique, print, textile, goodies et packaging, de l'étude à la pose.",
    start_url: "/",
    display: "standalone",
    background_color: "#0b0d0c",
    theme_color: "#40ab3f",
    icons: [
      { src: "/icon.png", sizes: "512x512", type: "image/png", purpose: "any" },
    ],
  };
}
