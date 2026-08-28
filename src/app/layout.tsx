import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ClientWrapper from "@/components/inkwise/ClientWrapper";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "InkWise - Pure White Pages",
  description: "Clean AI-generated notes and document images for ink-friendly printing. Process entire batches directly in your browser with zero server uploads.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased bg-gray-100 text-gray-900 h-screen overflow-hidden flex flex-col`}>
        <ClientWrapper>{children}</ClientWrapper>
      </body>
    </html>
  );
}
