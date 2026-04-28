/**
 * @author Ricardo Merlos Torres
 * @email rmerlos@g-metrics.com
 * @create date 2026-04-27 10:55:29
 * @modify date 2026-04-27 10:55:29
 * @desc [description]
 */

"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import { BaseWidgetProps } from "../registry/widgetRegistry";
import sensorData from "../../../../data/gmetrics_mock_data.json";

const Plot = dynamic(() => import("react-plotly.js"), { 
    ssr: false,
    loading: () => (
        <div className="flex h-full w-full items-center justify-center bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 rounded-xl">
            <div className="animate-spin rounded-full border-4 border-health-blue/30 border-t-health-blue h-8 w-8"></div>
        </div>
    )
});

const TOD_CLASSES = [
    { label: "Night (00:00 - 06:00)", color: "#1e293b", minHour: 0, maxHour: 6 },   // slate-800
    { label: "Morning (06:00 - 12:00)", color: "#0ea5e9", minHour: 6, maxHour: 12 }, // health-blue
    { label: "Afternoon (12:00 - 18:00)", color: "#f59e0b", minHour: 12, maxHour: 18 }, // amber-500
    { label: "Evening (18:00 - 24:00)", color: "#6366f1", minHour: 18, maxHour: 24 }  // indigo-500
];

const IOP_THRESHOLD = 21;

// implementation of scipy.stats.gaussian_kde
const calculateKDE = (pts: number[], xRange: number[], bandwidth: number) => {
    if (pts.length === 0) return xRange.map(() => 0);
    return xRange.map(x => {
        const density = pts.reduce((sum, v) => {
            const u = (x - v) / bandwidth;
            return sum + (1 / Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * u * u);
        }, 0);
        return density / (pts.length * bandwidth); 
    });
};

export default function WaterfallDensityWidget({ dictionary }: BaseWidgetProps) {
    const dict = dictionary?.dashboard_FHIR || dictionary;
    const [customDateRange, setCustomDateRange] = useState<{start: Date, end: Date} | null>(null);
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

    // --- 1. Data for Timeline (Never filtered) ---
    const { timelineDates, timelineIop } = useMemo(() => {
        const patientData = sensorData.filter((reading: any) => reading.sensor_id === "GM-SEN-001");
        const dailyAgg: Record<string, {sum: number, count: number}> = {};
        
        patientData.forEach((d: any) => {
            const dateStr = d.date.split("T")[0];
            if (!dailyAgg[dateStr]) dailyAgg[dateStr] = {sum: 0, count: 0};
            dailyAgg[dateStr].sum += d.iop;
            dailyAgg[dateStr].count += 1;
        });

        const sortedDates = Object.keys(dailyAgg).sort();
        const avgIops = sortedDates.map(date => Number((dailyAgg[date].sum / dailyAgg[date].count).toFixed(1)));

        return { timelineDates: sortedDates, timelineIop: avgIops };
    }, []);

    // --- 2. KDE Processing (Filtered by customDateRange) ---
    const plotData = useMemo(() => {
        let patientData = sensorData.filter((reading: any) => reading.sensor_id === "GM-SEN-001");

        if (customDateRange) {
            patientData = patientData.filter((d: any) => {
                const dateObj = new Date(d.date);
                return dateObj >= customDateRange.start && dateObj <= customDateRange.end;
            });
        }

        // Define the X-axis points to evaluate the KDE (IOP from 5 to 40 mmHg)
        const xValues = Array.from({ length: 100 }, (_, i) => 5 + i * 0.35);
        const bandwidth = 1.2; // Scott's Rule equivalent smoothing
        
        let allIops: number[] = [];
        
        const traces = TOD_CLASSES.map(tod => {
            const iopsInClass = patientData
                .filter((d: any) => {
                    const hour = new Date(d.date).getHours();
                    return hour >= tod.minHour && hour < tod.maxHour;
                })
                .map((d: any) => d.iop);

            allIops = allIops.concat(iopsInClass);

            const yValues = calculateKDE(iopsInClass, xValues, bandwidth);
            
            // Weight the density by the proportion of readings in this TOD vs total readings
            const weight = iopsInClass.length > 0 ? (iopsInClass.length / patientData.length) : 0;
            const weightedY = yValues.map(y => y * weight);

            return {
                x: xValues,
                y: weightedY,
                type: 'scatter',
                mode: 'none', 
                fill: 'tonexty',
                stackgroup: 'one',
                fillcolor: tod.color,
                name: tod.label,
                hovertemplate: `<b>${tod.label}</b><br>IOP: %{x:.1f} mmHg<br>Density: %{y:.4f}<extra></extra>`
            };
        });

        const meanIop = allIops.length > 0 ? allIops.reduce((a, b) => a + b, 0) / allIops.length : 0;

        return { traces, meanIop, totalReadings: allIops.length };
    }, [customDateRange]);

    // --- Plotly Configs ---
    const waterfallLayout: Partial<Plotly.Layout> = useMemo(() => {
        const layout: Partial<Plotly.Layout> = {
            width: dimensions.width,
            height: dimensions.height > 150 ? dimensions.height - 100 : 300,
            autosize: false,
            margin: { t: 40, r: 20, l: 40, b: 60 },
            paper_bgcolor: "transparent",
            plot_bgcolor: "transparent",
            font: { family: "Inter, sans-serif", color: "#64748b" },
            showlegend: false,
            xaxis: {
                title: { text: "Intraocular Pressure (mmHg)", font: { size: 10 } },
                showgrid: true,
                gridcolor: "rgba(100, 116, 139, 0.1)",
                zeroline: false,
                range: [8, 35] 
            },
            yaxis: {
                title: { text: "Probability Density", font: { size: 10 } },
                showgrid: true,
                gridcolor: "rgba(100, 116, 139, 0.1)",
                zeroline: true,
                showticklabels: true
            },
            shapes: [
                // Threshold Line (Red)
                {
                    type: 'line',
                    x0: IOP_THRESHOLD, x1: IOP_THRESHOLD,
                    y0: 0, y1: 1,
                    yref: 'paper',
                    line: { color: 'rgba(239, 68, 68, 0.8)', width: 2, dash: 'dash' }
                },
                // Mean Line (Black/Slate)
                {
                    type: 'line',
                    x0: plotData.meanIop, x1: plotData.meanIop,
                    y0: 0, y1: 1,
                    yref: 'paper',
                    line: { color: 'rgba(51, 65, 85, 0.8)', width: 1.5, dash: 'dot' }
                }
            ],
            annotations: []
        };

        // PDF Data Context (Top Right)
        const dateText = customDateRange 
            ? `${customDateRange.start.toISOString().split('T')[0]} to ${customDateRange.end.toISOString().split('T')[0]}`
            : dict?.allTime || "All Time Data";

        layout.annotations!.push({
            text: `<b>${dict?.dateRange || "Date Range"}:</b> ${dateText}<br><b>n:</b> ${plotData.totalReadings} readings`,
            xref: "paper", yref: "paper",
            x: 1.0, y: 1.1,
            xanchor: "right", yanchor: "bottom",
            showarrow: false,
            font: { size: 11, color: "#475569", family: "Inter, sans-serif" },
            align: "right"
        });

        // Threshold & Mean Labels
        layout.annotations!.push({
            text: `Limit (${IOP_THRESHOLD})`,
            x: IOP_THRESHOLD, y: 1,
            yref: "paper", xanchor: "left", yanchor: "bottom",
            showarrow: false,
            font: { size: 9, color: "#ef4444" }
        });
        
        layout.annotations!.push({
            text: `Mean (${plotData.meanIop.toFixed(1)})`,
            x: plotData.meanIop, y: 0.95,
            yref: "paper", xanchor: "right", yanchor: "bottom",
            showarrow: false,
            font: { size: 9, color: "#334155" }
        });

        // Color Legend (Bottom Below X-Axis)
        TOD_CLASSES.forEach((tod, idx) => {
            layout.annotations!.push({
                text: `<span style="color:${tod.color}">⬤</span> ${tod.label}`,
                xref: "paper", yref: "paper",
                x: 0 + (idx * 0.25), y: -0.25, // Spread them horizontally below the chart
                xanchor: "left", yanchor: "top",
                showarrow: false,
                font: { size: 10, color: "#64748b", family: "Inter, sans-serif" },
            });
        });

        return layout;
    }, [dimensions, customDateRange, dict, plotData]);

    const timelineLayout: Partial<Plotly.Layout> = useMemo(() => ({
        width: dimensions.width, height: 100,
        margin: { t: 0, r: 20, l: 40, b: 20 },
        paper_bgcolor: "transparent", plot_bgcolor: "transparent",
        font: { family: "Inter, sans-serif", color: "#64748b" },
        xaxis: {
            rangeslider: { visible: true, thickness: 0.15, bgcolor: "rgba(100, 116, 139, 0.05)" },
            type: "date", showgrid: false, zeroline: false
        },
        yaxis: { visible: false, fixedrange: true },
        showlegend: false, hovermode: "x unified"
    }), [dimensions]);

    const handleRelayout = (event: any) => {
        if (event['xaxis.range[0]'] && event['xaxis.range[1]']) {
            setCustomDateRange({
                start: new Date(event['xaxis.range[0]']),
                end: new Date(event['xaxis.range[1]'])
            });
        } else if (event['xaxis.autorange']) {
            setCustomDateRange(null);
        }
    };

    return (
        <div className="flex h-full w-full flex-col overflow-hidden">
            <header className="mb-2 flex flex-col gap-1">
                <h3 className="text-xl font-semibold text-slate-800 dark:text-white">
                    {dict?.waterfallTitle || 'IOP Density Distribution'}
                </h3>
            </header>

            <div ref={chartContainerRef} className="relative flex-1 w-full min-h-[400px] flex flex-col">
                {dimensions.width > 0 && (
                    <>
                        {/* Top: The KDE Stacked Area Chart */}
                        <div style={{ height: waterfallLayout.height }}>
                            <Plot
                                data={plotData.traces as any}
                                layout={waterfallLayout}
                                config={{ displayModeBar: false }}
                            />
                        </div>

                        {/* Bottom: Timeline Range Slider */}
                        <div style={{ height: 100 }}>
                            <Plot
                                className="pdf-exclude"
                                data={[{
                                    x: timelineDates, y: timelineIop, type: "bar",
                                    marker: { color: "#cbd5e1" }, hoverinfo: "skip"
                                }]}
                                layout={timelineLayout}
                                config={{ displayModeBar: false }}
                                onRelayout={handleRelayout}
                            />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}