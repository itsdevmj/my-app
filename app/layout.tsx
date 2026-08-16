import type { Metadata } from "next";
import { Manrope, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ToasterProvider } from "./components/toaster";

/* Manrope carries everything. Modern and clean, a touch warmer than the
   default neutral grotesques, and it holds up at display sizes. */
const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

/* Mono is used only for small eyebrows and figures. */
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://capturestudio.co"),
  title: "Captured Studio — Video Production & Photography",
  description:
    "Captured Studio is a New York video production and photography company. Brand films, commercials, documentary and campaign content, crewed and finished in house.",
  keywords: [
    "video production company",
    "brand films",
    "commercial production",
    "photography studio",
    "documentary production",
    "New York video production",
  ],
  openGraph: {
    title: "Captured Studio — Video Production & Photography",
    description:
      "Brand films, commercials, documentary and campaign content, crewed and finished in house.",
    url: "/",
    siteName: "Captured Studio",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Capture Studio — Video Production & Photography",
    description: "Brand films, commercials and campaign content from New York.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${manrope.variable} ${geistMono.variable}`}>
      <body><ToasterProvider>{children}</ToasterProvider></body>
    </html>
  );
}
