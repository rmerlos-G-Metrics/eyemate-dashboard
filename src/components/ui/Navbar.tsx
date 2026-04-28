'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
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

export default function Navbar({ lang, dictionary }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path: string) => pathname === `/${lang}${path}`;

  const redirectedPathName = (locale: string) => {
    if (!pathname) return '/';
    const segments = pathname.split('/');
    segments[1] = locale;
    return segments.join('/');
  }

  const targetLanguage = lang === 'en' ? 'de' : 'en';
  const targetLanguageLabel = lang === 'en' ? 'DE' : 'EN';

  const navLinks = [
    { name: dictionary.home, href: '/' },
    { name: dictionary.impressum, href: '/impressum' },
    { name: dictionary.datenschutz, href: '/datenschutz' },
    
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      aria-label="Main Navigation"
      className={`w-full transition-colors duration-300 ${
        isScrolled
          ? 'bg-background/80 backdrop-blur-md shadow-sm border-b border-border'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Left section */}
        <div className="shrink-0 flex items-center">
          <Link
            href={`/${lang}`}
            className="flex items-center gap-2 outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md min-h-11 min-w-11"
            aria-label={dictionary.logoAlt}
          >
            <Image 
              src="/images/CORA_Logo_v1.png" 
              alt={dictionary.logoAlt} 
              width={130}
              height={80} 
              className="object-contain"
              priority
            />
          </Link>
        </div>

        {/* Center Section */}
        <div className="hidden md:flex items-center space-x-2">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={`/${lang}${link.href}`}
              aria-current={isActive(link.href) ? 'page' : undefined}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary min-h-11 flex items-center ${
                isActive(link.href)
                  ? 'text-primary bg-primary/10'
                  : 'text-muted-foreground hover:text-primary hover:bg-muted'
              }`}
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Right section*/}
        <div className="flex items-center gap-2">
          <Link
            href={`/${lang}/login`}
            className="hidden md:flex items-center justify-center px-5 py-2.5 bg-health-100/90 border border-gray-200 text-gray-900 rounded-md text-sm font-semibold shadow-sm hover:bg-gray-50 hover:text-primary transition-all outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 min-h-11"
          >
            {dictionary.loginButton || 'Login'}
          </Link>
          <Link
            href={redirectedPathName(targetLanguage)}
            aria-label={dictionary.toggleLanguage}
            className="hidden md:flex items-center justify-center w-11 h-11 rounded-md text-muted-foreground hover:bg-muted transition-colors focus-visible:ring-2 focus-visible:ring-primary font-medium"
          >
            {targetLanguageLabel}
          </Link>

          <button
            type="button"
            className="md:hidden flex items-center justify-center w-11 h-11 rounded-md text-muted-foreground hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-controls="mobile-menu"
            aria-expanded={isMobileMenuOpen}
            aria-label={isMobileMenuOpen ? dictionary.closeMenu : dictionary.openMenu}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <span className="sr-only">
              {isMobileMenuOpen ? dictionary.closeMenu : dictionary.openMenu}
            </span>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"} />
            </svg>
          </button>
          <ThemeToggle></ThemeToggle>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            id="mobile-menu"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="md:hidden overflow-hidden bg-background border-b border-border"
          >
            <div className="px-4 pt-2 pb-4 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={`/${lang}${link.href}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-3 py-3 rounded-md text-base font-medium min-h-11 ${
                    isActive(link.href)
                      ? 'text-primary bg-primary/10'
                      : 'text-muted-foreground hover:text-primary hover:bg-muted'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              <Link
                href={`/${lang}/login`}
                onClick={() => setIsMobileMenuOpen(false)}
                className="block w-full text-center px-3 py-3 bg-health-100/90 text-gray-900 rounded-md text-base font-medium shadow-sm"
              >
                {dictionary.loginButtonPatient || 'Patient Login'}
              </Link>
              <Link
                href={`/${lang}/login`}
                onClick={() => setIsMobileMenuOpen(false)}
                className="block w-full text-center px-3 py-3 bg-health-100/90 text-gray-900 rounded-md text-base font-medium shadow-sm"
              >
                {dictionary.loginButtonProvider || 'Doctor Login'}
              </Link>
              <Link
                 href={redirectedPathName(lang === 'en' ? 'de' : 'en')}
                 className="block px-3 py-3 mt-4 border-t border-border text-muted-foreground font-medium"
                 onClick={() => setIsMobileMenuOpen(false)}
              >
                {dictionary.toggleLanguage}
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}