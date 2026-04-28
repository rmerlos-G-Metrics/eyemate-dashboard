/**
 * @author Ricardo Merlos Torres
 * @email rmerlos@g-metrics.com
 * @create date 2026-04-13 17:27:42
 * @modify date 2026-04-13 17:27:42
 * @desc [description]
 */

"use client"

import React from "react";
import { motion } from "framer-motion";
import { Server, Activity, ShieldCheck } from "lucide-react";

export default function SystemDiagnosticsWidget() {
    return (
        <div className="flex h-full w-full flex-col justify-between rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 p-4 dark:from-slate-800/50 dark:to-slate-900/50">
            {/* Header Area */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                    <Server size={18} className="text-health-blue" />
                    <span className="text-sm font-semibold">G-Metrics Core</span>
                </div>
                {/* Pulsing Status Indicator */}
                <div className="flex items-center gap-2 rounded-full bg-green-100 px-2.5 py-1 dark:bg-green-900/30">
                    <motion.div
                        animate={{ opacity: [1, 0.4, 1] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        className="h-2 w-2 rounded-full bg-green-500"
                    />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-green-700 dark:text-green-400">
                        Online
                    </span>
                </div>
            </div>

            {/* Metrics Area */}
            <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="flex flex-col rounded-lg border border-slate-200/60 bg-white/60 p-3 shadow-sm dark:border-slate-700/50 dark:bg-slate-800/60">
                    <span className="mb-1 text-[10px] uppercase text-slate-500">Latency</span>
                    <div className="flex items-end gap-1">
                        <span className="text-xl font-bold text-slate-800 dark:text-slate-100">12</span>
                        <span className="mb-0.5 text-xs font-medium text-slate-400">ms</span>
                    </div>
                </div>
                <div className="flex flex-col rounded-lg border border-slate-200/60 bg-white/60 p-3 shadow-sm dark:border-slate-700/50 dark:bg-slate-800/60">
                    <span className="mb-1 text-[10px] uppercase text-slate-500">Sync Status</span>
                    <div className="flex items-center gap-1.5 mt-1">
                        <ShieldCheck size={18} className="text-health-blue" />
                        <span className="text-sm font-bold text-slate-800 dark:text-slate-100">Verified</span>
                    </div>
                </div>
            </div>

            {/* Footer Area */}
            <div className="mt-4 flex items-center gap-2 border-t border-slate-200 pt-3 text-xs text-slate-500 dark:border-slate-700">
                <Activity size={14} className="text-slate-400" />
                <span>Registry Architecture Active</span>
            </div>
        </div>
    );
}