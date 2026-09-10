"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { inmatesApi } from "@/lib/api";
import { 
  Search, 
  Filter, 
  FolderGit2, 
  ArrowRight, 
  Scale, 
  Clock, 
  UserCheck, 
  Building, 
  ChevronRight, 
  FileText,
  AlertCircle,
  ShieldAlert
} from "lucide-react";

const STATUS_TABS = [
  { id: "ALL", label: "All Undertrials" },
  { id: "ELIGIBLE", label: "Eligible (Sec. 479)" },
  { id: "BORDERLINE", label: "Borderline Threshold" },
  { id: "MULTI_CASE_REVIEW", label: "Multi-Case Graph" },
  { id: "INELIGIBLE", label: "Ineligible" },
  { id: "EXCLUDED", label: "Excluded (Life/Death/NDPS)" },
];

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { cls: string; label: string }> = {
    ELIGIBLE: { cls: "badge-eligible", label: "Eligible" },
    INELIGIBLE: { cls: "badge-ineligible", label: "Ineligible" },
    BORDERLINE: { cls: "badge-borderline", label: "Borderline" },
    EXCLUDED: { cls: "badge-excluded", label: "Excluded" },
    MULTI_CASE_REVIEW: { cls: "badge-multi", label: "Multi-Case" },
    UNDER_REVIEW: { cls: "badge-borderline", label: "Under Review" },
  };
  const { cls, label } = map[status] || { cls: "badge-excluded", label: status };
  return <span className={cls}>{label}</span>;
}

export default function CasesPage() {
  const [inmates, setInmates] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 250);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setLoading(true);
    inmatesApi.list({
      search: debouncedSearch || undefined,
      status: selectedStatus === "ALL" ? undefined : selectedStatus,
      limit: 50,
    })
      .then((res) => {
        setInmates(res.items);
        setTotal(res.total);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [debouncedSearch, selectedStatus]);

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FolderGit2 className="w-5 h-5 text-blue-600 dark:text-gold-400" />
            Prisoner Case Graph Intelligence Directory
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Single unified dossier per undertrial: cross-court CNR mappings, charge structures, and custody tracking.
          </p>
        </div>
        <div className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 self-start sm:self-auto border border-slate-200 dark:border-slate-700">
          Showing <span className="font-mono text-blue-600 dark:text-gold-400">{inmates.length}</span> of {total} registered undertrials
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="ent-card p-4 space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              id="case-search-input"
              type="text"
              placeholder="Search by prisoner name, prison ID (e.g. KA/BLR), detention facility, or court..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-input pl-10"
            />
          </div>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-t border-slate-100 dark:border-slate-800/80 pt-3">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedStatus(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedStatus === tab.id
                  ? "bg-blue-600 text-white dark:bg-gold-500 dark:text-navy-950 shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Cases Ledger Table */}
      <div className="ent-card overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-3">
            <div className="w-8 h-8 border-3 border-blue-600 dark:border-gold-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs text-slate-400">Loading Case Graphs...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="ent-table">
              <thead>
                <tr>
                  <th>Prisoner & System ID</th>
                  <th>Detention Facility</th>
                  <th>Arrest Date</th>
                  <th>Effective Custody</th>
                  <th>Offender Category</th>
                  <th>Linked Cases</th>
                  <th>Section 479 Status</th>
                  <th>Stage</th>
                  <th className="text-right">Dossier</th>
                </tr>
              </thead>
              <tbody>
                {inmates.map((inmate: any) => (
                  <tr key={inmate.id} className="group">
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-gold-400 font-bold flex items-center justify-center text-xs shadow-inner">
                          {inmate.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-slate-100 text-sm group-hover:text-blue-600 dark:group-hover:text-gold-400 transition-colors">
                            {inmate.name}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            {inmate.prisoner_id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="text-sm font-medium text-slate-800 dark:text-slate-200">
                        {inmate.prison_name}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {inmate.prison_district}
                      </div>
                    </td>
                    <td>
                      <div className="text-xs font-mono text-slate-600 dark:text-slate-300">
                        {inmate.arrest_date}
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-1.5 font-mono text-sm font-bold text-slate-800 dark:text-slate-200">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{inmate.days_in_custody}d</span>
                      </div>
                    </td>
                    <td>
                      {inmate.is_first_offender ? (
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/40">
                          1st Offender (1/3)
                        </span>
                      ) : (
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                          Repeat Offender (1/2)
                        </span>
                      )}
                    </td>
                    <td>
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-xs text-slate-800 dark:text-slate-200">
                          {inmate.case_count} {inmate.case_count === 1 ? "case" : "cases"}
                        </span>
                        {inmate.multi_case_flag && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-bold">
                            MULTI
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <StatusBadge status={inmate.overall_status} />
                    </td>
                    <td>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {inmate.workflow_stage}
                      </span>
                    </td>
                    <td className="text-right">
                      <Link
                        href={`/dashboard/cases/${inmate.id}`}
                        className="btn-secondary text-xs px-3 py-1 inline-flex items-center gap-1"
                      >
                        <span>View</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
                {inmates.length === 0 && (
                  <tr>
                    <td colSpan={9} className="text-center py-12 text-slate-400 text-sm">
                      No undertrial records matching criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
