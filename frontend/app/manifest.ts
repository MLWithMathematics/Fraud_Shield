import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "FraudShield AI",
    short_name: "FraudShield",
    description:
      "Intelligence Against Financial Crime — A 3-model fraud detection pipeline with supervised transaction scoring, unsupervised anomaly detection, and LSTM behavioural sequence analysis.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0a0a0a",
    theme_color: "#0052FF",
    lang: "en",
    categories: ["finance", "productivity", "utilities"],
    icons: [
      {
        src: "/icons/icon-72x72.png",
        sizes: "72x72",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-96x96.png",
        sizes: "96x96",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-128x128.png",
        sizes: "128x128",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-144x144.png",
        sizes: "144x144",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-152x152.png",
        sizes: "152x152",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-384x384.png",
        sizes: "384x384",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
    shortcuts: [
      {
        name: "Combined Risk Engine",
        short_name: "Risk Engine",
        description: "Run the full 3-model fraud detection pipeline",
        url: "/combined",
        icons: [{ src: "/icons/icon-192x192.png", sizes: "192x192" }],
      },
      {
        name: "Model Gallery",
        short_name: "Gallery",
        description: "View and test all 3 fraud detection models",
        url: "/gallery",
        icons: [{ src: "/icons/icon-192x192.png", sizes: "192x192" }],
      },
    ],
    screenshots: [
      {
        src: "/screenshots/home.png",
        sizes: "1080x1920",
        type: "image/png",
        // @ts-ignore — form_factor is valid PWA spec but not yet in Next.js types
        form_factor: "narrow",
        label: "FraudShield AI Home",
      },
      {
        src: "/screenshots/risk-engine.png",
        sizes: "1080x1920",
        type: "image/png",
        // @ts-ignore
        form_factor: "narrow",
        label: "Combined Risk Engine",
      },
    ],
  };
}
