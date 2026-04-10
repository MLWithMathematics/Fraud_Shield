// app/test/[modelId]/layout.tsx

// This forces Vercel to generate these specific URLs at build time, preventing 404s.
export function generateStaticParams() {
  return [
    { modelId: "transaction-classifier" },
    { modelId: "anomaly-detector" },
    { modelId: "ato-detector" }
  ];
}

export default function TestModelLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}