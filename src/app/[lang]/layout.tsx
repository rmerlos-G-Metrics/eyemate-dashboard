import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import { getDictionary, Locale } from "@/dictionaries/getDictionary";
import CookieBanner from "@/components/ui/CookieBanner";
import { ThemeProvider } from "@/components/theme/ThemeProvider";

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
    <html lang={lang} className={`${inter.variable}`} >
      <body
        className="flex flex-col min-h-screen antialiased bg-background text-foreground"
      >
        <ThemeProvider>
          {children}
          <CookieBanner dictionary={dict.cookieBanner}></CookieBanner>
        </ThemeProvider>
      </body>
    </html>
  );
}
