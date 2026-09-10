"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { inmatesApi } from "@/lib/api";
import { 
  ListTodo, 
  ArrowRight, 
  Clock, 
  CheckCircle2, 
  Building, 
  Scale, 
  UserCheck, 
  ChevronRight,
  Filter
} from "lucide-react";

const STAGE_FLOW = ["IDENTIFIED", "VERIFIED", "ASSIGNED", "DRAFTED", "REVIEWED", "FILED", "OUTCOME"];

export default function ActionsPage() {
  const [inmates, setInmates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    inmatesApi.list({ limit: 50 })
      .then((res) => {
        const actionable = res.items.filter((i: any) =>
          ["ELIGIBLE", "BORDERLINE", "MULTI_CASE_REVIEW"].includes(i.overall_status)
        );
        setInmates(actionable);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const grouped = STAGE_FLOW.reduce((acc, stage) => {
    acc[stage] = inmates.filter((i) => i.workflow_stage === stage);
    return acc;
  }, {} as Record<string, any[]>);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-3">
        <div className="w-8 h-8 border-3 border-blue-600 dark:border-gold-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs text-slate-400">Loading Active Workflow Action Queue...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ListTodo className="w-5 h-5 text-blue-600 dark:text-gold-400" />
            DLSA & Institutional Legal Action Queue
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {inmates.length} undertrials requiring verification, legal aid counsel assignment, or court petition review.
          </p>
        </div>
      </div>

      {/* Stage Groups */}
      <div className="space-y-4">
        {STAGE_FLOW.filter((s) => grouped[s]?.length > 0).map((stage, idx) => (
          <div key={stage} className="ent-card overflow-hidden">
            <div className="p-4 bg-slate-50 dark:bg-[#081326] border-b border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-md bg-blue-600 dark:bg-gold-500 text-white dark:text-navy-950 font-bold text-xs flex items-center justify-center font-mono">
                  {idx + 1}
                </span>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                    Stage: {stage.replace(/_/g, " ")}
                  </h2>
                  <span className="text-[11px] text-slate-400">
                    {stage === "IDENTIFIED"
                      ? "Pending Superintendent confirmation of previous conviction status"
                      : stage === "VERIFIED"
                      ? "Ready for DLSA panel legal aid advocate allocation"
                      : stage === "ASSIGNED"
                      ? "Legal counsel reviewing charge sheet & drafting bail application"
                      : stage === "DRAFTED"
                      ? "Draft petition ready for final lawyer sign-off"
                      : "Awaiting judicial determination"}
                  </span>
                </div>
              </div>

              <span className="text-xs font-semibold px-2.5 py-1 rounded bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                {grouped[stage].length} cases
              </span>
            </div>

            {/* List */}
            <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {grouped[stage].map((inmate: any) => (
                <div
                  key={inmate.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-gold-400 font-bold flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                      {inmate.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        {inmate.name}
                      </div>
                      <div className="text-xs text-slate-400 font-mono">
                        {inmate.prisoner_id} · {inmate.prison_name}
                      </div>
                      {inmate.assigned_lawyer && (
                        <div className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 mt-0.5 flex items-center gap-1">
                          <UserCheck className="w-3 h-3" />
                          <span>Counsel: {inmate.assigned_lawyer}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 self-end sm:self-auto">
                    <div className="text-right">
                      <div className="text-sm font-bold font-mono text-slate-800 dark:text-slate-200">
                        {inmate.days_in_custody}d
                      </div>
                      <div className="text-[10px] text-slate-400 uppercase">Detention</div>
                    </div>

                    <Link
                      href={`/dashboard/cases/${inmate.id}`}
                      className="btn-primary text-xs px-3.5 py-1.5 inline-flex items-center gap-1"
                    >
                      <span>Action Dossier</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {inmates.length === 0 && (
          <div className="ent-card p-12 text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Action Queue Clean</h3>
            <p className="text-xs text-slate-400">All Section 479 candidate cases have been processed.</p>
          </div>
        )}
      </div>
    </div>
  );
}
