import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Speak Notes",
  description: "Voice-based note-taking app",
  manifest: "/manifest.json",
  themeColor: "#0ea5e9",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/icon-192x192.png" />
        <meta name="theme-color" content="#0ea5e9" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white text-gray-900 min-h-screen max-w-md mx-auto flex flex-col`}>
        {children}
      </body>
    </html>
  );
}
