'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

interface HeroProps {
  dictionary: {
    title: string;
    highlight: string;
    subtitle: string;
  };
}

export default function Hero({dictionary}: HeroProps) {
  return (
    <section 
      className="relative flex flex-col items-center justify-center min-h-[80vh] px-6 text-center"
      aria-label="Introduction to G-Metrics"
    >

      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,var(--color-health-100)_0%,transparent_70%)] dark:bg-[radial-gradient(ellipse_at_center,var(--color-health-900)_0%,transparent_70%)]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="max-w-4xl"
      >
        <h1 className="text-5xl font-extrabold tracking-tight md:text-7xl text-foreground">
          {dictionary.title} <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-linear-to-r from-health-500 to-health-700">
            {dictionary.highlight}
          </span>
        </h1>
        
        <p className="mt-6 text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
          {dictionary.subtitle}
        </p>

        <motion.div 
          className="mt-12 p-8 glass-panel max-w-lg mx-auto"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <div className='flex flex-col items-center text-center gap-5'>
            <p className="text-sm font-medium text-health-800 dark:text-health-200">
              {dictionary.madeBy}
            </p>
            <Image
              src="/images/G-Metrics-logo.png"
              alt="G-Metrics-Logo"
              width={150}
              height={150}
            />
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}