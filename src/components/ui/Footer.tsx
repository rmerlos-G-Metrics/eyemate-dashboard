import Link from 'next/link';

interface FooterProps {
    dictionary: {
        impressum: string;
        datenschutz: string;
        rights: string;
    };
    lang: string;
}

export default function Footer ({ dictionary, lang}: FooterProps) {
    const currentYear = new Date().getFullYear();

    return(
        <footer className="w-full py-8 mt-auto border-t border-slate-200 dark:border-slate-800 bg-background/50 backdrop-blur-sm">
        <div className="flex flex-col items-center justify-between px-6 mx-auto max-w-7xl md:flex-row">
            
            {/* Brand & Copyright */}
            <div className="mb-4 md:mb-0">
            <p className="text-sm text-slate-500 dark:text-slate-400">
                &copy; {currentYear} G-Metrics GmbH. {dictionary.rights}
            </p>
            </div>

            {/* Legal Links */}
            <nav className="flex gap-6" aria-label="Legal Navigation">
            <Link 
                href={`/${lang}/impressum`}
                className="text-sm font-medium transition-colors text-slate-500 hover:text-health-600 dark:hover:text-health-400 focus:outline-none focus:ring-2 focus:ring-health-500 rounded-sm"
            >
                {dictionary.impressum}
            </Link>
            
            <Link 
                href={`/${lang}/datenschutz`}
                className="text-sm font-medium transition-colors text-slate-500 hover:text-health-600 dark:hover:text-health-400 focus:outline-none focus:ring-2 focus:ring-health-500 rounded-sm"
            >
                {dictionary.datenschutz}
            </Link>
            </nav>
            
        </div>
        </footer>
    );
}