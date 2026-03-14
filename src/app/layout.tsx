import type { Metadata } from "next";
import { Heebo, Playfair_Display } from "next/font/google";
import "./globals.css";
import { GameProvider } from "@/context/GameContext";
import { AudioPlayer } from "@/components/AudioPlayer";

const heebo = Heebo({ subsets: ["hebrew"], variable: "--font-heebo" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });

export const metadata: Metadata = {
  title: "The Game | A Night to Remember",
  description: "A romantic and sensual interactive experience.",
  manifest: "/manifest.json",
  themeColor: "#121212",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "The Game",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl" className={`\\${heebo.variable} \\${playfair.variable}`}>
      <head>
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
      </head>
      <body className="antialiased min-h-screen relative">
        <AudioPlayer />
        <GameProvider>
          <main className="max-w-md mx-auto min-h-screen flex flex-col items-center justify-center p-6 relative z-10">
            {children}
          </main>
        </GameProvider>
      </body>
    </html>
  );
}
