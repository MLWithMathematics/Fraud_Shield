import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "FraudShield AI — Intelligence Against Financial Crime",
  description:
    "3-model fraud detection platform — XGBoost+LightGBM transaction scoring, IsolationForest+Autoencoder anomaly detection, GBM+LSTM account takeover detection. Combined risk engine. Built with Next.js 14 and FastAPI.",
  keywords: ["fraud detection", "AI", "machine learning", "XGBoost", "LightGBM", "autoencoder", "LSTM", "anomaly detection", "account takeover"],
  themeColor: "#0052FF",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "FraudShield AI",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#0052FF" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="bg-[#0a0a0a] text-gray-200 font-body antialiased">
        <div className="fixed inset-0 bg-grid opacity-100 pointer-events-none z-0" />
        <div className="fixed inset-0 pointer-events-none z-0"
          style={{ background: "radial-gradient(ellipse 80% 40% at 50% -5%, rgba(0,82,255,0.12), transparent)" }} />
        <Navbar />
        <main className="relative z-10">{children}</main>

        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/service-worker.js')
                    .then(function(reg) { console.log('SW registered:', reg.scope); })
                    .catch(function(err) { console.log('SW registration failed:', err); });
                });
              }
            `,
          }}
        />

        <footer className="relative z-10 border-t border-white/5 mt-20 py-8">
          <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded bg-[#0052FF] flex items-center justify-center">
                <span className="text-white text-[8px] font-bold font-mono">FS</span>
              </div>
              <span className="text-xs text-gray-600 font-mono">FraudShield AI · Built by Shubhankar</span>
            </div>
            <p className="text-xs text-gray-700 font-mono">
              IEEE-CIS · ULB Credit Card · XGBoost · LightGBM · Keras LSTM
            </p>
            <div className="flex gap-5">
              {[
                { label: "Gallery",     href: "/gallery" },
                { label: "Risk Engine", href: "/combined" },
                { label: "How To Use",  href: "/how-to-use" },
                { label: "GitHub",      href: "#" },
              ].map((link) => (
                <a key={link.label} href={link.href}
                  className="text-xs text-gray-600 hover:text-gray-400 transition-colors font-mono">
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
