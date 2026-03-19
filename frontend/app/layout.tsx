import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/context/AuthContext";
import { ToastProvider } from "@/lib/context/ToastContext";
import { ToastContainer } from "@/components/ui/Toast";
import { ConditionalLayout } from "@/components/layout/ConditionalLayout";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Flash Sale System - Real-Time Inventory Reservation",
  description: "Reserve products with real-time inventory tracking and 5-minute expiry",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <ToastProvider>
            <ConditionalLayout>{children}</ConditionalLayout>
            <ToastContainer />
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
