/**
 * @author Ricardo Merlos Torres
 * @email rmerlos@g-metrics.com
 * @create date 2026-04-14 13:57:02
 * @modify date 2026-04-14 13:57:02
 * @desc [description]
 */

"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { BaseWidgetProps } from "../registry/widgetRegistry";

// Plotly must remain dynamically imported to prevent Next.js SSR crashes
const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

import sensorData from "../../../../data/gmetrics_mock_data.json"; 

export default function PatientIopWidget({ dictionary }: BaseWidgetProps) {
  const dict = dictionary?.dashboard_FHIR || dictionary;

  // Create references and state for the Observer
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [revision, setRevision] = useState(0);

  // The ResizeObserver watches the physical pixel dimensions of the div, ignoring the window.
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        
        setDimensions((prev) => {
          // Only trigger a re-render if the size actually changed
          if (prev.width === width && prev.height === height) return prev;
          
          // Increment the revision counter
          setRevision((r) => r + 1);
          return { width, height };
        });
      }
    });

    observer.observe(chartContainerRef.current);
    
    // Cleanup observer on unmount
    return () => observer.disconnect();
  }, []);

  const patientData = useMemo(() => {
    return sensorData.filter((reading: any) => reading.sensor_id === "GM-SEN-001");
  }, []);

  const xDates = patientData.map((d: any) => d.date);
  const yIopValues = patientData.map((d: any) => d.iop);

  const plotData: any[] = [
    {
      x: xDates,
      y: yIopValues,
      type: "scatter",
      mode: "markers+lines",
      marker: { color: "#2563eb", size: 6 }, 
      line: { shape: "spline", smoothing: 1.3, width: 3, color: "#2563eb" },
      fill: "tozeroy",
      fillcolor: "rgba(37, 99, 235, 0.1)", 
      name: "IOP",
      hovertemplate: "<b>%{y} mmHg</b><br>%{x}<extra></extra>",
    },
    {
      x: [xDates[0], xDates[xDates.length - 1]],
      y: [18, 18], // Threshold
      type: "scatter",
      mode: "lines",
      line: { color: "#ef4444", width: 2, dash: "dash" },
      name: dict?.upperLimit || "Upper Normal Limit",
      hoverinfo: "skip", 
    }
  ];

  const plotLayout: Partial<Plotly.Layout> = {
    // Inject the exact pixel dimensions tracked by the observer
    width: dimensions.width,
    height: dimensions.height,
    autosize: true,
    margin: { t: 10, r: 10, l: 35, b: 30 }, 
    paper_bgcolor: "transparent", 
    plot_bgcolor: "transparent",
    xaxis: {
      showgrid: false,
      zeroline: false,
      tickfont: { color: "#64748b" }, 
    },
    yaxis: {
      title: { text: "IOP (mmHg)", font: { size: 10, color: "#64748b" }, standoff: 5 },
      showgrid: true,
      gridcolor: "rgba(100, 116, 139, 0.1)",
      zeroline: false,
      tickfont: { color: "#64748b" },
    },
    showlegend: false, 
    hovermode: "x unified", 
  };

  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      {/* Widget Header */}
      <header className="mb-4 flex justify-between items-start">
        <h3 className="text-xl font-semibold text-slate-800 dark:text-white flex items-center gap-2">
          {dict?.iopTitle || 'Test Data'}
        </h3>
        <span className="text-[10px] font-medium bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400 px-2.5 py-1 rounded-full border border-red-100 dark:border-red-500/20 uppercase tracking-wide">
          {dict?.targetIop || 'Target'}: 18 mmHg
        </span>
      </header>
      
      {/* This div acts as the absolute measuring box. Flex-1 makes it fill the remaining space under the header. We attach chartContainerRef here.*/}
      <div ref={chartContainerRef} className="relative flex-1 w-full min-h-[200px]">
        {/* Only render Plotly once the physical dimensions (> 0) */}
        {dimensions.width > 0 && (
          <Plot
            data={plotData}
            layout={plotLayout}
            revision={revision} //Pass the revision prop
            config={{ 
              displaylogo: false,
              displayModeBar: true,
              responsive: true 
            }}
            style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
            useResizeHandler={true} 
          />
        )}
      </div>
    </div>
  );
}