import { useState, useCallback } from 'react';
import { validatePAN, validateAadhaarVerhoeff } from '../utils/validators';
import { LoanType } from '../types/loan';

export type VerificationType = 'pan' | 'aadhaar' | 'mobile' | 'email';

export interface VerificationState {
  isVerifying: boolean;
  isVerified: boolean;
  error: string | null;
  message?: string;
}

export function useVerification() {
  const [states, setStates] = useState<Record<string, VerificationState>>({});

  const verifyField = useCallback(
    async (
      fieldKey: string,
      type: VerificationType,
      value: string,
      loanType: LoanType = 'personal'
    ): Promise<boolean> => {
      if (!value || !value.trim()) {
        setStates((prev) => ({
          ...prev,
          [fieldKey]: {
            isVerifying: false,
            isVerified: false,
            error: 'Value is required for verification',
          },
        }));
        return false;
      }

      // Initial synchronous format verification
      let formatValid = false;
      let formatError: string | undefined;

      if (type === 'pan') {
        const res = validatePAN(value, loanType);
        formatValid = res.isValid;
        formatError = res.error;
      } else if (type === 'aadhaar') {
        const res = validateAadhaarVerhoeff(value);
        formatValid = res.isValid;
        formatError = res.error;
      } else if (type === 'mobile') {
        formatValid = /^[6-9]\d{9}$/.test(value.trim());
        formatError = formatValid ? undefined : 'Must be a 10-digit mobile number starting with 6-9';
      } else if (type === 'email') {
        formatValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
        formatError = formatValid ? undefined : 'Must be a valid email address';
      }

      if (!formatValid) {
        setStates((prev) => ({
          ...prev,
          [fieldKey]: {
            isVerifying: false,
            isVerified: false,
            error: formatError || 'Invalid format',
          },
        }));
        return false;
      }

      // Format is valid -> Trigger simulated 1.5s API verification call
      setStates((prev) => ({
        ...prev,
        [fieldKey]: { isVerifying: true, isVerified: false, error: null },
      }));

      await new Promise((resolve) => setTimeout(resolve, 1500));

      setStates((prev) => ({
        ...prev,
        [fieldKey]: {
          isVerifying: false,
          isVerified: true,
          error: null,
          message:
            type === 'pan'
              ? 'NSDL Records Match: Active & Valid'
              : type === 'aadhaar'
              ? 'UIDAI Verhoeff Checksum Verified'
              : type === 'mobile'
              ? 'OTP Verified'
              : 'Email Verified',
        },
      }));

      return true;
    },
    []
  );

  const resetFieldVerification = useCallback((fieldKey: string) => {
    setStates((prev) => ({
      ...prev,
      [fieldKey]: { isVerifying: false, isVerified: false, error: null },
    }));
  }, []);

  const setManualVerified = useCallback((fieldKey: string, isVerified: boolean) => {
    setStates((prev) => ({
      ...prev,
      [fieldKey]: { isVerifying: false, isVerified, error: null },
    }));
  }, []);

  return {
    states,
    verifyField,
    resetFieldVerification,
    setManualVerified,
  };
}
