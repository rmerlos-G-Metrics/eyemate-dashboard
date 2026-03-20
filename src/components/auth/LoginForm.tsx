'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface LoginDictionary {
  title: string;
  subtitle: string;
  emailLabel: string;
  emailPlaceholder: string;
  passwordLabel: string;
  forgotPassword: string;
  submitButton: string;
  loading: string;
  secureNotice: string;
}

interface LoginFormProps {
  lang: string;
  dictionary: {
    login: LoginDictionary;
  }; 
}

export default function LoginForm({ lang, dictionary }: LoginFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  
  const t = dictionary.login;

  const handleLoginAction = async (formData: FormData) => {
    setIsLoading(true);
    
    const email = formData.get('email');
    const password = formData.get('password');

    await new Promise((resolve) => setTimeout(resolve, 800));

    router.push(`/${lang}/portal`);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }} // Apple-style custom spring easing
      className="w-full bg-health-100/90 backdrop-blur-2xl border border-white/20 shadow-2xl rounded-2xl p-8 sm:p-10"
    >
      <div className="flex flex-col items-center mb-8">
        <Image 
          src="/images/eyemate-logo.png" 
          alt="G-Metrics eyemate logo" 
          width={140}
          height={48} 
          className="object-contain mb-6"
          priority
        />
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 text-center">
          {t.title}
        </h1>
        <p className="text-sm text-slate-500 mt-2 text-center leading-relaxed">
          {t.subtitle}
        </p>
      </div>

      <form action={handleLoginAction} className="space-y-5" noValidate>
        {/* Email Field */}
        <div className="space-y-1.5">
          <label 
            htmlFor="email" 
            className="block text-sm font-semibold text-slate-700"
          >
            {t.emailLabel}
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            aria-required="true"
            className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-sm min-h-[3rem]"
            placeholder={t.emailPlaceholder}
          />
        </div>

        {/* Password Field */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label 
              htmlFor="password" 
              className="block text-sm font-semibold text-slate-700"
            >
              {t.passwordLabel}
            </label>
            <a href="#" className="text-sm font-medium text-slate-900/60 hover:text-primary/80 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary rounded">
              {t.forgotPassword}
            </a>
          </div>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            aria-required="true"
            className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-sm min-h-[3rem]"
            placeholder="••••••••"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          aria-busy={isLoading}
          className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-lg shadow-md text-sm font-bold text-white bg-health-900 glass-panel hover:bg-health-900/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all disabled:opacity-70 disabled:cursor-not-allowed min-h-[3rem] mt-2"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {t.loading}
            </span>
          ) : (
            t.submitButton
          )}
        </button>
      </form>

      <div className="mt-8 text-center text-xs font-medium text-slate-400">
        <p>{t.secureNotice}</p>
      </div>
    </motion.div>
  );
}