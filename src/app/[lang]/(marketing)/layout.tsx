import { getDictionary, Locale } from "@/dictionaries/getDictionary";
import Footer from "@/components/ui/Footer";
import Navbar from "@/components/ui/Navbar";

export default async function MarketingLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{lang: string}>;
}>) {
  const {lang} = await params;
  const dict = await getDictionary(lang as Locale);

  return (
    <>
      <header className="fixed top-0 w-full z-50">
        <Navbar dictionary={dict.navbar} lang={lang}></Navbar>
      </header>

      {/* The pt-24 pushes the content down below the fixed Navbar */}
      <main className="grow pt-24">
        {children}
      </main>

      <Footer dictionary={dict.footer} lang={lang}></Footer>
    </>
  );
}