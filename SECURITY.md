# LendSwift — Information Security & PII Protection Policy

This document defines the data security standards implemented in the **LendSwift Multi-Step Digital Lending Platform (Project 3A)**.

---

## 1. Regulatory Context (RBI & DPDP Act 2023)

Under the **Reserve Bank of India (RBI) Guidelines on Digital Lending (DL/2022/01)** and the **Digital Personal Data Protection (DPDP) Act, 2023**, financial platforms collecting Personally Identifiable Information (PII) must enforce:
1. **Purpose Limitation & Data Minimality:** Data collected must be strictly necessary for loan evaluation.
2. **Explicit Consent Architecture:** Consent for bureau checks and KYC cannot be bundled or pre-selected.
3. **Storage Security & Encryption:** Data persisted client-side must be protected against local tampering and casual inspection.

---

## 2. Cryptographic Architecture (AES-256-GCM)

```
[Plain Form State JSON]
        │
        ▼ (PBKDF2 SHA-256 with 10,000 iterations + Salt)
  [256-Bit CryptoKey]
        │
        ▼ (window.crypto.subtle.encrypt with 12-Byte Random IV)
 [Ciphertext + Auth Tag]
        │
        ▼ (Base64 Encode)
[LocalStorage Entry: lendswift_draft_[loanType]]
```

- **Algorithm:** AES-256-GCM (Galois/Counter Mode), providing both confidentiality and cryptographic integrity verification.
- **Key Derivation:** Web Crypto API `PBKDF2` key derivation function with 10,000 rounds of SHA-256.
- **Tamper Evidence:** Any modification to the ciphertext stored in `localStorage` fails AES-GCM authentication tag verification, causing the application to safely purge the corrupted draft and offer to start fresh.

---

## 3. PII Masking in User Interface

- **PAN Numbers:** Displays only the final 4 characters (e.g., `••••••234F`).
- **Aadhaar Numbers:** Masks first 8 digits, displaying only last 4 digits (e.g., `••••••••0019`).
- **Interactive Focus Unmasking:** Values are only revealed when the field is actively focused for input, or toggled via the accessible eye icon.

---

## 4. Document Processing & In-Memory Lifecycle

- **No Remote Server Transmission:** In this demonstration system, documents (PDF, JPG, PNG) and captured digital signatures reside entirely within browser memory or encrypted local drafts.
- **Client-Side Compression:** Images are compressed locally using the HTML5 Canvas API, minimizing memory footprint and reducing draft size.
- **State Sanitization:** When the loan application is successfully submitted, all draft records are immediately purged from `localStorage`.
