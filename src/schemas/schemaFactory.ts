import { z } from 'zod';
import { LoanFormData } from '../types/loan';
import {
  validatePAN,
  validateAadhaarVerhoeff,
  validateDOB,
  validateGSTIN,
  calculateAge,
} from '../utils/validators';

/**
 * STEP 1: Loan Type & Basic Information Schema
 */
export function getStep1Schema(currentDOB?: string) {
  return z
    .object({
      loanType: z.enum(['personal', 'home', 'business'], {
        errorMap: () => ({ message: 'Please select a loan product' }),
      }),
      loanAmount: z
        .number({ invalid_type_error: 'Loan amount is required' })
        .min(50000, 'Minimum loan amount is ₹ 50,000'),
      loanTenureMonths: z
        .number({ invalid_type_error: 'Please select a loan tenure' })
        .min(12, 'Minimum tenure is 12 months'),
      loanPurpose: z.string().min(1, 'Please select a loan purpose'),
      referralCode: z
        .string()
        .optional()
        .refine(
          (code) => !code || /^[a-zA-Z0-9]{6,10}$/.test(code),
          'Referral code must be 6-10 alphanumeric characters'
        ),
    })
    .superRefine((data, ctx) => {
      // Max amount limits by product
      if (data.loanType === 'personal' && data.loanAmount > 1000000) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['loanAmount'],
          message: 'Personal Loan amount cannot exceed ₹ 10 Lakh (₹ 10,00,000)',
        });
      } else if (data.loanType === 'home' && data.loanAmount > 10000000) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['loanAmount'],
          message: 'Home Loan amount cannot exceed ₹ 1 Crore (₹ 1,00,00,000)',
        });
      } else if (data.loanType === 'business' && data.loanAmount > 5000000) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['loanAmount'],
          message: 'Business Loan amount cannot exceed ₹ 50 Lakh (₹ 50,00,000)',
        });
      }

      // Tenure limits by product
      if (data.loanType === 'personal' && data.loanTenureMonths > 60) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['loanTenureMonths'],
          message: 'Personal Loan tenure cannot exceed 60 months (5 years)',
        });
      } else if (data.loanType === 'business' && data.loanTenureMonths > 120) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['loanTenureMonths'],
          message: 'Business Loan tenure cannot exceed 120 months (10 years)',
        });
      } else if (data.loanType === 'home' && data.loanTenureMonths > 360) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['loanTenureMonths'],
          message: 'Home Loan tenure cannot exceed 360 months (30 years)',
        });
      }

      // Cross-step dependency: Age + loan tenure must not exceed 65 years
      if (currentDOB) {
        const age = calculateAge(currentDOB);
        const tenureYears = data.loanTenureMonths / 12;
        if (age + tenureYears > 65) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['loanTenureMonths'],
            message: `Based on your age (${age} years), total age at loan maturity cannot exceed 65 years. Maximum allowable tenure is ${Math.max(
              12,
              Math.floor((65 - age) * 12)
            )} months.`,
          });
        }
      }
    });
}

/**
 * STEP 2: Personal Information Schema
 */
export const step2Schema = z
  .object({
    fullName: z
      .string()
      .min(2, 'Full name must be at least 2 characters')
      .max(100, 'Full name cannot exceed 100 characters')
      .regex(/^[a-zA-Z\s.]+$/, 'Name can only contain alphabets, spaces, and periods (as on PAN card)'),
    dateOfBirth: z
      .string()
      .min(1, 'Date of birth is required')
      .refine((dob) => validateDOB(dob).isValid, (dob) => ({
        message: validateDOB(dob).error || 'Applicant must be between 21 and 65 years old',
      })),
    gender: z.enum(['male', 'female', 'other'], {
      errorMap: () => ({ message: 'Please select gender' }),
    }),
    maritalStatus: z.enum(['single', 'married', 'divorced', 'widowed'], {
      errorMap: () => ({ message: 'Please select marital status' }),
    }),
    fathersName: z
      .string()
      .min(2, "Father's name must be at least 2 characters")
      .max(100)
      .regex(/^[a-zA-Z\s.]+$/, "Father's name can only contain alphabets, spaces, and periods"),
    mothersName: z
      .string()
      .min(2, "Mother's name must be at least 2 characters")
      .max(100)
      .regex(/^[a-zA-Z\s.]+$/, "Mother's name can only contain alphabets, spaces, and periods"),
    email: z
      .string()
      .min(1, 'Email address is required')
      .email('Please enter a valid email address (e.g. name@example.com)'),
    mobileNumber: z
      .string()
      .min(1, 'Mobile number is required')
      .regex(/^[6-9]\d{9}$/, 'Mobile number must be exactly 10 digits starting with 6, 7, 8, or 9'),
    alternateMobile: z
      .string()
      .optional()
      .refine(
        (val) => !val || /^[6-9]\d{9}$/.test(val),
        'Alternate mobile must be 10 digits starting with 6-9'
      ),
  })
  .refine(
    (data) => !data.alternateMobile || data.alternateMobile !== data.mobileNumber,
    {
      message: 'Alternate mobile number must differ from primary mobile number',
      path: ['alternateMobile'],
    }
  );

/**
 * STEP 3: Identity Verification (KYC) Schema
 */
export function getStep3Schema(loanType: string = 'personal', loanAmount: number = 0) {
  return z
    .object({
      panNumber: z
        .string()
        .min(1, 'PAN number is required')
        .superRefine((pan, ctx) => {
          const res = validatePAN(pan, loanType as any);
          if (!res.isValid) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: res.error || 'Invalid PAN number',
            });
          }
        }),
      aadhaarNumber: z
        .string()
        .min(1, 'Aadhaar number is required')
        .superRefine((aadhaar, ctx) => {
          const res = validateAadhaarVerhoeff(aadhaar);
          if (!res.isValid) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: res.error || 'Invalid Aadhaar number',
            });
          }
        }),
      aadhaarConsent: z.literal(true, {
        errorMap: () => ({
          message: 'Explicit consent for simulated Aadhaar verification is mandatory under UIDAI guidelines',
        }),
      }),
      voterId: z
        .string()
        .optional()
        .refine(
          (val) => !val || /^[A-Z]{3}[0-9]{7}$/.test(val.toUpperCase()),
          'Voter ID must be 3 uppercase letters followed by 7 digits (e.g. ABC1234567)'
        ),
      passportNumber: z
        .string()
        .optional()
        .refine(
          (val) => !val || /^[A-Z]{1}[0-9]{7}$/.test(val.toUpperCase()),
          'Passport must be 1 letter followed by 7 digits (e.g. A1234567)'
        ),
    })
    .superRefine((data, ctx) => {
      // If Home loan > 50L, passport is recommended/required as high-value KYC
      if (loanType === 'home' && loanAmount > 5000000 && !data.passportNumber) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['passportNumber'],
          message: 'Passport number is required for high-value Home Loans (> ₹ 50 Lakh)',
        });
      }
    });
}

/**
 * STEP 4: Address Information Schema
 */
export const step4Schema = z
  .object({
    currentAddress: z.object({
      addressLine1: z
        .string()
        .min(5, 'Address Line 1 must be between 5 and 200 characters')
        .max(200),
      addressLine2: z.string().optional(),
      pinCode: z
        .string()
        .regex(/^\d{6}$/, 'PIN code must be exactly 6 digits'),
      city: z.string().min(2, 'City is required'),
      state: z.string().min(2, 'State is required'),
      postOffice: z.string().optional(),
    }),
    residenceType: z.enum(['owned', 'rented', 'company', 'family'], {
      errorMap: () => ({ message: 'Please select residence type' }),
    }),
    monthlyRent: z.number().optional(),
    yearsAtCurrentAddress: z
      .number({ invalid_type_error: 'Years at current address is required' })
      .min(0, 'Cannot be negative')
      .max(50, 'Cannot exceed 50 years'),
    previousAddress: z
      .object({
        addressLine1: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        pinCode: z.string().optional(),
      })
      .optional(),
    sameAsPermanentAddress: z.boolean(),
    permanentAddress: z
      .object({
        addressLine1: z.string().optional(),
        addressLine2: z.string().optional(),
        pinCode: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
      })
      .optional(),
  })
  .superRefine((data, ctx) => {
    // If rented, monthlyRent is required and min 1000
    if (data.residenceType === 'rented') {
      if (!data.monthlyRent || data.monthlyRent < 1000) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['monthlyRent'],
          message: 'Monthly rent amount is required for rented accommodations (min ₹ 1,000)',
        });
      }
    }

    // If years at current address < 1, previous address is mandatory
    if (data.yearsAtCurrentAddress < 1) {
      if (!data.previousAddress?.addressLine1 || data.previousAddress.addressLine1.length < 5) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['previousAddress', 'addressLine1'],
          message: 'Previous address is required when living at current address for less than 1 year',
        });
      }
      if (!data.previousAddress?.city) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['previousAddress', 'city'],
          message: 'Previous city is required',
        });
      }
    }

    // If not same as permanent address, permanent address is mandatory
    if (!data.sameAsPermanentAddress) {
      if (!data.permanentAddress?.addressLine1 || data.permanentAddress.addressLine1.length < 5) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['permanentAddress', 'addressLine1'],
          message: 'Permanent Address Line 1 is required (min 5 characters)',
        });
      }
      if (!data.permanentAddress?.pinCode || !/^\d{6}$/.test(data.permanentAddress.pinCode)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['permanentAddress', 'pinCode'],
          message: 'Valid 6-digit permanent PIN code is required',
        });
      }
      if (!data.permanentAddress?.city) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['permanentAddress', 'city'],
          message: 'Permanent city is required',
        });
      }
      if (!data.permanentAddress?.state) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['permanentAddress', 'state'],
          message: 'Permanent state is required',
        });
      }
    }
  });

/**
 * STEP 5: Employment & Income Schema
 */
export function getStep5Schema(loanType: string = 'personal') {
  return z
    .object({
      employmentType: z.enum(['salaried', 'self_employed', 'business_owner'], {
        errorMap: () => ({ message: 'Please select your employment type' }),
      }),
      // Salaried fields
      companyName: z.string().optional(),
      designation: z.string().optional(),
      monthlyNetSalary: z.number().optional(),
      totalWorkExperienceYears: z.number().optional(),

      // Self-Employed fields
      professionName: z.string().optional(),
      professionType: z.string().optional(),
      annualTurnover: z.number().optional(),
      yearsInPractice: z.number().optional(),
      selfEmployedMonthlyIncome: z.number().optional(),

      // Business Owner fields
      businessName: z.string().optional(),
      businessType: z.string().optional(),
      businessAnnualTurnover: z.number().optional(),
      yearsInBusiness: z.number().optional(),
      businessMonthlyNetProfit: z.number().optional(),
      gstNumber: z.string().optional(),
    })
    .superRefine((data, ctx) => {
      // Cross-step dependency: Business Loan requires Business Owner or Self-Employed
      if (loanType === 'business' && data.employmentType === 'salaried') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['employmentType'],
          message: 'Business Loan requires applicant to be a Business Owner or Self-Employed Professional',
        });
      }

      if (data.employmentType === 'salaried') {
        if (!data.companyName || data.companyName.trim().length < 2) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['companyName'],
            message: 'Company name is required (min 2 characters)',
          });
        }
        if (!data.designation || data.designation.trim().length < 2) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['designation'],
            message: 'Designation is required',
          });
        }
        if (!data.monthlyNetSalary || data.monthlyNetSalary < 15000) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['monthlyNetSalary'],
            message: 'Monthly net salary must be at least ₹ 15,000',
          });
        }
        if (data.totalWorkExperienceYears === undefined || data.totalWorkExperienceYears < 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['totalWorkExperienceYears'],
            message: 'Total experience is required',
          });
        }
      } else if (data.employmentType === 'self_employed') {
        if (!data.professionName || data.professionName.trim().length < 2) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['professionName'],
            message: 'Practice / firm name is required',
          });
        }
        if (!data.professionType) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['professionType'],
            message: 'Profession category is required',
          });
        }
        if (!data.annualTurnover || data.annualTurnover < 300000) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['annualTurnover'],
            message: 'Annual turnover must be at least ₹ 3 Lakh (₹ 3,00,000)',
          });
        }
        if (!data.yearsInPractice || data.yearsInPractice < 2) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['yearsInPractice'],
            message: 'Minimum 2 years in practice / profession required',
          });
        }
        if (!data.selfEmployedMonthlyIncome || data.selfEmployedMonthlyIncome < 15000) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['selfEmployedMonthlyIncome'],
            message: 'Average monthly income must be at least ₹ 15,000',
          });
        }
      } else if (data.employmentType === 'business_owner') {
        if (!data.businessName || data.businessName.trim().length < 2) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['businessName'],
            message: 'Registered business name is required',
          });
        }
        if (!data.businessType) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['businessType'],
            message: 'Business legal structure is required',
          });
        }
        if (!data.businessAnnualTurnover || data.businessAnnualTurnover < 300000) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['businessAnnualTurnover'],
            message: 'Annual business turnover must be at least ₹ 3 Lakh',
          });
        }
        if (!data.yearsInBusiness || data.yearsInBusiness < 2) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['yearsInBusiness'],
            message: 'Minimum 2 years of business vintage required',
          });
        }
        if (!data.businessMonthlyNetProfit || data.businessMonthlyNetProfit < 15000) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['businessMonthlyNetProfit'],
            message: 'Monthly net profit must be at least ₹ 15,000',
          });
        }
        if (data.gstNumber) {
          const gstRes = validateGSTIN(data.gstNumber);
          if (!gstRes.isValid) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ['gstNumber'],
              message: gstRes.error || 'Invalid GST number format',
            });
          }
        } else if (loanType === 'business') {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['gstNumber'],
            message: '15-character GST number is mandatory for Business Loan',
          });
        }
      }
    });
}

/**
 * STEP 6: Co-Applicant Schema (Conditional)
 */
export const step6Schema = z
  .object({
    coApplicantName: z
      .string()
      .min(2, 'Co-applicant name must be at least 2 characters')
      .max(100)
      .regex(/^[a-zA-Z\s.]+$/, 'Name can only contain alphabets, spaces, and periods'),
    coApplicantRelationship: z.enum(['spouse', 'parent', 'sibling', 'business_partner'], {
      errorMap: () => ({ message: 'Please select relationship with primary applicant' }),
    }),
    coApplicantPan: z
      .string()
      .min(1, 'Co-applicant PAN is required')
      .superRefine((pan, ctx) => {
        const res = validatePAN(pan, 'personal');
        if (!res.isValid) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: res.error || 'Invalid co-applicant PAN',
          });
        }
      }),
    coApplicantMonthlyIncome: z
      .number({ invalid_type_error: 'Co-applicant income is required' })
      .min(10000, 'Co-applicant monthly income must be at least ₹ 10,000'),
    coApplicantConsent: z.literal(true, {
      errorMap: () => ({
        message: 'Co-applicant consent and acknowledgment is required to proceed',
      }),
    }),
  });

/**
 * STEP 7: Document Upload & Signature Schema
 */
export function getStep7Schema(
  loanType: string,
  employmentType: string,
  panVerified: boolean = false
) {
  return z
    .object({
      documents: z.array(z.any()),
      applicantSignature: z
        .string()
        .min(1, 'Digital signature is required before proceeding to review'),
    })
    .superRefine((data, ctx) => {
      const docTypes = new Set(data.documents.map((d: any) => d.docType));

      // Aadhaar Card required for all
      if (!docTypes.has('aadhaar_card')) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['documents'],
          message: 'Aadhaar Card (Front + Back) document is required',
        });
      }

      // PAN Card required for all UNLESS PAN was verified via simulated NSDL in Step 3
      if (!panVerified && !docTypes.has('pan_card')) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['documents'],
          message: 'PAN Card copy is required (or complete instant PAN verification in Step 3)',
        });
      }

      // Bank Statements required for all
      if (!docTypes.has('bank_statements')) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['documents'],
          message: 'Bank statements (Last 6 months) are required',
        });
      }

      // Salaried needs salary slips
      if (employmentType === 'salaried' && !docTypes.has('salary_slips')) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['documents'],
          message: 'Salary slips (Last 3 months) are required for salaried applicants',
        });
      }

      // Self-employed & Business Owner need ITR
      if (
        (employmentType === 'self_employed' || employmentType === 'business_owner') &&
        !docTypes.has('itr_returns')
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['documents'],
          message: 'ITR acknowledgement (Last 2 years) is required for self-employed/business applicants',
        });
      }

      // Home Loan needs property documents
      if (loanType === 'home' && !docTypes.has('property_documents')) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['documents'],
          message: 'Property ownership/sale agreement documents are required for Home Loan',
        });
      }

      // Business Loan needs business registration certificate
      if (loanType === 'business' && !docTypes.has('business_registration')) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['documents'],
          message: 'Business registration certificate is required for Business Loan',
        });
      }
    });
}

/**
 * STEP 8: Final Review & RBI Consents Schema
 */
export function getStep8Schema(isHighDebtBurden: boolean = false) {
  return z
    .object({
      consentInformationAccurate: z.literal(true, {
        errorMap: () => ({
          message: 'You must confirm that all information provided is accurate and authentic',
        }),
      }),
      consentCreditBureauCheck: z.literal(true, {
        errorMap: () => ({
          message: 'Explicit authorisation for CIBIL/Equifax credit score inquiry is mandatory',
        }),
      }),
      consentTermsConditions: z.literal(true, {
        errorMap: () => ({
          message: 'You must accept the LendSwift Lending Terms and Key Fact Statement (KFS)',
        }),
      }),
      consentCommunications: z.literal(true, {
        errorMap: () => ({
          message: 'Consent to receive application communications is required',
        }),
      }),
      consentHighDebtBurdenAcknowledged: z.boolean().optional(),
    })
    .superRefine((data, ctx) => {
      if (isHighDebtBurden && !data.consentHighDebtBurdenAcknowledged) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['consentHighDebtBurdenAcknowledged'],
          message:
            'Estimated EMI exceeds 50% of monthly income. You must acknowledge the high debt burden to proceed.',
        });
      }
    });
}

/**
 * Evaluates whether Step 6 (Co-Applicant) is required based on cross-step rules
 */
export function isStep6Required(loanType: string, loanAmount: number): boolean {
  if (loanType === 'home') return true;
  // Personal Loan: exceeds 5,00,000 (500001+)
  if (loanType === 'personal' && loanAmount > 500000) return true;
  // Business Loan: exceeds 20,00,000 (2000001+)
  if (loanType === 'business' && loanAmount > 2000000) return true;
  return false;
}

/**
 * Dynamic Schema Factory returning the appropriate step schema
 */
export function getSchemaForStep(stepIndex: number, formData: LoanFormData) {
  switch (stepIndex) {
    case 0:
      return getStep1Schema(formData.dateOfBirth);
    case 1:
      return step2Schema;
    case 2:
      return getStep3Schema(formData.loanType, formData.loanAmount);
    case 3:
      return step4Schema;
    case 4:
      return getStep5Schema(formData.loanType);
    case 5:
      return step6Schema;
    case 6:
      return getStep7Schema(formData.loanType, formData.employmentType, formData.panVerified);
    case 7: {
      const applicantIncome =
        formData.employmentType === 'salaried'
          ? formData.monthlyNetSalary || 0
          : formData.employmentType === 'self_employed'
          ? formData.selfEmployedMonthlyIncome || 0
          : formData.businessMonthlyNetProfit || 0;
      const coAppIncome = formData.coApplicantMonthlyIncome || 0;
      const totalIncome = applicantIncome + coAppIncome;
      const isHighDebt = totalIncome > 0 ? (formData.loanAmount / 12 / totalIncome) > 0.5 : false;
      return getStep8Schema(isHighDebt);
    }
    default:
      return z.object({});
  }
}
