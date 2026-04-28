"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import { BaseWidgetProps } from "../registry/widgetRegistry";

import sensorData from "../../../../data/gmetrics_mock_data.json";
import { Layout } from "lucide-react";

const Plot = dynamic(() => import("react-plotly.js"), { 
    ssr: false,
    loading: () => (
        <div className="flex h-full w-full items-center justify-center bg-slate-50 border border-slate-100 rounded-xl">
            <div className="animate-spin rounded-full border-4 border-blue-600/30 border-t-blue-600 h-8 w-8"></div>
        </div>
    )
});

const IOP_RANGES = [
    { label: "<12 (Low)", color: "#3b82f6", min: 0, max: 12 },        
    { label: "12-18 (Target)", color: "#22c55e", min: 12, max: 18 },  
    { label: "18-21 (Elevated)", color: "#f97316", min: 18, max: 21 },
    { label: ">21 (High)", color: "#ef4444", min: 21, max: 100 },     
];

const getColorForIop = (iop: number) => {
    const range = IOP_RANGES.find(r => iop >= r.min && iop < r.max);
    return range ? range.color : "#94a3b8"; 
};

export default function InteractivePolarClockWidget({ dictionary }: BaseWidgetProps) {
    // --- State ---
    // Null means "All Time" is selected. Otherwise, it holds the start and end dates.
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

    // --- 1. Data for the Bottom Timeline (Never filtered) ---
    const { timelineDates, timelineIop } = useMemo(() => {
        const patientData = sensorData.filter((reading: any) => reading.sensor_id === "GM-SEN-001");
        
        // Group by day to make the bottom bar chart
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

    // --- 2. Data for the Polar Clock (Filtered by customDateRange) ---
    const { polarValues, polarColors, hoverTexts } = useMemo(() => {
        let patientData = sensorData.filter((reading: any) => reading.sensor_id === "GM-SEN-001");

        // Filter by the slider range if the user has touched it
        if (customDateRange) {
            patientData = patientData.filter((d: any) => {
                const dateObj = new Date(d.date);
                return dateObj >= customDateRange.start && dateObj <= customDateRange.end;
            });
        }

        const hourBuckets = Array.from({ length: 24 }, () => ({ sum: 0, count: 0 }));

        patientData.forEach((d: any) => {
            const dateObj = new Date(d.date);
            const hour = dateObj.getHours(); 
            hourBuckets[hour].sum += d.iop;
            hourBuckets[hour].count += 1;
        });

        const values = [];
        const colors = [];
        const texts = [];

        for (let i = 0; i < 24; i++) {
            if (hourBuckets[i].count > 0) {
                const avgIop = Number((hourBuckets[i].sum / hourBuckets[i].count).toFixed(1));
                values.push(avgIop);
                colors.push(getColorForIop(avgIop));
                texts.push(`${String(i).padStart(2, '0')}:00 - Avg IOP: ${avgIop} mmHg (${hourBuckets[i].count} readings)`);
            } else {
                values.push(null); 
                colors.push("transparent");
                texts.push("No data");
            }
        }

        return { polarValues: values, polarColors: colors, hoverTexts: texts };
    }, [customDateRange]);

    // --- Plotly Configs ---
    const thetas = Array.from({ length: 24 }, (_, i) => i * 15);

    const polarLayout: Partial<Plotly.Layout> = useMemo(() => {
        const layout: Partial<Plotly.Layout> = {
            width: dimensions.width,
            height: dimensions.height > 150 ? dimensions.height - 100 : 300,
            autosize: false,
            // Increased top and bottom margins significantly to fit the new internal text
            margin: { t: 60, r: 30, l: 30, b: 80 }, 
            paper_bgcolor: "transparent",
            plot_bgcolor: "transparent",
            font: { family: "Inter, sans-serif", color: "#64748b" },
            polar: {
                angularaxis: {
                    direction: "clockwise",
                    rotation: 90,
                    tickmode: "array",
                    tickvals: [0, 45, 90, 135, 180, 225, 270, 315],
                    ticktext: ["00:00", "03:00", "06:00", "09:00", "12:00", "15:00", "18:00", "21:00"],
                    tickfont: { size: 10, color: "#94a3b8" },
                    gridcolor: "rgba(100, 116, 139, 0.1)",
                },
                radialaxis: {
                    visible: true,
                    range: [0, 30], 
                    tickvals: [10, 18, 25], 
                    ticktext: ["10", "18 Limit", "25"],
                    tickfont: { size: 9, color: "#94a3b8" },
                    gridcolor: "rgba(100, 116, 139, 0.15)",
                    angle: 90
                }
            },
            showlegend: false,
            annotations: [] // Initialize annotations array
        };

        // 1. Bake the Date Range directly into the top right of the canvas
        const dateText = customDateRange 
            ? `${customDateRange.start.toISOString().split('T')[0]} to ${customDateRange.end.toISOString().split('T')[0]}`
            : dictionary?.allTime || "All Time Data";

        layout.annotations!.push({
            text: `<b>${dictionary?.dateRange || "Date Range"}:</b> ${dateText}`,
            xref: "paper",
            yref: "paper",
            x: 1.0,     // Right edge
            y: 1.15,    // Above the chart
            xanchor: "right",
            yanchor: "bottom",
            showarrow: false,
            font: { size: 11, color: "#475569", family: "Inter, sans-serif" }
        });

        // 2. Bake the Color Legend directly into the bottom left of the canvas
        // This ensures the color meanings are always exported in the PDF
        IOP_RANGES.forEach((range, idx) => {
            layout.annotations!.push({
                // Using HTML spans to create colored dots directly inside Plotly
                text: `<span style="color:${range.color}">⬤</span> ${range.label}`,
                xref: "paper",
                yref: "paper",
                x: 0,                   // Left edge
                y: -0.1 - (idx * 0.08), // Stack them downwards
                xanchor: "left",
                yanchor: "top",
                showarrow: false,
                font: { size: 10, color: "#64748b", family: "Inter, sans-serif" },
                align: "left"
            });
        });

        return layout;

    // CRITICAL: Ensure customDateRange is in the dependency array so the layout updates when sliding
    }, [dimensions, customDateRange, dictionary]);

    const timelineLayout: Partial<Plotly.Layout> = useMemo(() => ({
        width: dimensions.width,
        height: 100, // Fixed small height for the navigator
        margin: { t: 0, r: 20, l: 20, b: 20 },
        paper_bgcolor: "transparent",
        plot_bgcolor: "transparent",
        font: { family: "Inter, sans-serif", color: "#64748b" },
        xaxis: {
            rangeslider: { visible: true, thickness: 0.15, bgcolor: "rgba(100, 116, 139, 0.05)" },
            type: "date",
            showgrid: false,
            zeroline: false
        },
        yaxis: { visible: false, fixedrange: true },
        showlegend: false,
        hovermode: "x unified"
    }), [dimensions]);

    // --- Interaction Handler ---
    const handleRelayout = (event: any) => {
        // Plotly returns keys like 'xaxis.range[0]' when the slider is dragged
        if (event['xaxis.range[0]'] && event['xaxis.range[1]']) {
            setCustomDateRange({
                start: new Date(event['xaxis.range[0]']),
                end: new Date(event['xaxis.range[1]'])
            });
        } 
        // If the user double clicks to reset the zoom
        else if (event['xaxis.autorange']) {
            setCustomDateRange(null);
        }
    };

    return (
        <div className="flex h-full w-full flex-col overflow-hidden">
            <header className="mb-2 flex flex-col gap-1">
                <h3 className="text-xl font-semibold text-slate-800 dark:text-white">
                    Test Data
                </h3>
                <p className="text-xs text-slate-500">
                    Use the slider at the bottom to filter the 24-hour clock to a specific time range.
                </p>
            </header>

            {/* Custom Clinical Legend */}
            <div className="flex flex-wrap gap-x-4 gap-y-1 mb-2">
                {IOP_RANGES.map((range) => (
                    <div key={range.label} className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: range.color }} />
                        <span className="text-[11px] text-slate-600 dark:text-slate-300 font-medium">{range.label}</span>
                    </div>
                ))}
            </div>

            <div ref={chartContainerRef} className="relative flex-1 w-full min-h-[400px] flex flex-col">
                {dimensions.width > 0 && (
                    <>
                        {/* Top: The Polar Clock */}
                        <div style={{ height: polarLayout.height }}>
                            <Plot
                                data={[{
                                    type: "barpolar",
                                    r: polarValues,
                                    theta: thetas,
                                    width: 15,
                                    marker: { color: polarColors, line: { color: "white", width: 1 } },
                                    hoverinfo: "text",
                                    hovertext: hoverTexts,
                                    opacity: 0.85
                                }]}
                                layout={polarLayout}
                                config={{ displayModeBar: false }}
                            />
                        </div>

                        {/* Bottom: The Timeline Range Slider */}
                        <div style={{ height: 100 }}>
                            <Plot
                                className="pdf-exclude"
                                data={[{
                                    x: timelineDates,
                                    y: timelineIop,
                                    type: "bar",
                                    marker: { color: "#cbd5e1" }, // Neutral color for the timeline
                                    hoverinfo: "skip"
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