import { getDictionary, Locale } from '@/dictionaries/getDictionary';
import LoginForm from '@/components/auth/LoginForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Eyemate-Dashboard | G-Metrics',
  description: 'Secure access to the G-Metrics eyemate dashboard.',
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
    <main className="min-h-screen w-full flex items-center justify-center relative bg-slate-900 overflow-hidden">
      
      <div className="absolute top-[-20%] left-[-10%] w-[50rem] h-[50rem] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40rem] h-[40rem] bg-cyan-600/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-[20%] right-[20%] w-[30rem] h-[30rem] bg-blue-800/30 rounded-full blur-[80px] pointer-events-none" />
      
      <div className="relative z-10 w-full max-w-md px-4 sm:px-0">
        <LoginForm key={lang} lang={lang} dictionary={dictionary} />
      </div>
    </main>
  );
}