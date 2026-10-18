import React, { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { MapPin, AlertTriangle, Loader2 } from 'lucide-react';
import { LoanFormData, ResidenceType } from '../../types/loan';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { Checkbox } from '../common/Checkbox';
import { CurrencyInput } from '../common/CurrencyInput';
import { usePinCodeLookup } from '../../hooks/usePinCodeLookup';

interface Step4Props {
  form: UseFormReturn<LoanFormData>;
}

export const Step4Address: React.FC<Step4Props> = ({ form }) => {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = form;

  const residenceType = watch('residenceType');
  const yearsAtCurrentAddress = watch('yearsAtCurrentAddress');
  const sameAsPermanentAddress = watch('sameAsPermanentAddress');
  const currentPin = watch('currentAddress.pinCode');
  const currentState = watch('currentAddress.state');

  const { lookupPinCode: lookupCurrentPin, isLoading: isLoadingCurrentPin } = usePinCodeLookup();
  const { lookupPinCode: lookupPermPin, isLoading: isLoadingPermPin } = usePinCodeLookup();

  const [pinDerivedState, setPinDerivedState] = useState<string | null>(null);

  // Auto-fill address on 6-digit PIN code blur or change
  const handleCurrentPinBlur = async () => {
    if (currentPin && currentPin.length === 6) {
      const record = await lookupCurrentPin(currentPin);
      if (record) {
        setValue('currentAddress.city', record.city, { shouldValidate: true });
        setValue('currentAddress.state', record.state, { shouldValidate: true });
        setValue('currentAddress.postOffice', record.postOffice || '', { shouldValidate: true });
        setPinDerivedState(record.state);
      }
    }
  };

  const handlePermanentPinBlur = async (pin: string) => {
    if (pin && pin.length === 6) {
      const record = await lookupPermPin(pin);
      if (record) {
        setValue('permanentAddress.city', record.city, { shouldValidate: true });
        setValue('permanentAddress.state', record.state, { shouldValidate: true });
      }
    }
  };

  // State mismatch detection (Section A3.3 / E1)
  const isStateMismatch =
    pinDerivedState &&
    currentState &&
    pinDerivedState.toLowerCase() !== currentState.toLowerCase();

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-100 pb-4">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Residential Address Information</h2>
        <p className="text-xs text-slate-500 mt-1">
          Provide your current residence and permanent address for verification and physical document dispatch.
        </p>
      </div>

      {/* 1. Current Address Section */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
          <MapPin className="w-4 h-4 text-lendswift-blue-600" /> Current Residential Address
        </h3>

        <Input isRequired hasError={Boolean(errors.currentAddress?.addressLine1)}>
          <Input.Label>House / Flat No., Building, Street</Input.Label>
          <Input.Field
            placeholder="e.g. Flat 402, Green Meadows, 5th Main Road"
            maxLength={200}
            {...register('currentAddress.addressLine1')}
          />
          <Input.Error message={errors.currentAddress?.addressLine1?.message} />
        </Input>

        <Input hasError={Boolean(errors.currentAddress?.addressLine2)}>
          <Input.Label optional>Landmark / Locality (Line 2)</Input.Label>
          <Input.Field
            placeholder="e.g. Opposite City Park, Koramangala"
            maxLength={200}
            {...register('currentAddress.addressLine2')}
          />
        </Input>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
          <Input isRequired hasError={Boolean(errors.currentAddress?.pinCode)}>
            <Input.Label>6-Digit PIN Code</Input.Label>
            <Input.Field
              placeholder="e.g. 560034"
              maxLength={6}
              rightElement={
                isLoadingCurrentPin && (
                  <span className="flex items-center text-lendswift-blue-600">
                    <Loader2 className="w-4 h-4 animate-spin" />
                  </span>
                )
              }
              {...register('currentAddress.pinCode', {
                onChange: (e) => {
                  const clean = e.target.value.replace(/\D/g, '');
                  setValue('currentAddress.pinCode', clean);
                  if (clean.length === 6) handleCurrentPinBlur();
                },
              })}
              onBlur={handleCurrentPinBlur}
            />
            <Input.HelpText>Auto-fills City & State from Indian Post directory</Input.HelpText>
            <Input.Error message={errors.currentAddress?.pinCode?.message} />
          </Input>

          <Input isRequired hasError={Boolean(errors.currentAddress?.city)}>
            <Input.Label>City / District</Input.Label>
            <Input.Field placeholder="City name" {...register('currentAddress.city')} />
            <Input.Error message={errors.currentAddress?.city?.message} />
          </Input>

          <Input isRequired hasError={Boolean(errors.currentAddress?.state)}>
            <Input.Label>State / Union Territory</Input.Label>
            <Input.Field placeholder="State name" {...register('currentAddress.state')} />
            <Input.Error message={errors.currentAddress?.state?.message} />
          </Input>
        </div>

        {/* State Mismatch Warning */}
        {isStateMismatch && (
          <div className="flex items-center gap-2 p-3 bg-lendswift-amber-50 rounded-xl border border-lendswift-amber-200 text-xs text-lendswift-amber-800">
            <AlertTriangle className="w-4 h-4 shrink-0 text-lendswift-amber-600" />
            <span>
              <strong>Discrepancy Detected:</strong> The entered state ({currentState}) differs from the official state associated with PIN code {currentPin} ({pinDerivedState}). Please ensure this is intentional.
            </span>
          </div>
        )}
      </div>

      {/* 2. Residence Ownership & Vintage */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start pt-4 border-t border-slate-100">
        <Select
          label="Residence Ownership Type"
          isRequired
          placeholder="Select ownership status"
          options={[
            { value: 'owned', label: 'Owned (Self or Family)' },
            { value: 'rented', label: 'Rented Accommodation' },
            { value: 'company', label: 'Company Provided Quarters' },
            { value: 'family', label: 'Living with Parents' },
          ]}
          value={residenceType || ''}
          onChange={(e) => setValue('residenceType', e.target.value as ResidenceType, { shouldValidate: true })}
          error={errors.residenceType?.message}
        />

        <Input isRequired hasError={Boolean(errors.yearsAtCurrentAddress)}>
          <Input.Label>Years Residing at Current Address</Input.Label>
          <Input.Field
            type="number"
            min={0}
            max={50}
            placeholder="e.g. 3"
            {...register('yearsAtCurrentAddress', { valueAsNumber: true })}
          />
          <Input.HelpText>If less than 1 year, previous address history will be required</Input.HelpText>
          <Input.Error message={errors.yearsAtCurrentAddress?.message} />
        </Input>
      </div>

      {/* Conditional Rent Amount Field */}
      {residenceType === 'rented' && (
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
          <CurrencyInput
            label="Monthly Rent Paid"
            isRequired
            placeholder="e.g. 20,000"
            value={watch('monthlyRent') || 0}
            onChange={(val) => setValue('monthlyRent', val, { shouldValidate: true })}
            error={errors.monthlyRent?.message}
            helpText="Used for transparent credit affordability and net disposable income calculation"
          />
        </div>
      )}

      {/* Conditional Previous Address (if < 1 year) */}
      {yearsAtCurrentAddress !== undefined && yearsAtCurrentAddress < 1 && (
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
            Previous Address Details (Required since current residence is &lt; 1 year)
          </h4>

          <Input isRequired hasError={Boolean(errors.previousAddress?.addressLine1)}>
            <Input.Label>Previous Address Line 1</Input.Label>
            <Input.Field
              placeholder="Previous street/building"
              {...register('previousAddress.addressLine1')}
            />
            <Input.Error message={errors.previousAddress?.addressLine1?.message} />
          </Input>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input hasError={Boolean(errors.previousAddress?.pinCode)}>
              <Input.Label optional>Previous PIN Code</Input.Label>
              <Input.Field
                maxLength={6}
                placeholder="PIN"
                {...register('previousAddress.pinCode')}
              />
            </Input>
            <Input isRequired hasError={Boolean(errors.previousAddress?.city)}>
              <Input.Label>Previous City</Input.Label>
              <Input.Field placeholder="City" {...register('previousAddress.city')} />
              <Input.Error message={errors.previousAddress?.city?.message} />
            </Input>
            <Input hasError={Boolean(errors.previousAddress?.state)}>
              <Input.Label optional>Previous State</Input.Label>
              <Input.Field placeholder="State" {...register('previousAddress.state')} />
            </Input>
          </div>
        </div>
      )}

      {/* 3. Permanent Address Checkbox and Conditional Block */}
      <div className="pt-4 border-t border-slate-100 space-y-4">
        <Checkbox
          label="Permanent address is same as current residential address"
          description="Check this box if your permanent address in Aadhaar matches your current address above."
          checked={sameAsPermanentAddress !== false}
          onChange={(e) => {
            const isChecked = e.target.checked;
            setValue('sameAsPermanentAddress', isChecked, { shouldValidate: true });
            if (isChecked) {
              // Copy current to permanent
              const curr = watch('currentAddress');
              setValue('permanentAddress', { ...curr });
            }
          }}
        />

        {sameAsPermanentAddress === false && (
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
              Permanent Residence Address (As per official records)
            </h4>

            <Input isRequired hasError={Boolean(errors.permanentAddress?.addressLine1)}>
              <Input.Label>Permanent Address Line 1</Input.Label>
              <Input.Field
                placeholder="House no., street, locality"
                maxLength={200}
                {...register('permanentAddress.addressLine1')}
              />
              <Input.Error message={errors.permanentAddress?.addressLine1?.message} />
            </Input>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input isRequired hasError={Boolean(errors.permanentAddress?.pinCode)}>
                <Input.Label>Permanent PIN Code</Input.Label>
                <Input.Field
                  maxLength={6}
                  placeholder="PIN"
                  rightElement={
                    isLoadingPermPin && (
                      <span className="flex items-center text-lendswift-blue-600">
                        <Loader2 className="w-4 h-4 animate-spin" />
                      </span>
                    )
                  }
                  {...register('permanentAddress.pinCode', {
                    onChange: (e) => {
                      const clean = e.target.value.replace(/\D/g, '');
                      setValue('permanentAddress.pinCode', clean);
                      if (clean.length === 6) handlePermanentPinBlur(clean);
                    },
                  })}
                  onBlur={(e) => handlePermanentPinBlur(e.target.value)}
                />
                <Input.Error message={errors.permanentAddress?.pinCode?.message} />
              </Input>

              <Input isRequired hasError={Boolean(errors.permanentAddress?.city)}>
                <Input.Label>Permanent City</Input.Label>
                <Input.Field placeholder="City" {...register('permanentAddress.city')} />
                <Input.Error message={errors.permanentAddress?.city?.message} />
              </Input>

              <Input isRequired hasError={Boolean(errors.permanentAddress?.state)}>
                <Input.Label>Permanent State</Input.Label>
                <Input.Field placeholder="State" {...register('permanentAddress.state')} />
                <Input.Error message={errors.permanentAddress?.state?.message} />
              </Input>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
