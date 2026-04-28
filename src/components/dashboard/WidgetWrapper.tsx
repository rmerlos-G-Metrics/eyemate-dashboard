/**
 * @author Ricardo Merlos Torres
 * @email rmerlos@g-metrics.com
 * @create date 2026-04-10 11:03:05
 * @modify date 2026-04-20 08:35:46
 * @desc [description]
 */

"use client"

import React, { forwardRef } from "react";
import { GripHorizontal, Maximize2, ArrowDownRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { WidgetDefinition, WidgetLayout } from "@/types/dashboard";
import { useDashboardStore } from "@/store/useDashboardStore";

interface WidgetWrapperProps extends React.HTMLAttributes<HTMLDivElement> {
    definition: WidgetDefinition;
    layout: WidgetLayout;
    children: React.ReactNode;
    dictionary: any;
}

export const WidgetWrapper = forwardRef<HTMLDivElement, WidgetWrapperProps>(
    ({ definition, layout, children, style, dictionary, id, className, ...rest }, ref) => {
        const isEditMode = useDashboardStore((state) => state.isEditMode);

        return (
            <div
                id={`widget-${layout.i}`}
                ref={ref}
                style={style}
                className={`flex flex-col h-full rounded-2xl border transition-all duration-300 relative overflow-hidden ${
                    isEditMode
                        ? "border-health-blue/50 bg-white/90 shadow-lg ring-2 ring-health-blue/20 dark:bg-slate-800/90 dark:border-health-blue/40"
                        : "border-white/20 bg-white/60 backdrop-blur-xl shadow-lg hover:shadow-xl dark:bg-slate-900/60 dark:border-slate-700/50"
                } ${className || ""}`}
                {...rest}
            >
                {/* Header */}
                <header
                    className={`relative z-20 flex items-center justify-between px-4 py-3 border-b border-health-blue/10 transition-colors ${
                        isEditMode ? "widget-drag-handle cursor-grab active:cursor-grabbing bg-health-blue/5" : ""
                    }`}
                >
                    <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 select-none flex items-center relative">
                        {definition.title}
                        
                        <AnimatePresence>
                            {isEditMode && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="absolute left-full ml-3 whitespace-nowrap pointer-events-none"
                                >
                                    <span className="font-mono text-[10px] py-0.5 px-2 bg-slate-100 text-slate-500 rounded-md border border-slate-200 dark:bg-slate-800 dark:border-slate-700">
                                        x:{layout.x} y:{layout.y} w:{layout.w} h:{layout.h}
                                    </span>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </h3>
                    
                    <AnimatePresence>
                        {isEditMode && (
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="text-health-blue"
                            >
                                <GripHorizontal size={18} aria-hidden="true" />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </header>
                
                {/* Content Area */}
                <div className="flex flex-1 flex-col relative p-4">
                    <div 
                        className={`w-full h-full transition-all duration-300 ease-in-out ${
                            isEditMode 
                                ? "opacity-30 blur-[2px] pointer-events-none" 
                                : "opacity-100 blur-0 pointer-events-auto"
                        }`}
                    >
                        {children}
                    </div>

                    <AnimatePresence>
                        {isEditMode && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="absolute inset-2 z-10 border-2 border-dashed border-health-blue/40 rounded-xl flex flex-col items-center justify-center bg-white/40 dark:bg-slate-800/40 backdrop-blur-sm pointer-events-none"
                            >
                                <Maximize2 className="text-health-blue/80 mb-2" size={24} />
                                <span className="text-sm font-medium text-health-blue/90 select-none text-center px-4 drop-shadow-sm">
                                    {dictionary?.widgetWrapper?.resizeHintTitle || "Layout Mode"} <br/>
                                    <span className="text-xs opacity-80">
                                        {dictionary?.widgetWrapper?.resizeHint || "Drag to move, pull bottom right corner to resize"}
                                    </span>
                                </span>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <AnimatePresence>
                    {isEditMode && (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute bottom-1 right-1 p-1 text-health-blue/70 pointer-events-none z-20"
                        >
                            <motion.div
                                animate={{ opacity: [0.4, 1, 0.4] }}
                                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                            >
                                <ArrowDownRight size={20} strokeWidth={5.5} />
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        )
    }
)

WidgetWrapper.displayName = "WidgetWrapper";