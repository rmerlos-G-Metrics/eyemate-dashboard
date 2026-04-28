/**
 * @author Ricardo Merlos Torres
 * @email rmerlos@g-metrics.com
 * @create date 2026-04-09 16:09:45
 * @modify date 2026-04-09 16:09:45
 * @desc [description]
 */


import {create} from 'zustand';
import {persist} from 'zustand/middleware'
import { DashboardState, WidgetLayout } from '@/types/dashboard';


interface DashboardActions {
    toggleEditMode: () => void;
    setActivePreset: (presetId: string) => void;
    updateLayouts: (newLayouts: Partial<WidgetLayout>[]) => void;
    toggleWidgetVisibility: (widgetId: string) => void;
    createPreset: (name:string) => void;
    deletePreset: (presetId: string) => void;
}

type DashboardStore = DashboardState & DashboardActions;

const initialState: DashboardState = {
    columns: 12,
    rowHeight: 30, 
    isEditMode: false,
    activePresetId: "preset-standard",
    widgets: [
        //{id: "w-info", type: "patientInformation", title: "Patient Data"},
        //{id: "w-test", type: "testWidget", title: "Test Widget"},
        //{id: "w-test-invisible", type: "testWidget", title: "Test Widget Invisible"},
        //{id: "sys-diagnostics", type: "systemDiagnostics", title: "System Diagnostics" },
        {id: "patientCondition", type: "patientCondition", title: "Patient Conditions" },
        //{id: "iopWidget", type: "iopWidget", title: "IOP Data" },
        {id: "heatmapWidget", type: "heatmapWidget", title: "Heatmap Widget" },
        {id: "animatedIopWidget", type: "animatedIopWidget", title: "IOP Animation" }, //polarClockWidget
        {id: "polarClockWidget", type: "polarClockWidget", title: "Polar Clock" },
        {id: "ewmaIopWidget", type: "ewmaIopWidget", title: "EWMA Plot" },
        {id: "waterfallWidget", type: "waterfallWidget", title: "Waterfall Plot" },
        {id: "hourlyIopWidget", type: "hourlyIopWidget", title: "IOP Bar Chart" },
        {id: "quickViewWidget", type: "quickViewWidget", title: "Quick View" },
    ],
    presets: [
        {
            id: "preset-standard",
            name: "Eyemate Dashboard",
            layouts: [
                //{i: "w-info", x:0, y:4, w:3, h:4, minW:2, minH:2, isVisible:true},
                //{i: "w-test", x:4, y:10, w:3, h:4, minW:2, minH:2, isVisible:true},
                //{i: "w-test-invisible", x:4, y:10, w:3, h:4, minW:2, minH:2, isVisible:false},
                //{i: "sys-diagnostics", x:0, y:3, w:4, h:4, minW:3, minH:3, isVisible: true },
                {i: "patientCondition", x:0, y:0, w:4, h:4, minW:2, minH:4, maxW:4, maxH:4, isVisible: true },
                //{i: "iopWidget", x:4, y:7, w:8, h:5, minW:3, minH:5, isVisible: true },
                {i: "heatmapWidget", x:0, y:4, w:6, h:3, minW:3, minH:3, isVisible: true },
                {i: "animatedIopWidget", x:7, y:4, w:6, h:3, minW:3, minH:3, isVisible: true },
                {i: "polarClockWidget", x:0, y:7, w:4, h:5, minW:3, minH:5, isVisible: true },
                {i: "ewmaIopWidget", x:6, y:12, w:6, h:5, minW:3, minH:3 , isVisible: true },
                {i: "waterfallWidget", x:0, y:12, w:6, h:5, minW:3, minH:5 , isVisible: true },
                {i: "hourlyIopWidget", x:4, y:7, w:8, h:5, minW:3, minH:5 , isVisible: true },
                {i: "quickViewWidget", x:4, y:0, w:8, h:4, minW:2, minH:2 , isVisible: true },
            ]
        }
    ]
}

export const useDashboardStore = create<DashboardStore>()(
    persist(
        (set) => ({
            ...initialState,

            toggleEditMode: () => 
                set((state) => ({ isEditMode: !state.isEditMode })),

            setActivePreset: (presetId) => 
                set({ activePresetId: presetId }),

            // Updates coordinates when dragging/resizing finishes
            updateLayouts: (newLayouts) => 
                set((state) => {
                    const activePresetIndex = state.presets.findIndex(p => p.id === state.activePresetId);
                    if (activePresetIndex === -1) return state;

                    const updatedPresets = [...state.presets];
                    const activePreset = { ...updatedPresets[activePresetIndex] };
                    
                    // Merge new coordinates with existing layouts (preserving visibility, etc.)
                    activePreset.layouts = activePreset.layouts.map(layout => {
                        const updated = newLayouts.find(l => l.i === layout.i);
                        return updated ? { ...layout, ...updated } : layout;
                    });

                    updatedPresets[activePresetIndex] = activePreset;
                    return { presets: updatedPresets };
                }),

            // Flips the visibility toggle from the Control Bar
            toggleWidgetVisibility: (widgetId) => 
            set((state) => {
                const activePresetIndex = state.presets.findIndex(p => p.id === state.activePresetId);
                if (activePresetIndex === -1) return state;

                const updatedPresets = [...state.presets];
                const activePreset = { ...updatedPresets[activePresetIndex] };

                // Check if the widget already exists in this preset's layout
                const layoutExists = activePreset.layouts.some(l => l.i === widgetId);

                if (layoutExists) {
                    // Toggle visibility for existing layout
                    activePreset.layouts = activePreset.layouts.map(layout => 
                        layout.i === widgetId 
                            ? { ...layout, isVisible: !layout.isVisible }
                            : layout
                    );
                } else {
                    // Spawn the missing widget safely at the bottom of the grid
                    activePreset.layouts.push({
                        i: widgetId,
                        x: 0,
                        y: Infinity, // RGL will auto-pack this to the bottom
                        w: 3,
                        h: 4,
                        minW: 2,
                        minH: 2,
                        isVisible: true
                    });
                }

                updatedPresets[activePresetIndex] = activePreset;
                return { presets: updatedPresets };
            }),
            
            createPreset: (name) =>
                set((state) => {
                    const blueprintPreset = state.presets[0];
                    const clonedLayouts = blueprintPreset ? JSON.parse(JSON.stringify(blueprintPreset.layouts)) : [];

                    const newPreset: DashboardPreset = {
                        id: `preset-${Date.now()}`,
                        name: name,
                        layouts: clonedLayouts
                    }

                    return {
                        presets: [...state.presets, newPreset],
                        activePresetId: newPreset.id,
                        isEditMode: true,
                    }
                }),

            deletePreset: (presetId) => {
                set((state) => {
                    if (state.presets.length <= 1) return state;

                    const filteredPresets = state.presets.filter( p => p.id !== presetId);

                    const newActiveId = state.activePresetId === presetId
                        ? filteredPresets[0].id
                        : state.activePresetId;

                    return {
                        presets: filteredPresets,
                        activePresetId: newActiveId
                    }
                })
            }
        }),
        {
            name: 'layout_configuration',
            partialize: (state) => ({presets: state.presets, activePresetId: state.activePresetId})
        }
    )
);