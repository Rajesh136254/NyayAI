import type { Metadata } from "next";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "NYAYAI | Sovereign Justice Intelligence & Undertrial Compliance",
  description:
    "Enterprise AI intelligence platform for prison administration, DLSA workflow coordination, and BNSS Section 479 statutory compliance.",
  keywords: ["NYAYAI", "Justice AI", "BNSS 479", "Undertrial Compliance", "Legal Tech", "e-Prisons Intelligence"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen antialiased bg-[#F8FAFC] dark:bg-[#060E1E] text-slate-900 dark:text-slate-100 selection:bg-gold-500/20 selection:text-gold-600 dark:selection:text-gold-400">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
