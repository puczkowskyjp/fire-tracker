import { GeistSans } from "geist/font/sans";
import "./globals.css";

import CssBaseline from '@mui/material/CssBaseline';

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Fire Watcher",
  description: "The best way to keep track of wildfires around the country.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={GeistSans.className}>
      <head>
        <link rel="stylesheet" href="https://js.arcgis.com/4.28/@arcgis/core/assets/esri/themes/light/main.css"></link>
      </head>
      <body className="bg-neutral-500 text-foreground">
        <CssBaseline/>
        <main className="min-h-screen flex w-full">
          {children}
        </main>
      </body>
    </html>
  );
}
