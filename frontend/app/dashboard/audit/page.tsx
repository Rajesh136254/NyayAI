"use client";

import { useEffect, useState } from "react";
import { auditApi } from "@/lib/api";
import { 
  FileCheck2, 
  ShieldCheck, 
  Search, 
  Filter, 
  Lock, 
  Key, 
  Eye, 
  Edit3, 
  Download,
  Clock
} from "lucide-react";

const ACTION_TAGS: Record<string, { label: string; bg: string; text: string }> = {
  LOGIN: { label: "Session Auth", bg: "bg-blue-500/10", text: "text-blue-600 dark:text-blue-400" },
  LOGOUT: { label: "Session Close", bg: "bg-slate-500/10", text: "text-slate-600 dark:text-slate-400" },
  VIEW: { label: "Record View", bg: "bg-emerald-500/10", text: "text-emerald-600 dark:text-emerald-400" },
  MODIFY: { label: "State Advance", bg: "bg-amber-500/10", text: "text-amber-600 dark:text-gold-400" },
  EXPORT: { label: "Report Export", bg: "bg-purple-500/10", text: "text-purple-600 dark:text-purple-400" },
};

export default function AuditPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState("");

  useEffect(() => {
    setLoading(true);
    auditApi.list({ limit: 100, action: actionFilter || undefined })
      .then((res) => {
        setLogs(res.items);
        setTotal(res.total);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [actionFilter]);

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-blue-600 dark:text-gold-400" />
            Digital Personal Data Protection (DPDP) Immutable Audit Ledger
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Cryptographically sealed access log tracking all statutory dossier queries, role transitions, and export actions.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40 self-start sm:self-auto">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>DPDP Act 2023 Statutory Compliance</span>
        </div>
      </div>

      {/* Filter Chips */}
      <div className="ent-card p-4 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mr-1">Filter Action:</span>
          {["", "LOGIN", "VIEW", "MODIFY", "EXPORT", "LOGOUT"].map((a) => (
            <button
              key={a}
              onClick={() => setActionFilter(a)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                actionFilter === a
                  ? "bg-blue-600 text-white dark:bg-gold-500 dark:text-navy-950 shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
              }`}
            >
              {a || "All Events"}
            </button>
          ))}
        </div>

        <span className="text-xs text-slate-400 font-mono">
          {total} logged transactions
        </span>
      </div>

      {/* Audit Log Table */}
      <div className="ent-card overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-3">
            <div className="w-8 h-8 border-3 border-blue-600 dark:border-gold-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs text-slate-400">Loading Immutable Security Audit Records...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="ent-table">
              <thead>
                <tr>
                  <th>Timestamp (IST)</th>
                  <th>Officer Account</th>
                  <th>Designated Role</th>
                  <th>Action Type</th>
                  <th>Target Resource</th>
                  <th>Audit Statement</th>
                  <th>Terminal IP</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log: any) => {
                  const tag = ACTION_TAGS[log.action] || { label: log.action, bg: "bg-slate-100", text: "text-slate-600" };
                  return (
                    <tr key={log.id}>
                      <td className="font-mono text-xs text-slate-500 whitespace-nowrap">
                        {log.timestamp ? new Date(log.timestamp).toLocaleString("en-IN") : "—"}
                      </td>
                      <td>
                        <div className="font-semibold text-slate-800 dark:text-slate-200 text-xs">
                          {log.user_email}
                        </div>
                      </td>
                      <td>
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {log.user_role}
                        </span>
                      </td>
                      <td>
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${tag.bg} ${tag.text}`}>
                          {tag.label}
                        </span>
                      </td>
                      <td className="font-mono text-xs text-slate-600 dark:text-slate-400">
                        {log.resource_type} {log.resource_id ? `#${log.resource_id}` : ""}
                      </td>
                      <td className="text-xs text-slate-600 dark:text-slate-300 max-w-sm truncate">
                        {log.description}
                      </td>
                      <td className="font-mono text-[11px] text-slate-400 whitespace-nowrap">
                        {log.ip_address}
                      </td>
                    </tr>
                  );
                })}
                {logs.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-slate-400 text-sm">
                      No security audit log records found.
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
