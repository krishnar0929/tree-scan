import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const font = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-jakarta" });

export const metadata: Metadata = {
  title: "Tree Scan",
  description: "Photo-based tree health and storm-risk screening.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#2f5d3a",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={font.variable}>
      <body className="min-h-dvh font-sans antialiased" style={{ fontFamily: "var(--font-jakarta), var(--font-sans)" }}>
        <main className="mx-auto min-h-dvh w-full max-w-md">{children}</main>
      </body>
    </html>
  );
}
