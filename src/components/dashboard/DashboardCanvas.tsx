/**
 * @author Ricardo Merlos Torres
 * @email rmerlos@g-metrics.com
 * @create date 2026-04-09 15:26:12
 * @modify date 2026-04-09 15:26:12
 * @desc [description]
 */


"use client"

import React, {useMemo} from "react";
import GridLayout, {useContainerWidth, useResponsiveLayout} from "react-grid-layout";
import type {Layout} from "react-grid-layout"

import { WidgetDefinition } from "@/types/dashboard";
import { useDashboardStore } from "@/store/useDashboardStore";


// react-grid-layout requires them
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { div } from "framer-motion/client";
import { WidgetWrapper } from "./WidgetWrapper";
import { widgetRegistry } from "./registry/widgetRegistry";

interface DashboardCanvasProps {
    dictionary: any;
}

export function DashboardCanvas({dictionary}: DashboardCanvasProps) {
    const { width, containerRef, mounted } = useContainerWidth();

    const {
        isEditMode,
        activePresetId,
        presets, 
        widgets,
        updateLayouts
    } = useDashboardStore();

    // Get current layout preset
    const activePreset = useMemo(() =>
        presets.find(p => p.id === activePresetId) || presets[0],
    [presets, activePresetId]);

    // Filters down only widgets that need to be visible
    const visibleLayouts = useMemo(() => {
        return activePreset.layouts.filter(layout => layout.isVisible);
    }, [activePreset.layouts]);

    const initialLayouts = useMemo(() => {
        const rglLayout: Layout[] = visibleLayouts.map((l) => ({
            i: l.i, 
            x: l.x, 
            y: l.y, 
            w: l.w, 
            h: l.h, 
            minW: l.minW, 
            minH: l.minH, 
            static: !isEditMode,
            isResizable: isEditMode,
            isDraggable: isEditMode
        }));
        return { lg: rglLayout, md: rglLayout}
    }, [visibleLayouts, isEditMode]); 

    const { layout } = useResponsiveLayout({
        width,
        layouts: initialLayouts,
        breakpoints: {lg: 1200, md: 996, sm: 768, xs:480, xxs: 0},
        cols: { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2}
    });

    return(
        <div
            ref={containerRef}
            className="min-h-screen w-full bg-slate-50/50 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-[size:16px_16px] p-4 dark:bg-slate-950 dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)]"
        >
            {!mounted ? (
                <div className="flex h-64 w-full items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-health-blue/30 border-t-health-blue"></div>
                </div>
            ) : (
                <GridLayout
                    className="layout"
                    width={width}
                    layout={layout}
                    isDraggable={isEditMode}
                    isResizable={isEditMode}
                    margin={[40,40]}
                    dragConfig={{
                        handle: ".widget-drag-handle",
                        enabled: true
                    }}
                    onDragStop={(currentLayout) => {
                        if (isEditMode) updateLayouts(currentLayout);
                    }}
                    onResizeStop={(currentLayout) => {
                        if (isEditMode) updateLayouts(currentLayout);
                    }}
                >
                    {activePreset.layouts.map((layoutItem) => {
                        // 1. Skip if hidden via ControlBar
                        if (!layoutItem.isVisible) return null; 

                        // 2. Get the static definition (Title, minWidth, etc.)
                        const definition = widgets.find(w => w.id === layoutItem.i);
                        if (!definition) return null;

                        // 3. Lookup the dynamic component from our registry
                        const DynamicWidgetComponent = widgetRegistry[layoutItem.i];

                        return (
                            <div key={layoutItem.i}>
                                {/* Wrapper loads instantly, defines the borders and drag handles */}
                                <WidgetWrapper definition={definition} layout={layoutItem} dictionary={dictionary}>
                                    
                                    {/* Inside, the Plotly chart loads lazily. 
                                        If it's not registered, we fail gracefully. */}
                                    {DynamicWidgetComponent ? (
                                        <DynamicWidgetComponent 
                                            patientId="patient-123" // Example prop passing
                                        />
                                    ) : (
                                        <div className="flex h-full items-center justify-center text-sm text-red-400">
                                            Widget code not found for ID: {layoutItem.i}
                                        </div>
                                    )}

                                </WidgetWrapper>
                            </div>
                        );
                    })}
                </GridLayout>
            )}
        </div>
    );
}