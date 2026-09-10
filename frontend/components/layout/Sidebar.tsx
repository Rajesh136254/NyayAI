"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { authApi } from "@/lib/api";
import {
  LayoutDashboard,
  FolderGit2,
  Clock,
  ListTodo,
  BarChart3,
  FileCheck2,
  LogOut,
  Scale,
  ShieldCheck,
  Award,
  ChevronRight
} from "lucide-react";

interface NavItem {
  href: string;
  icon: any;
  label: string;
  badge?: string;
  roles: string[];
}

const NAV_ITEMS: NavItem[] = [
  { 
    href: "/dashboard", 
    icon: LayoutDashboard, 
    label: "Overview", 
    roles: ["SUPERINTENDENT", "DLSA_LAWYER", "STATE_ADMIN", "SYSTEM_ADMIN"] 
  },
  { 
    href: "/dashboard/cases", 
    icon: FolderGit2, 
    label: "Case Graphs", 
    roles: ["SUPERINTENDENT", "DLSA_LAWYER", "STATE_ADMIN", "SYSTEM_ADMIN"] 
  },
  { 
    href: "/dashboard/delays", 
    icon: Clock, 
    label: "Delay Intelligence", 
    roles: ["SUPERINTENDENT", "DLSA_LAWYER", "STATE_ADMIN", "SYSTEM_ADMIN"] 
  },
  { 
    href: "/dashboard/actions", 
    icon: ListTodo, 
    label: "Action Queue", 
    roles: ["DLSA_LAWYER", "STATE_ADMIN", "SYSTEM_ADMIN"] 
  },
  { 
    href: "/dashboard/analytics", 
    icon: BarChart3, 
    label: "Judiciary Analytics", 
    roles: ["STATE_ADMIN", "SYSTEM_ADMIN"] 
  },
  { 
    href: "/dashboard/audit", 
    icon: FileCheck2, 
    label: "Audit Ledger", 
    roles: ["STATE_ADMIN", "SYSTEM_ADMIN"] 
  },
];

const ROLE_BADGE: Record<string, { label: string; color: string }> = {
  SUPERINTENDENT: { label: "Prison Supt.", color: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20" },
  DLSA_LAWYER: { label: "DLSA Counsel", color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" },
  STATE_ADMIN: { label: "State Directorate", color: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20" },
  SYSTEM_ADMIN: { label: "System Admin", color: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20" },
};

export default function Sidebar({ user, isOpen, onToggle }: { user: any; isOpen: boolean; onToggle: () => void }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try { await authApi.logout(); } catch {}
    localStorage.removeItem("nyayai_token");
    localStorage.removeItem("nyayai_user");
    router.push("/login");
  };

  const allowedNav = NAV_ITEMS.filter(item => item.roles.includes(user?.role));
  const roleConfig = ROLE_BADGE[user?.role] || { label: "Authorized", color: "bg-slate-500/10 text-slate-400 border-slate-500/20" };

  return (
    <aside
      className={`flex flex-col flex-shrink-0 transition-all duration-300 border-r bg-white dark:bg-[#071122] border-slate-200 dark:border-slate-800/80 z-40 select-none ${
        isOpen ? "w-64" : "w-16"
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center gap-3 px-4 border-b border-slate-200 dark:border-slate-800/80">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-br from-navy-900 via-navy-800 to-navy-950 dark:from-gold-500 dark:via-gold-400 dark:to-gold-600 shadow-md flex-shrink-0">
          <Scale className="w-5 h-5 text-gold-400 dark:text-navy-950" />
        </div>
        {isOpen && (
          <div className="flex flex-col animate-fade-in truncate">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white font-heading">
                NYAY<span className="text-blue-600 dark:text-gold-400">AI</span>
              </span>
              <span className="text-[10px] px-1 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 font-mono">
                v1.0
              </span>
            </div>
            <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
              Govt. of India · SLSA
            </span>
          </div>
        )}
      </div>

      {/* Navigation List */}
      <div className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {isOpen && (
          <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Intelligence Modules
          </div>
        )}
        {allowedNav.map((item) => {
          const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              title={!isOpen ? item.label : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group relative ${
                active
                  ? "bg-slate-100 text-blue-700 dark:bg-slate-800/80 dark:text-gold-400 font-semibold shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800/40"
              }`}
            >
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-600 dark:bg-gold-500 rounded-r" />
              )}
              <Icon className={`w-4 h-4 flex-shrink-0 transition-transform group-hover:scale-105 ${active ? "text-blue-600 dark:text-gold-400" : "text-slate-400 dark:text-slate-500"}`} />
              {isOpen && (
                <span className="truncate flex-1 text-[13px]">{item.label}</span>
              )}
              {isOpen && active && (
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-600" />
              )}
            </Link>
          );
        })}
      </div>

      {/* Institutional Role Card & Sign Out */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800/80 space-y-2">
        {isOpen && (
          <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-[#0B172E] border border-slate-200/80 dark:border-slate-800/80">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Jurisdiction</span>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${roleConfig.color}`}>
                {roleConfig.label}
              </span>
            </div>
            <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
              {user?.prison_id || user?.district || "Karnataka State"}
            </div>
          </div>
        )}

        <button
          onClick={handleLogout}
          title={!isOpen ? "Sign Out" : undefined}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30 transition-colors"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {isOpen && <span>Sign Out Session</span>}
        </button>
      </div>
    </aside>
  );
}
