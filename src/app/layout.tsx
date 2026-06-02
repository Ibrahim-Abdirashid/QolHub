import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "QolHub — Find Your Home in Boorama",
  description:
    "Find a house or room for rent in Boorama. Connect landlords and tenants.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full`} suppressHydrationWarning>
      <body className="flex min-h-full flex-col antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
