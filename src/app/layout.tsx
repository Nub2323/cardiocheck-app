import type { Metadata } from "next";
import { Nunito_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const nunitoSans = Nunito_Sans({
  variable: "--font-nunito-sans",
  subsets: ["latin"],
  weight: ["300", "400", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "CardioCheck - Seguimiento Cardiológico",
  description: "Sistema de monitoreo remoto post-alta para pacientes con insuficiencia cardíaca - CardioCheck",
  icons: {
    icon: "/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${nunitoSans.variable} antialiased`}
        style={{ fontFamily: 'var(--font-nunito-sans), sans-serif' }}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
