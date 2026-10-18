import React, { useMemo } from 'react';
import { UseFormReturn } from 'react-hook-form';
import {
  Edit3,
  AlertTriangle,
  FileText,
  FileCheck2,
  Calendar,
  Building,
  MapPin,
  User,
  ShieldCheck,
  Printer,
} from 'lucide-react';
import { LoanFormData } from '../../types/loan';
import { Checkbox } from '../common/Checkbox';
import { Button } from '../common/Button';
import { calculateEMI, formatINR, formatInLakhsCrores } from '../../utils/emiCalculator';
import { maskPII } from '../../utils/validators';

interface Step8Props {
  form: UseFormReturn<LoanFormData>;
  onNavigateToStep: (stepIndex: number) => void;
  onSubmitApplication: () => void;
  isSubmitting?: boolean;
}

export const Step8Review: React.FC<Step8Props> = ({
  form,
  onNavigateToStep,
  onSubmitApplication,
  isSubmitting = false,
}) => {
  const {
    watch,
    setValue,
    formState: { errors },
  } = form;

  const formData = watch();
  const loanType = formData.loanType || 'personal';
  const loanAmount = formData.loanAmount || 0;
  const loanTenure = formData.loanTenureMonths || 12;

  // Compute total income for EMI ratio
  const primaryIncome =
    formData.employmentType === 'salaried'
      ? formData.monthlyNetSalary || 0
      : formData.employmentType === 'self_employed'
      ? formData.selfEmployedMonthlyIncome || 0
      : formData.businessMonthlyNetProfit || 0;
  const coAppIncome = formData.coApplicantMonthlyIncome || 0;

  const emiDetails = useMemo(() => {
    return calculateEMI(loanAmount, loanTenure, loanType, primaryIncome, coAppIncome);
  }, [loanAmount, loanTenure, loanType, primaryIncome, coAppIncome]);

  const allConsentsChecked =
    formData.consentInformationAccurate &&
    formData.consentCreditBureauCheck &&
    formData.consentTermsConditions &&
    formData.consentCommunications &&
    (!emiDetails.isHighDebtBurden || formData.consentHighDebtBurdenAcknowledged);

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Application Review & Pre-Approval Summary
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Please verify all entered parameters and provide explicit regulatory consents before submission.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => window.print()}
          leftIcon={<Printer className="w-3.5 h-3.5" />}
          className="no-print"
        >
          Print / Save PDF
        </Button>
      </div>

      {/* 1. Key Fact Statement (KFS) & Pre-Approval Financial Summary Card */}
      <div className="bg-gradient-to-br from-slate-900 via-lendswift-blue-900 to-slate-900 text-white p-6 rounded-2xl shadow-xl border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/10 gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-lendswift-green-400">
                RBI Key Fact Statement (KFS)
              </span>
              <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-white/80">
                Demo Pre-Approval
              </span>
            </div>
            <p className="text-2xl font-black tracking-tight text-white mt-1">
              {formatINR(loanAmount)}
              <span className="text-xs font-normal text-slate-300 ml-2">
                ({formatInLakhsCrores(loanAmount)})
              </span>
            </p>
          </div>
          <div className="sm:text-right">
            <span className="text-xs text-slate-400">Monthly Installment (EMI)</span>
            <p className="text-2xl font-black text-lendswift-green-400">
              {formatINR(emiDetails.monthlyEmi)}
              <span className="text-xs font-normal text-slate-300 ml-1">/ mo</span>
            </p>
          </div>
        </div>

        {/* Detailed Financial Breakdown Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 text-xs">
          <div>
            <span className="text-slate-400 block">Indicative Interest Rate</span>
            <span className="text-sm font-bold text-white mt-0.5 block">
              {emiDetails.annualInterestRate}% p.a.
            </span>
          </div>
          <div>
            <span className="text-slate-400 block">Loan Tenure</span>
            <span className="text-sm font-bold text-white mt-0.5 block">
              {loanTenure} Months ({(loanTenure / 12).toFixed(1)} Yrs)
            </span>
          </div>
          <div>
            <span className="text-slate-400 block">Total Interest Payable</span>
            <span className="text-sm font-bold text-white mt-0.5 block">
              {formatINR(emiDetails.totalInterest)}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block">Processing Fee (1%)</span>
            <span className="text-sm font-bold text-white mt-0.5 block">
              {formatINR(emiDetails.processingFee)}
            </span>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-300 gap-2">
          <span>
            Total Cost of Borrowing & Repayment:{' '}
            <strong className="text-white font-semibold">
              {formatINR(emiDetails.totalAmountPayable)}
            </strong>
          </span>
          <span className="text-[11px] text-slate-400">
            Estimated EMI-to-Income Ratio:{' '}
            <strong className={emiDetails.isHighDebtBurden ? 'text-lendswift-amber-400' : 'text-lendswift-green-400'}>
              {emiDetails.emiToIncomeRatio}%
            </strong>
          </span>
        </div>
      </div>

      {/* High Debt Burden Alert (Section B3) */}
      {emiDetails.isHighDebtBurden && (
        <div className="p-4 bg-lendswift-amber-50 rounded-2xl border border-lendswift-amber-200 text-xs text-lendswift-amber-900 space-y-2">
          <div className="flex items-center gap-2 font-bold text-lendswift-amber-800">
            <AlertTriangle className="w-4 h-4 text-lendswift-amber-600" />
            <span>High Debt-to-Income Ratio Warning ({emiDetails.emiToIncomeRatio}%)</span>
          </div>
          <p className="leading-relaxed">
            Your estimated monthly EMI exceeds 50% of your verified household income ({formatINR(primaryIncome + coAppIncome)}). To maintain prudent financial leverage, please acknowledge this risk or add a co-applicant to increase eligible pool income.
          </p>
          <div className="pt-1">
            <Checkbox
              label="I acknowledge that my monthly debt burden exceeds 50% and request consideration based on combined assets."
              checked={Boolean(formData.consentHighDebtBurdenAcknowledged)}
              onChange={(e) =>
                setValue('consentHighDebtBurdenAcknowledged', e.target.checked, { shouldValidate: true })
              }
              error={errors.consentHighDebtBurdenAcknowledged?.message}
            />
          </div>
        </div>
      )}

      {/* 2. Section-by-Section Data Summary with Quick Edit Buttons */}
      <div className="space-y-4">
        {/* Section 1: Loan Requirement */}
        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-lendswift-blue-600" /> 1. Loan Product & Purpose
            </h3>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onNavigateToStep(0)}
              leftIcon={<Edit3 className="w-3.5 h-3.5" />}
              className="text-xs text-lendswift-blue-600 hover:text-lendswift-blue-700"
            >
              Edit
            </Button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 text-xs">
            <div>
              <span className="text-slate-400 block">Product</span>
              <span className="font-semibold text-slate-800 uppercase">{formData.loanType} Loan</span>
            </div>
            <div>
              <span className="text-slate-400 block">Amount</span>
              <span className="font-semibold text-slate-800">{formatINR(formData.loanAmount)}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Tenure</span>
              <span className="font-semibold text-slate-800">{formData.loanTenureMonths} Months</span>
            </div>
            <div>
              <span className="text-slate-400 block">Purpose</span>
              <span className="font-semibold text-slate-800 capitalize">
                {formData.loanPurpose?.replace(/_/g, ' ')}
              </span>
            </div>
          </div>
        </div>

        {/* Section 2: Personal & Contact */}
        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-lendswift-blue-600" /> 2. Personal & Contact Profile
            </h3>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onNavigateToStep(1)}
              leftIcon={<Edit3 className="w-3.5 h-3.5" />}
              className="text-xs text-lendswift-blue-600"
            >
              Edit
            </Button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 text-xs">
            <div>
              <span className="text-slate-400 block">Full Name</span>
              <span className="font-semibold text-slate-800">{formData.fullName}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Date of Birth</span>
              <span className="font-semibold text-slate-800">{formData.dateOfBirth}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Email Address</span>
              <span className="font-semibold text-slate-800">{formData.email}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Mobile Number</span>
              <span className="font-semibold text-slate-800 font-mono">+91 {formData.mobileNumber}</span>
            </div>
          </div>
        </div>

        {/* Section 3: Identity & Address */}
        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-lendswift-blue-600" /> 3 & 4. KYC & Address Details
            </h3>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onNavigateToStep(2)}
              leftIcon={<Edit3 className="w-3.5 h-3.5" />}
              className="text-xs text-lendswift-blue-600"
            >
              Edit
            </Button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 text-xs">
            <div>
              <span className="text-slate-400 block">PAN Number</span>
              <span className="font-semibold text-slate-800 font-mono">{maskPII(formData.panNumber)}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Aadhaar Number</span>
              <span className="font-semibold text-slate-800 font-mono">{maskPII(formData.aadhaarNumber)}</span>
            </div>
            <div className="sm:col-span-2">
              <span className="text-slate-400 block">Current Address</span>
              <span className="font-semibold text-slate-800">
                {formData.currentAddress?.addressLine1}, {formData.currentAddress?.city},{' '}
                {formData.currentAddress?.state} - {formData.currentAddress?.pinCode}
              </span>
            </div>
          </div>
        </div>

        {/* Section 5: Employment */}
        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-lendswift-blue-600" /> 5. Income & Employment
            </h3>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onNavigateToStep(4)}
              leftIcon={<Edit3 className="w-3.5 h-3.5" />}
              className="text-xs text-lendswift-blue-600"
            >
              Edit
            </Button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-3 text-xs">
            <div>
              <span className="text-slate-400 block">Employment Category</span>
              <span className="font-semibold text-slate-800 uppercase">{formData.employmentType}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Organization / Entity</span>
              <span className="font-semibold text-slate-800">
                {formData.companyName || formData.professionName || formData.businessName || 'N/A'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block">Verified Monthly Income</span>
              <span className="font-semibold text-lendswift-green-700">{formatINR(primaryIncome)}</span>
            </div>
          </div>
        </div>

        {/* Section 6: Co-Applicant (if applicable) */}
        {formData.coApplicantName && (
          <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-lendswift-blue-600" /> 6. Co-Applicant
              </h3>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onNavigateToStep(5)}
                leftIcon={<Edit3 className="w-3.5 h-3.5" />}
                className="text-xs text-lendswift-blue-600"
              >
                Edit
              </Button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 text-xs">
              <div>
                <span className="text-slate-400 block">Co-Borrower Name</span>
                <span className="font-semibold text-slate-800">{formData.coApplicantName}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Relationship</span>
                <span className="font-semibold text-slate-800 capitalize">
                  {formData.coApplicantRelationship}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">PAN</span>
                <span className="font-semibold text-slate-800 font-mono">
                  {maskPII(formData.coApplicantPan)}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Monthly Income</span>
                <span className="font-semibold text-slate-800">
                  {formatINR(formData.coApplicantMonthlyIncome)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Section 7: Documents & Signature Preview */}
        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <FileCheck2 className="w-3.5 h-3.5 text-lendswift-blue-600" /> 7. Uploaded Documents & E-Signature
            </h3>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onNavigateToStep(6)}
              leftIcon={<Edit3 className="w-3.5 h-3.5" />}
              className="text-xs text-lendswift-blue-600"
            >
              Edit
            </Button>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3">
            <div className="text-xs">
              <span className="text-slate-400 block mb-1">Uploaded Files ({formData.documents?.length || 0})</span>
              <div className="flex flex-wrap gap-1.5">
                {formData.documents?.map((d) => (
                  <span
                    key={d.id}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-[11px]"
                  >
                    <FileText className="w-3 h-3 text-slate-500" />
                    {d.fileName}
                  </span>
                ))}
              </div>
            </div>

            {/* Signature Preview */}
            {formData.applicantSignature && (
              <div className="border border-slate-200 rounded-xl p-2 bg-slate-50 flex flex-col items-center shrink-0">
                <span className="text-[10px] text-slate-400 font-semibold uppercase mb-1">
                  Recorded E-Signature
                </span>
                <img
                  src={formData.applicantSignature}
                  alt="Captured Applicant E-Signature"
                  className="h-12 max-w-[140px] object-contain"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. Four Separate Mandatory RBI Explicit Consents (Section A3.1 & Day 9) */}
      <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3.5">
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2.5">
          <ShieldCheck className="w-4 h-4 text-lendswift-blue-600" />
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Mandatory Regulatory Declarations & Consents
          </h3>
        </div>

        <Checkbox
          label="Truthfulness & Authenticity Undertaking"
          description="I declare that all information provided in this loan application is true, correct, and complete. Any misrepresentation shall entitle LendSwift to terminate processing."
          checked={Boolean(formData.consentInformationAccurate)}
          onChange={(e) => setValue('consentInformationAccurate', e.target.checked, { shouldValidate: true })}
          error={errors.consentInformationAccurate?.message}
        />

        <Checkbox
          label="Credit Bureau Check Authorization (CIBIL / Experian / Equifax / CRIF High Mark)"
          description="I explicitly authorise LendSwift to fetch my credit bureau reports and track ongoing repayment history."
          checked={Boolean(formData.consentCreditBureauCheck)}
          onChange={(e) => setValue('consentCreditBureauCheck', e.target.checked, { shouldValidate: true })}
          error={errors.consentCreditBureauCheck?.message}
        />

        <Checkbox
          label="Key Fact Statement (KFS) & Terms of Sanction Acceptance"
          description="I have reviewed the Key Fact Statement above including the interest rate, processing fee, and cooling-off period under RBI Digital Lending Guidelines 2022."
          checked={Boolean(formData.consentTermsConditions)}
          onChange={(e) => setValue('consentTermsConditions', e.target.checked, { shouldValidate: true })}
          error={errors.consentTermsConditions?.message}
        />

        <Checkbox
          label="Omnichannel Communication Consent (WhatsApp, SMS, Email, Call)"
          description="I agree to receive transactional updates, repayment reminders, and loan status notifications."
          checked={Boolean(formData.consentCommunications)}
          onChange={(e) => setValue('consentCommunications', e.target.checked, { shouldValidate: true })}
          error={errors.consentCommunications?.message}
        />
      </div>

      {/* 4. Final Submission Action */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-xs text-slate-500">
          Clicking submit completes the digital application and generates your pre-approval reference ID.
        </p>

        <Button
          type="button"
          size="lg"
          variant="secondary"
          isLoading={isSubmitting}
          disabled={!allConsentsChecked}
          onClick={onSubmitApplication}
          leftIcon={<ShieldCheck className="w-5 h-5" />}
          className="w-full sm:w-auto"
        >
          Submit Loan Application
        </Button>
      </div>
    </div>
  );
};
