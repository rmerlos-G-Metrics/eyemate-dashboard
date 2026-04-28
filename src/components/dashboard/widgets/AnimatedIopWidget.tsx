/**
 * @author Ricardo Merlos Torres
 * @email rmerlos@g-metrics.com
 * @create date 2026-04-20 18:03:58
 * @modify date 2026-04-20 18:03:58
 * @desc [description]
 */

"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import { CalendarDays } from "lucide-react";
import { BaseWidgetProps } from "../registry/widgetRegistry";

// Import actual data
import sensorData from "../../../../data/gmetrics_mock_data.json";

const Plot = dynamic(() => import("react-plotly.js"), { 
    ssr: false,
    loading: () => (
        <div className="flex h-full w-full items-center justify-center bg-slate-50 border border-slate-100 rounded-xl">
            <div className="animate-spin rounded-full border-4 border-blue-600/30 border-t-blue-600 h-8 w-8"></div>
        </div>
    )
});

type TimeStep = "daily" | "weekly" | "monthly";

// Helper to get week number
function getWeekNumber(d: Date) {
    const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    const dayNum = date.getUTCDay() || 7;
    date.setUTCDate(date.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(date.getUTCFullYear(),0,1));
    return Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1)/7);
}

export default function AnimatedIopWidget({ dictionary }: BaseWidgetProps) {
    const [timeStep, setTimeStep] = useState<TimeStep>("monthly");
    
    // --- Responsive Container Logic ---
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

    // --- Data Processing for Animation ---
    const { initialData, frames, sliderSteps } = useMemo(() => {
        // 1. Filter to single patient
        const patientData = sensorData.filter((reading: any) => reading.sensor_id === "GM-SEN-001");

        // 2. Group data by the selected TimeStep (Frames) and then by Hour (X-axis)
        const groupedFrames: Record<string, { [hour: number]: { sum: number, count: number } }> = {};

        patientData.forEach((d: any) => {
            const dateObj = new Date(d.date);
            const hour = dateObj.getHours();
            
            let frameKey = "";
            if (timeStep === "daily") {
                frameKey = dateObj.toISOString().split("T")[0]; // YYYY-MM-DD
            } else if (timeStep === "weekly") {
                frameKey = `${dateObj.getFullYear()}-W${getWeekNumber(dateObj).toString().padStart(2, '0')}`;
            } else if (timeStep === "monthly") {
                frameKey = `${dateObj.getFullYear()}-${(dateObj.getMonth() + 1).toString().padStart(2, '0')}`;
            }

            if (!groupedFrames[frameKey]) {
                groupedFrames[frameKey] = {};
                // Initialize all 24 hours to ensure continuous lines
                for (let i = 0; i < 24; i++) groupedFrames[frameKey][i] = { sum: 0, count: 0 };
            }

            groupedFrames[frameKey][hour].sum += d.iop;
            groupedFrames[frameKey][hour].count += 1;
        });

        const frameNames = Object.keys(groupedFrames).sort();
        if (frameNames.length === 0) return { initialData: [], frames: [], sliderSteps: [] };

        // 3. X-Axis labels (00:00 to 23:00)
        const xHours = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`);

        // 4. Build Plotly Frames
        const plotlyFrames = frameNames.map(frameName => {
            const hourData = groupedFrames[frameName];
            const yValues = [];

            for (let i = 0; i < 24; i++) {
                if (hourData[i].count > 0) {
                    yValues.push(Number((hourData[i].sum / hourData[i].count).toFixed(1)));
                } else {
                    yValues.push(null); // Leave gaps if no data for that hour
                }
            }

            return {
                name: frameName,
                data: [{ x: xHours, y: yValues }] // Only the data that changes
            };
        });

        // 5. Initial Trace (First Frame) + Target Line
        const initialTrace = {
            ...plotlyFrames[0].data[0],
            type: "scatter",
            mode: "markers",
            marker: { size: 8, color: "#2563eb" },
            name: "Avg IOP",
            hovertemplate: "Time: %{x}<br>IOP: <b>%{y} mmHg</b><extra></extra>",
        };

        const targetLine = {
            x: [xHours[0], xHours[23]],
            y: [18, 18],
            type: "scatter",
            mode: "lines",
            line: { color: "#ef4444", width: 2, dash: "dash" },
            name: "Target Limit",
            hoverinfo: "skip"
        };

        // 6. Build Slider Steps
        const steps = frameNames.map((frameName) => ({
            method: "animate",
            label: frameName,
            args: [
                [frameName], 
                {
                    mode: "immediate",
                    transition: { duration: 400, easing: "cubic-in-out" },
                    frame: { duration: 400, redraw: false }
                }
            ]
        }));

        return { 
            initialData: [initialTrace, targetLine], 
            frames: plotlyFrames, 
            sliderSteps: steps 
        };

    }, [timeStep]);

    // --- Plotly Layout ---
    const layout: Partial<Plotly.Layout> = useMemo(() => ({
        width: dimensions.width,
        height: dimensions.height,
        autosize: true,
        margin: { t: 20, r: 20, l: 50, b: 80 },
        paper_bgcolor: "transparent",
        plot_bgcolor: "transparent",
        font: { family: "Inter, sans-serif", color: "#64748b" },
        showlegend: false,
        xaxis: {
            title: "Time of Day (24h)",
            showgrid: true,
            gridcolor: "rgba(100, 116, 139, 0.1)",
            fixedrange: true // Prevent zooming from breaking animation experience
        },
        yaxis: {
            title: "Average IOP (mmHg)",
            range: [5, 30], // Fix Y-axis range so the line physically moves up and down during animation
            showgrid: true,
            gridcolor: "rgba(100, 116, 139, 0.1)",
            fixedrange: true
        },
        updatemenus: [{
            type: "buttons",
            showactive: false,
            x: 0.05,
            y: -0.15,
            xanchor: "left",
            yanchor: "top",
            direction: "left",
            pad: { t: 10, r: 10 },
            buttons: [
                {
                    label: "▶ Play",
                    method: "animate",
                    args: [null, {
                        mode: "immediate",
                        fromcurrent: true,
                        transition: { duration: 400, easing: "cubic-in-out" },
                        frame: { duration: 400, redraw: false }
                    }]
                },
                {
                    label: "⏸ Pause",
                    method: "animate",
                    args: [[null], {
                        mode: "immediate",
                        transition: { duration: 0 },
                        frame: { duration: 0, redraw: false }
                    }]
                }
            ]
        }],
        sliders: [{
            pad: { l: 110, t: 30 },
            x: 0.1,
            y: -0.15,
            xanchor: "left",
            yanchor: "top",
            currentvalue: {
                visible: true,
                prefix: "Period: ",
                xanchor: "right",
                font: { size: 14, color: "#334155" }
            },
            steps: sliderSteps
        }]
    }), [dimensions, sliderSteps]);

    return (
        <div className="flex h-full w-full flex-col overflow-hidden">
            <header className="mb-4 flex flex-wrap gap-4 justify-between items-start">
                <div>
                    <h3 className="text-xl font-semibold text-slate-800 dark:text-white">
                        Test Data
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">Watch how the 24-hour IOP rhythm evolves over time.</p>
                </div>

                <div className="flex items-center gap-2 bg-slate-50/50 dark:bg-slate-900/50 p-1.5 rounded-lg border border-slate-200 dark:border-slate-800">
                    <CalendarDays size={14} className="text-slate-400 ml-1" />
                    <span className="text-xs text-slate-500 font-medium">Animate by:</span>
                    <select 
                        value={timeStep} 
                        onChange={(e) => setTimeStep(e.target.value as TimeStep)}
                        className="bg-white dark:bg-slate-800 text-xs font-medium text-health-blue rounded-md px-2 py-1 border-slate-200 dark:border-slate-700 shadow-sm focus:outline-none cursor-pointer"
                    >
                        <option value="daily">Daily Averages</option>
                        <option value="weekly">Weekly Averages</option>
                        <option value="monthly">Monthly Averages</option>
                    </select>
                </div>
            </header>

            <div ref={chartContainerRef} className="relative flex-1 w-full min-h-[350px]">
                {dimensions.width > 0 && initialData.length > 0 && (
                    <Plot
                        data={initialData}
                        layout={layout}
                        frames={frames}
                        config={{ displayModeBar: false, responsive: true }}
                        style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
                    />
                )}
            </div>
        </div>
    );
}