import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, DM_Serif_Display } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const dmSerif = DM_Serif_Display({
  variable: "--font-dm-serif",
  subsets: ["latin"],
  weight: "400",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "CardScan Pro — AI-Powered Business Card Scanner",
    template: "%s | CardScan Pro",
  },
  description:
    "Turn business cards into actionable leads instantly with AI-powered scanning. Extract contacts, manage leads, and grow your network.",
  keywords: [
    "business card scanner",
    "AI card reader",
    "lead management",
    "contact extraction",
  ],
  openGraph: {
    title: "CardScan Pro — AI-Powered Business Card Scanner",
    description:
      "Turn business cards into actionable leads instantly with AI-powered scanning.",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${dmSerif.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col dark">
        {children}
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
