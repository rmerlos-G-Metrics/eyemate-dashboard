import { getDictionary, Locale } from '@/dictionaries/getDictionary';
import { Metadata } from 'next';
import AuthContainer from '@/components/auth/AuthContainer';

export const metadata: Metadata = {
  title: 'Eyemate-Dashboard | G-Metrics',
  description: 'Access to the G-Metrics eyemate dashboard.',
};

export default async function LoginPage({
  params,
}: {
  params: Promise<{ lang: string }>; 
}) {
  const resolvedParams = await params;
  const lang = resolvedParams.lang as Locale;

  const dictionary = await getDictionary(lang);

  return (
    <main className="min-h-screen w-full flex items-center justify-center relative bg-background overflow-hidden transition-colors duration-300">
      
      <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-health-200/40 dark:bg-health-900/20 rounded-full blur-[120px] pointer-events-none transition-colors duration-500" />
      
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-health-300/30 dark:bg-health-800/20 rounded-full blur-[100px] pointer-events-none transition-colors duration-500" />
      
      <div className="absolute top-[20%] right-[20%] w-[500px] h-[500px] bg-health-100/50 dark:bg-[#0b406f]/30 rounded-full blur-[80px] pointer-events-none transition-colors duration-500" />
      
      {/* Login Form Container */}
      <div className="relative z-10 w-full max-w-md px-4 sm:px-0">
      <AuthContainer dictionary={dictionary} lang={lang}></AuthContainer>
      </div>
    </main>
  );
}