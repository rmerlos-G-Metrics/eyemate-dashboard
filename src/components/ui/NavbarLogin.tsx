'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { ThemeToggle } from './ThemeToggle';

interface NavbarProps {
  lang: string;
  dictionary: {
    logoAlt: string;
    home: string;
    impressum: string;
    datenschutz: string;
    toggleLanguage: string;
    openMenu: string;
    closeMenu: string;
    loginButton: string;
  };
}

export default function NavbarLogin({ lang, dictionary }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const redirectedPathName = (locale: string) => {
    if (!pathname) return '/';
    const segments = pathname.split('/');
    segments[1] = locale;
    return segments.join('/');
  }

  const targetLanguage = lang === 'en' ? 'de' : 'en';
  const targetLanguageLabel = lang === 'en' ? 'DE' : 'EN';

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      aria-label="Login Navigation"
      className={`w-full transition-colors duration-300 ${
        isScrolled
          ? 'bg-background/80 backdrop-blur-md shadow-sm border-b border-border'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Left section: Logo (Sends user back to marketing home) */}
        <div className="shrink-0 flex items-center">
          <Link href={`/${lang}`} className="flex items-center gap-2 outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md">
            <Image 
              src="/images/eyemate-logo.png" 
              alt={dictionary.logoAlt} 
              width={120} height={40} 
              className="object-contain" priority
            />
            <span className="text-xl font-semibold tracking-tight hidden sm:block">
              Dashboard
            </span>
          </Link>
        </div>

        {/* Right section: Language Toggle Only */}
        <div className="flex items-center gap-2">
            <Link
            href={redirectedPathName(targetLanguage)}
            aria-label={dictionary.toggleLanguage}
            className="flex items-center justify-center w-11 h-11 rounded-md text-muted-foreground hover:bg-muted transition-colors focus-visible:ring-2 focus-visible:ring-primary font-medium"
            >
            {targetLanguageLabel}
            </Link>
            <ThemeToggle></ThemeToggle>        
        </div>
      </div>
    </motion.nav>
  );
}