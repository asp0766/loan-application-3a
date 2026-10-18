# LendSwift Project Changelog

All notable changes to the **LendSwift Multi-Step Loan Application (Project 3A)** are documented herein.

## [1.0.0] - 2026-10-18

### Added
- **Core Architecture & Scaffolding (Sprint 1):**
  - Initialized Vite + React 19 + TypeScript + Vitest environment.
  - Configured Tailwind CSS with custom LendSwift primary blue (`#1F4E79`), accent green (`#27AE60`), error red (`#E74C3C`), and warning amber (`#F39C12`).
  - Implemented compound components library: `Input`, `Select`, `RadioGroup`, `Checkbox`, `CurrencyInput`, `MaskedInput`, `ErrorMessage`, `Button`, `Badge`, `Modal`, `Toast`.
- **Validation Algorithms & Verification Simulation (Sprint 1):**
  - Implemented PAN validation with 4th character entity type checking (`P` for Individual, `C` for Company, `F` for Firm).
  - Implemented Aadhaar 12-digit verification using official **Verhoeff checksum algorithm** ($d$, $p$, and $inv$ permutation tables).
  - Implemented Date of Birth age calculator with boundary validation (21 to 65 years).
  - Created Indian PIN code dataset covering all 28 states and 8 Union Territories with simulated Post Office lookup.
  - Implemented simulated 1.5-second API delay for NSDL and UIDAI verification with live status badges.
- **Form Steps Implementation (Sprint 2):**
  - Step 1: Loan Type Selection with dynamic amounts, tenures, and purposes for Personal, Home, and Business loans.
  - Step 2: Personal information with demographic fields and 4-digit mobile OTP verification simulation.
  - Step 3: Identity verification with masked inputs, Verhoeff checksum validation, and explicit Aadhaar consent.
  - Step 4: Address verification with PIN auto-fill, state-PIN discrepancy warning, and conditional permanent/previous addresses.
  - Step 5: Dynamic employment sub-forms for Salaried (with top employer autocomplete), Self-Employed, and Business Owner (with 15-character GSTIN validation).
  - Step 6: Conditional Co-Applicant step with joint liability consent, PAN verification, and clubbed income calculation.
  - Step 7: Document upload with Canvas-based image compression and interactive Digital E-Signature canvas with touch/mouse support.
  - Step 8: Comprehensive review, Pre-Approval Key Fact Statement (KFS), reducing-balance EMI calculation, and 4 explicit RBI consents.
- **State Persistence & Security (Sprint 2):**
  - Implemented `useAutoSave` with debounced 30-second snapshot writes.
  - Encrypted draft storage using **AES-256-GCM** via Web Crypto API (`window.crypto.subtle`).
  - Added 72-hour TTL auto-purge and data corruption recovery modal.
- **Testing & Quality Assurance (Sprint 3):**
  - 53 unit and integration tests across 9 test suites with 100% pass rate.
  - WCAG 2.1 AA accessibility audit ensuring full keyboard navigation, role landmarks, and 4.5:1 text contrast.
  - QA stress tests defending against string overflows, state tampering, and rapid-click attacks.
