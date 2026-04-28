/**
 * @author Ricardo Merlos Torres
 * @email rmerlos@g-metrics.com
 * @create date 2026-04-13 16:55:56
 * @modify date 2026-04-13 16:55:56
 * @desc [description]
 */

import dynamic from "next/dynamic";
import { WidgetSkeleton } from "./WidgetSkeleton";

export interface BaseWidgetProps {
    dictionary: any;
}

export const widgetRegistry: Record<string, React.ComponentType<BaseWidgetProps>> = {
    "patientCondition": dynamic(() => import('../../clinical/PatientConditionWidget'), {
        // ssr: false to avoid server rendering 
        ssr: false, 
        loading: () => <WidgetSkeleton />,
    }),
    "heatmapWidget": dynamic(() => import('../widgets/HeatmapWidget'), {
        ssr: false, 
        loading: () => <WidgetSkeleton />,
    }),
    "animatedIopWidget": dynamic(() => import('../widgets/AnimatedIopWidget'), {
        ssr: false, 
        loading: () => <WidgetSkeleton />,
    }),
    "polarClockWidget": dynamic(() => import('../widgets/PolarClockWidget'), {
        ssr: false, 
        loading: () => <WidgetSkeleton />,
    }),
    "ewmaIopWidget": dynamic(() => import('../widgets/EwmaIopWidget'), {
        ssr: false, 
        loading: () => <WidgetSkeleton />,
    }),
    "waterfallWidget": dynamic(() => import('../widgets/WaterfallDensityWidget'), {
        ssr: false, 
        loading: () => <WidgetSkeleton />,
    }),
    "hourlyIopWidget": dynamic(() => import('../widgets/HourlyIopBarWidget'), {
        ssr: false, 
        loading: () => <WidgetSkeleton />,
    }),
    "quickViewWidget": dynamic(() => import('../widgets/QuickViewWidget'), {
        ssr: false, 
        loading: () => <WidgetSkeleton />,
    }),
}