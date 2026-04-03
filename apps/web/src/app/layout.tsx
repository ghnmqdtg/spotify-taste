import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Funnel_Sans } from "next/font/google";
import { Newsreader } from "next/font/google";
import "./globals.css";
import { Providers } from "@/providers";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

const funnelSans = Funnel_Sans({
  subsets: ["latin"],
  variable: "--font-funnel-sans",
  weight: ["400", "500", "600", "700"],
});

const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-newsreader",
  style: ["normal", "italic"],
  weight: ["400"],
});

export const metadata: Metadata = {
  title: "Spotify Taste",
  description:
    "Discover what your music says about you",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${geist.variable} ${funnelSans.variable} ${newsreader.variable}`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
