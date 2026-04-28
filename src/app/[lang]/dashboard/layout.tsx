import { getDictionary, Locale } from "@/dictionaries/getDictionary";
import Footer from "@/components/ui/Footer";
import NavbarDashboard from "@/components/ui/NavbarDashboard";

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
      <header className="top-0 w-full z-50">
        <NavbarDashboard dictionary={dict.navbarDashboard} lang={lang}></NavbarDashboard>
      </header>

      <main className="grow flex items-center justify-start">
        {children}
      </main>

      <Footer dictionary={dict.footer} lang={lang}></Footer>
    </>
  );
}