'use client';

import {useState, useEffect} from 'react';
import {motion, AnimatePresence} from 'framer-motion';

interface CookieBannerProps {
    dictionary: {
        title: string;
        description: string;
        acceptAll: string;
        rejectAll: string;
        manage: string;
    };
}

export default function CookieBanner({dictionary}: CookieBannerProps) {
    // State Management
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        //check if the usere has already made a choice
        const consent = localStorage.getItem('gmetrics_cookie_consent');

        if (!consent) {
            const timer = setTimeout(() => setIsVisible(true), 1000);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('gmetrics_cookie_consent', 'accepted');
        setIsVisible(false);
    };

    const handleReject = () => {
        localStorage.setItem('gmetrics_cookie_consent', 'rejected');
        setIsVisible(false);
    }

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ y:50, opacity: 0}}
                    animate={{ y:0, opacity: 1}}
                    exit={{ y:50, opacity:0 }}
                    transition={{ type: 'spring', bounce: 0.1, duration:0.6 }}
                    role='dialog'
                    aria-labelledby='cookie-banner-title'
                    aria-describedby='cookie-banner-description'
                    className="fixed bottom-4 left-4 right-4 z-50 p-6 md:left-auto md:right-8 md:w-96 rounded-2xl shadow-2xl bg-background/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800"
                >
                    <div className='flex flex-col items-center text-center'>
                        <h2 id="cookie-banner-title" className="text-lg font-semibold text-foreground">
                            {dictionary.title}
                        </h2>
                        <p id="cookie-banner-description" className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                            {dictionary.description}
                        </p>
                        <div className="flex flex-col gap-3 mt-6 sm:flex-row sm:justify-end">
                            <button
                                onClick={handleReject}
                                className='px-4 py-2 text-sm font-medium transition-colors rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-health-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900'
                            >
                                {dictionary.rejectAll}
                            </button>
                            <button
                                onClick={handleAccept}
                                className='px-4 py-2 text-sm font-medium transition-colors rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-health-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900'
                            >
                                {dictionary.acceptAll}
                            </button>
                        </div>
                    </div>
                    
                </motion.div>
            )}
        </AnimatePresence>
    );
}
