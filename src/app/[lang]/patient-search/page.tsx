import { getDictionary } from '@/dictionaries/getDictionary';
import PatientSearchClient from '@/components/auth/PatientSearchClient';

// Define the expected parameters based on your i18n setup
interface PatientSearchPageProps {
  params: {
    lang: 'en' | 'de';
  };
}

export default async function PatientSearchPage({ params }: PatientSearchPageProps) {
  // 1. Fetch the dictionary on the Server to keep bundle size small
  const dictionary = await getDictionary(params.lang);

  // 2. Render the Glassmorphism Client Component
  return (
    <main className="relative w-full min-h-screen">
      {/* Optional: If you have a global animated background or specific 
        healthcare branding pattern, you can place it here. 
      */}
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950" />
      
      {/* The Client Component handles the interactivity, state, and animations.
        It sits above the background on the z-axis.
      */}
      <div className="relative z-10 w-full h-full">
        <PatientSearchClient 
          dictionary={dictionary} 
          lang={params.lang} 
        />
      </div>
    </main>
  );
}