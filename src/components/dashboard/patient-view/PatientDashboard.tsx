/**
 * @author Ricardo Merlos Torres
 * @email rmerlos@g-metrics.com
 * @create date 2026-04-09 14:07:18
 * @modify date 2026-04-09 14:07:18
 * @desc [description]
 */

interface PatientDashboardProps {
    lang: string;
    token: string;
}

export default async function PatientDashboard({lang, token}: PatientDashboardProps) {
    return(
        <div>
            <h1>Patient</h1>
        </div>
    )
}