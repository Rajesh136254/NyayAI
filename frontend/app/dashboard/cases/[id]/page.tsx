"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { inmatesApi } from "@/lib/api";
import {
  ArrowLeft,
  Scale,
  Clock,
  Building,
  ShieldCheck,
  AlertTriangle,
  FileText,
  Calendar,
  CheckCircle2,
  XCircle,
  HelpCircle,
  TrendingDown,
  Layers,
  ChevronRight,
  UserCheck,
  Printer,
  Sparkles,
  Gavel,
  BookOpen,
  Info,
  ClipboardCheck,
  Upload,
  LoaderCircle
} from "lucide-react";

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { cls: string; label: string }> = {
    ELIGIBLE: { cls: "badge-eligible", label: "Eligible (Sec. 479)" },
    INELIGIBLE: { cls: "badge-ineligible", label: "Ineligible" },
    BORDERLINE: { cls: "badge-borderline", label: "Borderline Threshold" },
    EXCLUDED: { cls: "badge-excluded", label: "Statutory Exclusion" },
    MULTI_CASE_REVIEW: { cls: "badge-multi", label: "Multi-Case Coordination" },
  };
  const { cls, label } = map[status] || { cls: "badge-excluded", label: status };
  return <span className={cls}>{label}</span>;
}

const HEARING_STATUS_STYLE: Record<string, { label: string; bg: string; text: string }> = {
  ADJOURNED: { label: "Adjourned", bg: "bg-amber-500/10 dark:bg-amber-500/20", text: "text-amber-700 dark:text-amber-300" },
  HEARD: { label: "Heard on Merits", bg: "bg-emerald-500/10 dark:bg-emerald-500/20", text: "text-emerald-700 dark:text-emerald-300" },
  CHARGE_FRAMED: { label: "Charges Framed", bg: "bg-blue-500/10 dark:bg-blue-500/20", text: "text-blue-700 dark:text-blue-300" },
  BAIL_ORDER: { label: "Bail Order", bg: "bg-purple-500/10 dark:bg-purple-500/20", text: "text-purple-700 dark:text-purple-300" },
  JUDGMENT: { label: "Judgment", bg: "bg-indigo-500/10 dark:bg-indigo-500/20", text: "text-indigo-700 dark:text-indigo-300" },
};

const STAGE_ORDER = ["IDENTIFIED", "VERIFIED", "ASSIGNED", "DRAFTED", "REVIEWED", "FILED", "OUTCOME"];

export default function CaseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [inmate, setInmate] = useState<any>(null);
  const [assessment, setAssessment] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"graph" | "assessment" | "delays" | "actions">("graph");
  const [loading, setLoading] = useState(true);
  const [assLoading, setAssLoading] = useState(false);

  const id = Number(params.id);

  useEffect(() => {
    inmatesApi.get(id)
      .then((data) => {
        setInmate(data);
        setLoading(false);
      })
      .catch(console.error);
  }, [id]);

  const loadAssessment = async () => {
    if (assessment) return;
    setAssLoading(true);
    try {
      const data = await inmatesApi.assessment(id);
      setAssessment(data);
    } catch (e) {
      console.error(e);
    } finally {
      setAssLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "assessment") {
      loadAssessment();
    }
  }, [activeTab]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-3">
        <div className="w-8 h-8 border-3 border-blue-600 dark:border-gold-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs text-slate-600 dark:text-slate-400">Loading Undertrial Dossier...</span>
      </div>
    );
  }

  if (!inmate) {
    return (
      <div className="ent-card p-12 text-center max-w-lg mx-auto space-y-3">
        <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto" />
        <h3 className="text-base font-bold text-slate-900 dark:text-white">Dossier Not Found</h3>
        <p className="text-xs text-slate-600 dark:text-slate-500">The specified prisoner record does not exist or has been archived.</p>
        <Link href="/dashboard/cases" className="btn-primary text-xs px-4 py-2 inline-flex">
          Return to Case List
        </Link>
      </div>
    );
  }

  const stageIdx = STAGE_ORDER.indexOf(inmate.workflow_stage);

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard/cases"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-gold-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Case Directory</span>
        </Link>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => window.print()}
            className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Dossier</span>
          </button>
        </div>
      </div>

      {/* Hero Dossier Card */}
      <div className="ent-card p-6 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-900 to-navy-950 dark:from-gold-500 dark:to-gold-700 text-white dark:text-navy-950 font-extrabold text-2xl flex items-center justify-center shadow-md flex-shrink-0">
              {inmate.name.charAt(0)}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                  {inmate.name}
                </h1>
                <StatusBadge status={inmate.overall_status} />
              </div>

              <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                <span className="font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded font-semibold text-slate-700 dark:text-slate-300">
                  {inmate.prisoner_id}
                </span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Building className="w-3.5 h-3.5 text-slate-400" />
                  {inmate.prison_name} ({inmate.prison_district})
                </span>
                <span>·</span>
                <span>Arrest: {inmate.arrest_date}</span>
                {inmate.gender && <span>· Gender: {inmate.gender}</span>}
              </div>

              {/* Status Chips */}
              <div className="flex items-center gap-2 pt-1 flex-wrap">
                {inmate.is_first_offender ? (
                  <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/40">
                    First-Time Offender (1/3 Threshold)
                  </span>
                ) : (
                  <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    Repeat Offender (1/2 Threshold)
                  </span>
                )}

                {inmate.multi_case_flag && (
                  <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/40">
                    Multi-Case Record (Coordinated Review)
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0E1A33] border border-slate-200/80 dark:border-slate-800 text-center min-w-[110px]">
              <div className="text-2xl font-black text-blue-600 dark:text-gold-400 font-heading">
                {inmate.days_in_custody}
              </div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mt-0.5">
                Total Custody Days
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0E1A33] border border-slate-200/80 dark:border-slate-800 text-center min-w-[110px]">
              <div className="text-2xl font-black text-slate-900 dark:text-white font-heading">
                {inmate.cases?.length || 0}
              </div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mt-0.5">
                Linked Cases
              </div>
            </div>
          </div>
        </div>

        {/* Workflow Progression Stepper */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">Statutory Workflow Progress</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Current Stage: <span className="text-blue-600 dark:text-gold-400">{inmate.workflow_stage}</span>
            </span>
          </div>

          <div className="grid grid-cols-7 gap-1">
            {STAGE_ORDER.map((stage, idx) => {
              const isPast = idx < stageIdx;
              const isCurrent = idx === stageIdx;
              return (
                <div key={stage} className="flex flex-col items-center gap-1.5 text-center">
                  <div 
                    className={`w-full h-1.5 rounded-full transition-all ${
                      isPast 
                        ? "bg-emerald-500" 
                        : isCurrent 
                        ? "bg-blue-600 dark:bg-gold-500" 
                        : "bg-slate-200 dark:bg-slate-800"
                    }`} 
                  />
                  <span className={`text-[10px] font-semibold truncate ${
                    isCurrent ? "text-blue-600 dark:text-gold-400 font-bold" : "text-slate-600 dark:text-slate-400"
                  }`}>
                    {stage.replace(/_/g, " ")}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <ReviewSummaryPanel
        inmateId={id}
        summary={inmate.review_summary}
        documents={inmate.documents || []}
        bailApplications={inmate.bail_applications || []}
        utrcReviews={inmate.utrc_reviews || []}
        deadlines={inmate.deadlines || []}
      />

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-px">
        {[
          { id: "graph", label: "Prisoner Case Graph", icon: Layers },
          { id: "assessment", label: "Section 479 Assessment", icon: Scale },
          { id: "delays", label: "Delay Intelligence", icon: Clock },
          { id: "actions", label: "Action Workflow", icon: CheckCircle2 },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold transition-all border-b-2 -mb-px ${
                active
                  ? "border-blue-600 text-blue-600 dark:border-gold-500 dark:text-gold-400 bg-blue-50/50 dark:bg-slate-800/40 rounded-t-lg"
                  : "border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Case Graph & Chronology */}
      {activeTab === "graph" && (
        <div className="space-y-4 animate-fade-in">
          {inmate.cases?.map((c: any, ci: number) => (
            <div key={c.id} className="ent-card p-6 space-y-4">
              {/* Case Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 font-bold flex items-center justify-center text-xs flex-shrink-0">
                    C{ci + 1}
                  </div>
                  <div>
                    <div className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      {c.bns_section}
                      {c.is_life_sentence ? (
                        <span className="text-[10px] px-2 py-0.2 rounded bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300 font-semibold">
                          Life Sentence Offence
                        </span>
                      ) : null}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {c.offence_description}
                    </div>
                    <div className="text-[11px] text-slate-600 dark:text-slate-400 font-mono mt-1">
                      {c.court_name} · District: {c.court_district} · CNR: <span className="text-slate-700 dark:text-slate-300">{c.cnr || "N/A"}</span>
                    </div>
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  <div className="text-xs font-semibold text-slate-600 dark:text-slate-400">Maximum Sentence</div>
                  <div className="text-sm font-bold font-mono text-slate-800 dark:text-slate-200">
                    {c.max_sentence_years} Years ({Math.round(c.max_sentence_years * 365)} days)
                  </div>
                </div>
              </div>

              {/* Hearings History */}
              <div className="space-y-3 pt-2">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center justify-between">
                  <span>Hearing Orders & Adjournment Record ({c.hearings?.length || 0} proceedings)</span>
                </div>

                <div className="space-y-2">
                  {c.hearings?.map((h: any, hi: number) => {
                    const status = HEARING_STATUS_STYLE[h.outcome] || { label: h.outcome, bg: "bg-slate-100", text: "text-slate-600" };
                    return (
                      <div
                        key={hi}
                        className="p-3 rounded-lg border border-slate-200/60 dark:border-slate-800/80 bg-slate-50/50 dark:bg-[#071326]/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-500 font-mono text-[10px] flex items-center justify-center font-bold">
                            {hi + 1}
                          </div>
                          <div>
                            <div className="font-bold text-slate-800 dark:text-slate-200 font-mono">
                              {h.hearing_date}
                            </div>
                            {h.order_reference && (
                              <div className="text-[10px] text-slate-600 dark:text-slate-400">
                                Order Ref: {h.order_reference}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-3 flex-wrap">
                          <span className={`px-2.5 py-0.5 rounded-full font-semibold text-[11px] ${status.bg} ${status.text}`}>
                            {status.label}
                          </span>

                          {h.adjournment_reason && (
                            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                              Cause: {h.adjournment_reason.replace(/_/g, " ")}
                            </span>
                          )}

                          {h.is_excluded_from_custody && (
                            <span className="px-2 py-0.5 rounded bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300 font-bold text-[10px] border border-red-200 dark:border-red-900/40">
                              {h.days_excluded}d Excluded (Defence Cause)
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: Section 479 Assessment */}
      {activeTab === "assessment" && (
        <div className="space-y-4 animate-fade-in">
          {assLoading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-3 ent-card">
              <div className="w-8 h-8 border-3 border-blue-600 dark:border-gold-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs text-slate-600 dark:text-slate-400">Executing Deterministic Sec. 479 Rules Engine...</span>
            </div>
          ) : assessment ? (
            <div className="space-y-4">
              {/* Verdict Card */}
              <div className="ent-card p-6 space-y-5 border-l-4 border-l-blue-600 dark:border-l-gold-500">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Statutory Evaluation Engine
                    </span>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                      BNSS Section 479 Eligibility Assessment
                    </h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={assessment.status} />
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 dark:bg-slate-800 text-blue-700 dark:text-gold-400 border border-blue-200 dark:border-slate-700">
                      {assessment.confidence} Confidence
                    </span>
                  </div>
                </div>

                {/* Calculation Breakdown Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: "Total Calendar Custody", value: `${assessment.total_days_in_custody} days`, sub: "From arrest date" },
                    { label: "Excluded Days (Defence)", value: `${assessment.days_excluded} days`, sub: "Sec. 479 delay exclusions" },
                    { label: "Effective Countable Custody", value: `${assessment.effective_custody_days} days`, sub: "Net eligible period" },
                    { label: `Required Threshold (${assessment.threshold_fraction})`, value: `${assessment.threshold_days} days`, sub: assessment.is_first_offender ? "1/3 maximum penalty" : "1/2 maximum penalty" },
                  ].map((m, i) => (
                    <div key={i} className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#081326] border border-slate-200/80 dark:border-slate-800/80 space-y-1">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{m.label}</div>
                      <div className="text-base font-extrabold text-slate-900 dark:text-white font-mono">{m.value}</div>
                      <div className="text-[10px] text-slate-400">{m.sub}</div>
                    </div>
                  ))}
                </div>

                {/* Explanation Statement */}
                <div className="p-4 rounded-xl bg-blue-50/50 dark:bg-[#0c1c38]/50 border border-blue-100 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 leading-relaxed space-y-1">
                  <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Info className="w-4 h-4 text-blue-600 dark:text-gold-400" />
                    Legal Explanation & Statutory Context
                  </div>
                  <p>{assessment.ai_explanation}</p>
                </div>
              </div>

              {/* Evidence Trail */}
              <div className="ent-card p-6 space-y-3">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600 dark:text-gold-400" />
                  Deterministic Audit Trail & Verifiable Evidence
                </h3>
                <div className="space-y-2 pt-1">
                  {assessment.evidence_trail?.map((ev: string, i: number) => (
                    <div key={i} className="p-2.5 rounded-lg bg-slate-50 dark:bg-[#071326] border border-slate-200/60 dark:border-slate-800/60 flex items-start gap-2.5 text-xs">
                      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">✓</span>
                      <span className="font-mono text-slate-700 dark:text-slate-300">{ev}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* Tab 3: Delay Intelligence */}
      {activeTab === "delays" && <DelayAnalysisSub inmateId={id} />}

      {/* Tab 4: Actions Workflow */}
      {activeTab === "actions" && <ActionsSub inmateId={id} />}
    </div>
  );
}

function ReviewSummaryPanel({ inmateId, summary, documents, bailApplications, utrcReviews, deadlines }: { inmateId: number; summary: any; documents: any[]; bailApplications: any[]; utrcReviews: any[]; deadlines: any[] }) {
  const [documentList, setDocumentList] = useState(documents);
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");
  const [documentType, setDocumentType] = useState("OTHER");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDocumentUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setUploading(true);
    setUploadMessage("");
    try {
      const uploaded = await inmatesApi.uploadDocument(inmateId, file, documentType);
      setDocumentList((current) => [...current, uploaded]);
      setUploadMessage("Uploaded and queued for human verification.");
    } catch (error) {
      setUploadMessage(error instanceof Error ? error.message : "Document upload failed");
    } finally {
      setUploading(false);
    }
  };

  if (!summary) return null;
  const UploadIcon = uploading ? LoaderCircle : Upload;

  const priorityStyles: Record<string, string> = {
    URGENT: "border-red-200 bg-red-50/70 text-red-700 dark:border-red-900/60 dark:bg-red-950/20 dark:text-red-300",
    ATTENTION: "border-amber-200 bg-amber-50/70 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/20 dark:text-amber-300",
    NORMAL: "border-emerald-200 bg-emerald-50/70 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/20 dark:text-emerald-300",
  };
  const priority = priorityStyles[summary.priority] || priorityStyles.NORMAL;

  return (
    <section className="space-y-4 animate-fade-in">
      <div className={`ent-card p-5 border-l-4 ${summary.priority === "URGENT" ? "border-l-red-500" : summary.priority === "ATTENTION" ? "border-l-amber-500" : "border-l-emerald-500"}`}>
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">Case health and next action</h2>
              <span className={`px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider ${priority}`}>{summary.priority_label}</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{summary.recommended_action}</p>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold text-slate-600 dark:text-slate-300">
            <span>{summary.signal_count} review signals</span>
            <span>{summary.missing_count} information gaps</span>
            {summary.next_hearing && <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{summary.next_hearing}</span>}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-5">
          <div className="lg:col-span-2 space-y-2">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Human legal review signals</h3>
            {summary.signals?.length ? summary.signals.map((signal: any) => (
              <div key={signal.key} className="flex items-start gap-2.5 p-3 rounded-lg bg-slate-50 dark:bg-[#081326] border border-slate-200 dark:border-slate-800">
                <ShieldCheck className={`w-4 h-4 mt-0.5 flex-shrink-0 ${signal.severity === "URGENT" ? "text-red-500" : "text-amber-500"}`} />
                <div><div className="text-xs font-bold text-slate-800 dark:text-slate-200">{signal.label}</div><p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{signal.detail}</p></div>
              </div>
            )) : <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 text-xs text-emerald-700 dark:text-emerald-300">No immediate review signal detected. Continue monitoring.</div>}
            <p className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1 pt-1"><Info className="w-3 h-3" />This is an administrative review signal, not an automated bail or release decision.</p>
          </div>

          <div className="space-y-2">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Missing information engine</h3>
            {summary.missing_information?.length ? summary.missing_information.map((item: any) => (
              <div key={item.key} className="p-3 rounded-lg border border-red-200/80 dark:border-red-900/50 bg-red-50/60 dark:bg-red-950/20">
                <div className="flex items-center gap-2 text-xs font-bold text-red-700 dark:text-red-300"><FileText className="w-3.5 h-3.5" />{item.label}</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">Owner: {item.owner}</div>
              </div>
            )) : <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 text-xs text-emerald-700 dark:text-emerald-300">Required profile information is present.</div>}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
        <div className="ent-card p-5 xl:col-span-3 space-y-3">
          <div className="flex items-center justify-between"><h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2"><Clock className="w-4 h-4 text-blue-600 dark:text-gold-400" />Unified case timeline</h3><span className="text-[10px] text-slate-500 dark:text-slate-400">{summary.timeline?.length || 0} events</span></div>
          <div className="max-h-80 overflow-y-auto space-y-2 pr-1">
            {summary.timeline?.map((event: any, index: number) => (
              <div key={`${event.date}-${index}`} className="flex gap-3">
                <div className="flex flex-col items-center"><div className="w-2.5 h-2.5 rounded-full bg-blue-600 dark:bg-gold-500 mt-1.5" />{index < summary.timeline.length - 1 && <div className="w-px flex-1 bg-slate-200 dark:bg-slate-800" />}</div>
                <div className="pb-3"><div className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400">{event.date}</div><div className="text-xs font-bold text-slate-800 dark:text-slate-200">{event.title}</div><div className="text-[11px] text-slate-500 dark:text-slate-400">{event.detail}</div></div>
              </div>
            ))}
          </div>
        </div>

        <div className="ent-card p-5 xl:col-span-2 space-y-3">
          <div className="flex items-center justify-between"><h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2"><Layers className="w-4 h-4 text-blue-600 dark:text-gold-400" />Connected records</h3><span className="text-[10px] text-slate-500 dark:text-slate-400">Profile integrations</span></div>
          <div className="space-y-2">
            {summary.integrations?.map((integration: any) => (
              <div key={integration.key} className="flex items-center justify-between gap-3 p-3 rounded-lg bg-slate-50 dark:bg-[#081326] border border-slate-200 dark:border-slate-800">
                <div className="min-w-0"><div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{integration.label}</div><div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{integration.detail}</div></div>
                <span className={`text-[10px] font-bold whitespace-nowrap ${integration.status === "Connected" || integration.status === "Assigned" || integration.status === "Ready for review" || integration.status === "Review signal ready" ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}`}>{integration.status}</span>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400">External records are shown as linked profile sources. Authorised teams must verify current documents and status before action.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="ent-card p-5 space-y-3">
          <div className="flex items-center justify-between gap-3"><h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2"><FileText className="w-4 h-4 text-blue-600 dark:text-gold-400" />Document register</h3><span className="text-[10px] text-slate-500 dark:text-slate-400">{documentList.length} records</span></div>
          <div className="p-3 rounded-lg border border-dashed border-blue-300 dark:border-slate-700 bg-blue-50/50 dark:bg-blue-950/10 space-y-2">
            <div className="flex items-center gap-2"><select value={documentType} onChange={(event) => setDocumentType(event.target.value)} className="form-input text-xs py-1.5"><option value="OTHER">Other document</option><option value="FIR">FIR</option><option value="CHARGESHEET">Chargesheet</option><option value="BAIL_ORDER">Bail order</option><option value="SOCIAL_STATUS_REPORT">Social/financial report</option><option value="HEARING_ORDER">Hearing order</option></select><button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading} className="btn-primary text-xs py-1.5 px-3 whitespace-nowrap"><UploadIcon className={`w-3.5 h-3.5 ${uploading ? "animate-spin" : ""}`} />{uploading ? "Uploading" : "Upload file"}</button></div>
            <input ref={fileInputRef} type="file" accept=".pdf,.png,.jpg,.jpeg,.doc,.docx" onChange={handleDocumentUpload} className="hidden" />
            <p className="text-[10px] text-slate-500 dark:text-slate-400">PDF, image, DOC, or DOCX up to 10 MB. Uploaded files remain pending human verification.</p>
            {uploadMessage && <p className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">{uploadMessage}</p>}
          </div>
          <div className="space-y-2">{documentList.map((document: any) => <div key={document.id} className="flex items-center justify-between gap-2 text-xs"><span className="text-slate-700 dark:text-slate-300 truncate">{document.title}</span><span className={`text-[10px] font-bold ${document.status === "VERIFIED" ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>{document.status}</span></div>)}</div>
        </div>
        <div className="ent-card p-5 space-y-3">
          <div className="flex items-center justify-between"><h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2"><Gavel className="w-4 h-4 text-blue-600 dark:text-gold-400" />Bail history</h3><span className="text-[10px] text-slate-500 dark:text-slate-400">{bailApplications.length} application(s)</span></div>
          {bailApplications.map((application: any) => <div key={application.id} className="p-3 rounded-lg bg-slate-50 dark:bg-[#081326] border border-slate-200 dark:border-slate-800"><div className="flex items-center justify-between text-xs"><span className="font-bold text-slate-800 dark:text-slate-200">{application.application_type.replace(/_/g, " ")}</span><span className="font-bold text-amber-600 dark:text-amber-400">{application.status}</span></div><div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">Filed {application.filed_date} · {application.court_name}</div></div>)}
          {!bailApplications.length && <p className="text-xs text-slate-500 dark:text-slate-400">No bail application is linked yet.</p>}
        </div>
        <div className="ent-card p-5 space-y-3">
          <div className="flex items-center justify-between"><h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2"><ClipboardCheck className="w-4 h-4 text-blue-600 dark:text-gold-400" />UTRC and deadlines</h3><span className="text-[10px] text-slate-500 dark:text-slate-400">{utrcReviews.length} review(s)</span></div>
          {utrcReviews.map((review: any) => <div key={review.id} className="p-3 rounded-lg bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50"><div className="flex items-center justify-between text-xs"><span className="font-bold text-slate-800 dark:text-slate-200">UTRC review due</span><span className="font-bold text-amber-600 dark:text-amber-400">{review.review_date}</span></div><div className="text-[10px] text-slate-600 dark:text-slate-400 mt-1">{review.missing_item || review.recommendation}</div></div>)}
          {deadlines.map((deadline: any) => <div key={deadline.id} className="flex items-center justify-between gap-2 text-xs"><span className="text-slate-700 dark:text-slate-300 truncate">{deadline.action}</span><span className="font-mono font-bold text-red-600 dark:text-red-400">{deadline.due_date}</span></div>)}
        </div>
      </div>
    </section>
  );
}

function DelayAnalysisSub({ inmateId }: { inmateId: number }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    inmatesApi.delays(inmateId)
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [inmateId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-3 ent-card">
        <div className="w-8 h-8 border-3 border-blue-600 dark:border-gold-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs text-slate-400">Evaluating Adjournment Patterns...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {data?.cases?.map((c: any) => {
        const r = c.report;
        return (
          <div key={c.case_id} className="ent-card p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {c.bns_section} — Delay Classification Report
                </h3>
                <div className="text-xs text-slate-400 font-mono">
                  {c.court_name} · CNR: {c.cnr}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2.5 py-1 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50">
                  {r.delay_severity} Severity
                </span>
                {r.systemic_delay_detected && (
                  <span className="text-xs font-bold px-2.5 py-1 rounded bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800/50">
                    Systemic Pattern Flagged
                  </span>
                )}
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#081326] text-center border border-slate-200/80 dark:border-slate-800/80">
                <div className="text-xl font-bold text-slate-900 dark:text-white font-mono">{r.total_hearings}</div>
                <div className="text-[10px] uppercase font-bold text-slate-400">Total Hearings</div>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#081326] text-center border border-slate-200/80 dark:border-slate-800/80">
                <div className="text-xl font-bold text-amber-600 dark:text-gold-400 font-mono">{r.total_adjournments}</div>
                <div className="text-[10px] uppercase font-bold text-slate-400">Adjournments</div>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#081326] text-center border border-slate-200/80 dark:border-slate-800/80">
                <div className="text-xl font-bold text-blue-600 dark:text-blue-400 font-mono">{r.adjournment_rate}%</div>
                <div className="text-[10px] uppercase font-bold text-slate-400">Adjournment Ratio</div>
              </div>
            </div>

            {/* Delay Narrative */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#0c1c38]/40 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              <span className="font-bold text-slate-900 dark:text-white block mb-1">Algorithmic Delay Attribution:</span>
              {r.delay_narrative}
            </div>

            {/* Recommendations */}
            {r.recommendations?.length > 0 && (
              <div className="space-y-2 pt-2">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  DLSA Legal Recommendations
                </div>
                <div className="space-y-1.5">
                  {r.recommendations.map((rec: string, i: number) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
                      <span className="text-blue-600 dark:text-gold-400 font-bold">•</span>
                      <span>{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function ActionsSub({ inmateId }: { inmateId: number }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    inmatesApi.actions(inmateId)
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [inmateId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-3 ent-card">
        <div className="w-8 h-8 border-3 border-blue-600 dark:border-gold-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs text-slate-400">Generating Role-Specific Action Checklist...</span>
      </div>
    );
  }

  return (
    <div className="ent-card p-6 space-y-4 animate-fade-in">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Mandatory Action & Review Checklist
          </h3>
          <p className="text-xs text-slate-400">
            Step-by-step procedures required for compliance verification and court bail filing.
          </p>
        </div>
        <StatusBadge status={data?.assessment_status} />
      </div>

      <div className="space-y-3 pt-2">
        {data?.steps?.map((step: any, i: number) => (
          <div
            key={i}
            className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-[#071326]/60 flex items-start gap-3.5"
          >
            <div className="w-7 h-7 rounded-lg bg-blue-600 text-white dark:bg-gold-500 dark:text-navy-950 font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
              {step.step_number}
            </div>

            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                  {step.title}
                </h4>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {step.assigned_role}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {step.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
