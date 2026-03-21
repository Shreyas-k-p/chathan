import type { Metadata } from "next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "Scan4Serve - Smart SaaS Management",
  description: "Advanced Restaurant State Management Engine",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased dark"
    >
      <body className="min-h-full flex flex-col font-sans bg-[#0a0a0a]">
        {children}
        <Toaster position="top-center" richColors />
        <SpeedInsights />
      </body>
    </html>
  );
}
