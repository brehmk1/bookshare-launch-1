import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

export const metadata: Metadata = {
  title: "BookShare",
  description: "Ad-free. Author-first. Built for breakout writing.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <div className="page">
          <div className="background-glow" />
          <SiteHeader />
          {children}
        </div>
      </body>
    </html>
  );
}
