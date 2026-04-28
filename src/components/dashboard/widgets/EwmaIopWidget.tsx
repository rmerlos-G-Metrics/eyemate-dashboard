/**
 * @author Ricardo Merlos Torres
 * @email rmerlos@g-metrics.com
 * @create date 2026-04-21 10:03:49
 * @modify date 2026-04-21 10:03:49
 * @desc [description]
 */

"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import { Activity } from "lucide-react";
import { BaseWidgetProps } from "../registry/widgetRegistry";

import sensorData from "../../../../data/gmetrics_mock_data.json";

const Plot = dynamic(() => import("react-plotly.js"), { 
    ssr: false,
    loading: () => (
        <div className="flex h-full w-full items-center justify-center bg-slate-50/50 dark:bg-slate-800/20 animate-pulse rounded-xl">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600/30 border-t-blue-600"></div>
        </div>
    )
});

export default function EwmaIopWidget({ dictionary }: BaseWidgetProps) {
    const dict = dictionary?.dashboard_FHIR || dictionary;

    // --- State ---
    const [alpha, setAlpha] = useState<number>(0.3);

    // --- Responsive State ---
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    const [revision, setRevision] = useState(0);

    useEffect(() => {
        if (!chartContainerRef.current) return;
        const observer = new ResizeObserver((entries) => {
            for (let entry of entries) {
                const { width, height } = entry.contentRect;
                setDimensions((prev) => {
                    if (prev.width === width && prev.height === height) return prev;
                    // Trigger a layout re-render only when physical size changes
                    setRevision((r) => r + 1); 
                    return { width, height };
                });
            }
        });
        observer.observe(chartContainerRef.current);
        return () => observer.disconnect();
    }, []);

    // --- 1. Base Data Parsing (Runs once) ---
    const baseData = useMemo(() => {
        // Isolate the single sensor and sort chronologically to ensure accurate moving averages
        const patientData = sensorData
            .filter((reading: any) => reading.sensor_id === "GM-SEN-001")
            .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());

        const dates = patientData.map((d: any) => d.date);
        const rawIop = patientData.map((d: any) => d.iop);

        return { dates, rawIop };
    }, []);

    // --- 2. EWMA Calculation (Fast recalculation on Alpha change) ---
    const ewmaData = useMemo(() => {
        if (baseData.rawIop.length === 0) return [];

        const ewma = [];
        // The first EWMA point is initialized as the first raw point
        let currentEwma = baseData.rawIop[0]; 
        ewma.push(currentEwma);

        // EWMA Formula: EWMA_t = α * X_t + (1 - α) * EWMA_{t-1}
        for (let i = 1; i < baseData.rawIop.length; i++) {
            currentEwma = (alpha * baseData.rawIop[i]) + ((1 - alpha) * currentEwma);
            ewma.push(currentEwma);
        }
        
        return ewma;
    }, [alpha, baseData]);

    // --- 3. Plotly Traces ---
    const traces: any[] = useMemo(() => [
        {
            // Trace 0: Raw Data (Faint background dots)
            x: baseData.dates,
            y: baseData.rawIop,
            type: "scatter",
            mode: "markers",
            marker: { color: "rgba(59, 130, 246, 0.25)", size: 4 }, // Faint blue circles
            name: "Raw IOP",
            hoverinfo: "y+name",
            hovertemplate: "%{y:.1f} mmHg<extra>Raw Data</extra>"
        },
        {
            // Trace 1: EWMA Path (Solid prominent line)
            x: baseData.dates,
            y: ewmaData,
            type: "scatter",
            mode: "lines",
            line: { shape: "spline", smoothing: 0.5, color: "#3b82f6", width: 2.5 }, // Solid blue line
            name: `EWMA (α=${alpha.toFixed(2)})`,
            hoverinfo: "y+name",
            hovertemplate: "<b>%{y:.1f} mmHg</b><extra>Trend Line</extra>"
        }
    ], [baseData, ewmaData, alpha]);

    // --- 4. Plotly Layout (Memoized to prevent UI rebuilds) ---
    const layout = useMemo(() => ({
        width: dimensions.width,
        height: dimensions.height,
        autosize: true,
        margin: { t: 10, r: 10, l: 40, b: 30 },
        paper_bgcolor: "transparent",
        plot_bgcolor: "transparent",
        font: { family: "Inter, sans-serif", color: "#64748b" },
        xaxis: {
            type: "date",
            showgrid: true,
            gridcolor: "rgba(100, 116, 139, 0.05)",
            zeroline: false,
            tickfont: { color: "#64748b" }
        },
        yaxis: {
            title: "IOP (mmHg)",
            autorange: true,
            showgrid: true,
            gridcolor: "rgba(100, 116, 139, 0.1)",
            zeroline: false,
            tickfont: { color: "#64748b" }
        },
        showlegend: false,
        hovermode: "x unified",
        shapes: [
            {
                // Target Threshold Line (21 mmHg)
                type: 'line',
                xref: 'paper',
                x0: 0,
                x1: 1,
                y0: 18,
                y1: 18,
                line: { color: 'rgba(239, 68, 68, 0.4)', width: 1.5, dash: 'dash' }
            }
        ],
        annotations: [
            {
                // Target Line Label
                xref: 'paper',
                x: 1,
                y: 18.5,
                text: 'Target: 18 MMHG',
                showarrow: false,
                xanchor: 'right',
                font: { size: 10, color: '#ef4444', family: "Inter" }
            }
        ]
    }), [dimensions]);

    return (
        <div className="flex h-full w-full flex-col overflow-hidden">
            
            {/* Widget Header */}
            <header className="mb-4 flex flex-col gap-1">
                <div className="flex justify-between items-start">
                    <h3 className="text-xl font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                        {dict?.iopTrendTitle || 'Test Data'}
                    </h3>
                </div>
                <p className="text-xs text-slate-500">
                    Use the alpha slider below to separate long-term trends from acute daily fluctuations.
                </p>
            </header>

            {/* Responsive Chart Container */}
            <div ref={chartContainerRef} className="relative flex-1 w-full min-h-[250px] mb-3">
                {dimensions.width > 0 && (
                    <Plot
                        data={traces}
                        layout={layout}
                        revision={revision}
                        config={{ displaylogo: false, displayModeBar: true, responsive: true }}
                        style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
                        useResizeHandler={true} 
                    />
                )}
            </div>

            {/* Slider Control Panel */}
            <div className="flex items-center gap-4 bg-slate-50/50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800 backdrop-blur-sm">
                <div className="flex flex-col flex-1 gap-2">
                    <div className="flex justify-between items-center">
                        <label htmlFor="alpha-slider" className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                            Smoothing Factor (α)
                        </label>
                        <span className="text-xs font-mono bg-white dark:bg-slate-800 px-2 py-1 rounded shadow-sm border border-slate-200 dark:border-slate-700 text-blue-600 dark:text-blue-400">
                            {alpha.toFixed(2)}
                        </span>
                    </div>
                    
                    <input
                        id="alpha-slider"
                        type="range"
                        min="0.01"
                        max="0.99"
                        step="0.01"
                        value={alpha}
                        onChange={(e) => setAlpha(parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700 accent-blue-500 hover:accent-blue-600 transition-all"
                    />
                    
                    <div className="flex justify-between text-[10px] text-slate-400 font-medium px-1 mt-1">
                        <span>← Long-term Trend</span>
                        <span>Acute Events →</span>
                    </div>
                </div>
            </div>

        </div>
    );
}