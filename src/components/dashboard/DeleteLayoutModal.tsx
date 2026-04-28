/**
 * @author Ricardo Merlos Torres
 * @email rmerlos@g-metrics.com
 * @create date 2026-04-13 16:25:31
 * @modify date 2026-04-13 16:25:31
 * @desc [description]
 */


'use client'

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { AlertTriangle, X } from "lucide-react";

interface DeleteLayoutModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    layoutName: string;
    dictionary: any;
}

export function DeleteLayoutModal({ isOpen, onClose, onConfirm, layoutName, dictionary }: DeleteLayoutModalProps) {
    const [mounted, setMounted] = useState(false);

    const dict = dictionary.dashboardControlBar.deleteLayoutModal;

    useEffect(() => {
        setMounted(true);
    }, []);
    
    useEffect(() => {
        if (isOpen) {
            const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

            document.body.style.paddingRight = `${scrollbarWidth}px`;
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.paddingRight = "0px";
            document.body.style.overflow = "unset";
        }
        return () => { 
            document.body.style.paddingRight = "0px";
            document.body.style.overflow = "unset" 
        };
    }, [isOpen]);

    if (!mounted) return null;

    return createPortal(
        <AnimatePresence>
        {isOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm dark:bg-slate-950/60"
                    aria-hidden="true"
                />

                {/* Modal Content */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    transition={{ type: "spring", duration: 0.4, bounce: 0.3 }}
                    className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/20 bg-white/90 p-6 shadow-2xl backdrop-blur-xl dark:border-slate-700/50 dark:bg-slate-900/90"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="delete-layout-title"
                >
                    <button
                        onClick={onClose}
                        className="absolute right-4 top-4 rounded-full p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
                    >
                        <X size={20} />
                    </button>

                    <div className="flex flex-col items-center text-center">
                        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100/50 text-red-600 dark:bg-red-900/20 dark:text-red-400">
                            <AlertTriangle size={24} />
                        </div>
                        
                        <h2 id="delete-layout-title" className="mb-2 text-xl font-semibold text-slate-900 dark:text-white">
                            {dict.title}
                        </h2>
                        
                        <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">
                            {dict.confirmPrefix} <span className="font-semibold text-slate-700 dark:text-slate-200">"{layoutName}"</span> {dict.confirmSuffix}
                        </p>

                        <div className="flex w-full flex-col gap-3 sm:flex-row">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700/50"
                            >
                                {dict.cancelButton}
                            </button>
                            
                            <button
                                type="button"
                                onClick={() => {
                                    onConfirm();
                                    onClose();
                                }}
                                className="flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-red-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 active:scale-95 dark:hover:bg-red-500 dark:focus:ring-offset-slate-900"
                            >
                                {dict.deleteButton}
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        )}
        </AnimatePresence>,
        document.body
    );
}