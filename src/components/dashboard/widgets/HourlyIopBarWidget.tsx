/**
 * @author Ricardo Merlos Torres
 * @email rmerlos@g-metrics.com
 * @create date 2026-04-27 15:33:40
 * @modify date 2026-04-27 15:33:40
 * @desc [description]
 */


"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import { BaseWidgetProps } from "../registry/widgetRegistry";
import sensorData from "../../../../data/gmetrics_mock_data.json";

// Dynamically import Plotly for SSR safety
const Plot = dynamic(() => import("react-plotly.js"), { 
    ssr: false,
    loading: () => (
        <div className="flex h-full w-full items-center justify-center bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 rounded-xl">
            <div className="animate-spin rounded-full border-4 border-health-blue/30 border-t-health-blue h-8 w-8"></div>
        </div>
    )
});

// --- Math Utilities ---
// Native JS equivalent to Pandas .agg(['mean', 'std'])
const calculateStats = (values: number[]) => {
    if (values.length === 0) return { mean: null, std: null };
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    if (values.length === 1) return { mean, std: 0 };
    
    // Sample Standard Deviation
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / (values.length - 1);
    return { mean, std: Math.sqrt(variance) };
};

export default function HourlyIopBarWidget({ dictionary }: BaseWidgetProps) {
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

    // --- Data Processing (Pandas Translation) ---
    const plotData = useMemo(() => {
        const patientData = sensorData.filter((reading: any) => reading.sensor_id === "GM-SEN-001");
        
        if (patientData.length === 0) return { traces: [] };

        // 1. Find the latest measurement date
        const timestamps = patientData.map((d: any) => new Date(d.date).getTime());
        const latestTime = Math.max(...timestamps);
        const latestDate = new Date(latestTime);

        // 2. Define Time Cohort Cutoffs
        const ninetyDaysPrior = new Date(latestTime - (90 * 24 * 60 * 60 * 1000));
        const oneEightyDaysPrior = new Date(latestTime - (180 * 24 * 60 * 60 * 1000));

        // 3. Initialize Hour Buckets (0-23)
        const bucketsAll = Array.from({ length: 24 }, () => [] as number[]);
        const bucketsRecent = Array.from({ length: 24 }, () => [] as number[]); // 90-180
        const bucketsMostRecent = Array.from({ length: 24 }, () => [] as number[]); // 0-90

        // 4. Distribute Data into Buckets
        patientData.forEach((d: any) => {
            const dateObj = new Date(d.date);
            const hour = dateObj.getHours();
            const iop = d.iop;

            bucketsAll[hour].push(iop);

            if (dateObj >= ninetyDaysPrior) {
                bucketsMostRecent[hour].push(iop);
            } else if (dateObj >= oneEightyDaysPrior && dateObj < ninetyDaysPrior) {
                bucketsRecent[hour].push(iop);
            }
        });

        // 5. Calculate Means and Stds
        const statsAll = bucketsAll.map(calculateStats);
        const statsRecent = bucketsRecent.map(calculateStats);
        const statsMostRecent = bucketsMostRecent.map(calculateStats);

        const hours = Array.from({ length: 24 }, (_, i) => i);

        // 6. Build Plotly Traces (Translating go.Bar)
        const traces = [
            {
                x: hours,
                y: statsAll.map(s => s.mean),
                error_y: { type: 'data', array: statsAll.map(s => s.std), visible: true, color: '#475569', thickness: 1 },
                name: dict?.allData || 'All Data',
                type: 'bar',
                marker: { color: '#94a3b8' },
                hovertemplate: '<b>All Data</b><br>Hour: %{x}:00<br>Mean: %{y:.1f} ± %{error_y.array:.1f}<extra></extra>'
            },
            {
                x: hours,
                y: statsRecent.map(s => s.mean),
                error_y: { type: 'data', array: statsRecent.map(s => s.std), visible: true, color: '#0f766e', thickness: 1 },
                name: dict?.past180to90 || '-180 to -90 Days',
                type: 'bar',
                marker: { color: '#0ea5e9' }, 
                hovertemplate: '<b>-180 to -90 Days</b><br>Hour: %{x}:00<br>Mean: %{y:.1f} ± %{error_y.array:.1f}<extra></extra>'
            },
            {
                x: hours,
                y: statsMostRecent.map(s => s.mean),
                error_y: { type: 'data', array: statsMostRecent.map(s => s.std), visible: true, color: '#86198f', thickness: 1 },
                name: dict?.past90 || 'Past 90 Days',
                type: 'bar',
                marker: { color: '#d946ef' }, 
                hovertemplate: '<b>Past 90 Days</b><br>Hour: %{x}:00<br>Mean: %{y:.1f} ± %{error_y.array:.1f}<extra></extra>'
            }
        ];

        return { traces };
    }, [dict]);

    // --- Plotly Configs ---
    const barLayout: Partial<Plotly.Layout> = useMemo(() => ({
        width: dimensions.width,
        height: dimensions.height > 100 ? dimensions.height : 300,
        autosize: true,
        margin: { t: 30, r: 20, l: 40, b: 50 },
        paper_bgcolor: "transparent",
        plot_bgcolor: "transparent",
        font: { family: "Inter, sans-serif", color: "#64748b" },
        barmode: "group",
        showlegend: true,
        legend: { orientation: "h", y: -0.2, x: 0.5, xanchor: "center" },
        xaxis: {
            tickmode: 'array',
            tickvals: [0, 3, 6, 9, 12, 15, 18, 21],
            ticktext: ['Midnight', '3am', '6am', '9am', 'Noon', '3pm', '6pm', '9pm'],
            range: [-0.5, 23.5],
            showgrid: false,
            zeroline: false
        },
        yaxis: {
            title: { text: "Mean IOP [mmHg]", font: { size: 10 } },
            tickformat: ",.1f",
            showgrid: true,
            gridcolor: "rgba(100, 116, 139, 0.1)",
            zeroline: false,
        },
        shapes: [
            {
                type: 'line',
                x0: -0.5, x1: 23.5,
                y0: 21, y1: 21,
                line: { color: 'rgba(239, 68, 68, 0.8)', width: 2, dash: 'dash' },
                layer: "below"
            }
        ]
    }), [dimensions]);

    return (
        <div className="flex h-full w-full flex-col overflow-hidden">
            <header className="mb-2 flex flex-col gap-1">
                <h3 className="text-xl font-semibold text-slate-800 dark:text-white">
                    {dict?.hourlyIopTitle || 'Average IOP by Hour of Day'}
                </h3>
            </header>

            <div ref={chartContainerRef} className="relative flex-1 w-full h-full">
                {dimensions.width > 0 && plotData.traces && (
                    <Plot
                        data={plotData.traces as any}
                        layout={barLayout}
                        config={{ displayModeBar: false, responsive: true }}
                        style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
                        useResizeHandler={true} 
                    />
                )}
            </div>
        </div>
    );
}