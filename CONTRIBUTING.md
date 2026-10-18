# Contributing to LendSwift (Project 3A)

## 1. Git Workflow Standards

- **Main Branch (`main`):** Always stable and deployable.
- **Feature Branches:** Use standard prefixed branch naming:
  - `feature/step-1-loan-type`
  - `feature/step-2-personal-info`
  - `feature/step-3-kyc-verification`
  - `feature/step-4-address-lookup`
  - `feature/step-5-employment-income`
  - `feature/step-6-co-applicant`
  - `feature/step-7-documents-signature`
  - `feature/step-8-review-kfs`
  - `feature/auto-save-persistence`
  - `feature/e2e-tests`
  - `feature/accessibility-audit`

---

## 2. Conventional Commit Format

Every commit must follow the Conventional Commits specification:
```
type(scope): description
```
- **Allowed Types:** `feat`, `fix`, `test`, `refactor`, `docs`, `style`, `chore`
- **Scopes:** `step1`, `step2`, `kyc`, `address`, `employment`, `co-applicant`, `documents`, `review`, `a11y`, `security`, `utils`, `common`

---

## 3. Pre-Commit Verification Checklist

Before pushing any changes:
1. `npm test` must pass 100% of test suites with zero failures.
2. `npm run lint` must pass with zero errors.
3. `npm run build` must compile without TypeScript or bundle errors.
