import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ClientWrapper from "@/components/inkwise/ClientWrapper";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "InkWise",
  description: "Clean AI-generated notes and document images for ink-friendly printing. Process entire batches directly in your browser with zero server uploads.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} flex min-h-screen flex-col overflow-x-hidden bg-slate-50 font-sans antialiased text-slate-950`}>
        <ClientWrapper>{children}</ClientWrapper>
      </body>
    </html>
  );
}
