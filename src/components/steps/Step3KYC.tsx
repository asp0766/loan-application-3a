import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { CheckCircle2, Shield, Info, Loader2 } from 'lucide-react';
import { LoanFormData } from '../../types/loan';
import { MaskedInput } from '../common/MaskedInput';
import { Input } from '../common/Input';
import { Checkbox } from '../common/Checkbox';
import { useVerification } from '../../hooks/useVerification';

interface Step3Props {
  form: UseFormReturn<LoanFormData>;
}

export const Step3KYC: React.FC<Step3Props> = ({ form }) => {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = form;

  const loanType = watch('loanType') || 'personal';
  const loanAmount = watch('loanAmount') || 0;
  const panNumber = watch('panNumber') || '';
  const aadhaarNumber = watch('aadhaarNumber') || '';
  const panVerified = watch('panVerified');
  const aadhaarVerified = watch('aadhaarVerified');
  const aadhaarConsent = watch('aadhaarConsent');

  const { states, verifyField } = useVerification();

  const isPanVerifying = states.pan?.isVerifying;
  const isAadhaarVerifying = states.aadhaar?.isVerifying;

  const handlePanBlur = async () => {
    if (panNumber.length === 10) {
      const ok = await verifyField('pan', 'pan', panNumber, loanType);
      if (ok) {
        setValue('panVerified', true, { shouldValidate: true });
      } else {
        setValue('panVerified', false, { shouldValidate: true });
      }
    }
  };

  const handleAadhaarBlur = async () => {
    if (aadhaarNumber.length === 12) {
      const ok = await verifyField('aadhaar', 'aadhaar', aadhaarNumber, loanType);
      if (ok) {
        setValue('aadhaarVerified', true, { shouldValidate: true });
      } else {
        setValue('aadhaarVerified', false, { shouldValidate: true });
      }
    }
  };

  // Check if high-value Home Loan
  const isHighValueHomeLoan = loanType === 'home' && loanAmount > 5000000;

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-100 pb-4">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Identity Verification (KYC)</h2>
        <p className="text-xs text-slate-500 mt-1">
          Government identity documents for credit assessment. Verified via simulated NSDL & UIDAI services.
        </p>
      </div>

      {/* Simulated Verification Notice */}
      <div className="p-3.5 bg-lendswift-blue-50/70 rounded-xl border border-lendswift-blue-100 flex items-start gap-3">
        <Shield className="w-5 h-5 text-lendswift-blue-600 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-600">
          <p className="font-semibold text-lendswift-blue-900">Deterministic Simulated KYC Environment</p>
          <p className="mt-0.5 leading-relaxed">
            All validations run client-side. Valid PAN format (e.g.,{' '}
            <code className="font-mono text-lendswift-blue-800 bg-white px-1 py-0.5 rounded border border-lendswift-blue-200">
              ABCPE1234F
            </code>
            ) and Aadhaar numbers with Verhoeff checksum (e.g.,{' '}
            <code className="font-mono text-lendswift-blue-800 bg-white px-1 py-0.5 rounded border border-lendswift-blue-200">
              999999990019
            </code>
            ) simulate real government database responses with a 1.5s delay.
          </p>
        </div>
      </div>

      {/* 1. PAN Number Input */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
        <MaskedInput
          label="PAN (Permanent Account Number)"
          isRequired
          maxLength={10}
          placeholder="ABCPE1234F"
          value={panNumber}
          onChange={(val) => {
            const upper = val.toUpperCase().replace(/[^A-Z0-9]/g, '');
            setValue('panNumber', upper, { shouldValidate: true });
            if (panVerified) setValue('panVerified', false);
          }}
          onBlur={handlePanBlur}
          error={states.pan?.error || errors.panNumber?.message}
          helpText="10 characters. 4th char must be 'P' for Individual (or 'C'/'F' for Business)"
          rightBadge={
            isPanVerifying ? (
              <span className="flex items-center gap-1 text-xs text-lendswift-blue-600 font-medium">
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Verifying with NSDL...
              </span>
            ) : panVerified ? (
              <span className="flex items-center gap-1 text-xs text-lendswift-green-700 bg-lendswift-green-50 px-2 py-0.5 rounded-full border border-lendswift-green-200 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" /> NSDL Verified
              </span>
            ) : (
              panNumber.length === 10 && (
                <button
                  type="button"
                  onClick={handlePanBlur}
                  className="text-xs text-lendswift-blue-600 hover:text-lendswift-blue-700 font-semibold px-2 py-0.5 bg-lendswift-blue-50 rounded"
                >
                  Verify Now
                </button>
              )
            )
          }
        />

        {/* 2. Aadhaar Number Input */}
        <MaskedInput
          label="12-Digit Aadhaar Number"
          isRequired
          maxLength={12}
          placeholder="999999990019"
          value={aadhaarNumber}
          onChange={(val) => {
            const clean = val.replace(/\D/g, '');
            setValue('aadhaarNumber', clean, { shouldValidate: true });
            if (aadhaarVerified) setValue('aadhaarVerified', false);
          }}
          onBlur={handleAadhaarBlur}
          error={states.aadhaar?.error || errors.aadhaarNumber?.message}
          helpText="Validated using official UIDAI Verhoeff Checksum Algorithm"
          rightBadge={
            isAadhaarVerifying ? (
              <span className="flex items-center gap-1 text-xs text-lendswift-blue-600 font-medium">
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Verifying UIDAI...
              </span>
            ) : aadhaarVerified ? (
              <span className="flex items-center gap-1 text-xs text-lendswift-green-700 bg-lendswift-green-50 px-2 py-0.5 rounded-full border border-lendswift-green-200 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" /> Checksum Verified
              </span>
            ) : (
              aadhaarNumber.length === 12 && (
                <button
                  type="button"
                  onClick={handleAadhaarBlur}
                  className="text-xs text-lendswift-blue-600 hover:text-lendswift-blue-700 font-semibold px-2 py-0.5 bg-lendswift-blue-50 rounded"
                >
                  Verify Now
                </button>
              )
            )
          }
        />
      </div>

      {/* 3. Explicit Aadhaar Consent Checkbox (RBI DL Guidelines Compliant) */}
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
        <Checkbox
          label="Explicit Aadhaar e-KYC Verification Consent"
          description="I voluntarily submit my Aadhaar details to LendSwift (simulated NBFC) for the sole purpose of establishing identity and address under the Aadhaar Act, 2016 and RBI Digital Lending Regulations. I understand my biometric data is neither requested nor stored."
          checked={Boolean(aadhaarConsent)}
          onChange={(e) => setValue('aadhaarConsent', e.target.checked, { shouldValidate: true })}
          error={errors.aadhaarConsent?.message}
        />
      </div>

      {/* 4. Optional Secondary Identity Documents */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start pt-2 border-t border-slate-100">
        <Input hasError={Boolean(errors.voterId)}>
          <Input.Label optional>Voter ID Card Number (EPIC)</Input.Label>
          <Input.Field
            placeholder="e.g. ABC1234567"
            maxLength={10}
            {...register('voterId')}
            onChange={(e) => setValue('voterId', e.target.value.toUpperCase())}
          />
          <Input.HelpText>Format: 3 alphabetic letters followed by 7 numeric digits</Input.HelpText>
          <Input.Error message={errors.voterId?.message} />
        </Input>

        {isHighValueHomeLoan ? (
          <Input isRequired hasError={Boolean(errors.passportNumber)}>
            <Input.Label>Passport Number (Mandatory for Home Loan &gt; ₹50L)</Input.Label>
            <Input.Field
              placeholder="e.g. A1234567"
              maxLength={8}
              {...register('passportNumber')}
              onChange={(e) => setValue('passportNumber', e.target.value.toUpperCase())}
            />
            <Input.HelpText>Required high-value secondary KYC document</Input.HelpText>
            <Input.Error message={errors.passportNumber?.message} />
          </Input>
        ) : (
          <Input hasError={Boolean(errors.passportNumber)}>
            <Input.Label optional>Indian Passport Number</Input.Label>
            <Input.Field
              placeholder="e.g. A1234567"
              maxLength={8}
              {...register('passportNumber')}
              onChange={(e) => setValue('passportNumber', e.target.value.toUpperCase())}
            />
            <Input.HelpText>Format: 1 letter followed by 7 numeric digits</Input.HelpText>
            <Input.Error message={errors.passportNumber?.message} />
          </Input>
        )}
      </div>

      {/* Cross-step verification status hint */}
      {(!panVerified || !aadhaarVerified) && (
        <div className="flex items-center gap-2 p-3 bg-lendswift-amber-50 rounded-xl border border-lendswift-amber-200 text-xs text-lendswift-amber-800">
          <Info className="w-4 h-4 shrink-0 text-lendswift-amber-600" />
          <span>
            Please complete simulated verification for both <strong>PAN</strong> and <strong>Aadhaar</strong> before proceeding to the next step.
          </span>
        </div>
      )}
    </div>
  );
};
