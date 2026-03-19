import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import { getDictionary, Locale } from "@/dictionaries/getDictionary";
import CookieBanner from "@/components/ui/CookieBanner";
import Footer from "@/components/ui/Footer";
import Navbar from "@/components/ui/Navbar";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "G-Metrics | AI-Driven Glaucoma Monitoring",
  description: "Pioneering predictive care with biosensors and artificial intelligence.",
};

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{lang: string}>;
}>) {
  const {lang} = await params;

  const dict = await getDictionary(lang as Locale);

  return (
    <html lang={lang} className={`${inter.variable}`}>
      <body
        className="flex flex-col min-h-screen antialiased bg-background text-foreground"
      >
        <header className="fixed top-0 w-full z-50">
          <Navbar dictionary={dict.navbar} lang={lang}></Navbar>
        </header>

        <main className="grow pt-24">
          {children}
        </main>

        <Footer dictionary={dict.footer} lang={lang}></Footer>
        <CookieBanner dictionary={dict.cookieBanner}></CookieBanner>
      </body>
    </html>
  );
}
