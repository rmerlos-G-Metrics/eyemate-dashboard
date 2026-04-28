/**
 * @author Ricardo Merlos Torres
 * @email rmerlos@g-metrics.com
 * @create date 2026-04-27 15:57:07
 * @modify date 2026-04-27 15:57:07
 * @desc [description]
 */

"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import { BaseWidgetProps } from "../registry/widgetRegistry";
import sensorData from "../../../../data/gmetrics_mock_data.json";

interface QuickViewProps extends BaseWidgetProps {
    fhirData?: any[];
}

const Plot = dynamic(() => import("react-plotly.js"), { 
    ssr: false,
    loading: () => (
        <div className="flex h-full w-full items-center justify-center bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 rounded-xl">
            <div className="animate-spin rounded-full border-4 border-health-blue/30 border-t-health-blue h-8 w-8"></div>
        </div>
    )
});

// Clinical Ranges and Colors (Apple Glassmorphism UI matched)
const RANGES = [
    { label: "Low (<12)", color: "#3b82f6", min: 0, max: 12 },        // blue-500
    { label: "Target (12-18)", color: "#10b981", min: 12, max: 18 },  // emerald-500
    { label: "Elevated (18-21)", color: "#f59e0b", min: 18, max: 21 },// amber-500
    { label: "High (>21)", color: "#ef4444", min: 21, max: 100 },     // red-500
];

const TARGET_THRESHOLD = 21;

export default function QuickViewWidget({ dictionary, fhirData = sensorData }: QuickViewProps) {
    const dict = dictionary?.dashboard_FHIR || dictionary;
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    useEffect(() => {
        if (!chartContainerRef.current) return;
        const observer = new ResizeObserver((entries) => {
            for (let entry of entries) {
                setDimensions({ width: entry.contentRect.width, height: entry.contentRect.height });
            }
        });
        observer.observe(chartContainerRef.current);
        return () => observer.disconnect();
    }, []);

    const plotData = useMemo(() => {
        const patientData = fhirData.filter((reading: any) => reading.sensor_id === "GM-SEN-001");
        if (patientData.length === 0) return null;

        // 1. Establish Time Cutoffs
        const timestamps = patientData.map((d: any) => new Date(d.date).getTime());
        const latestTime = Math.max(...timestamps);
        
        const ninetyDaysPrior = latestTime - (90 * 24 * 60 * 60 * 1000);
        const oneEightyDaysPrior = latestTime - (180 * 24 * 60 * 60 * 1000);

        // 2. Filter Cohorts
        const past90 = patientData.filter((d: any) => new Date(d.date).getTime() >= ninetyDaysPrior);
        const prev90 = patientData.filter((d: any) => {
            const t = new Date(d.date).getTime();
            return t >= oneEightyDaysPrior && t < ninetyDaysPrior;
        });

        // 3. Calculate Averages
        const avg90 = past90.length > 0 
            ? past90.reduce((sum: number, d: any) => sum + d.iop, 0) / past90.length 
            : 0;
        
        const avgPrev90 = prev90.length > 0 
            ? prev90.reduce((sum: number, d: any) => sum + d.iop, 0) / prev90.length 
            : avg90; // Fallback if no prior data

        // 4. Calculate Distribution for Donut Chart
        const distribution = RANGES.map(r => ({
            ...r,
            count: past90.filter((d: any) => d.iop >= r.min && d.iop < r.max).length
        }));

        // 5. Build Plotly Traces
        const traces: any[] = [
            // Left Side: Donut Chart showing IOP Division
            {
                type: "pie",
                hole: 0.65, // Makes it a donut
                labels: distribution.map(d => d.label),
                values: distribution.map(d => d.count),
                marker: { 
                    colors: distribution.map(d => d.color),
                    line: { color: 'white', width: 2 }
                },
                domain: { x: [0, 0.45], y: [0, 1] }, // Take up the left 45% of the canvas
                textinfo: "percent",
                textfont: { size: 12, color: "#475569" },
                hoverinfo: "label+value+percent",
                showlegend: false
            },
            // Right Side: Main Indicator
            {
                type: "indicator",
                mode: "number+delta+gauge",
                value: avg90,
                number: { valueformat: ".1f", suffix: " mmHg", font: { size: 40, color: "#0f172a" } },
                title: { 
                    text: "90-Day Average", 
                    font: { size: 14, color: "#64748b" } 
                },
                delta: { 
                    reference: avgPrev90, 
                    valueformat: ".1f",
                    position: "top",
                    // CRITICAL: Inverse colors for medical data. Increase in pressure is BAD (Red).
                    increasing: { color: "#ef4444", symbol: "▲" }, 
                    decreasing: { color: "#10b981", symbol: "▼" }
                },
                gauge: {
                    axis: { range: [5, 35], visible: true, tickcolor: "#cbd5e1" },
                    // Color the gauge bar green if below threshold, red if above
                    bar: { color: avg90 <= TARGET_THRESHOLD ? "#10b981" : "#ef4444", thickness: 0.2 },
                    bgcolor: "rgba(100, 116, 139, 0.1)",
                    borderwidth: 0,
                    threshold: {
                        line: { color: "#ef4444", width: 3 },
                        thickness: 0.75,
                        value: TARGET_THRESHOLD
                    }
                },
                domain: { x: [0.55, 1], y: [0.1, 0.9] } // Take up the right side of the canvas
            }
        ];

        return { traces, past90Count: past90.length };
    }, [fhirData]);

    const layout: Partial<Plotly.Layout> = useMemo(() => ({
        width: dimensions.width,
        height: dimensions.height > 100 ? dimensions.height : 250,
        autosize: true,
        margin: { t: 40, r: 20, l: 20, b: 20 },
        paper_bgcolor: "transparent",
        plot_bgcolor: "transparent",
        font: { family: "Inter, sans-serif", color: "#64748b" },
        annotations: [
            // Label for the center of the Donut Chart
            {
                text: `<b>${plotData?.past90Count || 0}</b><br><span style='font-size:10px'>Readings</span>`,
                x: 0.225, // Center of the left domain
                y: 0.5,
                showarrow: false,
                font: { size: 16, color: "#334155" },
                xanchor: "center",
                yanchor: "middle"
            }
        ]
    }), [dimensions, plotData]);

    return (
        <div className="flex h-full w-full flex-col overflow-hidden">
            <header className="mb-2 flex flex-col gap-1">
                <h3 className="text-xl font-semibold text-slate-800 dark:text-white">
                    {dict?.quickViewTitle || 'IOP Quick View (Past 90 Days)'}
                </h3>
                <p className="text-xs text-slate-500">
                    Distribution of pressure readings vs. overall average trend.
                </p>
            </header>

            <div ref={chartContainerRef} className="relative flex-1 w-full min-h-[220px]">
                {dimensions.width > 0 && plotData?.traces && (
                    <Plot
                        data={plotData.traces as any}
                        layout={layout}
                        config={{ displayModeBar: false, responsive: true }}
                        style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
                        useResizeHandler={true} 
                    />
                )}
            </div>
        </div>
    );
}
