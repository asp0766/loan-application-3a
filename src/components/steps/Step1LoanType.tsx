import React, { useMemo } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { User, Home, Briefcase, Calculator, Percent, Clock } from 'lucide-react';
import { LoanFormData, LoanType } from '../../types/loan';
import { RadioGroup } from '../common/RadioGroup';
import { CurrencyInput } from '../common/CurrencyInput';
import { Select } from '../common/Select';
import { Input } from '../common/Input';
import { calculateEMI, formatINR } from '../../utils/emiCalculator';

interface Step1Props {
  form: UseFormReturn<LoanFormData>;
}

export const Step1LoanType: React.FC<Step1Props> = ({ form }) => {
  const {
    watch,
    setValue,
    register,
    formState: { errors },
  } = form;

  const loanType = watch('loanType') || 'personal';
  const loanAmount = watch('loanAmount') || 0;
  const loanTenureMonths = watch('loanTenureMonths') || 24;

  // Limits based on product
  const productConfig = useMemo(() => {
    switch (loanType) {
      case 'home':
        return {
          minAmount: 500000,
          maxAmount: 10000000,
          defaultAmount: 2500000,
          tenureOptions: [
            { value: 60, label: '5 Years (60 Months)' },
            { value: 120, label: '10 Years (120 Months)' },
            { value: 180, label: '15 Years (180 Months)' },
            { value: 240, label: '20 Years (240 Months)' },
            { value: 300, label: '25 Years (300 Months)' },
            { value: 360, label: '30 Years (360 Months)' },
          ],
          purposes: [
            { value: 'ready_property', label: 'Purchase of Ready Built Flat / House' },
            { value: 'construction', label: 'Self-Construction on Owned Plot' },
            { value: 'plot_plus_construction', label: 'Plot Purchase + Construction' },
            { value: 'renovation_extension', label: 'Home Extension / Renovation' },
            { value: 'balance_transfer', label: 'Balance Transfer of Existing Home Loan' },
          ],
        };
      case 'business':
        return {
          minAmount: 100000,
          maxAmount: 5000000,
          defaultAmount: 1000000,
          tenureOptions: [
            { value: 12, label: '1 Year (12 Months)' },
            { value: 24, label: '2 Years (24 Months)' },
            { value: 36, label: '3 Years (36 Months)' },
            { value: 60, label: '5 Years (60 Months)' },
            { value: 84, label: '7 Years (84 Months)' },
            { value: 120, label: '10 Years (120 Months)' },
          ],
          purposes: [
            { value: 'working_capital', label: 'Working Capital & Daily Operations' },
            { value: 'machinery_equipment', label: 'Machinery / Equipment Purchase' },
            { value: 'business_expansion', label: 'Business Expansion & Branch Setup' },
            { value: 'inventory_procurement', label: 'Bulk Inventory Procurement' },
            { value: 'technology_infra', label: 'Digital Transformation & Technology' },
          ],
        };
      case 'personal':
      default:
        return {
          minAmount: 50000,
          maxAmount: 1000000,
          defaultAmount: 300000,
          tenureOptions: [
            { value: 12, label: '1 Year (12 Months)' },
            { value: 24, label: '2 Years (24 Months)' },
            { value: 36, label: '3 Years (36 Months)' },
            { value: 48, label: '4 Years (48 Months)' },
            { value: 60, label: '5 Years (60 Months)' },
          ],
          purposes: [
            { value: 'medical', label: 'Medical Emergency / Healthcare' },
            { value: 'wedding', label: 'Family Wedding / Celebrations' },
            { value: 'education', label: 'Higher Education / Certification' },
            { value: 'home_renovation', label: 'Home Renovation / Interior Work' },
            { value: 'travel', label: 'Vacation / Travel Expenses' },
            { value: 'debt_consolidation', label: 'Consolidation of High-Cost Debt' },
          ],
        };
    }
  }, [loanType]);

  // Handle loan type change
  const handleLoanTypeChange = (newType: string) => {
    const type = newType as LoanType;
    setValue('loanType', type, { shouldValidate: true });

    // Adjust amount if out of new bounds
    let adjustedAmount = loanAmount;
    if (type === 'personal' && adjustedAmount > 1000000) adjustedAmount = 1000000;
    if (type === 'business' && adjustedAmount > 5000000) adjustedAmount = 5000000;
    if (type === 'home' && adjustedAmount < 500000) adjustedAmount = 1500000;
    if (!adjustedAmount || adjustedAmount < 50000) adjustedAmount = productConfig.defaultAmount;
    setValue('loanAmount', adjustedAmount, { shouldValidate: true });

    // Reset tenure if out of new options
    if (type === 'home' && loanTenureMonths < 60) setValue('loanTenureMonths', 120);
    if (type === 'personal' && loanTenureMonths > 60) setValue('loanTenureMonths', 36);
    if (type === 'business' && loanTenureMonths > 120) setValue('loanTenureMonths', 60);

    // Reset purpose
    setValue('loanPurpose', '', { shouldValidate: true });
  };

  // Live calculated EMI preview
  const liveEmi = useMemo(() => {
    return calculateEMI(loanAmount, loanTenureMonths, loanType);
  }, [loanAmount, loanTenureMonths, loanType]);

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-100 pb-4">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Loan Product & Requirement</h2>
        <p className="text-xs text-slate-500 mt-1">
          Select your desired lending product, required capital amount, and repayment tenure.
        </p>
      </div>

      {/* 1. Loan Product Selection */}
      <RadioGroup
        label="Select Loan Product"
        name="loanType"
        layout="grid"
        isRequired
        value={loanType}
        onChange={handleLoanTypeChange}
        error={errors.loanType?.message}
        options={[
          {
            value: 'personal',
            label: 'Personal Loan',
            description: 'Unsecured financing for immediate personal, medical, or family needs.',
            badge: '10.5% p.a.',
            icon: <User className="w-5 h-5" />,
          },
          {
            value: 'home',
            label: 'Home Loan',
            description: 'Attractive interest rates for ready property purchase or plot construction.',
            badge: '8.5% p.a.',
            icon: <Home className="w-5 h-5" />,
          },
          {
            value: 'business',
            label: 'Business Loan',
            description: 'Collateral-free working capital or equipment expansion loans.',
            badge: '14.0% p.a.',
            icon: <Briefcase className="w-5 h-5" />,
          },
        ]}
      />

      {/* 2. Amount and Tenure */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
        <CurrencyInput
          label="Requested Loan Amount"
          isRequired
          value={loanAmount}
          onChange={(val) => setValue('loanAmount', val, { shouldValidate: true })}
          min={productConfig.minAmount}
          max={productConfig.maxAmount}
          error={errors.loanAmount?.message}
          helpText="Enter required principal amount in INR"
        />

        <Select
          label="Preferred Loan Tenure"
          isRequired
          placeholder="Select tenure duration"
          options={productConfig.tenureOptions}
          value={loanTenureMonths}
          onChange={(e) => setValue('loanTenureMonths', Number(e.target.value), { shouldValidate: true })}
          error={errors.loanTenureMonths?.message}
          helpText="Longer tenures reduce monthly EMI"
        />
      </div>

      {/* 3. Loan Purpose and Referral Code */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
        <Select
          label="Purpose of Loan"
          isRequired
          placeholder="Select specific end-use"
          options={productConfig.purposes}
          value={watch('loanPurpose') || ''}
          onChange={(e) => setValue('loanPurpose', e.target.value, { shouldValidate: true })}
          error={errors.loanPurpose?.message}
          helpText="Complies with RBI data minimality & end-use classification"
        />

        <Input hasError={Boolean(errors.referralCode)}>
          <Input.Label optional>Referral / Promo Code</Input.Label>
          <Input.Field
            placeholder="e.g. SWIFT2026"
            maxLength={10}
            {...register('referralCode')}
          />
          <Input.HelpText>Optional 6-10 character partner code for processing fee discount</Input.HelpText>
          <Input.Error message={errors.referralCode?.message} />
        </Input>
      </div>

      {/* Live Indicative EMI Estimate Card */}
      {loanAmount >= productConfig.minAmount && (
        <div className="bg-gradient-to-br from-lendswift-blue-50/70 to-slate-50 p-4.5 rounded-2xl border border-lendswift-blue-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-lendswift-blue-500 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Indicative Monthly EMI
              </span>
              <p className="text-xl font-extrabold text-lendswift-blue-900 tracking-tight">
                {formatINR(liveEmi.monthlyEmi)}
                <span className="text-xs font-normal text-slate-500 ml-1">/ month</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6 border-t sm:border-t-0 sm:border-l border-slate-200 pt-3 sm:pt-0 sm:pl-6 text-xs text-slate-600">
            <div className="flex items-center gap-1.5">
              <Percent className="w-3.5 h-3.5 text-lendswift-blue-600" />
              <span>
                Rate: <strong className="text-slate-800">{liveEmi.annualInterestRate}% p.a.</strong>
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-lendswift-blue-600" />
              <span>
                Tenure: <strong className="text-slate-800">{loanTenureMonths} Months</strong>
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
