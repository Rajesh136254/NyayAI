"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { analyticsApi } from "@/lib/api";
import {
  Users,
  Scale,
  CheckCircle,
  AlertTriangle,
  Layers,
  ArrowRight,
  TrendingUp,
  Clock,
  ShieldCheck,
  Filter,
  Search,
  FileSpreadsheet,
  Building,
  RefreshCw,
  ShieldAlert,
  FileWarning,
  ClipboardCheck
} from "lucide-react";

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { cls: string; label: string }> = {
    ELIGIBLE: { cls: "badge-eligible", label: "Eligible (Sec. 479)" },
    INELIGIBLE: { cls: "badge-ineligible", label: "Ineligible" },
    BORDERLINE: { cls: "badge-borderline", label: "Borderline Threshold" },
    EXCLUDED: { cls: "badge-excluded", label: "Statutory Exclusion" },
    MULTI_CASE_REVIEW: { cls: "badge-multi", label: "Multi-Case Coordination" },
    UNDER_REVIEW: { cls: "badge-borderline", label: "Under Legal Review" },
  };
  const { cls, label } = map[status] || { cls: "badge-excluded", label: status };
  return <span className={cls}>{label}</span>;
}

const STAGE_ORDER = ["IDENTIFIED", "VERIFIED", "ASSIGNED", "DRAFTED", "REVIEWED", "FILED", "OUTCOME"];

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [priorityFilter, setPriorityFilter] = useState<string>("ALL");
  const [workflowFilter, setWorkflowFilter] = useState<string>("ALL");

  const loadData = () => {
    setLoading(true);
    analyticsApi.dashboard()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-3">
        <div className="w-8 h-8 border-3 border-blue-600 dark:border-gold-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Syncing Statewide Undertrial Intelligence...
        </span>
      </div>
    );
  }

  const flagged = data?.recent_flags || [];
  const filteredFlags = (filterStatus === "ALL"
    ? flagged
    : filterStatus === "ACTION_REQUIRED"
    ? flagged.filter((item: any) => ["ELIGIBLE", "MULTI_CASE_REVIEW"].includes(item.status))
    : flagged.filter((item: any) => item.status === filterStatus))
    .filter((item: any) => priorityFilter === "ALL" || item.priority === priorityFilter)
    .filter((item: any) => workflowFilter === "ALL" || item.stage === workflowFilter);
  const selectedPriorityLabel = priorityFilter === "ALL"
    ? workflowFilter === "ALL" ? "All review cases" : `${workflowFilter.replace("_", " ")} cases`
    : priorityFilter === "URGENT"
    ? "Urgent cases"
    : priorityFilter === "ATTENTION"
    ? "Cases requiring attention"
    : "Cases with no immediate action";
  const selectedFilterLabel = filterStatus !== "ALL"
    ? `${filterStatus.replace(/_/g, " ")} cases`
    : selectedPriorityLabel;

  const applyFilter = (next: { status?: string; priority?: string; workflow?: string }) => {
    setFilterStatus(next.status ?? "ALL");
    setPriorityFilter(next.priority ?? "ALL");
    setWorkflowFilter(next.workflow ?? "ALL");
  };

  const stages = STAGE_ORDER.map(s => ({
    stage: s,
    count: data?.workflow_stages?.[s] || 0
  }));
  const totalCasesInPipeline = stages.reduce((acc, curr) => acc + curr.count, 0);

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
      {/* Top Banner: Statutory Mission Statement */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-gradient-to-r from-blue-900/10 via-slate-900/5 to-gold-500/10 dark:from-[#0c1a36] dark:to-[#0f244c] border border-blue-200 dark:border-slate-800">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-blue-600 dark:bg-gold-500 flex items-center justify-center text-white dark:text-navy-950 shadow-sm flex-shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              BNSS Section 479 Compliance Enforcement Active
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Monitoring 10 synthetic correctional facilities across Karnataka. Real-time eligibility computation active.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Sync Ledger</span>
          </button>
          <Link
            href="/dashboard/cases"
            className="btn-primary text-xs px-3.5 py-1.5 flex items-center gap-1.5"
          >
            <span>Review Full Graph</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Action Centre: the first answer to "who needs attention today?" */}
      <section className="ent-card p-5 sm:p-6 space-y-5 border-t-4 border-t-red-500 dark:border-t-red-400">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-red-600 dark:text-red-400" />
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">Who needs attention today?</h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
              Ranked from custody, hearings, workflow actions, legal-aid assignment, and information gaps. Every signal requires human legal verification.
            </p>
          </div>
          <Link href="/dashboard/actions" className="btn-secondary text-xs px-3 py-1.5 inline-flex items-center gap-1.5 self-start">
            <ClipboardCheck className="w-3.5 h-3.5" />
            Open action queue
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 dark:bg-[#081326] border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300">
          <ClipboardCheck className="w-4 h-4 text-blue-600 dark:text-gold-400" />
          <span className="font-bold">UTRC action list:</span>
          <span>{(data?.review_counts?.URGENT ?? 0) + (data?.review_counts?.ATTENTION ?? 0)} cases require authorised review before the next committee meeting.</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { key: "URGENT", label: "Urgent", count: data?.review_counts?.URGENT ?? 0, icon: ShieldAlert, tone: "text-red-600 dark:text-red-400", bg: "bg-red-50 dark:bg-red-950/30", detail: "Deadline, custody, pending action, or legal-aid gap" },
            { key: "ATTENTION", label: "Attention required", count: data?.review_counts?.ATTENTION ?? 0, icon: FileWarning, tone: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-950/30", detail: "Repeated adjournments or missing case information" },
            { key: "NORMAL", label: "No immediate action", count: data?.review_counts?.NORMAL ?? 0, icon: ClipboardCheck, tone: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/30", detail: "Continue monitoring the next hearing and records" },
          ].map((bucket) => {
            const Icon = bucket.icon;
            return (
              <button key={bucket.key} type="button" aria-pressed={priorityFilter === bucket.key} onClick={() => applyFilter({ priority: priorityFilter === bucket.key ? "ALL" : bucket.key })} className={`text-left p-4 rounded-xl border transition-all ${priorityFilter === bucket.key ? "border-blue-500 ring-2 ring-blue-500/10" : "border-slate-200 dark:border-slate-800"} ${bucket.bg}`}>
                <div className="flex items-center justify-between">
                  <div className={`flex items-center gap-2 text-xs font-bold ${bucket.tone}`}><Icon className="w-4 h-4" />{bucket.label}</div>
                  <span className={`text-2xl font-black ${bucket.tone}`}>{bucket.count}</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-2">{bucket.detail}</p>
              </button>
            );
          })}
        </div>

      </section>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Total Inmates */}
        <button type="button" onClick={() => applyFilter({})} className="ent-card p-5 space-y-3 text-left w-full hover:border-blue-400 dark:hover:border-gold-500/50 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Monitored Undertrials</span>
            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800/50">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white font-heading">
            {data?.total_inmates ?? 0}
          </div>
          <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500 dark:text-slate-400 font-medium">
            <span>Across Central & District Jails</span>
          </div>
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
            <span className="text-slate-400">Multi-Case Flags:</span>
            <span className="font-semibold text-purple-600 dark:text-purple-400">{data?.multi_case_count ?? 0} cases</span>
          </div>
        </button>

        {/* Card 2: Eligible Cases */}
        <button type="button" onClick={() => applyFilter({ status: "ELIGIBLE" })} className="ent-card p-5 space-y-3 text-left hover:border-blue-400 dark:hover:border-gold-500/50 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Sec. 479 Eligible</span>
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/50">
              <Scale className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold tracking-tight text-emerald-600 dark:text-emerald-400 font-heading">
              {data?.eligible_count ?? 0}
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500 dark:text-slate-400 font-medium">
              <span>Passed 1/3 or 1/2 rule verification</span>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
            <span className="text-slate-400">Exclusions:</span>
            <span className="font-semibold text-slate-600 dark:text-slate-300">{data?.excluded_count ?? 0} cases</span>
          </div>
        </button>

        {/* Card 3: Compliance Rate */}
        <button type="button" onClick={() => applyFilter({ workflow: "FILED" })} className="ent-card p-5 space-y-3 text-left hover:border-blue-400 dark:hover:border-gold-500/50 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Compliance Rate</span>
            <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-800/50">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white font-heading">
              {data?.compliance_rate ?? 0}%
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500 dark:text-slate-400 font-medium">
              <span>{data?.filed_review_count ?? 0} of {data?.eligible_review_count ?? 0} eligible cases filed</span>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div 
                className="bg-purple-600 dark:bg-purple-400 h-1.5 rounded-full transition-all duration-500" 
                style={{ width: `${Math.max(Number(data?.compliance_rate || 0), 4)}%` }} 
              />
            </div>
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400">Eligible review cases reaching FILED or OUTCOME</div>
        </button>
      </div>

      {/* Middle Section: Workflow Stage Pipeline */}
      <div className="ent-card p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600 dark:text-gold-400" />
              Statutory Workflow Progression Funnel
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Stages of compliance review from initial identification to court release order.
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md">
            {totalCasesInPipeline} Cases Tracked
          </span>
        </div>

        {/* Interactive Steps */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 pt-2">
          {stages.map(({ stage, count }, idx) => {
            const hasItems = count > 0;
            return (
              <button
                type="button"
                onClick={() => applyFilter({ workflow: stage })}
                key={stage}
                className={`p-3 rounded-xl border flex flex-col justify-between text-left transition-all ${
                  hasItems 
                    ? "bg-slate-50/80 dark:bg-[#0E1A33] border-blue-200 dark:border-slate-700 shadow-sm" 
                    : "bg-transparent border-slate-200/50 dark:border-slate-800/50 opacity-60"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 font-mono">0{idx + 1}</span>
                  <span className={`text-xs font-extrabold px-1.5 py-0.5 rounded ${
                    hasItems ? "bg-blue-600 text-white dark:bg-gold-500 dark:text-navy-950" : "bg-slate-200 dark:bg-slate-800 text-slate-400"
                  }`}>
                    {count}
                  </span>
                </div>
                <div className="mt-3">
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                    {stage.replace("_", " ")}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5 truncate">
                    {stage === "IDENTIFIED" ? "Algorithmic flag" : stage === "VERIFIED" ? "Supt. confirmed" : stage === "ASSIGNED" ? "DLSA allocated" : stage === "DRAFTED" ? "Petition ready" : stage === "FILED" ? "In court" : "Outcome pending"}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Flagged Inmates Dossier Table */}
      <div className="ent-card overflow-hidden">
        <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/80">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              {selectedFilterLabel}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {filteredFlags.length} case{filteredFlags.length === 1 ? "" : "s"} match this drill-down. Select any summary number above to change the result set.
            </p>
          </div>

        </div>

        <div className="overflow-x-auto">
          <table className="ent-table">
            <thead>
              <tr>
                <th>Undertrial Prisoner</th>
                <th>Detention Facility</th>
                <th>Days in Custody</th>
                <th>Statutory Status</th>
                <th>Workflow Stage</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredFlags.map((inmate: any) => (
                <tr key={inmate.id} className="group">
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-gold-400 font-bold flex items-center justify-center text-xs shadow-inner">
                        {inmate.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-slate-100 text-sm group-hover:text-blue-600 dark:group-hover:text-gold-400 transition-colors">
                          {inmate.name}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          ID: #{inmate.id}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="text-sm font-medium text-slate-800 dark:text-slate-200">
                      {inmate.prison}
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-mono text-sm font-bold text-slate-800 dark:text-slate-200">
                        {inmate.days_in_custody} days
                      </span>
                    </div>
                  </td>
                  <td>
                    <StatusBadge status={inmate.status} />
                  </td>
                  <td>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {inmate.stage}
                    </span>
                  </td>
                  <td className="text-right">
                    <Link
                      href={`/dashboard/cases/${inmate.id}`}
                      className="btn-secondary text-xs px-3 py-1 inline-flex items-center gap-1"
                    >
                      <span>Open Dossier</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </td>
                </tr>
              ))}
              {filteredFlags.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-400 text-sm">
                    No cases match the selected filter criterion.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
