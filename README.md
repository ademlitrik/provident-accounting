# Provident Accounting & Audit Suite

<p align="center">
  <img src="public/icon.png" alt="Provident Logo" width="80" />
</p>

<p align="center">
  <strong>Professional Audit & Statutory Financial Reporting Software for South African Chartered Accountants</strong><br/>
  Built for Provident Financial Consultants · <a href="https://pfconsultants.co.za/">pfconsultants.co.za</a>
</p>

<p align="center">
  <a href="https://github.com/ademlitrik/provident-accounting/releases/latest">
    <img src="https://img.shields.io/github/v/release/ademlitrik/provident-accounting?label=Latest%20Release&color=4F46E5" alt="Latest Release" />
  </a>
  <a href="https://github.com/ademlitrik/provident-accounting/actions/workflows/build-release.yml">
    <img src="https://github.com/ademlitrik/provident-accounting/actions/workflows/build-release.yml/badge.svg" alt="Build Status" />
  </a>
  <img src="https://img.shields.io/badge/platform-Windows%20%7C%20macOS-blue" alt="Platform" />
  <img src="https://img.shields.io/badge/Electron-45-47848F?logo=electron" alt="Electron" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react" alt="React" />
</p>

---

## 📥 Download

| Platform | Installer | Architecture |
|----------|-----------|-------------|
| **Windows** | `Provident Accounting Setup x.x.x.exe` | x64 |
| **macOS** | `Provident Accounting-x.x.x.dmg` | Intel + Apple Silicon (Universal) |

👉 **[Download latest release →](https://github.com/ademlitrik/provident-accounting/releases/latest)**

---

## ✨ Features

- 📊 **General Ledger & Trial Balance** — full double-entry bookkeeping
- 🏦 **Bank Reconciliation** — automated matching engine
- 📋 **ISA 210 Client Acceptance** — risk and independence checklists
- 📄 **Financial Statements** — IFRS/GRAP-compliant statutory financials with PDF export
- 🔍 **ISA 530 Audit Sampling** — substantive & statistical sampling tools
- 🧾 **Tax Computations** — South African income tax schedules
- 📁 **Audit Working Papers** — structured evidence binder with sign-off
- 🔐 **Audit PDF Studio** — unlock, edit, annotate, OCR client PDFs
- 🏛️ **CIPC iXBRL E-Filing** — CIPC-compliant XBRL tagging & export
- 🤖 **AI Audit Assistant** — Google Gemini-powered guidance
- 🔄 **Legacy File Migration** — import CaseWare `.cwp`, Draftworx exports, CSV Trial Balances
- 👥 **User Management** — admin-controlled multi-user access with roles
- 🕐 **Practice Management** — timesheets, WIP billing, engagement scheduling
- 🛡️ **Security & Compliance Centre** — audit log, encryption status, SOC 2 readiness

---

## 🚀 Getting Started (Development)

### Prerequisites
- Node.js 20+
- npm 10+

### Install & Run

```bash
git clone https://github.com/ademlitrik/provident-accounting.git
cd provident-accounting
npm install
npm run dev        # Starts Vite + Electron in dev mode
```

### Build Installers

```bash
npm run build:win   # Windows NSIS installer (.exe)
npm run build:mac   # macOS DMG (.dmg) — requires macOS
npm run build:all   # Both platforms
```

---

## 🏗️ CI/CD — Automated Releases

Push a version tag to trigger automated builds on GitHub Actions:

```bash
git tag v1.0.1
git push origin v1.0.1
```

GitHub Actions will:
1. Build the React frontend (Vite)
2. Package Windows EXE on `ubuntu-latest` (cross-compile)
3. Package macOS DMG (Universal: Intel + Apple Silicon) on `macos-latest`
4. Create a **GitHub Release** and attach both installers automatically

See [`.github/workflows/build-release.yml`](.github/workflows/build-release.yml)

---

## 🔐 Default Login

| Field | Value |
|-------|-------|
| Email | `info@pfconsultants.co.za` |
| Password | `admin@123` |

> The administrator can create additional users from **User Management** in the sidebar.

---

## 🏢 Development Credits

| | |
|--|--|
| **Developer** | Tanyaradzwa Livingstone Bvute |
| **GitHub** | [@ademlitrik](https://github.com/ademlitrik) |
| **Company** | [Afro Vision Media](https://github.com/ademlitrik) |
| **Client** | [Provident Financial Consultants](https://pfconsultants.co.za/) |

> Designed, developed, and implemented by **Tanyaradzwa Livingstone Bvute** under **Afro Vision Media** for **Provident Financial Consultants**.

---

## 📄 License

Proprietary software. All rights reserved © 2025 Provident Financial Consultants / Afro Vision Media.
