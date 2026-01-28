import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers"; // 👈 IMPORT THIS

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Reload Logistics",
  description: "Logistics Management Platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* WRAP THE BODY CONTENT WITH PROVIDERS 👇 */}
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}