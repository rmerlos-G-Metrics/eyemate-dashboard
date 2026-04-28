/**
 * @author Ricardo Merlos Torres
 * @email rmerlos@g-metrics.com
 * @create date 2026-04-09 13:19:02
 * @modify date 2026-04-09 13:19:02
 * @desc [description]
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { ThemeToggle } from './ThemeToggle';
import { logoutAction } from "@/actions/authActions";
import { LogoutConfirmModal } from "../ui/LogoutConfirmModal";

interface NavbarProps {
  lang: string;
  dictionary: any;
}

export default function NavbarLogin({ lang, dictionary}: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
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

  const handleLogout = logoutAction.bind(null, lang);

  return (
    <>
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
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Left section */}
          <div className="shrink-0 flex items-center">
            <Link href={`/${lang}`} className="flex items-center gap-2 outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md">
              <Image 
                src="/images/CORA_Logo_v1.png" 
                alt={dictionary.logoAlt} 
                width={130} height={80} 
                className="object-contain" priority
              />
            </Link>
          </div>

          {/* Right section */}
          <div className="flex items-center gap-2">
              <button
                  type="button"
                  onClick={() => setIsLogoutModalOpen(true)}
                  className="hidden min-h-11 items-center justify-center rounded-md border border-red-200 bg-red-50/90 px-5 py-2.5 text-sm font-semibold text-red-700 shadow-sm transition-all outline-none hover:border-red-600 hover:bg-red-500 hover:text-white focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-800 dark:hover:text-white md:flex"
              >
                  {dictionary?.logoutButton || 'Logout'}
              </button>
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
      <LogoutConfirmModal 
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        logoutAction={handleLogout}
        dictionary={dictionary}
      />
    </>
  );
}