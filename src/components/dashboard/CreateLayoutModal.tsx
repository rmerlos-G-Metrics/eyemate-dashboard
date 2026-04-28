/**
 * @author Ricardo Merlos Torres
 * @email rmerlos@g-metrics.com
 * @create date 2026-04-13 16:14:04
 * @modify date 2026-04-13 16:14:04
 * @desc [description]
 */

'use client'

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { LayoutList, X } from "lucide-react";

interface CreateLayoutModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreate: (name: string) => void;
    dictionary: any;
}

export function CreateLayoutModal({ isOpen, onClose, onCreate, dictionary }: CreateLayoutModalProps) {
    const [mounted, setMounted] = useState(false);
    // Use dictionary for the default value
    const [layoutName, setLayoutName] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    const dict = dictionary.dashboardControlBar.createLayoutModal;

    useEffect(() => {
        setMounted(true);
    }, []);
    
    useEffect(() => {
        if (isOpen) {
            // Calculate scrollbar width
            const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
            
            // Apply padding to fill the gap left by the disappearing scrollbar
            document.body.style.paddingRight = `${scrollbarWidth}px`;
            document.body.style.overflow = "hidden";
            
            setLayoutName(dict.defaultViewName);
            setTimeout(() => inputRef.current?.select(), 100); 
        } else {
            // Restore everything when closed
            document.body.style.paddingRight = "0px";
            document.body.style.overflow = "unset";
            setTimeout(() => setLayoutName(""), 300);
        }
        
        return () => { 
            document.body.style.paddingRight = "0px";
            document.body.style.overflow = "unset"; 
        };
    }, [isOpen, dict.defaultViewName]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedName = layoutName.trim();
        if (trimmedName) {
            onCreate(trimmedName);
            onClose();
        }
    };

    if (!mounted) return null;

    return createPortal(
        <AnimatePresence>
        {isOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm dark:bg-slate-950/60"
                    aria-hidden="true"
                />

                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    transition={{ type: "spring", duration: 0.4, bounce: 0.3 }}
                    className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/20 bg-white/90 p-6 shadow-2xl backdrop-blur-xl dark:border-slate-700/50 dark:bg-slate-900/90"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="create-layout-title"
                >
                    <button
                        onClick={onClose}
                        className="absolute right-4 top-4 rounded-full p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
                    >
                        <X size={20} />
                    </button>

                    <div className="flex flex-col">
                        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-health-blue/10 text-health-blue dark:bg-health-blue/20">
                            <LayoutList size={24} />
                        </div>
                        
                        <h2 id="create-layout-title" className="mb-2 text-xl font-semibold text-slate-900 dark:text-white">
                            {dict.title}
                        </h2>
                        
                        <p className="mb-5 text-sm text-slate-500 dark:text-slate-400">
                            {dict.description}
                        </p>

                        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                            <div>
                                <label htmlFor="layout-name" className="sr-only">
                                    {dict.inputLabel}
                                </label>
                                <input
                                    ref={inputRef}
                                    id="layout-name"
                                    type="text"
                                    value={layoutName}
                                    onChange={(e) => setLayoutName(e.target.value)}
                                    placeholder={dict.placeholder}
                                    className="w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-3 text-sm font-medium text-slate-900 placeholder-slate-400 shadow-inner focus:border-health-blue focus:outline-none focus:ring-2 focus:ring-health-blue/20 dark:border-slate-700 dark:bg-slate-950/50 dark:text-white dark:focus:ring-health-blue/30"
                                    autoFocus
                                    required
                                />
                            </div>

                            <div className="flex w-full flex-col gap-3 sm:flex-row mt-2">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700/50"
                                >
                                    {dict.cancelButton}
                                </button>
                                
                                <button
                                    type="submit"
                                    disabled={!layoutName.trim()}
                                    className="flex-1 rounded-xl bg-health-blue px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-md transition-all hover:bg-blue-500 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-health-blue focus:ring-offset-2 active:scale-95 disabled:opacity-50 disabled:pointer-events-none dark:hover:bg-blue-500 dark:focus:ring-offset-slate-900"
                                >
                                    {dict.submitButton}
                                </button>
                            </div>
                        </form>
                    </div>
                </motion.div>
            </div>
        )}
        </AnimatePresence>,
        document.body
    );
}