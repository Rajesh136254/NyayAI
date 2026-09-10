"use client";

import { usePathname } from "next/navigation";
import { useTheme } from "@/components/theme/ThemeProvider";
import { 
  Sun, 
  Moon, 
  Shield, 
  Menu, 
  Bell, 
  Search, 
  CheckCircle2, 
  Building2, 
  ChevronRight,
  ShieldCheck
} from "lucide-react";

const PAGE_META: Record<string, { title: string; subtitle: string; category: string }> = {
  "/dashboard": { 
    title: "Executive Overview", 
    subtitle: "Real-time BNSS Sec. 479 undertrial compliance & institutional workflow monitor",
    category: "Monitoring"
  },
  "/dashboard/cases": { 
    title: "Prisoner Case Graph", 
    subtitle: "Unified cross-court custody records, CNR tracking & case graph resolutions",
    category: "Intelligence"
  },
  "/dashboard/delays": { 
    title: "Delay Intelligence Engine", 
    subtitle: "Adjournment cause classification, systemic pattern detection & delay attribution",
    category: "Analytics"
  },
  "/dashboard/actions": { 
    title: "Action & Compliance Queue", 
    subtitle: "DLSA panel assignments, AI draft petition generation & verification workflows",
    category: "Operations"
  },
  "/dashboard/analytics": { 
    title: "Statewide Judiciary Analytics", 
    subtitle: "SLSA institutional performance benchmarks, district compliance & audit metrics",
    category: "Governance"
  },
  "/dashboard/audit": { 
    title: "Immutable Audit Ledger", 
    subtitle: "DPDP statutory compliance log, tamper-evident user access & export trails",
    category: "Compliance"
  },
};

export default function Topbar({ user, onMenuToggle }: { user: any; onMenuToggle: () => void }) {
  const pathname = usePathname();
  const { resolvedTheme, toggleTheme } = useTheme();

  const key = Object.keys(PAGE_META).find(k => pathname === k || (k !== "/dashboard" && pathname.startsWith(k)));
  const meta = PAGE_META[key || "/dashboard"] || { 
    title: "Case Intelligence Dossier", 
    subtitle: "Unified undertrial assessment and case record analysis", 
    category: "Dossier" 
  };

  return (
    <header className="h-16 px-6 flex items-center justify-between border-b bg-white/95 dark:bg-[#081224]/95 backdrop-blur-md border-slate-200 dark:border-slate-800/80 sticky top-0 z-30 transition-colors">
      {/* Left: Menu trigger & Breadcrumb */}
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuToggle}
          aria-label="Toggle Navigation"
          className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-slate-400 dark:text-slate-500">
          <span>{meta.category}</span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-800 dark:text-slate-200 font-semibold">{meta.title}</span>
        </div>
      </div>

      {/* Center/Right Actions */}
      <div className="flex items-center gap-3">
        {/* District badge */}
        {user?.district && (
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 dark:bg-slate-800/70 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700/60">
            <Building2 className="w-3.5 h-3.5 text-slate-400 dark:text-gold-500" />
            <span>{user.district}</span>
          </div>
        )}

        {/* Live Statutory Compliance Engine Status */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800/50">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>BNSS 479 Active</span>
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle Light and Dark Mode"
          title={`Switch to ${resolvedTheme === 'dark' ? 'Light' : 'Dark'} Mode`}
          className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-gold-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
        >
          {resolvedTheme === "dark" ? (
            <Sun className="w-4 h-4 text-gold-400" />
          ) : (
            <Moon className="w-4 h-4 text-slate-600" />
          )}
        </button>

        {/* Profile Card */}
        <div className="flex items-center gap-3 pl-3 border-l border-slate-200 dark:border-slate-800">
          <div className="w-8 h-8 rounded-lg bg-navy-900 dark:bg-gold-500/20 border border-slate-300 dark:border-gold-500/30 flex items-center justify-center text-xs font-bold text-white dark:text-gold-400 shadow-sm">
            {user?.name?.charAt(0) || "U"}
          </div>
          <div className="hidden sm:block text-left">
            <div className="text-xs font-bold text-slate-800 dark:text-slate-100 leading-tight">
              {user?.name || "Authorized User"}
            </div>
            <div className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {user?.role?.replace("_", " ") || "Officer"}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
