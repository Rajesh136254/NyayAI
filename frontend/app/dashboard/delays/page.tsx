"use client";

import { useEffect, useState } from "react";
import { analyticsApi } from "@/lib/api";
import { 
  Clock, 
  AlertTriangle, 
  ShieldAlert, 
  TrendingDown, 
  CheckCircle2, 
  PieChart, 
  Scale, 
  Info,
  BarChart2
} from "lucide-react";

export default function DelaysPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsApi.delaySummary()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const REASON_LABELS: Record<string, string> = {
    PROSECUTION_ABSENT: "Prosecution Agency Absent / Not Ready",
    PROSECUTION_WITNESS_ABSENT: "Police / Official Witness Non-Attendance",
    WITNESS_ABSENT: "Private / Expert Witness Unavailable",
    DEFENCE_ABSENT: "Defence Counsel Unavailability (Excludable)",
    DEFENCE_COUNSEL_ABSENT: "Defence Counsel Leave / Adjournment (Excludable)",
    ADMINISTRATIVE: "Judicial Administrative / Presiding Officer Recess",
    COURT_HOLIDAY: "Statutory Court Recess / Gazette Holiday",
    COVID_FORCE_MAJEURE: "COVID-19 Pandemic / Force Majeure Event",
    OTHER: "Unclassified Proceeding Record",
  };

  const DEFENCE_CAUSES = new Set(["DEFENCE_ABSENT", "DEFENCE_COUNSEL_ABSENT"]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-3">
        <div className="w-8 h-8 border-3 border-blue-600 dark:border-gold-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs text-slate-400">Aggregating Adjournment Intelligence Across Karnataka Courts...</span>
      </div>
    );
  }

  const maxCount = Math.max(...(data?.breakdown?.map((b: any) => b.count) || [1]), 1);

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
      {/* Page Title */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-600 dark:text-gold-400" />
          Statewide Delay Intelligence & Adjournment Root-Cause Engine
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Distinguishing systemic judicial delays from defence-caused postponements for Section 479 statutory computation.
        </p>
      </div>

      {/* Top 3 High-Level Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="ent-card p-5 space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Total Proceedings Audited
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white font-mono">
            {data?.total_hearings ?? 0}
          </div>
          <div className="text-xs text-slate-500">Across all linked undertrial charge sheets</div>
        </div>

        <div className="ent-card p-5 space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Adjournment Orders Issued
          </div>
          <div className="text-3xl font-extrabold text-amber-600 dark:text-gold-400 font-mono">
            {data?.total_adjournments ?? 0}
          </div>
          <div className="text-xs text-slate-500">Non-effective hearing proceedings</div>
        </div>

        <div className="ent-card p-5 space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Systemic Adjournment Ratio
          </div>
          <div className="text-3xl font-extrabold text-blue-600 dark:text-blue-400 font-mono">
            {data?.overall_adjournment_rate ?? 0}%
          </div>
          <div className="text-xs text-slate-500">Average postponement frequency per case</div>
        </div>
      </div>

      {/* Primary Adjournment Breakdown */}
      <div className="ent-card p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-blue-600 dark:text-gold-400" />
              Adjournment Cause Distribution & Excludability Mapping
            </h2>
            <p className="text-xs text-slate-400">
              Red bars indicate defence-caused delays (excluded from custody). Blue/Gold bars indicate systemic delays.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-blue-600 dark:bg-gold-500" />
              <span className="text-slate-600 dark:text-slate-400">Systemic Delay (Countable)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-red-500" />
              <span className="text-slate-600 dark:text-slate-400">Defence Delay (Excludable)</span>
            </div>
          </div>
        </div>

        <div className="space-y-4 pt-2">
          {data?.breakdown?.map((item: any, i: number) => {
            const isDefence = DEFENCE_CAUSES.has(item.reason);
            const label = REASON_LABELS[item.reason] || item.reason.replace(/_/g, " ");
            return (
              <div key={i} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    {isDefence && (
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300">
                        EXCLUDED
                      </span>
                    )}
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {label}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 font-mono">
                    <span className="text-slate-400">{item.count} orders</span>
                    <span className={`font-bold ${isDefence ? "text-red-600 dark:text-red-400" : "text-blue-600 dark:text-gold-400"}`}>
                      {item.percentage}%
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${
                      isDefence
                        ? "bg-red-500 dark:bg-red-600"
                        : "bg-blue-600 dark:bg-gold-500"
                    }`}
                    style={{ width: `${(item.count / maxCount) * 100}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Intelligence Takeaways */}
      <div className="ent-card p-6 space-y-3 bg-gradient-to-br from-blue-50/50 via-white to-gold-50/20 dark:from-[#0B172E] dark:to-[#081224] border border-blue-200/80 dark:border-slate-800">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
          <Info className="w-4 h-4 text-blue-600 dark:text-gold-400" />
          Statutory Compliance Guidance (BNSS Section 479)
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          Under the proviso to Section 479 BNSS 2023, delay caused by the accused or their defence counsel is deducted from the cumulative detention calculation. Prosecution delays (such as failure to produce witnesses or administrative trial adjournments) <strong className="text-slate-900 dark:text-white">do not penalize the undertrial</strong> and reinforce the statutory presumption of bail eligibility.
        </p>
      </div>
    </div>
  );
}
