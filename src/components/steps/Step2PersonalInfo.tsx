import React, { useMemo, useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Mail, Phone, Calendar, CheckCircle2, ShieldCheck, KeyRound } from 'lucide-react';
import { LoanFormData } from '../../types/loan';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { RadioGroup } from '../common/RadioGroup';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { calculateAge } from '../../utils/validators';

interface Step2Props {
  form: UseFormReturn<LoanFormData>;
}

export const Step2PersonalInfo: React.FC<Step2Props> = ({ form }) => {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = form;

  const dob = watch('dateOfBirth');
  const email = watch('email');
  const mobileNumber = watch('mobileNumber');
  const emailVerified = watch('emailVerified');
  const mobileVerified = watch('mobileVerified');

  // Simulated OTP verification modal state
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [enteredOtp, setEnteredOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  // Live age calculation
  const applicantAge = useMemo(() => {
    return dob ? calculateAge(dob) : 0;
  }, [dob]);

  const handleSimulateEmailVerify = () => {
    if (!email || errors.email) return;
    setValue('emailVerified', true, { shouldValidate: true });
  };

  const handleOpenOtpModal = () => {
    if (!mobileNumber || errors.mobileNumber) return;
    setEnteredOtp('');
    setOtpError('');
    setShowOtpModal(true);
  };

  const handleVerifyOtp = async () => {
    if (enteredOtp.length !== 4) {
      setOtpError('Please enter a 4-digit OTP (Enter 1234 for demo)');
      return;
    }
    setIsVerifyingOtp(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setIsVerifyingOtp(false);

    if (enteredOtp === '1234') {
      setValue('mobileVerified', true, { shouldValidate: true });
      setShowOtpModal(false);
    } else {
      setOtpError('Invalid OTP code. Please enter demo OTP: 1234');
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-100 pb-4">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Personal Information</h2>
        <p className="text-xs text-slate-500 mt-1">
          Provide your legal identity and demographic details matching official government records.
        </p>
      </div>

      {/* 1. Full Name */}
      <Input isRequired hasError={Boolean(errors.fullName)}>
        <Input.Label>Full Legal Name (as per PAN Card)</Input.Label>
        <Input.Field
          placeholder="e.g. Rahul Ramesh Sharma"
          maxLength={100}
          autoComplete="name"
          {...register('fullName')}
        />
        <Input.HelpText>Must match the exact name spelling on your Income Tax PAN card</Input.HelpText>
        <Input.Error message={errors.fullName?.message} />
      </Input>

      {/* 2. Date of Birth & Gender */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
        <div>
          <Input isRequired hasError={Boolean(errors.dateOfBirth)}>
            <div className="flex items-center justify-between mb-1.5">
              <Input.Label>Date of Birth</Input.Label>
              {applicantAge > 0 && (
                <span className="text-[11px] font-semibold text-lendswift-blue-700 bg-lendswift-blue-50 px-2 py-0.5 rounded-full border border-lendswift-blue-200">
                  {applicantAge} Years Old
                </span>
              )}
            </div>
            <Input.Field
              type="date"
              leftIcon={<Calendar className="w-4 h-4" />}
              {...register('dateOfBirth')}
            />
            <Input.HelpText>Applicant must be between 21 and 65 years of age</Input.HelpText>
            <Input.Error message={errors.dateOfBirth?.message} />
          </Input>
        </div>

        <RadioGroup
          label="Gender"
          name="gender"
          layout="horizontal"
          isRequired
          value={watch('gender')}
          onChange={(val) => setValue('gender', val as any, { shouldValidate: true })}
          error={errors.gender?.message}
          options={[
            { value: 'male', label: 'Male' },
            { value: 'female', label: 'Female' },
            { value: 'other', label: 'Other' },
          ]}
        />
      </div>

      {/* 3. Marital Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
        <Select
          label="Marital Status"
          isRequired
          placeholder="Select status"
          options={[
            { value: 'single', label: 'Single / Unmarried' },
            { value: 'married', label: 'Married' },
            { value: 'divorced', label: 'Divorced' },
            { value: 'widowed', label: 'Widowed' },
          ]}
          value={watch('maritalStatus') || ''}
          onChange={(e) => {
            setValue('maritalStatus', e.target.value as any, { shouldValidate: true });
            // If married, set default co-applicant relationship in Step 6
            if (e.target.value === 'married') {
              setValue('coApplicantRelationship', 'spouse');
            }
          }}
          error={errors.maritalStatus?.message}
        />
      </div>

      {/* 4. Parent Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
        <Input isRequired hasError={Boolean(errors.fathersName)}>
          <Input.Label>Father's Full Name</Input.Label>
          <Input.Field
            placeholder="e.g. Ramesh Chandra Sharma"
            maxLength={100}
            {...register('fathersName')}
          />
          <Input.Error message={errors.fathersName?.message} />
        </Input>

        <Input isRequired hasError={Boolean(errors.mothersName)}>
          <Input.Label>Mother's Full Name</Input.Label>
          <Input.Field
            placeholder="e.g. Sunita Ramesh Sharma"
            maxLength={100}
            {...register('mothersName')}
          />
          <Input.Error message={errors.mothersName?.message} />
        </Input>
      </div>

      {/* 5. Contact Information & Simulated Verification */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start pt-2 border-t border-slate-100">
        <Input isRequired hasError={Boolean(errors.email)}>
          <Input.Label>Personal Email Address</Input.Label>
          <Input.Field
            type="email"
            autoComplete="email"
            placeholder="name@example.com"
            leftIcon={<Mail className="w-4 h-4" />}
            rightElement={
              emailVerified ? (
                <span className="flex items-center gap-1 text-[11px] text-lendswift-green-700 bg-lendswift-green-50 px-2 py-1 rounded-lg border border-lendswift-green-200 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                </span>
              ) : (
                email &&
                !errors.email && (
                  <button
                    type="button"
                    onClick={handleSimulateEmailVerify}
                    className="text-xs text-lendswift-blue-600 hover:text-lendswift-blue-700 font-semibold px-2 py-1 bg-lendswift-blue-50 rounded-lg"
                  >
                    Verify
                  </button>
                )
              )
            }
            {...register('email')}
          />
          <Input.HelpText>Loan sanction letters and digital agreements will be sent here</Input.HelpText>
          <Input.Error message={errors.email?.message} />
        </Input>

        <Input isRequired hasError={Boolean(errors.mobileNumber)}>
          <Input.Label>Primary Mobile Number</Input.Label>
          <Input.Field
            type="tel"
            autoComplete="tel"
            placeholder="9876543210"
            maxLength={10}
            leftIcon={<Phone className="w-4 h-4" />}
            rightElement={
              mobileVerified ? (
                <span className="flex items-center gap-1 text-[11px] text-lendswift-green-700 bg-lendswift-green-50 px-2 py-1 rounded-lg border border-lendswift-green-200 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                </span>
              ) : (
                mobileNumber &&
                mobileNumber.length === 10 &&
                !errors.mobileNumber && (
                  <button
                    type="button"
                    onClick={handleOpenOtpModal}
                    className="text-xs text-lendswift-blue-600 hover:text-lendswift-blue-700 font-semibold px-2 py-1 bg-lendswift-blue-50 rounded-lg"
                  >
                    Verify OTP
                  </button>
                )
              )
            }
            {...register('mobileNumber')}
          />
          <Input.HelpText>10-digit Indian mobile number linked to Aadhaar</Input.HelpText>
          <Input.Error message={errors.mobileNumber?.message} />
        </Input>
      </div>

      {/* Alternate Mobile */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
        <Input hasError={Boolean(errors.alternateMobile)}>
          <Input.Label optional>Alternate Mobile Number</Input.Label>
          <Input.Field
            type="tel"
            placeholder="9123456780"
            maxLength={10}
            leftIcon={<Phone className="w-4 h-4" />}
            {...register('alternateMobile')}
          />
          <Input.HelpText>Must differ from your primary mobile number</Input.HelpText>
          <Input.Error message={errors.alternateMobile?.message} />
        </Input>
      </div>

      {/* Simulated OTP Modal */}
      <Modal
        isOpen={showOtpModal}
        onClose={() => setShowOtpModal(false)}
        title="Simulated Mobile OTP Verification"
      >
        <div className="space-y-4">
          <div className="p-3 bg-lendswift-blue-50 rounded-xl border border-lendswift-blue-100 flex items-start gap-2.5">
            <KeyRound className="w-5 h-5 text-lendswift-blue-600 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-700">
              <p className="font-semibold text-lendswift-blue-900">Demo OTP Service</p>
              <p className="mt-0.5">
                We sent a simulated 4-digit verification code to <strong>+91 {mobileNumber}</strong>.
              </p>
              <p className="mt-1 font-mono text-lendswift-blue-700 bg-white inline-block px-1.5 py-0.5 rounded border border-lendswift-blue-200">
                Use Demo Code: <strong>1234</strong>
              </p>
            </div>
          </div>

          <Input isRequired hasError={Boolean(otpError)}>
            <Input.Label>Enter 4-Digit OTP Code</Input.Label>
            <Input.Field
              type="text"
              maxLength={4}
              placeholder="1234"
              value={enteredOtp}
              onChange={(e) => {
                setEnteredOtp(e.target.value.replace(/\D/g, ''));
                setOtpError('');
              }}
              className="text-center font-mono text-lg tracking-widest"
            />
            <Input.Error message={otpError} />
          </Input>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowOtpModal(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              isLoading={isVerifyingOtp}
              onClick={handleVerifyOtp}
              leftIcon={<ShieldCheck className="w-4 h-4" />}
            >
              Confirm OTP
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
