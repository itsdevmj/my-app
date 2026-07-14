import type { Metadata } from "next";
import { Geist, Geist_Mono, Archivo } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Heavy grotesque for the giant display headlines
const archivo = Archivo({
  variable: "--font-display",
  weight: ["700", "800", "900"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Capture Studio — Visual Poetry in Motion",
  description:
    "Capture Studio is a videography, photography and marketing house turning moments into motion. Discover the artistry of moments captured in motion.",
  keywords: [
    "videography",
    "photography",
    "marketing",
    "creative studio",
    "video production",
    "visual storytelling",
  ],
  openGraph: {
    title: "Capture Studio",
    description: "Visual poetry in motion — videography, photography, marketing.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${archivo.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
