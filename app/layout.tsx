import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/ui/toast";
import PlausibleProvider from "next-plausible";

export const metadata: Metadata = {
  title: "Slipwise - Organize Your Receipts",
  description:
    "Instantly convert invoices into clear, categorized summaries. Upload your receipts and get organized spending insights.",
  openGraph: {
    images: "https://receipthero-self.vercel.app/og.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Schibsted+Grotesk:wght@700&family=Instrument+Sans:wght@400;500&family=DM+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
        <PlausibleProvider domain="usereceipthero.com" />
      </head>
      <body>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
