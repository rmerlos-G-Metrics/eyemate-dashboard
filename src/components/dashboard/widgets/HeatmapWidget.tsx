/**
 * @author Ricardo Merlos Torres
 * @email rmerlos@g-metrics.com
 * @create date 2026-04-20 17:03:46
 * @modify date 2026-04-20 17:03:46
 * @desc [description]
 */

"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import { CalendarDays, Clock } from "lucide-react";
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

// --- Types & Config ---
type DateRange = "6m" | "12m" | "2y" | "all";
type HourBin = 1 | 3 | 6;

const IOP_RANGES = [
    { label: "<12 (Low)", color: "#3b82f6", max: 12 },        // Blue
    { label: "12-18 (Target)", color: "#22c55e", max: 18 },   // Green
    { label: "18-21 (Elevated)", color: "#f97316", max: 21 }, // Orange
    { label: ">21 (High)", color: "#ef4444", max: 30 },       // Red
];

const Z_MAX = 30;
const discreteColorScale = [
    [0, "#3b82f6"], [12 / Z_MAX, "#3b82f6"],            // Blue
    [12 / Z_MAX, "#22c55e"], [18 / Z_MAX, "#22c55e"],   // Green
    [18 / Z_MAX, "#f97316"], [21 / Z_MAX, "#f97316"],   // Orange
    [21 / Z_MAX, "#ef4444"], [1, "#ef4444"]             // Red
];

export default function SinglePatientHeatmapWidget({ dictionary }: BaseWidgetProps) {
    const dict = dictionary?.dashboard_FHIR || dictionary;

    // --- Control State ---
    const [dateRange, setDateRange] = useState<DateRange>("all");
    const [hourBin, setHourBin] = useState<HourBin>(6);

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
                    setRevision((r) => r + 1);
                    return { width, height };
                });
            }
        });
        observer.observe(chartContainerRef.current);
        return () => observer.disconnect();
    }, []);

    // --- Data Parsing & Transformation ---
    const { heatmapZ, xDates, yHours } = useMemo(() => {
        // 1. Isolate the single sensor data FIRST
        let patientData = sensorData.filter((reading: any) => reading.sensor_id === "GM-SEN-001");

        // 2. Filter data by Date Range
        const now = new Date(); 
        let cutoffDate = new Date(0); 
        
        if (dateRange === "6m") cutoffDate.setMonth(now.getMonth() - 6);
        if (dateRange === "12m") cutoffDate.setFullYear(now.getFullYear() - 1);
        if (dateRange === "2y") cutoffDate.setFullYear(now.getFullYear() - 2);

        patientData = patientData.filter((d: any) => new Date(d.date) >= cutoffDate);

        // 3. Extract unique days for the X-axis (sorted)
        const uniqueDaysSet = new Set<string>();
        patientData.forEach((d: any) => {
            const dateStr = d.date.split("T")[0]; 
            uniqueDaysSet.add(dateStr);
        });
        const dates = Array.from(uniqueDaysSet).sort();

        // 4. Generate Hour Bins for the Y-axis
        const hours = Array.from({ length: 24 / hourBin }, (_, i) => `${String(i * hourBin).padStart(2, '0')}:00`);

        // 5. Initialize an empty 2D array: Z[y_index][x_index] (Filled with nulls)
        const zMatrix: (number | null)[][] = hours.map(() => dates.map(() => null));
        const tempAgg = hours.map(() => dates.map(() => ({ sum: 0, count: 0 })));

        // 6. Populate the matrix
        patientData.forEach((d: any) => {
            const dateObj = new Date(d.date);
            const dateStr = d.date.split("T")[0];
            const hour = dateObj.getHours();

            const xIndex = dates.indexOf(dateStr);
            const yIndex = Math.floor(hour / hourBin); 

            if (xIndex !== -1 && yIndex !== -1) {
                tempAgg[yIndex][xIndex].sum += d.iop;
                tempAgg[yIndex][xIndex].count += 1;
            }
        });

        // 7. Calculate averages
        for (let y = 0; y < hours.length; y++) {
            for (let x = 0; x < dates.length; x++) {
                if (tempAgg[y][x].count > 0) {
                    zMatrix[y][x] = Number((tempAgg[y][x].sum / tempAgg[y][x].count).toFixed(1));
                }
            }
        }

        return { heatmapZ: zMatrix, xDates: dates, yHours: hours };
    }, [hourBin, dateRange]);

    // --- Plotly Traces ---
    const traces: any[] = useMemo(() => [
        {
            type: "heatmap",
            z: heatmapZ,
            x: xDates,
            y: yHours,
            zmin: 0,
            zmax: Z_MAX,
            colorscale: discreteColorScale,
            showscale: false, 
            hoverinfo: "text",
            hovertemplate: "<b>Date:</b> %{x}<br><b>Time:</b> %{y}<br><b>IOP:</b> %{z} mmHg<extra></extra>",
            name: "IOP",
        }
    ], [heatmapZ, xDates, yHours]);

    // --- Plotly Layout ---
    const layout = useMemo(() => ({
        width: dimensions.width,
        height: dimensions.height,
        autosize: true,
        margin: { t: 10, r: 10, l: 50, b: 30 },
        paper_bgcolor: "transparent",
        plot_bgcolor: "transparent",
        font: { family: "Inter, sans-serif", color: "#64748b" },
        yaxis: { 
            title: "Time of Day", 
            autorange: "reversed", 
            showgrid: false,
            tickfont: { color: "#64748b" }
        },
        xaxis: { 
            showgrid: false, 
            zeroline: false,
            tickfont: { color: "#64748b" }
        },
        hovermode: "closest"
    }), [dimensions]);

    return (
        <div className="flex h-full w-full flex-col overflow-hidden">
            
            {/* Widget Header & Controls */}
            <header className="mb-4 flex flex-col gap-3">
                <div className="flex justify-between items-start">
                    <h3 className="text-xl font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                        {dict?.iopTitle || 'Test Data'}
                    </h3>
                </div>

                {/*
                <div className="flex flex-wrap gap-2 items-center bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-md p-2 rounded-xl border border-slate-100 dark:border-slate-800 w-fit">
                    
                    
                    <div className="flex items-center gap-2 px-2 border-r border-slate-200 dark:border-slate-700">
                        <CalendarDays size={14} className="text-slate-400" />
                        <select 
                            value={dateRange} onChange={(e) => setDateRange(e.target.value as DateRange)}
                            className="bg-transparent text-xs font-medium text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
                        >
                            <option value="6m">Last 6 Months</option>
                            <option value="12m">Last 12 Months</option>
                            <option value="2y">Last 2 Years</option>
                            <option value="all">All Time</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-2 px-2">
                        <Clock size={14} className="text-slate-400" />
                        <select 
                            value={hourBin} onChange={(e) => setHourBin(Number(e.target.value) as HourBin)}
                            className="bg-transparent text-xs font-medium text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
                        >
                            <option value={1}>1-Hour Windows</option>
                            <option value={3}>3-Hour Windows</option>
                            <option value={6}>6-Hour Windows</option>
                        </select>
                    </div>
                </div>
                */}
            </header>

            {/* Clinical Legend */}
            <div className="flex flex-wrap gap-x-4 gap-y-1 mb-2">
                <span className="text-[10px] text-slate-400 font-medium uppercase mr-2">Ranges (mmHg):</span>
                {IOP_RANGES.map((range) => (
                    <div key={range.label} className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-sm shadow-sm" style={{ backgroundColor: range.color }} />
                        <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">{range.label}</span>
                    </div>
                ))}
            </div>

            {/* Responsive Chart Container */}
            <div ref={chartContainerRef} className="relative flex-1 w-full min-h-[250px]">
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
        </div>
    );
}