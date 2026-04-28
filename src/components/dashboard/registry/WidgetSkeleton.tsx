/**
 * @author Ricardo Merlos Torres
 * @email rmerlos@g-metrics.com
 * @create date 2026-04-13 16:54:55
 * @modify date 2026-04-13 16:54:55
 * @desc [description]
 */

"use client"

import React from "react";
import { motion } from "framer-motion";
import { Activity } from "lucide-react";

export function WidgetSkeleton() {
    return (
        <div className="flex h-full w-full flex-col items-center justify-center rounded-xl bg-slate-50/50 dark:bg-slate-800/30">
            <motion.div
                initial={{ opacity: 0.3, scale: 0.9 }}
                animate={{ opacity: [0.3, 1, 0.3], scale: [0.9, 1, 0.9] }}
                transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
                className="flex flex-col items-center gap-3 text-health-blue/40 dark:text-health-blue/30"
            >
                <Activity size={32} strokeWidth={1.5} />
                
                <div className="h-1 w-24 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                    <motion.div
                        className="h-full bg-health-blue/50"
                        animate={{
                            x: ["-100%", "100%"],
                        }}
                        transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: "linear",
                        }}
                    />
                </div>
            </motion.div>
        </div>
    );
}