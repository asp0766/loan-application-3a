# LendSwift — Multi-Step Digital Lending Platform (Project 3A)

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.x-61dafb.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.x-646CFF.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC.svg)](https://tailwindcss.com/)
[![Tests](https://img.shields.io/badge/Vitest-53%20Passed-brightgreen.svg)](https://vitest.dev/)
[![WCAG 2.1 AA](https://img.shields.io/badge/Accessibility-WCAG%202.1%20AA-success.svg)](https://www.w3.org/WAI/WCAG21/quickref/)

A production-grade, highly responsive, 8-step digital loan application form built for **LendSwift**—a fictional Indian digital lending startup (RBI-registered Non-Banking Financial Company).

This project resolves complex form engineering challenges in consumer finance: **50+ validated form fields**, cross-step validation dependencies, conditional step insertion, client-side Canvas image compression, Verhoeff checksum algorithm verification, AES-256-GCM encrypted draft auto-saving, touch-enabled digital e-signatures, and instant pre-approval summary generation.

> [!NOTE]
> **DEMONSTRATION ONLY:** This application simulates digital lending underwriting, NSDL PAN verification, and UIDAI Aadhaar verification. It does not connect to real credit bureaus (CIBIL/Equifax) or banking databases.

---

## 🌟 Key Features & Capabilities

- **Three Loan Products Supported:**
  - **Personal Loan:** ₹50,000 to ₹10,00,000 (12–60 months, 10.5% p.a.). Co-applicant triggered when loan exceeds ₹5,00,000.
  - **Home Loan:** ₹5,00,000 to ₹1,00,00,000 (60–360 months, 8.5% p.a.). Always requires a co-applicant and property documentation.
  - **Business Loan:** ₹1,00,000 to ₹50,00,000 (12–120 months, 14.0% p.a.). Requires Business Owner or Self-Employed status, GSTIN, and business registration. Co-applicant triggered when loan exceeds ₹20,00,000.
- **8 Mandatory Application Steps:**
  1. *Loan Product & Requirement:* Product selection, principal amount with live Lakhs/Crores formatting, tenure selection, purpose, and live indicative EMI card.
  2. *Personal Information:* Legal name, DOB with age verification (21–65 years), gender, marital status, parents' names, verified email, and simulated 4-digit mobile OTP verification.
  3. *Identity Verification (KYC):* PAN format check with 4th character entity validation (`P`, `C`, `F`), 12-digit Aadhaar with official **Verhoeff Checksum Algorithm**, simulated 1.5s API verification delay, and mandatory explicit UIDAI consent.
  4. *Residential Address:* Current address with **PIN code lookup** across all 28 Indian States & 8 UTs (auto-filling City & State), state mismatch warnings, residence type, conditional rent input, previous address (if <1 year), and permanent address section.
  5. *Income & Employment:* Dynamic sub-forms for **Salaried** (with Top 15 Indian Employers autocomplete), **Self-Employed**, and **Business Owner** (with 15-character GSTIN validation). Automatically purges stale data when switching categories.
  6. *Co-Applicant & Guarantor (Conditional):* Dynamically inserted when loan amount/type exceeds risk thresholds. Features joint liability consent, PAN verification, and clubbed household income for improved borrowing capacity.
  7. *Document Upload & E-Signature:* Drag-and-drop file upload with client-side **Canvas API compression** (60–80% size reduction for images), file size/type validation, document status checklist, and an interactive **Digital E-Signature Canvas** with touch/mouse drawing and clear options.
  8. *Review & Pre-Approval Summary:* Section-by-section data review with deep edit links, RBI Key Fact Statement (KFS) card, reducing-balance EMI breakdown, debt-to-income ratio check, 4 un-ticked explicit RBI consents, and downloadable PDF summary.
- **Auto-Save & Encrypted Persistence:**
  - Debounced 30-second background auto-save to `localStorage`.
  - Encrypted using **AES-256-GCM** via `window.crypto.subtle`.
  - 72-hour TTL auto-purge for data minimality.
  - "Resume Draft or Start Fresh" detection modal on page load with data corruption defense.
  - Unobtrusive auto-dismissing toast notifications.

---

## 🛠️ Technology Stack & Rationale

| Layer | Technology | Choice Rationale |
|---|---|---|
| **Core Framework** | React 19 + TypeScript | Type safety, concurrent rendering, and modern component lifecycle. |
| **Build Tool** | Vite 8 | Sub-second HMR and optimized production bundling (137 kB gzipped). |
| **Styling** | Tailwind CSS 3.4 | Clean utility-first design system with LendSwift custom palette and 44px+ touch targets. |
| **Form Management** | React Hook Form | Uncontrolled component refs prevent keystroke lag across 50+ fields on mobile devices. |
| **Schema Validation** | Zod + Resolver | TypeScript-first declarative schemas with dynamic cross-step factory composition. |
| **Cryptography** | Web Crypto API (`SubtleCrypto`) | Hardware-accelerated AES-256-GCM client-side encryption without heavy dependencies. |
| **Testing** | Vitest + React Testing Library | Blazing fast in-memory execution and accessible user-journey assertions. |
| **Icons & Effects** | Lucide React + Canvas Confetti | Lightweight accessible SVG icons and delightful submission micro-animations. |

---

## 🚀 Quick Start & Installation

### Prerequisites
- Node.js `v18.0.0` or higher (tested on Node v24.18)
- npm `v9.0.0` or higher

### Local Setup
```bash
# 1. Clone or navigate to the project directory
cd loan-application-3A

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser to view the application.

---

## 🧪 Testing Suite & Quality Assurance

LendSwift includes a comprehensive suite of **53 unit and integration tests** covering all 15 scenarios specified in the ZeTheta project evaluation protocol:

```bash
# Run all tests once
npm test

# Run tests in interactive watch mode
npm run test:watch
```

### Test Coverage Highlights:
- **`src/test/validators.test.ts` (15 tests):** PAN format, 4th character entity validation (`P`, `C`, `F`, and invalid types), Verhoeff checksum algorithm, exact 21st birthday acceptance vs. 20y 364d rejection, GSTIN format, and PII masking.
- **`src/test/emiCalculator.test.ts` (5 tests):** Reducing-balance EMI formula, processing fee bounds (min ₹2,000, max ₹25,000), and debt-to-income (>50%) threshold alerts.
- **`src/test/encryption.test.ts` (2 tests):** AES-256-GCM encryption/decryption round-trip and corrupted data recovery.
- **`src/test/schemaFactory.test.ts` (6 tests):** Product amount bounds, tenure limits, age + tenure $\le$ 65 years check, and Business Loan employment guards.
- **`src/test/flow.test.tsx` (10 tests):** End-to-end multi-step flows, loan type switching, rapid-click throttling, and localStorage draft saving.
- **`src/test/fixtures.test.ts` (3 tests):** Validates realistic mock payloads for Personal, Home, and Business loans across all 8 steps.
- **`src/test/components.test.tsx` (4 tests):** Tests Compound Component patterns (`Input.Label`, `Input.Field`, etc.) and accessibility attributes.
- **`src/test/accessibility.test.tsx` (4 tests):** WCAG 2.1 AA audit of ARIA live regions, input labels, landmark roles, and progress announcements.
- **`src/test/hooks.test.ts` (4 tests):** PIN code lookup with mock Indian Post data and 1.5s simulated verification delays.

---

## 🏗️ Production Build & Verification

```bash
# Check code style and rules
npm run lint

# Compile and create production bundle
npm run build

# Preview production build locally
npm run preview
```

**Production Build Metrics:**
- **Main JavaScript Chunk:** 480 kB (137 kB gzipped)
- **CSS Bundle:** 30.8 kB (6.1 kB gzipped)
- **Compilation Time:** ~2.3 seconds with zero errors

---

## 🔒 Security & Privacy Practices

- **Zero Plaintext PII in Storage:** All auto-saved drafts in `localStorage` are encrypted using AES-256-GCM.
- **PII UI Masking:** Sensitive fields (PAN, Aadhaar) mask characters, showing only the final 4 digits when not actively focused.
- **Anti-Screen-Capture Canvas Overlay:** The digital signature canvas obscures content when unfocused.
- **No Console PII Leaks:** Production builds strip all sensitive form payloads from logging statements.
- **Client-Side Image Processing:** Uploaded documents and photos are compressed in local browser memory via HTML5 Canvas and are never transmitted to external third-party servers.

---

## 📜 Indian Regulatory Compliance Highlights

- **RBI Digital Lending Guidelines (September 2022):**
  - Granular, unbundled checkboxes for explicit applicant consent. Pre-ticked consent boxes are strictly prohibited.
  - Pre-approval Key Fact Statement (KFS) itemizing interest rate, tenure, EMI, processing fee, and cooling-off disclosures.
  - Transparent grievance redressal displaying the lender's designated Nodal Grievance Officer and link to the RBI Banking Ombudsman Portal.
- **Information Technology Act, 2000 (Section 3A):** Captures time-stamped digital signatures as legal demonstration artifacts.

---

## 📄 License & Intellectual Property

Designed and engineered for the **ZeTheta Multi-Step Loan Application Form (Project 3A)** assessment. All rights reserved by LendSwift Financial Services Pvt Ltd (Simulated NBFC).
