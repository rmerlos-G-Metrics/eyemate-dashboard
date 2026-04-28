/**
 * @author Ricardo Merlos Torres
 * @email rmerlos@g-metrics.com
 * @create date 2026-04-09 16:20:04
 * @modify date 2026-04-09 16:20:04
 * @desc [description]
 */


export type WidgetType = 
    //| "patientInformation"
    //| "testWidget"
    //| "systemDiagnostics"
    | "patientCondition"
    //| "iopWidget"
    | "heatmapWidget"
    | "animatedIopWidget"
    | "polarClockWidget"
    | "ewmaIopWidget"
    | "waterfallWidget"
    | "hourlyIopWidget"
    | "quickViewWidget"


export interface WidgetDefinition {
    id: string;
    type: WidgetType;
    title: string;
    dataParams?: Record<string, unknown>; //Internal state
}

export interface WidgetLayout {
    i: string;
    x: number;
    y: number;
    w: number;
    h: number;
    minW?: number;
    minH?: number;
    maxW?: number;
    maxH?: number;
    static?: boolean;
    isVisible: boolean;
}

//config of different layouts (different views)
export interface DashboardPreset {
    id: string;
    name: string;
    layouts: WidgetLayout[];
}

export interface DashboardState {
    columns: number;
    rowHeight: number;
    isEditMode: boolean;
    activePresetId: string;
    widgets: WidgetDefinition[];
    presets: DashboardPreset[];
}