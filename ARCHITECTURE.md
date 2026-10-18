# LendSwift — Architecture & Engineering Specification

This document details the architectural decisions, design patterns, validation mechanics, and security implementations for the **LendSwift Multi-Step Loan Application Form (Project 3A)**.

---

## 1. Architectural Philosophy & Pattern Selection

### 1.1 Wizard Component with Step Registry (Pattern 3)

Multi-step form engineering in fintech presents three classical architectures:
1. **Single Monolithic Form with Conditional Rendering:** Simple context, but large re-render cascades and hard step error isolation.
2. **Step-per-Form with Context Store:** Independent steps, but cross-step validation and atomic draft serialization require complex coordination.
3. **Wizard Component with Dynamic Step Registry (Adopted):**
   - The **Wizard orchestrator** (`src/components/wizard/Wizard.tsx`) maintains the active step registry and manages global transitions, auto-saving, draft persistence, and progress tracking.
   - Each **Step component** (`Step1LoanType` through `Step8Review`) handles its specialized presentation, layout, and localized sub-forms.
   - The **Schema Factory** (`src/schemas/schemaFactory.ts`) dynamically generates step-specific Zod schemas by reading current accumulated form state, evaluating cross-step dependencies in real-time.

---

## 2. Form State & Performance: Why React Hook Form (RHF)?

### 2.1 Re-Render Isolation via Uncontrolled Components
In a multi-step form with **50+ fields**, naive controlled state (`useState` on every keystroke) triggers an $O(N)$ re-render cascade across the parent and all sibling fields on every typed character. On mid-range mobile devices (the primary device class in Indian Tier-2/Tier-3 lending), this creates visible input lag (>100ms per keystroke).

React Hook Form isolates re-renders by utilizing **uncontrolled component refs** internally. Only the specific active field or explicitly subscribed components (`useWatch`) re-render during input, keeping typing latency under 16ms (60 FPS).

### 2.2 Forwarded Refs & Compound Component Pattern
All reusable form elements in `src/components/common/` support `React.forwardRef`:
```tsx
export const Input = Object.assign(InputRoot, {
  Label: InputLabel,
  Field: InputField,
  Error: InputError,
  HelpText: InputHelpText,
});
```
This enables both **declarative composition** and direct compatibility with RHF's `register` function.

---

## 3. Schema-Based Validation: Why Zod?

### 3.1 TypeScript-First Type Inference
Zod provides runtime validation with compile-time type inference. The TypeScript type `LoanFormData` in `src/types/loan.ts` and the Zod schemas in `src/schemas/schemaFactory.ts` maintain synchronized contract definitions.

### 3.2 Dynamic Cross-Step Schema Factory
Instead of static schemas, `getSchemaForStep(stepIndex, formData)` accepts the complete form state and returns a dynamic schema that incorporates cross-step business rules:
- **Product Bounds:** Personal loan capped at ₹10 Lakhs, Home loan at ₹1 Crore, Business loan at ₹50 Lakhs.
- **Maturity Age Rule:** Date of Birth is checked against tenure:
  $$\text{Age} + \frac{\text{Tenure (Months)}}{12} \le 65 \text{ years}$$
- **Employment Guard:** If `loanType === 'business'`, `employmentType` cannot be `salaried`.
- **Conditional Documents:** If PAN was verified via simulated NSDL in Step 3, physical PAN copy upload is marked optional in Step 7.
- **High Debt Ratio:** If monthly EMI exceeds 50% of verified household income, Step 8 dynamically requires an explicit high debt burden acknowledgment.

---

## 4. State Persistence & Security Architecture

### 4.1 Client-Side Encryption (AES-256-GCM)
Because digital lending data contains Personally Identifiable Information (PII) such as PAN, Aadhaar numbers, net income, and home addresses, storing raw plaintext in browser `localStorage` is insecure.

LendSwift implements client-side encryption using the **Web Crypto API** (`window.crypto.subtle`):
1. **Key Derivation:** Generates a 256-bit AES-GCM `CryptoKey` using PBKDF2 with SHA-256 (10,000 iterations).
2. **Initialization Vector (IV):** Generates a cryptographically random 12-byte IV for every write operation via `crypto.getRandomValues`.
3. **Payload Construction:** Concatenates `[12-byte IV] + [Ciphertext]` and exports as a base64 string.
4. **Storage Keys:**
   - Encrypted data: `lendswift_draft_[loanType]`
   - Metadata: `lendswift_draft_meta_[loanType]` $\rightarrow$ `{ version: "1.0", timestamp: ISO, step: index, loanType }`

### 4.2 Auto-Save Lifecycle & 72-Hour TTL
- **Auto-Save Frequency:** Debounced 30-second timer (`useAutoSave`). Resets on form state changes and writes non-blocking background snapshots.
- **Toast Notifications:** Displays subtle, auto-dismissing `Draft saved at [time]` toasts for 2 seconds.
- **TTL Enforcement:** Stored drafts older than 72 hours are automatically purged on page load to comply with RBI data minimality guidelines.
- **Corruption Recovery:** If a saved draft is altered or invalid, `useFormPersistence` catches decryption errors and prompts the user to start fresh cleanly.

---

## 5. Client-Side Image Compression & E-Signature

### 5.1 Canvas API Image Compression
Document uploads in Indian fintech frequently encounter unstable 3G/4G connections. Uncompressed phone camera photos (often 4MB–8MB) cause severe upload drop-offs.
- Image files (JPG, PNG) are loaded onto an off-screen HTML5 Canvas.
- Dimensions are scaled to a maximum width of 1200px while maintaining the original aspect ratio.
- Exported as JPEG at 0.7 (70%) quality, reducing file size by 60%–80%.
- If the output blob still exceeds 2MB, quality is recursively reduced in 0.1 increments down to 0.3.
- Both original and compressed file sizes are displayed to provide user transparency.

### 5.2 E-Signature Capture
- Responsive `<canvas>` supporting both mouse pointer and mobile touch events.
- Device Pixel Ratio (DPR) scaling ensures crisp vector-quality strokes on high-resolution displays.
- Strict non-empty canvas validation analyzes the raw `ImageData` pixel buffer.
- Features a canvas clearing eraser and blur-protection overlay.

---

## 6. Indian Regulatory Compliance (RBI Digital Lending 2022)

1. **Explicit Granular Consent:** 4 distinct, un-ticked checkboxes in Step 8 (data accuracy, credit bureau inquiry, KFS acceptance, communication).
2. **Key Fact Statement (KFS):** Pre-approval summary displaying loan amount, tenure, annual interest rate, processing fee (1%, min ₹2,000, max ₹25,000), reducing-balance monthly EMI, and total cost of borrowing.
3. **Verified Checksum Algorithms:**
   - PAN: Validates 10-character format and checks the 4th character entity type (`P` for Individual, `C` for Company, `F` for Firm).
   - Aadhaar: Validates 12 digits using the **Verhoeff checksum algorithm** ($d$, $p$, and $inv$ dihedral permutation tables).
   - GSTIN: Validates 15-character GST structure (2-digit state code + 10-char PAN + entity code + 'Z' + checksum).
4. **Grievance Redressal & Ombudsman:** Displays LendSwift's designated Nodal Grievance Officer details and links directly to the RBI Banking Ombudsman Portal.
