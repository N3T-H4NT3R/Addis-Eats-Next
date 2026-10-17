import { Suspense } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Footer from "./components/Footer";
import NavbarWrapper from "./components/avbarWrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://addis-eats-next-js-five.vercel.app"
  ),
  title: {
    default: "Addis Eats",
    template: "%s | Addis Eats",
  },
  description:
    "Order delicious Ethiopian food, pizza, burgers and drinks from Addis Eats. Fast delivery in Addis Ababa.",
  keywords: [
    "Addis Eats",
    "food delivery",
    "Ethiopian food",
    "Addis Ababa",
    "order food online",
  ],
  openGraph: {
    type: "website",
    siteName: "Addis Eats",
    title: "Addis Eats — Delicious Food in Addis Ababa",
    description:
      "Order Ethiopian meals, pizza, burgers and drinks. Fast delivery in Addis Ababa.",
    images: [
      {
        url: "/images/hero-food.png",
        width: 1200,
        height: 630,
        alt: "Addis Eats — Delicious Food",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Addis Eats — Delicious Food in Addis Ababa",
    description:
      "Order Ethiopian meals, pizza, burgers and drinks. Fast delivery in Addis Ababa.",
    images: ["/images/hero-food.png"],
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <body className="bg-[#111315] font-sans text-gray-100 antialiased">
        <Suspense fallback={<div className="h-16 bg-[#111315] sm:h-20" />}>
          <NavbarWrapper />
        </Suspense>

        {children}

        <Footer />
      </body>
    </html>
  );
}
