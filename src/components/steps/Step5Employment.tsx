import React, { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Briefcase, Building2, UserCheck, ShieldCheck, Search } from 'lucide-react';
import { LoanFormData, EmploymentType } from '../../types/loan';
import { RadioGroup } from '../common/RadioGroup';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { CurrencyInput } from '../common/CurrencyInput';

interface Step5Props {
  form: UseFormReturn<LoanFormData>;
}

const TOP_EMPLOYERS = [
  'Tata Consultancy Services (TCS)',
  'Infosys Limited',
  'Wipro Technologies',
  'HDFC Bank Limited',
  'ICICI Bank Limited',
  'Reliance Industries Limited',
  'Larsen & Toubro (L&T)',
  'Bharti Airtel Limited',
  'State Bank of India (SBI)',
  'HCL Technologies',
  'Flipkart India',
  'Amazon India Development Center',
  'Google India',
  'Microsoft India',
  'Accenture India',
  'Cognizant Technology Solutions',
];

export const Step5Employment: React.FC<Step5Props> = ({ form }) => {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = form;

  const loanType = watch('loanType') || 'personal';
  const employmentType = watch('employmentType');

  // Autocomplete state for Salaried company name
  const [companySuggestions, setCompanySuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // When switching employment types, clean up previous specific fields to avoid stale data leaks (Section E3.1)
  const handleEmploymentTypeChange = (newType: string) => {
    const type = newType as EmploymentType;

    // Clear previous specific fields
    if (type !== 'salaried') {
      setValue('companyName', '');
      setValue('designation', '');
      setValue('monthlyNetSalary', undefined);
      setValue('totalWorkExperienceYears', undefined);
    }
    if (type !== 'self_employed') {
      setValue('professionName', '');
      setValue('professionType', '');
      setValue('annualTurnover', undefined);
      setValue('yearsInPractice', undefined);
      setValue('selfEmployedMonthlyIncome', undefined);
    }
    if (type !== 'business_owner') {
      setValue('businessName', '');
      setValue('businessType', '');
      setValue('businessAnnualTurnover', undefined);
      setValue('yearsInBusiness', undefined);
      setValue('businessMonthlyNetProfit', undefined);
      setValue('gstNumber', '');
    }

    setValue('employmentType', type, { shouldValidate: true });
  };

  const handleCompanyInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setValue('companyName', val, { shouldValidate: true });

    if (val.trim().length >= 2) {
      const matches = TOP_EMPLOYERS.filter((comp) =>
        comp.toLowerCase().includes(val.toLowerCase())
      );
      setCompanySuggestions(matches);
      setShowSuggestions(matches.length > 0);
    } else {
      setShowSuggestions(false);
    }
  };

  const selectCompany = (company: string) => {
    setValue('companyName', company, { shouldValidate: true });
    setShowSuggestions(false);
  };

  // Employment options
  const employmentOptions = [
    {
      value: 'salaried',
      label: 'Salaried Professional',
      description: 'Employed full-time with regular monthly pay slip & bank credits.',
      icon: <Building2 className="w-5 h-5" />,
      badge: loanType === 'business' ? 'Not eligible for Business Loan' : undefined,
    },
    {
      value: 'self_employed',
      label: 'Self-Employed Professional',
      description: 'Doctors, Chartered Accountants, Advocates, Architects, Consultants.',
      icon: <UserCheck className="w-5 h-5" />,
    },
    {
      value: 'business_owner',
      label: 'Business Owner / Proprietor',
      description: 'Trading, Manufacturing, MSME, Partnership, or Private Limited entity.',
      icon: <Briefcase className="w-5 h-5" />,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-100 pb-4">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Employment & Financial Profile</h2>
        <p className="text-xs text-slate-500 mt-1">
          Tell us about your source of income. This information directly computes your maximum borrowing eligibility.
        </p>
      </div>

      {/* 1. Employment Type Selection */}
      <RadioGroup
        label="Employment Category"
        name="employmentType"
        layout="grid"
        isRequired
        value={employmentType}
        onChange={handleEmploymentTypeChange}
        error={errors.employmentType?.message}
        options={employmentOptions}
      />

      {/* 2. Sub-Form: Salaried */}
      {employmentType === 'salaried' && (
        <div className="space-y-5 animate-fade-in bg-slate-50/50 p-5 rounded-2xl border border-slate-200">
          <div className="border-b border-slate-200 pb-2">
            <h3 className="text-sm font-bold text-slate-800">Corporate Employment Details</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
            {/* Company Name with Autocomplete */}
            <div className="relative">
              <Input isRequired hasError={Boolean(errors.companyName)}>
                <Input.Label>Employer / Organization Name</Input.Label>
                <Input.Field
                  placeholder="Type employer name (e.g. TCS, Infosys, HDFC...)"
                  value={watch('companyName') || ''}
                  onChange={handleCompanyInputChange}
                  leftIcon={<Search className="w-4 h-4" />}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                />
                <Input.Error message={errors.companyName?.message} />
              </Input>

              {/* Suggestions Dropdown */}
              {showSuggestions && companySuggestions.length > 0 && (
                <ul className="absolute z-30 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-48 overflow-y-auto py-1">
                  {companySuggestions.map((comp) => (
                    <li
                      key={comp}
                      onMouseDown={() => selectCompany(comp)}
                      className="px-3.5 py-2 text-xs text-slate-800 hover:bg-lendswift-blue-50 hover:text-lendswift-blue-900 cursor-pointer flex items-center justify-between"
                    >
                      <span>{comp}</span>
                      <span className="text-[10px] text-lendswift-blue-600 bg-lendswift-blue-100/50 px-1.5 py-0.5 rounded font-medium">
                        Recognized Cat A
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <Input isRequired hasError={Boolean(errors.designation)}>
              <Input.Label>Official Job Title / Designation</Input.Label>
              <Input.Field
                placeholder="e.g. Senior Software Engineer"
                maxLength={100}
                {...register('designation')}
              />
              <Input.Error message={errors.designation?.message} />
            </Input>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
            <CurrencyInput
              label="Net Monthly In-Hand Salary"
              isRequired
              placeholder="e.g. 75,000"
              value={watch('monthlyNetSalary') || 0}
              onChange={(val) => setValue('monthlyNetSalary', val, { shouldValidate: true })}
              min={15000}
              error={errors.monthlyNetSalary?.message}
              helpText="After PF, TDS, and deductions. Minimum eligible salary is ₹ 15,000"
            />

            <Input isRequired hasError={Boolean(errors.totalWorkExperienceYears)}>
              <Input.Label>Total Professional Work Experience (Years)</Input.Label>
              <Input.Field
                type="number"
                min={0}
                max={50}
                placeholder="e.g. 5"
                {...register('totalWorkExperienceYears', { valueAsNumber: true })}
              />
              <Input.Error message={errors.totalWorkExperienceYears?.message} />
            </Input>
          </div>
        </div>
      )}

      {/* 3. Sub-Form: Self-Employed */}
      {employmentType === 'self_employed' && (
        <div className="space-y-5 animate-fade-in bg-slate-50/50 p-5 rounded-2xl border border-slate-200">
          <div className="border-b border-slate-200 pb-2">
            <h3 className="text-sm font-bold text-slate-800">Professional Practice Details</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
            <Input isRequired hasError={Boolean(errors.professionName)}>
              <Input.Label>Clinic / Practice / Firm Name</Input.Label>
              <Input.Field
                placeholder="e.g. Apex Health Clinic"
                maxLength={100}
                {...register('professionName')}
              />
              <Input.Error message={errors.professionName?.message} />
            </Input>

            <Select
              label="Profession Category"
              isRequired
              placeholder="Select practice domain"
              options={[
                { value: 'doctor', label: 'Doctor / Medical Practitioner (MBBS/MD)' },
                { value: 'chartered_accountant', label: 'Chartered Accountant (FCA/ACA)' },
                { value: 'advocate', label: 'Advocate / Legal Consultant' },
                { value: 'architect', label: 'Architect / Urban Planner (COA)' },
                { value: 'it_consultant', label: 'Independent IT / Software Consultant' },
                { value: 'financial_advisor', label: 'Investment & Financial Advisor' },
              ]}
              value={watch('professionType') || ''}
              onChange={(e) => setValue('professionType', e.target.value, { shouldValidate: true })}
              error={errors.professionType?.message}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
            <CurrencyInput
              label="Annual Gross Receipts / Turnover"
              isRequired
              placeholder="e.g. 15,00,000"
              value={watch('annualTurnover') || 0}
              onChange={(val) => setValue('annualTurnover', val, { shouldValidate: true })}
              min={300000}
              error={errors.annualTurnover?.message}
              helpText="Minimum ₹ 3 Lakhs"
            />

            <CurrencyInput
              label="Average Monthly Net Income"
              isRequired
              placeholder="e.g. 1,00,000"
              value={watch('selfEmployedMonthlyIncome') || 0}
              onChange={(val) => setValue('selfEmployedMonthlyIncome', val, { shouldValidate: true })}
              min={15000}
              error={errors.selfEmployedMonthlyIncome?.message}
              helpText="Used for EMI eligibility check"
            />

            <Input isRequired hasError={Boolean(errors.yearsInPractice)}>
              <Input.Label>Years in Active Practice</Input.Label>
              <Input.Field
                type="number"
                min={2}
                max={50}
                placeholder="e.g. 4"
                {...register('yearsInPractice', { valueAsNumber: true })}
              />
              <Input.HelpText>Minimum 2 years required</Input.HelpText>
              <Input.Error message={errors.yearsInPractice?.message} />
            </Input>
          </div>
        </div>
      )}

      {/* 4. Sub-Form: Business Owner */}
      {employmentType === 'business_owner' && (
        <div className="space-y-5 animate-fade-in bg-slate-50/50 p-5 rounded-2xl border border-slate-200">
          <div className="border-b border-slate-200 pb-2">
            <h3 className="text-sm font-bold text-slate-800">Commercial Entity Details</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
            <Input isRequired hasError={Boolean(errors.businessName)}>
              <Input.Label>Registered Business Enterprise Name</Input.Label>
              <Input.Field
                placeholder="e.g. SwiftLogix Solutions Pvt Ltd"
                maxLength={100}
                {...register('businessName')}
              />
              <Input.Error message={errors.businessName?.message} />
            </Input>

            <Select
              label="Business Constitution"
              isRequired
              placeholder="Select legal structure"
              options={[
                { value: 'sole_proprietorship', label: 'Sole Proprietorship' },
                { value: 'partnership', label: 'Partnership Firm' },
                { value: 'private_limited', label: 'Private Limited Company (Pvt Ltd)' },
                { value: 'llp', label: 'Limited Liability Partnership (LLP)' },
                { value: 'opc', label: 'One Person Company (OPC)' },
              ]}
              value={watch('businessType') || ''}
              onChange={(e) => setValue('businessType', e.target.value, { shouldValidate: true })}
              error={errors.businessType?.message}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
            <CurrencyInput
              label="Annual Audited Turnover"
              isRequired
              placeholder="e.g. 50,00,000"
              value={watch('businessAnnualTurnover') || 0}
              onChange={(val) => setValue('businessAnnualTurnover', val, { shouldValidate: true })}
              min={300000}
              error={errors.businessAnnualTurnover?.message}
              helpText="Minimum ₹ 3 Lakh turnover"
            />

            <CurrencyInput
              label="Monthly Net Business Profit"
              isRequired
              placeholder="e.g. 1,50,000"
              value={watch('businessMonthlyNetProfit') || 0}
              onChange={(val) => setValue('businessMonthlyNetProfit', val, { shouldValidate: true })}
              min={15000}
              error={errors.businessMonthlyNetProfit?.message}
              helpText="Net take-home cashflow"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
            <Input isRequired hasError={Boolean(errors.gstNumber)}>
              <Input.Label>15-Character GSTIN Number</Input.Label>
              <Input.Field
                placeholder="e.g. 27ABCPE1234F1Z5"
                maxLength={15}
                {...register('gstNumber')}
                onChange={(e) => setValue('gstNumber', e.target.value.toUpperCase(), { shouldValidate: true })}
              />
              <Input.HelpText>First 2 digits are state code, followed by 10-char PAN</Input.HelpText>
              <Input.Error message={errors.gstNumber?.message} />
            </Input>

            <Input isRequired hasError={Boolean(errors.yearsInBusiness)}>
              <Input.Label>Business Vintage (Years)</Input.Label>
              <Input.Field
                type="number"
                min={2}
                max={50}
                placeholder="e.g. 5"
                {...register('yearsInBusiness', { valueAsNumber: true })}
              />
              <Input.HelpText>Minimum 2 years continuous operations required</Input.HelpText>
              <Input.Error message={errors.yearsInBusiness?.message} />
            </Input>
          </div>
        </div>
      )}

      {/* Safety info */}
      <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-200">
        <ShieldCheck className="w-4 h-4 text-lendswift-green-600 shrink-0" />
        <span>
          LendSwift adheres to RBI non-predatory lending ratios. EMI commitment must not exceed 50% of verified net monthly earnings.
        </span>
      </div>
    </div>
  );
};
