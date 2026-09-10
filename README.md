# NYAYAI — Sovereign Justice Intelligence Platform

> **"Transforming fragmented prison and court data into unified, explainable, and actionable case intelligence — BNSS Section 479 Compliance."**

---

## 🚀 How to Run the Application

You can start both frontend and backend servers easily using terminal commands or the provided PowerShell script.

### Method 1: Separate Terminals (Recommended for Development)

#### Terminal 1 — Backend (FastAPI Python API)
```powershell
cd c:\Users\rajes\Desktop\NYAYAI\backend
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
- **Backend API URL:** `http://localhost:8000`
- **Interactive Swagger Docs:** `http://localhost:8000/docs`

#### Terminal 2 — Frontend (Next.js 14 + Tailwind CSS)
```powershell
cd c:\Users\rajes\Desktop\NYAYAI\frontend
npm run dev
```
- **Frontend Web Portal:** `http://localhost:3000`

---

### Method 2: Single Command (PowerShell Script)
From the root project folder:
```powershell
cd c:\Users\rajes\Desktop\NYAYAI
.\start.ps1
```

---

## 🔑 Demo Login Credentials

The application includes an instant **1-click demo login switcher** on the login page, or you can sign in manually:

| Designated Role | Email | Password | Scope & Authority |
|---|---|---|---|
| **Prison Superintendent** | `superintendent@karnataka.gov.in` | `nyayai@123` | Detention facilities, custody timelines, Sec. 479 verification |
| **DLSA Panel Counsel** | `lawyer@dlsa.karnataka.gov.in` | `nyayai@123` | Legal aid allocation, draft petitions, court filing review |
| **State Legal Administrator** | `admin@slsa.karnataka.gov.in` | `nyayai@123` | Statewide SLSA compliance benchmarks, district monitoring |
| **System Administrator** | `sysadmin@nyayai.in` | `admin@nyayai123` | DPDP audit ledger, user role provisioning |

---

## 🎨 Enterprise UI & Theme Capabilities

- **Light & Dark Mode**: Seamless toggle in the top navigation bar with persistent preference storage.
- **Executive Palette**: Deep Navy Obsidian (`#0B1B3D`), Sovereign Gold (`#D4AF37`), Emerald Compliance, and Crisp Slate.
- **Enterprise Typography**: Inter + Plus Jakarta Sans + JetBrains Mono.
- **Modular Sections**:
  1. **Executive Overview**: High-level KPIs, compliance progression funnel, and prioritized undertrial review table.
  2. **Prisoner Case Graphs**: Cross-court CNR resolution, multi-case records, and complete hearing proceedings.
  3. **BNSS Section 479 Rules Engine**: Deterministic calculation deducting defence delays from calendar custody.
  4. **Delay Intelligence Engine**: Adjournment root-cause classification (prosecution vs defence vs systemic).
  5. **DLSA Action Workflow**: Step-by-step role-mapped verification checklists.
  6. **Judiciary Analytics**: District detention facility benchmarks.
  7. **Immutable Audit Ledger**: DPDP Act 2023 tamper-evident transaction logs.
