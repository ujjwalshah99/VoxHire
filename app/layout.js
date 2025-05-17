import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "./custom.css";
import { Providers } from "@/context/Providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "VoxHire - AI Interview Platform",
  description: "Schedule and manage AI-powered interviews",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-950 text-white`}
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
