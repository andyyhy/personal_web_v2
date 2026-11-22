import type { Metadata, Viewport } from "next";

import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { FONT_URL, MESSAGE } from "./message";

export const metadata: Metadata = {
  title: MESSAGE,
  description: MESSAGE,
};

// Matches the page background so mobile browser bars blend in.
export const viewport: Viewport = {
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <head>
        <link rel="icon" href="/ay.png" type="image/png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link rel="stylesheet" href={FONT_URL} />
        {/* Without JavaScript there's no intro, so show the text straight away. */}
        <noscript>
          <style>
            {
              ".bouncing-text[data-waiting] .bouncing-text-inner{opacity:1;filter:none;scale:1}"
            }
          </style>
        </noscript>
      </head>
      <body className="antialiased">
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
