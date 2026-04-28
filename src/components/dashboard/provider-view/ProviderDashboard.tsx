/**
 * @author Ricardo Merlos Torres
 * @email rmerlos@g-metrics.com
 * @create date 2026-04-09 14:07:04
 * @modify date 2026-04-09 14:07:04
 * @desc [description]
 */

import { DashboardCanvas } from "../DashboardCanvas";
import { DashboardControlBar } from "../DashboardControlBar";

interface ProviderDashboardProps {
    lang: string;
    token: string;
    dictionary: any;
}

export default async function ProviderDashboard({lang, token, dictionary}: ProviderDashboardProps) {
    return(
        <main className="relative min-h-screen w-full bg-slate-50 dark:bg-slate-950">
            <DashboardControlBar dictionary={dictionary}></DashboardControlBar>
            <DashboardCanvas dictionary={dictionary}></DashboardCanvas>
        </main>
    )
}