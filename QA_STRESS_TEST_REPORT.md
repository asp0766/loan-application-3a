# LendSwift — QA Stress Test & Security Report

**Document Version:** 1.0  
**Evaluator Protocol:** ZeTheta Section E3 QA Stress Test  
**Application Target:** LendSwift Multi-Step Loan Application (Project 3A)

---

## 1. Data Integrity Attacks (Section E3.1)

| Attack Vector | Simulated Scenario | Expected System Defense | Result |
|---|---|---|---|
| **E3.1.1 Storage Tampering** | Evaluator opens DevTools $\rightarrow$ LocalStorage and maliciously mutates the encrypted string to invalid ciphertext or broken JSON. | On page refresh, `useFormPersistence` catches the decryption error, displays an alert: *"The saved draft data is corrupted... Starting fresh is recommended"*, purges the bad draft, and allows the user to start fresh without crashing. | **PASSED** (Verified in `src/test/persistence.test.ts`) |
| **E3.1.2 Form State Leaks** | In Step 5, user selects Salaried, fills all salaried fields, then goes back and selects Self-Employed. | `Step5Employment.tsx` explicitly resets all salaried fields (`companyName`, `designation`, `monthlyNetSalary`, `totalWorkExperienceYears`) to `undefined` or empty strings. No stale data leaks into the submission payload. | **PASSED** (Verified in `src/components/steps/Step5Employment.tsx`) |
| **E3.1.3 Dynamic Step Insertion** | In Step 1, user selects Personal Loan of ₹3,00,000 (below threshold). Proceeds to Step 5. Then returns to Step 1 and changes loan amount to ₹8,00,000 (above threshold). | The Wizard detects that `isStep6Required('personal', 800000)` is now `true`. Step 6 (Co-Applicant) is dynamically inserted into the step registry and progress bar. | **PASSED** (Verified in `src/test/flow.test.tsx`) |

---

## 2. Performance Attacks (Section E3.2)

| Attack Vector | Simulated Scenario | Expected System Defense | Result |
|---|---|---|---|
| **E3.2.1 Multi-Tab Isolation** | User opens 3 separate browser tabs with differing products. | Storage keys are partitioned per loan product (`lendswift_draft_personal`, `lendswift_draft_home`, `lendswift_draft_business`). Cross-tab contamination is prevented. | **PASSED** |
| **E3.2.2 High-Resolution Photo Uploads** | User uploads 5 images of 4.5MB each. | `compressImage` runs client-side non-blocking via Canvas API with async/await, reducing image sizes by 60–80% without UI freezing. | **PASSED** (Verified in `src/utils/compression.ts`) |
| **E3.2.3 Rapid Next Clicks** | User rapidly clicks Next button 20 times in 2 seconds. | `StepNavigation.tsx` throttles click handlers via an atomic ref guard (`isThrottledRef`), preventing duplicate submissions, step skips, or corrupted step counters. | **PASSED** (Verified in `src/test/flow.test.tsx`) |

---

## 3. Edge Case Attacks (Section E3.4)

| Attack Vector | Input Tested | Expected System Defense | Result |
|---|---|---|---|
| **E3.4.1 Invalid Entity PAN** | `ABCDE1234F` (4th char `E` is not a valid Income Tax entity type). | Displays specific actionable message: *"PAN 4th character must indicate entity type (P for Individual, C for Company, etc.)"*, not a generic "Invalid PAN". | **PASSED** (Verified in `src/test/validators.test.ts`) |
| **E3.4.2 DOB Boundary** | Exact 21st birthday vs. 20 years and 364 days old. | Exact 21 is accepted; 20 years and 364 days is rejected with *"Applicant must be at least 21 years old"*. | **PASSED** (Verified in `src/test/validators.test.ts`) |
| **E3.4.3 Co-Applicant Threshold** | Personal Loan of exactly ₹5,00,000 vs. ₹5,00,001. | Exactly ₹5,00,000 does NOT require co-applicant; ₹5,00,001 immediately triggers Step 6. | **PASSED** (Verified in `src/test/schemaFactory.test.ts`) |
| **E3.4.4 Verhoeff Checksum** | Aadhaar with transposed digits or altered check digit. | Dihedral permutation table calculation rejects invalid checksums deterministically. | **PASSED** (Verified in `src/test/validators.test.ts`) |
