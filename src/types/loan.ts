export type LoanType = 'personal' | 'home' | 'business';

export type Gender = 'male' | 'female' | 'other';
export type MaritalStatus = 'single' | 'married' | 'divorced' | 'widowed';

export type ResidenceType = 'owned' | 'rented' | 'company' | 'family';

export type EmploymentType = 'salaried' | 'self_employed' | 'business_owner';

export type CoApplicantRelationship = 'spouse' | 'parent' | 'sibling' | 'business_partner';

export interface AddressInfo {
  addressLine1: string;
  addressLine2?: string;
  pinCode: string;
  city: string;
  state: string;
  postOffice?: string;
}

export interface UploadedDocument {
  id: string;
  docType: string;
  fileName: string;
  fileSize: number;
  compressedSize?: number;
  mimeType: string;
  dataUrl?: string; // Base64 for demo persistence
  uploadedAt: string;
  verified?: boolean;
}

export interface LoanFormData {
  // Step 1: Loan Type & Basic Info
  loanType: LoanType;
  loanAmount: number;
  loanTenureMonths: number;
  loanPurpose: string;
  referralCode?: string;

  // Step 2: Personal Information
  fullName: string;
  dateOfBirth: string; // YYYY-MM-DD
  gender: Gender;
  maritalStatus: MaritalStatus;
  fathersName: string;
  mothersName: string;
  email: string;
  mobileNumber: string;
  alternateMobile?: string;
  emailVerified?: boolean;
  mobileVerified?: boolean;

  // Step 3: Identity Verification (KYC)
  panNumber: string;
  panVerified?: boolean;
  aadhaarNumber: string;
  aadhaarVerified?: boolean;
  aadhaarConsent: boolean;
  voterId?: string;
  passportNumber?: string;

  // Step 4: Address Information
  currentAddress: AddressInfo;
  residenceType: ResidenceType;
  monthlyRent?: number;
  yearsAtCurrentAddress: number;
  previousAddress?: AddressInfo;
  sameAsPermanentAddress: boolean;
  permanentAddress?: AddressInfo;

  // Step 5: Employment & Income Details
  employmentType: EmploymentType;
  
  // Salaried
  companyName?: string;
  designation?: string;
  monthlyNetSalary?: number;
  totalWorkExperienceYears?: number;

  // Self-Employed
  professionName?: string;
  professionType?: string;
  annualTurnover?: number;
  yearsInPractice?: number;
  selfEmployedMonthlyIncome?: number;
  officeAddress?: AddressInfo;

  // Business Owner
  businessName?: string;
  businessType?: string;
  businessAnnualTurnover?: number;
  yearsInBusiness?: number;
  businessMonthlyNetProfit?: number;
  gstNumber?: string;
  businessOfficeAddress?: AddressInfo;

  // Step 6: Co-Applicant & Guarantor (Conditional)
  hasCoApplicant?: boolean;
  coApplicantName?: string;
  coApplicantRelationship?: CoApplicantRelationship;
  coApplicantPan?: string;
  coApplicantPanVerified?: boolean;
  coApplicantMonthlyIncome?: number;
  coApplicantConsent?: boolean;
  coApplicantSignature?: string;

  // Step 7: Documents & Signature
  documents: UploadedDocument[];
  applicantSignature?: string; // Base64 PNG

  // Step 8: Review & Consents
  consentInformationAccurate: boolean;
  consentCreditBureauCheck: boolean;
  consentTermsConditions: boolean;
  consentCommunications: boolean;
  consentHighDebtBurdenAcknowledged?: boolean;

  // Metadata
  currentStepIndex: number;
  completedStepIndices: number[];
  referenceNumber?: string;
  submissionTimestamp?: string;
}

export interface DraftMetadata {
  version: string;
  timestamp: string;
  step: number;
  loanType: LoanType;
}

export interface EMICalculationResult {
  principal: number;
  annualInterestRate: number;
  monthlyInterestRate: number;
  tenureMonths: number;
  monthlyEmi: number;
  totalInterest: number;
  processingFee: number;
  totalAmountPayable: number;
  emiToIncomeRatio: number;
  isHighDebtBurden: boolean;
  maxAffordableEmi: number;
}
