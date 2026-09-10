"use client";

import { useEffect, useState } from "react";
import { analyticsApi } from "@/lib/api";
import { 
  BarChart3, 
  Building, 
  Scale, 
  FileCheck2, 
  TrendingUp, 
  Award, 
  ShieldCheck,
  Download
} from "lucide-react";

export default function AnalyticsPage() {
  const [dashboard, setDashboard] = useState<any>(null);
  const [compliance, setCompliance] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([analyticsApi.dashboard(), analyticsApi.compliance()])
      .then(([d, c]) => {
        setDashboard(d);
        setCompliance(c);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-3">
        <div className="w-8 h-8 border-3 border-blue-600 dark:border-gold-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs text-slate-400">Compiling Statewide SLSA Compliance Analytics...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600 dark:text-gold-400" />
            Karnataka State SLSA Judiciary Compliance Directorate
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Inter-district benchmark comparison of Section 479 implementation and court petition throughput.
          </p>
        </div>

        <button 
          onClick={() => window.print()}
          className="btn-secondary text-xs px-3.5 py-1.5 inline-flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export SLSA Report</span>
        </button>
      </div>

      {/* Primary KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="ent-card p-5 space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Monitored</div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white font-mono">{dashboard?.total_inmates ?? 0}</div>
          <div className="text-[11px] text-slate-500">Undertrials in State custody</div>
        </div>

        <div className="ent-card p-5 space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Sec. 479 Eligible</div>
          <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">{dashboard?.eligible_count ?? 0}</div>
          <div className="text-[11px] text-slate-500">Statutory threshold achieved</div>
        </div>

        <div className="ent-card p-5 space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Court Filings</div>
          <div className="text-3xl font-extrabold text-blue-600 dark:text-blue-400 font-mono">
            {(dashboard?.workflow_stages?.FILED || 0) + (dashboard?.workflow_stages?.OUTCOME || 0)}
          </div>
          <div className="text-[11px] text-slate-500">Petitions actively in court</div>
        </div>

        <div className="ent-card p-5 space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Overall SLSA Compliance</div>
          <div className="text-3xl font-extrabold text-purple-600 dark:text-purple-400 font-mono">{dashboard?.compliance_rate || 0}%</div>
          <div className="text-[11px] text-slate-500">State target benchmark: 85%</div>
        </div>
      </div>

      {/* Facility-by-Facility Table */}
      <div className="ent-card overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800/80">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Building className="w-4 h-4 text-blue-600 dark:text-gold-400" />
            District Detention Facilities Performance & Compliance Ledger
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Facility-level breakdown of identified undertrials, eligible candidates, and completed bail filings.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="ent-table">
            <thead>
              <tr>
                <th>Correctional Facility</th>
                <th>District Jurisdiction</th>
                <th>Monitored Undertrials</th>
                <th>Sec. 479 Eligible</th>
                <th>Filed in Court</th>
                <th>Facility Compliance Metric</th>
              </tr>
            </thead>
            <tbody>
              {compliance?.prisons?.map((p: any, i: number) => (
                <tr key={i}>
                  <td className="font-bold text-slate-900 dark:text-slate-100">{p.prison}</td>
                  <td className="text-slate-600 dark:text-slate-400">{p.district}</td>
                  <td className="font-mono">{p.total}</td>
                  <td className="font-mono text-amber-600 dark:text-gold-400 font-bold">{p.eligible}</td>
                  <td className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">{p.filed}</td>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-24 bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-blue-600 dark:bg-gold-500 h-2 rounded-full"
                          style={{ width: `${p.compliance_rate}%` }}
                        />
                      </div>
                      <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                        {p.compliance_rate}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
