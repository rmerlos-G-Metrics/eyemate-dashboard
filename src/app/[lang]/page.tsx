import { getDictionary, Locale } from "@/dictionaries/getDictionary";
import Hero from "@/components/sections/Hero";

export default async function Home({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  return (
    <div className="flex flex-col items-center w-full">
      {/* We pass the localized text to our Client Component */}
      <Hero dictionary={dict.hero} />
    </div>
  );
}