import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import confetti from 'canvas-confetti';
import {
  ShieldCheck,
  RotateCcw,
  Sparkles,
  Printer,
  FileCheck2,
  Clock,
  Landmark,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

import { LoanFormData } from '../../types/loan';
import { getSchemaForStep, isStep6Required } from '../../schemas/schemaFactory';
import { useAutoSave } from '../../hooks/useAutoSave';
import { useFormPersistence } from '../../hooks/useFormPersistence';
import { ProgressBar, StepConfig } from './ProgressBar';
import { StepNavigation } from './StepNavigation';
import { ToastContainer, ToastMessage } from '../common/Toast';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { formatINR } from '../../utils/emiCalculator';

// Step components
import { Step1LoanType } from '../steps/Step1LoanType';
import { Step2PersonalInfo } from '../steps/Step2PersonalInfo';
import { Step3KYC } from '../steps/Step3KYC';
import { Step4Address } from '../steps/Step4Address';
import { Step5Employment } from '../steps/Step5Employment';
import { Step6CoApplicant } from '../steps/Step6CoApplicant';
import { Step7Documents } from '../steps/Step7Documents';
import { Step8Review } from '../steps/Step8Review';

const INITIAL_FORM_DATA: LoanFormData = {
  loanType: 'personal',
  loanAmount: 300000,
  loanTenureMonths: 36,
  loanPurpose: '',
  fullName: '',
  dateOfBirth: '',
  gender: 'male',
  maritalStatus: 'single',
  fathersName: '',
  mothersName: '',
  email: '',
  mobileNumber: '',
  panNumber: '',
  aadhaarNumber: '',
  aadhaarConsent: false,
  currentAddress: {
    addressLine1: '',
    pinCode: '',
    city: '',
    state: '',
  },
  residenceType: 'owned',
  yearsAtCurrentAddress: 3,
  sameAsPermanentAddress: true,
  employmentType: 'salaried',
  documents: [],
  consentInformationAccurate: false,
  consentCreditBureauCheck: false,
  consentTermsConditions: false,
  consentCommunications: false,
  currentStepIndex: 0,
  completedStepIndices: [],
};

export const Wizard: React.FC = () => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState<LoanFormData | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [validationErrorSummary, setValidationErrorSummary] = useState<string | null>(null);

  const formContainerRef = useRef<HTMLDivElement>(null);

  // Initialize React Hook Form
  const form = useForm<LoanFormData>({
    defaultValues: INITIAL_FORM_DATA,
    mode: 'onBlur',
    resolver: async (data, context, options) => {
      // Dynamic validation schema based on active step
      const schema = getSchemaForStep(currentStepIndex, data);
      return (zodResolver(schema as any) as any)(data, context, options);
    },
  });

  const { watch, reset, trigger, getValues } = form;
  const currentValues = watch();
  const loanType = watch('loanType') || 'personal';
  const loanAmount = watch('loanAmount') || 0;

  // Check if Step 6 is required based on cross-step rules
  const step6Active = useMemo(() => {
    return isStep6Required(loanType, loanAmount);
  }, [loanType, loanAmount]);

  // Build active steps registry dynamically
  const activeSteps: StepConfig[] = useMemo(() => {
    const list: StepConfig[] = [
      { id: 'step-1', title: 'Loan Product', shortTitle: '1. Loan Type', stepNumber: 1 },
      { id: 'step-2', title: 'Personal Details', shortTitle: '2. Personal', stepNumber: 2 },
      { id: 'step-3', title: 'Identity & KYC', shortTitle: '3. Identity', stepNumber: 3 },
      { id: 'step-4', title: 'Residential Address', shortTitle: '4. Address', stepNumber: 4 },
      { id: 'step-5', title: 'Income & Employment', shortTitle: '5. Income', stepNumber: 5 },
    ];

    if (step6Active) {
      list.push({
        id: 'step-6',
        title: 'Co-Applicant',
        shortTitle: '6. Co-Borrower',
        stepNumber: 6,
      });
    }

    list.push(
      {
        id: 'step-7',
        title: 'Documents & E-Signature',
        shortTitle: step6Active ? '7. Documents' : '6. Documents',
        stepNumber: step6Active ? 7 : 6,
      },
      {
        id: 'step-8',
        title: 'Review & Pre-Approval',
        shortTitle: step6Active ? '8. Review' : '7. Review',
        stepNumber: step6Active ? 8 : 7,
      }
    );

    return list;
  }, [step6Active]);

  // Toast notification helper
  const addToast = (type: ToastMessage['type'], message: string) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2500);
  };

  // Auto-Save custom hook (30s interval + debounced changes)
  const { saveNow, clearDraft, lastSavedTime } = useAutoSave(
    { ...currentValues, currentStepIndex, completedStepIndices: completedSteps },
    {
      interval: 30000,
      enabled: !submissionSuccess,
      onSaved: (time) => addToast('success', `Draft saved at ${time}`),
    }
  );

  // Form persistence & Resume modal on load
  const {
    detectedDraft,
    showResumeModal,
    corruptionError,
    resumeDraft,
    discardDraft,
  } = useFormPersistence(
    (restoredData) => {
      reset(restoredData);
      setCurrentStepIndex(restoredData.currentStepIndex || 0);
      setCompletedSteps(restoredData.completedStepIndices || []);
      addToast('info', 'Application draft successfully restored!');
    },
    () => {
      reset(INITIAL_FORM_DATA);
      setCurrentStepIndex(0);
      setCompletedSteps([]);
    }
  );

  // Focus management on step change (Section A4.2 & B4.2)
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setValidationErrorSummary(null);

    // Shift focus to the first input of the new step
    setTimeout(() => {
      if (formContainerRef.current) {
        const firstInput = formContainerRef.current.querySelector<
          HTMLInputElement | HTMLSelectElement | HTMLButtonElement
        >('input, select, textarea, button[type="radio"]');
        if (firstInput) {
          firstInput.focus();
        }
      }
    }, 150);
  }, [currentStepIndex]);

  // Determine which step component to render based on currentStepIndex and step6Active
  const renderCurrentStepComponent = () => {
    // If Step 6 is active: index 0..7 maps directly to Step 1..8
    // If Step 6 is omitted:
    // 0: Step 1, 1: Step 2, 2: Step 3, 3: Step 4, 4: Step 5, 5: Step 7 (Docs), 6: Step 8 (Review)
    if (currentStepIndex === 0) return <Step1LoanType form={form} />;
    if (currentStepIndex === 1) return <Step2PersonalInfo form={form} />;
    if (currentStepIndex === 2) return <Step3KYC form={form} />;
    if (currentStepIndex === 3) return <Step4Address form={form} />;
    if (currentStepIndex === 4) return <Step5Employment form={form} />;

    if (step6Active) {
      if (currentStepIndex === 5) return <Step6CoApplicant form={form} />;
      if (currentStepIndex === 6) return <Step7Documents form={form} />;
      if (currentStepIndex === 7) {
        return (
          <Step8Review
            form={form}
            onNavigateToStep={(stepIdx) => setCurrentStepIndex(stepIdx)}
            onSubmitApplication={handleFinalSubmission}
            isSubmitting={isSubmitting}
          />
        );
      }
    } else {
      if (currentStepIndex === 5) return <Step7Documents form={form} />;
      if (currentStepIndex === 6) {
        return (
          <Step8Review
            form={form}
            onNavigateToStep={(stepIdx) => setCurrentStepIndex(stepIdx)}
            onSubmitApplication={handleFinalSubmission}
            isSubmitting={isSubmitting}
          />
        );
      }
    }

    return null;
  };

  // Step validation and transition
  const handleNextStep = async () => {
    setValidationErrorSummary(null);
    const isValid = await trigger();

    if (!isValid) {
      setValidationErrorSummary('Please resolve all validation errors highlighted above before continuing.');
      return;
    }

    // Step 3 KYC Extra Gating: PAN & Aadhaar must be verified
    if (currentStepIndex === 2) {
      const panOk = getValues('panVerified');
      const aadhaarOk = getValues('aadhaarVerified');
      if (!panOk || !aadhaarOk) {
        setValidationErrorSummary(
          'Both PAN and Aadhaar identity checks must be verified before proceeding to the address step.'
        );
        return;
      }
    }

    // Save and advance
    setCompletedSteps((prev) => Array.from(new Set([...prev, currentStepIndex])));
    if (currentStepIndex < activeSteps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  const handlePreviousStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const handleStepJump = (targetIndex: number) => {
    if (completedSteps.includes(targetIndex) || targetIndex <= currentStepIndex) {
      setCurrentStepIndex(targetIndex);
    }
  };

  const handleSaveAndExit = async () => {
    const saved = await saveNow();
    if (saved) {
      addToast('success', 'Your application draft has been securely saved. You can safely close or resume anytime.');
    }
  };

  // Final Submission Handler
  const handleFinalSubmission = async () => {
    setIsSubmitting(true);
    const isValid = await trigger();

    if (!isValid) {
      setIsSubmitting(false);
      setValidationErrorSummary('Some mandatory consents or documents are missing.');
      return;
    }

    // Simulated API submission delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Generate client-side UUID reference number
    const randomHex = Math.random().toString(36).substring(2, 6).toUpperCase();
    const timestampHex = Date.now().toString(36).slice(-4).toUpperCase();
    const refNumber = `LS-2026-${randomHex}-${timestampHex}`;

    const submissionPayload: LoanFormData = {
      ...getValues(),
      referenceNumber: refNumber,
      submissionTimestamp: new Date().toISOString(),
    };

    // Trigger celebration confetti
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {
      // Ignored if confetti fails in test
    }

    // Clear saved draft from localStorage upon submission
    clearDraft(loanType);

    setSubmissionSuccess(submissionPayload);
    setIsSubmitting(false);
  };

  const handleStartNewApplication = () => {
    clearDraft(loanType);
    setSubmissionSuccess(null);
    reset(INITIAL_FORM_DATA);
    setCurrentStepIndex(0);
    setCompletedSteps([]);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between selection:bg-lendswift-blue-100">
      {/* Toast Notifications */}
      <ToastContainer
        toasts={toasts}
        onDismiss={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))}
      />

      {/* Top Header & Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs no-print">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-lendswift-blue-500 text-white flex items-center justify-center font-black text-lg tracking-wider shadow-sm">
              LS
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg text-lendswift-blue-900 tracking-tight">
                  Lend<span className="text-lendswift-green-600">Swift</span>
                </span>
                <span className="text-[10px] font-bold tracking-wide uppercase px-2 py-0.5 rounded-full bg-lendswift-blue-50 text-lendswift-blue-700 border border-lendswift-blue-200">
                  RBI Regulated NBFC
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">Digital Loan Application Portal</p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            {lastSavedTime && (
              <span className="text-slate-400 hidden md:flex items-center gap-1 font-mono text-[11px]">
                <Clock className="w-3.5 h-3.5 text-lendswift-green-600" /> Auto-saved: {lastSavedTime}
              </span>
            )}
            <div className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-lendswift-amber-50 text-lendswift-amber-800 border border-lendswift-amber-200 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-lendswift-amber-600" /> Demo Mode
            </div>
          </div>
        </div>
      </header>

      {/* Main Form Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 flex flex-col justify-start">
        {/* Progress Tracker */}
        {!submissionSuccess && (
          <div className="mb-6">
            <ProgressBar
              steps={activeSteps}
              currentStepIndex={currentStepIndex}
              completedStepIndices={completedSteps}
              onStepClick={handleStepJump}
            />
          </div>
        )}

        {/* Form Body Box */}
        {!submissionSuccess ? (
          <div
            ref={formContainerRef}
            className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8"
          >
            {/* Global Accessible Error Summary (WCAG 2.1 AA) */}
            {validationErrorSummary && (
              <div
                role="alert"
                aria-live="polite"
                className="mb-6 p-4 rounded-2xl bg-lendswift-red-50 border border-lendswift-red-200 text-lendswift-red-900 text-xs flex items-start gap-3"
              >
                <AlertCircle className="w-5 h-5 text-lendswift-red-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Attention Required</p>
                  <p className="mt-0.5">{validationErrorSummary}</p>
                </div>
              </div>
            )}

            {/* Current Step Component */}
            {renderCurrentStepComponent()}

            {/* Bottom Wizard Navigation */}
            <StepNavigation
              currentStepIndex={currentStepIndex}
              totalSteps={activeSteps.length}
              onPrevious={handlePreviousStep}
              onNext={handleNextStep}
              onSaveAndExit={handleSaveAndExit}
            />
          </div>
        ) : (
          /* Submission Success State */
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-lg p-6 sm:p-10 text-center max-w-2xl mx-auto space-y-6">
            <div className="w-16 h-16 rounded-full bg-lendswift-green-100 text-lendswift-green-600 mx-auto flex items-center justify-center shadow-inner">
              <Sparkles className="w-8 h-8" />
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-lendswift-green-600 bg-lendswift-green-50 px-3 py-1 rounded-full border border-lendswift-green-200">
                Application Successfully Pre-Approved (Demo)
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-3 tracking-tight">
                Congratulations, {submissionSuccess.fullName}!
              </h2>
              <p className="text-sm text-slate-500 mt-2 max-w-lg mx-auto leading-relaxed">
                Your loan application for{' '}
                <strong className="text-slate-800">{formatINR(submissionSuccess.loanAmount)}</strong> has been processed. Our underwriting engine has generated a preliminary digital sanction.
              </p>
            </div>

            {/* Application Reference ID Box */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 inline-block text-left w-full sm:w-auto">
              <span className="text-[11px] font-semibold text-slate-400 block uppercase tracking-wider">
                Application Reference ID
              </span>
              <p className="font-mono text-xl font-black text-lendswift-blue-900 tracking-wider mt-0.5">
                {submissionSuccess.referenceNumber}
              </p>
              <span className="text-[10px] text-slate-400 block mt-1">
                Timestamp: {new Date(submissionSuccess.submissionTimestamp || '').toLocaleString('en-IN')}
              </span>
            </div>

            {/* Summary Highlights */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-left bg-slate-50/50 p-4 rounded-2xl border border-slate-200 text-xs">
              <div>
                <span className="text-slate-400 block">Loan Product</span>
                <span className="font-semibold text-slate-800 uppercase">{submissionSuccess.loanType} Loan</span>
              </div>
              <div>
                <span className="text-slate-400 block">Tenure</span>
                <span className="font-semibold text-slate-800">{submissionSuccess.loanTenureMonths} Months</span>
              </div>
              <div>
                <span className="text-slate-400 block">Primary Applicant</span>
                <span className="font-semibold text-slate-800 truncate">{submissionSuccess.fullName}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={() => window.print()}
                leftIcon={<Printer className="w-4 h-4" />}
                className="w-full sm:w-auto"
              >
                Download Key Fact Statement (PDF)
              </Button>
              <Button
                type="button"
                variant="primary"
                size="md"
                onClick={handleStartNewApplication}
                leftIcon={<RotateCcw className="w-4 h-4" />}
                className="w-full sm:w-auto"
              >
                Apply for Another Loan
              </Button>
            </div>
          </div>
        )}
      </main>

      {/* Resume / Start Fresh Modal (Section C3.4 & E3.1) */}
      <Modal
        isOpen={showResumeModal}
        onClose={discardDraft}
        showCloseButton={false}
        title="Resume Existing Loan Application?"
      >
        <div className="space-y-4">
          <div className="p-3.5 bg-lendswift-blue-50 rounded-xl border border-lendswift-blue-100 flex items-start gap-3">
            <FileCheck2 className="w-5 h-5 text-lendswift-blue-600 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-700">
              <p className="font-semibold text-lendswift-blue-900">
                Saved Draft Detected for {detectedDraft?.loanType.toUpperCase()} LOAN
              </p>
              <p className="mt-0.5">
                We found an encrypted auto-saved application from{' '}
                {detectedDraft && new Date(detectedDraft.metadata.timestamp).toLocaleString('en-IN')}.
              </p>
            </div>
          </div>

          {corruptionError && (
            <div className="p-3 bg-lendswift-red-50 rounded-xl border border-lendswift-red-200 text-xs text-lendswift-red-800">
              {corruptionError}
            </div>
          )}

          <p className="text-xs text-slate-500">
            Would you like to restore your previously filled answers or start a completely fresh application?
          </p>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={discardDraft}>
              Start Fresh
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={resumeDraft}
              disabled={Boolean(corruptionError)}
            >
              Resume Previous Application
            </Button>
          </div>
        </div>
      </Modal>

      {/* Regulatory Footer (RBI Digital Lending Compliance) */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-12 text-xs text-slate-500 no-print">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Landmark className="w-4 h-4 text-lendswift-blue-600" />
            <span>
              <strong>LendSwift Financial Services Pvt Ltd</strong> — RBI Registered NBFC (No. N-13.02026)
            </span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span>Nodal Grievance Officer: grievance@lendswift.in</span>
            <span>•</span>
            <a
              href="https://cms.rbi.org.in"
              target="_blank"
              rel="noreferrer"
              className="hover:text-slate-600 flex items-center gap-1"
            >
              <HelpCircle className="w-3.5 h-3.5" /> RBI Ombudsman Portal
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};
