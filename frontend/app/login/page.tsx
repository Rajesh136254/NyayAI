"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api";
import { useTheme } from "@/components/theme/ThemeProvider";
import { 
  Scale, 
  ShieldCheck, 
  Lock, 
  Mail, 
  ArrowRight, 
  Sun, 
  Moon, 
  Building, 
  Gavel, 
  UserCheck, 
  AlertCircle
} from "lucide-react";

const DEMO_PROFILES = [
  {
    roleName: "Prison Superintendent",
    email: "superintendent@karnataka.gov.in",
    password: "nyayai@123",
    icon: Building,
    badge: "Detention Facility",
    desc: "Review custody timelines & initiate Section 479 reviews",
  },
  {
    roleName: "DLSA Panel Counsel",
    email: "lawyer@dlsa.karnataka.gov.in",
    password: "nyayai@123",
    icon: Gavel,
    badge: "Legal Aid Authority",
    desc: "Draft petitions, verify charges & manage court filings",
  },
  {
    roleName: "State Legal Administrator",
    email: "admin@slsa.karnataka.gov.in",
    password: "nyayai@123",
    icon: UserCheck,
    badge: "State SLSA Directorate",
    desc: "Monitor district compliance & audit institutional backlogs",
  },
];

export default function LoginPage() {
  const router = useRouter();
  const { resolvedTheme, toggleTheme } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e?: React.FormEvent, customCredentials?: { email: string; password: string }) => {
    if (e) e.preventDefault();
    const loginEmail = customCredentials?.email || email;
    const loginPassword = customCredentials?.password || password;

    if (!loginEmail || !loginPassword) {
      setError("Please enter both email address and password");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await authApi.login(loginEmail, loginPassword);
      localStorage.setItem("nyayai_token", res.access_token);
      localStorage.setItem("nyayai_user", JSON.stringify(res.user));
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Invalid authentication credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (profile: typeof DEMO_PROFILES[0]) => {
    setEmail(profile.email);
    setPassword(profile.password);
    handleLogin(undefined, { email: profile.email, password: profile.password });
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#F8FAFC] dark:bg-[#060E1E] text-slate-900 dark:text-slate-100 transition-colors">
      {/* Top Navbar */}
      <div className="absolute top-0 left-0 right-0 h-16 px-6 flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-navy-900 dark:bg-gold-500 flex items-center justify-center text-gold-400 dark:text-navy-950 shadow">
            <Scale className="w-4 h-4" />
          </div>
          <span className="font-bold tracking-tight text-white font-heading">
            NYAY<span className="text-blue-400 dark:text-gold-400">AI</span>
          </span>
        </div>

        <button
          onClick={toggleTheme}
          aria-label="Toggle Theme"
          className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-gold-400 hover:bg-slate-200/60 dark:hover:bg-slate-800/80 transition-colors"
        >
          {resolvedTheme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>

      {/* Left Column: Product promise */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 pt-24 bg-slate-900 dark:bg-[#081224] text-white relative overflow-hidden border-r border-slate-800">
        <div className="relative z-10 space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-gold-500/10 text-gold-400 border border-gold-500/20">
            <ShieldCheck className="w-4 h-4 text-gold-400" />
            <span>Undertrial review workspace</span>
          </div>

          <div className="space-y-3">
            <h1 className="text-4xl xl:text-5xl font-extrabold tracking-tight leading-tight">
              Find the cases <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-gold-300 to-gold-500">
                that need action.
              </span>
            </h1>
            <p className="text-slate-300 text-base max-w-lg leading-relaxed">
              One clear view of custody, hearings, missing records, legal-aid status, and UTRC deadlines for authorised review teams.
            </p>
          </div>

          {/* Three-step workflow */}
          <div className="grid grid-cols-1 gap-3 pt-2 max-w-lg">
            {[
              {
                number: "01",
                title: "See priority cases",
                desc: "Urgent, attention required, and monitor categories are ranked from recorded case signals.",
              },
              {
                number: "02",
                title: "Understand why",
                desc: "Review the timeline, custody period, adjournments, missing information, and legal-aid status.",
              },
              {
                number: "03",
                title: "Move the case forward",
                desc: "Assign the next action for the lawyer, prison team, court-data team, or UTRC review.",
              },
            ].map((pillar, i) => (
              <div key={i} className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-start gap-3">
                <span className="text-[11px] font-mono font-bold text-gold-400 pt-0.5">{pillar.number}</span>
                <div className="space-y-1">
                  <div className="text-sm font-bold text-white">{pillar.title}</div>
                  <p className="text-xs text-slate-300 leading-relaxed">{pillar.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 pt-8 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <span>For authorised review teams</span>
          <span>Synthetic MVP data</span>
        </div>
      </div>

      {/* Right Column: Authentication */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 pt-20">
        <div className="w-full max-w-md space-y-6">
          <div className="space-y-2 text-left">
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-blue-600 dark:text-gold-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Secure workspace
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Welcome back.
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Sign in to review undertrial cases and coordinate the next authorised action.
            </p>
          </div>

          {error && (
            <div className="p-3.5 rounded-lg text-xs font-medium bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800/60 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Work email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="email"
                  type="email"
                  placeholder="name@karnataka.gov.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-input pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-input pl-10"
                  required
                />
              </div>
            </div>

            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-2.5 text-sm font-semibold mt-2"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white dark:border-navy-950 border-t-transparent rounded-full animate-spin" />
                  Authenticating Session...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Continue to case review
                  <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </button>
          </form>

          {/* Quick Demo Access Roles */}
          <div className="pt-4 space-y-3">
            <div className="relative flex items-center justify-center">
              <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
              <span className="bg-[#F8FAFC] dark:bg-[#060E1E] px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Try a demo role
              </span>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {DEMO_PROFILES.map((profile, i) => {
                const Icon = profile.icon;
                return (
                  <button
                    key={i}
                    id={`demo-login-${i}`}
                    type="button"
                    onClick={() => handleQuickLogin(profile)}
                    disabled={loading}
                    className="p-3 rounded-xl border bg-white dark:bg-[#0B172E] border-slate-200 dark:border-slate-800 hover:border-blue-500/50 dark:hover:border-gold-500/50 text-left transition-all group flex items-start gap-3 shadow-sm hover:shadow"
                  >
                    <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-gold-400 group-hover:bg-blue-50 dark:group-hover:bg-gold-500/20 transition-colors flex-shrink-0 mt-0.5">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-gold-400">
                          {profile.roleName}
                        </span>
                        <span className="text-[10px] font-semibold px-2 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                          {profile.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                        {profile.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
