import React, { useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Users, CheckCircle2, Shield, Loader2 } from 'lucide-react';
import { LoanFormData } from '../../types/loan';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { MaskedInput } from '../common/MaskedInput';
import { CurrencyInput } from '../common/CurrencyInput';
import { Checkbox } from '../common/Checkbox';
import { SignatureCanvas } from '../signature/SignatureCanvas';
import { useVerification } from '../../hooks/useVerification';

interface Step6Props {
  form: UseFormReturn<LoanFormData>;
}

export const Step6CoApplicant: React.FC<Step6Props> = ({ form }) => {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = form;

  const maritalStatus = watch('maritalStatus');
  const coAppPan = watch('coApplicantPan') || '';
  const coAppPanVerified = watch('coApplicantPanVerified');
  const coApplicantConsent = watch('coApplicantConsent');

  const { states, verifyField } = useVerification();
  const isPanVerifying = states.coAppPan?.isVerifying;

  // Default relationship to Spouse if applicant is married
  useEffect(() => {
    if (maritalStatus === 'married' && !watch('coApplicantRelationship')) {
      setValue('coApplicantRelationship', 'spouse');
    }
  }, [maritalStatus, setValue, watch]);

  const handlePanBlur = async () => {
    if (coAppPan.length === 10) {
      const ok = await verifyField('coAppPan', 'pan', coAppPan, 'personal');
      setValue('coApplicantPanVerified', ok, { shouldValidate: true });
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2">
          <span className="p-1.5 bg-lendswift-blue-100 text-lendswift-blue-800 rounded-lg">
            <Users className="w-5 h-5" />
          </span>
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Co-Applicant & Guarantor</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Required for your requested loan threshold to enhance credit eligibility and meet risk guidelines.
            </p>
          </div>
        </div>
      </div>

      <div className="p-3.5 bg-lendswift-blue-50/60 rounded-xl border border-lendswift-blue-100 flex items-start gap-3">
        <Shield className="w-5 h-5 text-lendswift-blue-600 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-600">
          <p className="font-semibold text-lendswift-blue-900">Co-Borrower Income Clubbing</p>
          <p className="mt-0.5">
            Your co-applicant's income will be combined with yours, increasing your borrowing power and lowering your debt-to-income ratio.
          </p>
        </div>
      </div>

      {/* 1. Name and Relationship */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
        <Input isRequired hasError={Boolean(errors.coApplicantName)}>
          <Input.Label>Co-Applicant Full Legal Name</Input.Label>
          <Input.Field
            placeholder="e.g. Priya Sharma"
            maxLength={100}
            {...register('coApplicantName')}
          />
          <Input.HelpText>As registered in official government identity records</Input.HelpText>
          <Input.Error message={errors.coApplicantName?.message} />
        </Input>

        <Select
          label="Relationship with Primary Applicant"
          isRequired
          placeholder="Select relationship"
          options={[
            { value: 'spouse', label: 'Spouse (Husband / Wife)' },
            { value: 'parent', label: 'Parent (Father / Mother)' },
            { value: 'sibling', label: 'Sibling (Brother / Sister)' },
            { value: 'business_partner', label: 'Business Partner / Co-Director' },
          ]}
          value={watch('coApplicantRelationship') || ''}
          onChange={(e) => setValue('coApplicantRelationship', e.target.value as any, { shouldValidate: true })}
          error={errors.coApplicantRelationship?.message}
        />
      </div>

      {/* 2. Co-Applicant PAN & Monthly Income */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
        <MaskedInput
          label="Co-Applicant PAN Number"
          isRequired
          maxLength={10}
          placeholder="ABCPE5678K"
          value={coAppPan}
          onChange={(val) => {
            const upper = val.toUpperCase().replace(/[^A-Z0-9]/g, '');
            setValue('coApplicantPan', upper, { shouldValidate: true });
            if (coAppPanVerified) setValue('coApplicantPanVerified', false);
          }}
          onBlur={handlePanBlur}
          error={states.coAppPan?.error || errors.coApplicantPan?.message}
          helpText="10 characters, 4th character 'P'"
          rightBadge={
            isPanVerifying ? (
              <span className="flex items-center gap-1 text-xs text-lendswift-blue-600 font-medium">
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Verifying...
              </span>
            ) : coAppPanVerified ? (
              <span className="flex items-center gap-1 text-xs text-lendswift-green-700 bg-lendswift-green-50 px-2 py-0.5 rounded-full border border-lendswift-green-200 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" /> Verified
              </span>
            ) : null
          }
        />

        <CurrencyInput
          label="Co-Applicant Monthly Net Income"
          isRequired
          placeholder="e.g. 50,000"
          value={watch('coApplicantMonthlyIncome') || 0}
          onChange={(val) => setValue('coApplicantMonthlyIncome', val, { shouldValidate: true })}
          min={10000}
          error={errors.coApplicantMonthlyIncome?.message}
          helpText="Combined with primary applicant's income for EMI ratio"
        />
      </div>

      {/* 3. Co-Applicant Consent & E-Signature */}
      <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
        <Checkbox
          label="Co-Applicant Joint Liability & Credit Check Authorization"
          description="I (the co-applicant) hereby agree to be jointly and severally liable for all repayment obligations under this loan. I expressly authorise LendSwift to perform simulated credit bureau inquiries on my PAN and fetch financial profile details."
          checked={Boolean(coApplicantConsent)}
          onChange={(e) => setValue('coApplicantConsent', e.target.checked, { shouldValidate: true })}
          error={errors.coApplicantConsent?.message}
        />

        <div className="pt-2">
          <SignatureCanvas
            label="Co-Applicant Digital E-Signature"
            isRequired={false}
            value={watch('coApplicantSignature')}
            onChange={(sig) => setValue('coApplicantSignature', sig)}
          />
        </div>
      </div>
    </div>
  );
};
