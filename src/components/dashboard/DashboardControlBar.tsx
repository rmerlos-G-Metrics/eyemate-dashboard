/**
 * @author Ricardo Merlos Torres
 * @email rmerlos@g-metrics.com
 * @create date 2026-04-15 09:40:31
 * @modify date 2026-04-20 09:40:38
 * @desc [description]
 */

"use client"

import React, { useMemo, useState, useRef, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion";
import { 
    LayoutDashboard, Settings2, Eye, EyeOff, Trash2, 
    Plus, ChevronDown, Check, User, Calendar, IdCard, Loader2, FileDown, UploadCloud
} from "lucide-react";
import { useDashboardStore } from "@/store/useDashboardStore";
import { CreateLayoutModal } from "./CreateLayoutModal";
import { DeleteLayoutModal } from "./DeleteLayoutModal";
import { getFhirPatient } from "@/actions/getFhirPatient";

import { pdf } from "@react-pdf/renderer";
import { PatientReportPDF } from "./pdf/PatientReportPDF";
import { PatientReportData } from "@/types/report";
import { writeFHIRDocumentReference } from "@/actions/writeFHIRDocumentReference";

interface DashboardControlBarProps {
    dictionary: any;
}

interface PatientHeaderData {
    name: string;
    id: string;
    dob: string;
    sex: string;
}

export function DashboardControlBar({dictionary}: DashboardControlBarProps) {
    const {
        isEditMode,
        toggleEditMode,
        activePresetId,
        setActivePreset,
        presets,
        widgets,
        toggleWidgetVisibility,
        createPreset,
        deletePreset,
    } = useDashboardStore();

    const activePreset = useMemo(() => 
        presets.find(p => p.id === activePresetId) || presets[0],
    [presets, activePresetId]);

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // --- Patient Data State ---
    const [patientInfo, setPatientInfo] = useState<PatientHeaderData | null>(null);
    const [isLoadingPatient, setIsLoadingPatient] = useState(true);
    
    // --- PDF Generation State ---
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const fetchPatient = useCallback(async () => {
        setIsLoadingPatient(true);
        const result = await getFhirPatient();
        
        if (result.success && result.data) {
            const p = result.data;
            const officialName = p.name?.find((n: any) => n.use === 'official') || p.name?.[0];
            
            const given = officialName?.given?.join(" ") || "";
            const family = officialName?.family || "";
            const name = officialName ? `${given} ${family}`.trim() : "Unknown Patient";
            const id = p.id || "Unknown ID";
            const dob = p.birthDate || "N/A";
            const sex = p.gender ? p.gender.charAt(0).toUpperCase() + p.gender.slice(1) : "Unknown";

            setPatientInfo({ name, id, dob, sex });
        } else {
            setPatientInfo(null);
        }
        setIsLoadingPatient(false);
    }, []);

    useEffect(() => {
        fetchPatient();
    }, [fetchPatient]);

    const [isUploading, setIsUploading] = useState(false);
    
    const handleTestUpload = async () => {
        setIsUploading(true);
        try {
            const result = await writeFHIRDocumentReference();
            if (result.success) {
                alert(dictionary?.dashboard?.uploadSuccess || "Document uploaded successfully!")
            } else {
                alert(result.message || (dictionary?.dashboard?.uploadFailed || "Document upload failed."))
            } 
        } catch (error) {
            console.error("Upload error:", error);
        } finally {
            setIsUploading(false);
        }
    }

    const pdfData: PatientReportData | null = useMemo(() => {
        if (!patientInfo) return null;
        return {
            patientName: patientInfo.name,
            patientId: patientInfo.id,
            dob: patientInfo.dob,
            sex: patientInfo.sex,
            diagnosis: "Glaucoma",
            reportDate: new Date().toISOString().split('T')[0],
            reportId: `REP-${new Date().getTime().toString()}`
        };
    }, [patientInfo]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const pdfDictionaryFallback = dictionary?.pdfReport || { 
        title: "Dashboard Report", 
        labels: { patient: "Patient", patientId: "Patient ID", diagnosis: "Diagnosis", dob: "DOB", sex: "Sex", exam: "Exam Date", reportId: "Report ID" }, 
        imagePlaceholderText: "Dashboard Data" 
    };

    // PDF Generation
    const handleGeneratePDF = async () => {
        if (!pdfData) return;
        
        setIsGeneratingPDF(true);
        
        try {
            await new Promise(resolve => setTimeout(resolve, 50));

            const Plotly = (await import("plotly.js-dist-min")).default;

            // 1. SMART SORTING: Read from top-to-bottom, left-to-right
            const sortedLayouts = [...activePreset.layouts]
                .filter(layoutItem => layoutItem.isVisible) // Only print visible widgets
                .sort((a, b) => {
                    // If they are on the same row (y), sort by column (x)
                    if (a.y === b.y) {
                        return a.x - b.x;
                    }
                    // Otherwise, sort by row (y)
                    return a.y - b.y;
                });

            // 2. Fetch plots in the exact sorted order
            const plotPromises = sortedLayouts.map(async (layoutItem) => {
                // Find the specific widget wrapper in the DOM
                const widgetDOM = document.getElementById(`widget-${layoutItem.i}`);
                if (!widgetDOM) return null;

                // Find the Plotly chart inside this specific widget (ignoring sliders)
                const plotElement = widgetDOM.querySelector('.js-plotly-plot:not(.pdf-exclude)');
                if (!plotElement) return null; // Safe fallback if a widget isn't a chart

                // Convert to High-Res Image
                return Plotly.toImage(plotElement as any, { 
                    format: 'png', 
                    width: 800,  
                    height: 400 
                });
            });
            
            // 3. Resolve all promises and filter out any nulls (non-chart widgets)
            const plotImages = (await Promise.all(plotPromises)).filter(Boolean) as string[];

            // 4. Append the ordered plots to the PDF payload
            const completePdfData: PatientReportData = {
                ...pdfData,
                plots: plotImages
            };

            // 5. Generate the Blob in memory
            const blob = await pdf(
                <PatientReportPDF 
                    data={completePdfData} 
                    dictionary={pdfDictionaryFallback} 
                />
            ).toBlob();
            
            // 6. Securely trigger download
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `G-Metrics_Report_${completePdfData.patientName.replace(/\s+/g, '_')}.pdf`;
            document.body.appendChild(link);
            link.click();
            
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

        } catch (error) {
            console.error("Failed to generate PDF:", error);
        } finally {
            setIsGeneratingPDF(false);
        }
    };

    return (
        <>
            <div className="sticky top-0 z-50 w-full">
                <div className="flex flex-col border border-white/20 bg-white/60 backdrop-blur-xl shadow-lg dark:bg-slate-900/60 dark:border-slate-700/50">
                    
                    {/* Top Row */}
                    <div className="grid grid-cols-3 items-center px-6 py-4">
                        
                        {/* Left: Layout Selector */}
                        <div className="flex items-center gap-4 justify-self-start">
                            <div className="flex items-center gap-3">
                                <LayoutDashboard size={20} className="text-slate-600 dark:text-slate-300" />
                            </div>
                            <div>
                                <label htmlFor="preset-select" className="font-semibold uppercase tracking-wider text-slate-900 dark:text-white">
                                    {dictionary?.dashboardControlBar?.activeLayoutLabel || "Active Layout"}
                                </label>
                                <div className="flex items-center gap-2">
                                    <div className="relative" ref={dropdownRef}>
                                        <button
                                            onClick={() => !isEditMode && setIsDropdownOpen(!isDropdownOpen)}
                                            disabled={isEditMode}
                                            className={`flex items-center gap-3 min-w-[160px] justify-between rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-200 border ${
                                                isEditMode 
                                                    ? "bg-slate-100/50 text-slate-400 border-transparent dark:bg-slate-800/50 cursor-not-allowed" 
                                                    : "bg-white text-slate-900 border-slate-200 shadow-sm hover:border-health-blue/50 hover:shadow-health-blue/10 dark:bg-slate-800 dark:text-white dark:border-slate-700"
                                            }`}
                                        >
                                            <span>{activePreset.name}</span>
                                            <motion.div animate={{ rotate: isDropdownOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                                                <ChevronDown size={16} className="text-slate-400" />
                                            </motion.div>
                                        </button>

                                        <AnimatePresence>
                                            {isDropdownOpen && !isEditMode && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                                    className="absolute top-full left-0 mt-2 w-[220px] rounded-xl border border-white/20 bg-white backdrop-blur-xl shadow-xl dark:bg-slate-800 dark:border-slate-700 py-2 z-50 origin-top-left"
                                                >
                                                    {presets.map((preset) => (
                                                        <button
                                                            key={preset.id}
                                                            onClick={() => { 
                                                                setActivePreset(preset.id); 
                                                                setIsDropdownOpen(false); 
                                                            }}
                                                            className="w-full flex items-center justify-between px-4 py-2 text-sm text-left hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors"
                                                        >
                                                            <span className={preset.id === activePresetId ? "font-semibold text-health-blue" : "text-slate-700 dark:text-slate-200"}>
                                                                {preset.name}
                                                            </span>
                                                            {preset.id === activePresetId && <Check size={16} className="text-health-blue" />}
                                                        </button>
                                                    ))}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    {!isEditMode && (
                                        <div>
                                            <button onClick={() => setIsCreateModalOpen(true)} className="p-1.5 text-slate-400 hover:text-green-800 hover:bg-green-200 rounded-md transition-colors disabled:opacity-50">
                                                <Plus size={20} />
                                            </button>
                                            <button onClick={() => setIsDeleteModalOpen(true)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-100 rounded-md transition-colors disabled:opacity-50">
                                                <Trash2 size={20} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Middle: Patient Verification Display */}
                        <div className="flex items-center justify-center justify-self-center">
                            {isLoadingPatient ? (
                                <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800/80 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm">
                                    <Loader2 size={16} className="text-health-blue animate-spin" />
                                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Loading Patient Context...</span>
                                </div>
                            ) : patientInfo ? (
                                <div className="flex items-center gap-3 px-4 py-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                                    <div className="flex items-center gap-1.5 border-r border-slate-300 dark:border-slate-600 pr-3">
                                        <User size={24} className="text-health-blue" />
                                        <span className="text-sm font-semibold text-slate-900 dark:text-white truncate max-w-[120px] lg:max-w-[180px]" title={patientInfo.name}>
                                            {patientInfo.name}
                                        </span>
                                        <span className="text-sm px-1.5 py-0.5 rounded-md bg-slate-200/50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-300" title="Sex">
                                            {patientInfo.sex}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3 text-xs font-medium text-slate-600 dark:text-slate-400">
                                        <span className="text-sm flex items-center gap-1" title="Patient ID">
                                            <IdCard size={28} className="text-slate-400 dark:text-slate-500" />
                                            {patientInfo.id}
                                        </span>
                                        <span className="text-sm flex items-center gap-1" title="Date of Birth">
                                            <Calendar size={28} className="text-slate-400 dark:text-slate-500" />
                                            {patientInfo.dob}
                                        </span>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-500/10 rounded-full border border-red-200 dark:border-red-500/20 shadow-sm text-red-600 dark:text-red-400">
                                    <span className="text-sm font-medium">No Active Patient Context</span>
                                </div>
                            )}
                        </div>

                        {/* Right: Actions */}
                        <div className="flex items-center gap-4 justify-self-end">

                            {/* Upload Button */}
                            <button
                                onClick={handleTestUpload}
                                disabled={isUploading}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-health-blue bg-white/40 hover:bg-white/60 dark:bg-slate-800/40 dark:hover:bg-slate-800/60 dark:text-blue-400 border border-health-blue/10 rounded-xl transition-all shadow-sm disabled:opacity-50"
                            >
                                {isUploading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                <UploadCloud className="w-4 h-4" />
                                )}
                                <span>{dictionary?.dashboard?.uploadTestDoc || "Upload PDF"}</span>
                            </button>
                            
                            {/* PDF Button */}
                            {isMounted && !isEditMode && (
                                <button
                                    onClick={handleGeneratePDF}
                                    disabled={isLoadingPatient || !pdfData || isGeneratingPDF}
                                    className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-300 border backdrop-blur-md
                                        ${(isLoadingPatient || !pdfData || isGeneratingPDF)
                                            ? "bg-slate-100/50 text-slate-400 border-transparent cursor-not-allowed dark:bg-slate-800/50" 
                                            : "bg-white/80 text-health-blue border-health-blue/30 hover:bg-health-blue/10 hover:shadow-health-blue/20 shadow-sm dark:bg-slate-800/80 dark:border-health-blue/50 dark:hover:bg-slate-700"
                                        }`
                                    }
                                >
                                    {isGeneratingPDF || isLoadingPatient ? (
                                        <Loader2 size={18} className="animate-spin" />
                                    ) : (
                                        <FileDown size={18} />
                                    )}
                                    {isLoadingPatient 
                                        ? (dictionary?.dashboardControlBar?.loadingData || "Loading...")
                                        : isGeneratingPDF
                                            ? (dictionary?.dashboardControlBar?.generatingReport || "Generating...") 
                                            : (dictionary?.dashboardControlBar?.generateReport || "Generate Report")
                                    }
                                </button>
                            )}

                            {/* Edit Mode Button */}
                            <button
                                onClick={toggleEditMode}
                                className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-300 ${
                                    isEditMode
                                        ? "bg-health-blue-600 text-black shadow-md shadow-health-blue/20 hover:bg-blue-500 dark:bg-blue-600 dark:text-white dark:hover:bg-blue-500" 
                                        : "bg-slate-100 text-slate-700 hover:bg-blue-100 hover:text-health-blue dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                                }`}
                            >
                                <Settings2 size={20} className={isEditMode? "animate-spin-slow" : ""} />
                                {isEditMode 
                                    ? (dictionary?.dashboardControlBar?.doneEditing || "Done Editing") 
                                    : (dictionary?.dashboardControlBar?.editLayout || "Edit Layout")
                                }
                            </button>
                        </div>

                    </div>

                    {/* Bottom Row: Toggle Visible Widgets */}
                    <AnimatePresence initial={false}>
                        {isEditMode && (
                            <motion.div
                                initial={{height:0, opacity: 0}}
                                animate={{height:"auto", opacity: 1}}
                                exit={{height: 0, opacity: 0}}
                                transition={{duration: 0.3, ease: "easeInOut"}}
                                className="border-t border-slate-200/50 bg-white/40 dark:border-slate-700/50 dark:bg-slate-800/40 overflow-hidden"
                            >
                                <div className="px-6 py-4">
                                    <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                        {dictionary?.dashboardControlBar?.widgetVisibilityHint || "Widget Visibility (Click to toggle)"}
                                    </p>
                                    <div className="flex flex-wrap gap-3">
                                        {activePreset.layouts.map((layoutItem) => {
                                            const definition = widgets.find(w => w.id === layoutItem.i);
                                            if (!definition) return null;
                                            const isVisible = layoutItem.isVisible;
                                            return (
                                                <button
                                                    key={layoutItem.i}
                                                    onClick={() => toggleWidgetVisibility(layoutItem.i)}
                                                    className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                                                        isVisible
                                                            ? "bg-health-blue/10 text-health-blue border border-health-blue/20 ring-1 ring-health-blue/10 dark:bg-health-blue/20"
                                                            : "bg-slate-100 text-slate-400 border border-slate-200 hover:bg-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:hover:bg-slate-700"
                                                    }`}
                                                >
                                                    {isVisible ? <Eye size={16} /> : <EyeOff size={16} />}
                                                    {definition.title}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            <CreateLayoutModal 
                isOpen={isCreateModalOpen} 
                onClose={() => setIsCreateModalOpen(false)} 
                onCreate={(name) => createPreset(name)} 
                dictionary={dictionary} 
            />
            <DeleteLayoutModal 
                isOpen={isDeleteModalOpen} 
                onClose={() => setIsDeleteModalOpen(false)} 
                onConfirm={() => deletePreset(activePresetId)} 
                layoutName={activePreset.name} 
                dictionary={dictionary} 
            />
        </>
    );
}