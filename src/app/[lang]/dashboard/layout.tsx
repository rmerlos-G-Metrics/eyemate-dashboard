import { getDictionary, Locale } from "@/dictionaries/getDictionary";
import Footer from "@/components/ui/Footer";
import NavbarLogin from "@/components/ui/NavbarLogin";

export default async function DashboardLayout({
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
        <NavbarLogin dictionary={dict.navbar} lang={lang}></NavbarLogin>
      </header>

      <main className="grow flex items-center justify-center">
        {children}
      </main>

      <Footer dictionary={dict.footer} lang={lang}></Footer>
    </>
  );
}