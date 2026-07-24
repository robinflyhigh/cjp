import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CGP Protest Videos | Delhi Protest Updates & Live Coverage",
  description:
    "Watch videos from the CGP protest movement in Delhi. Browse speeches, public gatherings, interviews, protest footage, and updates in a continuous video experience.",
};

export const viewport: Viewport = {
  themeColor: "#0B0B0B",
  width: "device-width",
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
      <body className="min-h-screen bg-netflix-dark font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
