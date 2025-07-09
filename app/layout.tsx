import type { Metadata, Viewport } from "next";
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
  title: "Gloria Jean's POS - Point of Sale System",
  description: "Professional point of sale system for Gloria Jean's café. Manage orders, tables, menu items, and sales with ease.",
  keywords: "POS, point of sale, café, restaurant, Gloria Jean's, coffee, food service, order management",
  authors: [{ name: "Gloria Jean's" }],
  creator: "Gloria Jean's",
  publisher: "Gloria Jean's",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('http://localhost:3000'),
  openGraph: {
    title: "Gloria Jean's POS - Point of Sale System",
    description: "Professional point of sale system for Gloria Jean's café. Manage orders, tables, menu items, and sales with ease.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Gloria Jean's POS - Point of Sale System",
    description: "Professional point of sale system for Gloria Jean's café.",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
