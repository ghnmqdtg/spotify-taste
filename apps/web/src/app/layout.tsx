import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Funnel_Sans, Newsreader } from "next/font/google";
import "./globals.css";
import { Providers } from "@/providers";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const funnelSans = Funnel_Sans({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
});

const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-caption",
  display: "swap",
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Spotify Taste",
  description:
    "Manage, browse, and organize your Spotify liked songs library with AI-powered tools",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${geist.variable} ${funnelSans.variable} ${newsreader.variable}`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
