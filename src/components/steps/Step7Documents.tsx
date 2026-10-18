import React, { useMemo } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FileCheck, CheckCircle2, Clock, ShieldCheck } from 'lucide-react';
import { LoanFormData, UploadedDocument } from '../../types/loan';
import { FileUpload } from '../upload/FileUpload';
import { SignatureCanvas } from '../signature/SignatureCanvas';

interface Step7Props {
  form: UseFormReturn<LoanFormData>;
}

export const Step7Documents: React.FC<Step7Props> = ({ form }) => {
  const {
    watch,
    setValue,
    formState: { errors },
  } = form;

  const loanType = watch('loanType') || 'personal';
  const employmentType = watch('employmentType') || 'salaried';
  const panVerified = watch('panVerified');
  const documents = watch('documents') || [];
  const applicantSignature = watch('applicantSignature');

  // Compute required document specifications based on loan type & employment
  const requiredDocSpecs = useMemo(() => {
    const list = [
      {
        type: 'aadhaar_card',
        title: 'Aadhaar Card (Front & Back)',
        description: 'Clear photograph or PDF of official Aadhaar card',
        formats: ['application/pdf', 'image/jpeg', 'image/png'],
        maxSize: 5 * 1024 * 1024,
        isRequired: true,
      },
      {
        type: 'pan_card',
        title: 'PAN Card Copy',
        description: panVerified
          ? 'PAN already verified with NSDL in Step 3 (Optional upload)'
          : 'Scanned copy of your Physical PAN card',
        formats: ['application/pdf', 'image/jpeg', 'image/png'],
        maxSize: 5 * 1024 * 1024,
        isRequired: !panVerified,
      },
      {
        type: 'bank_statements',
        title: 'Bank Account Statements (Last 6 Months)',
        description: 'Official e-statements with IFSC, name, and salary/income credits',
        formats: ['application/pdf'],
        maxSize: 10 * 1024 * 1024,
        isRequired: true,
      },
    ];

    if (employmentType === 'salaried') {
      list.push({
        type: 'salary_slips',
        title: 'Salary Slips (Last 3 Months)',
        description: 'Monthly pay slips issued by your employer',
        formats: ['application/pdf'],
        maxSize: 5 * 1024 * 1024,
        isRequired: true,
      });
    }

    if (employmentType === 'self_employed' || employmentType === 'business_owner') {
      list.push({
        type: 'itr_returns',
        title: 'Income Tax Returns (ITR-V for Last 2 Years)',
        description: 'Computation of income and tax acknowledgement forms',
        formats: ['application/pdf'],
        maxSize: 5 * 1024 * 1024,
        isRequired: true,
      });
    }

    if (loanType === 'home') {
      list.push({
        type: 'property_documents',
        title: 'Property Allotment / Sale Agreement',
        description: 'Title deed, draft sale deed, or developer allotment letter',
        formats: ['application/pdf'],
        maxSize: 10 * 1024 * 1024,
        isRequired: true,
      });
    }

    if (loanType === 'business') {
      list.push({
        type: 'business_registration',
        title: 'Business Registration Certificate / Udyam MSME',
        description: 'Certificate of Incorporation, Partnership Deed, or MSME registration',
        formats: ['application/pdf'],
        maxSize: 5 * 1024 * 1024,
        isRequired: true,
      });
      list.push({
        type: 'gst_returns',
        title: 'GST Returns (GSTR-3B for Last 4 Quarters)',
        description: 'Quarterly filed GSTR-3B statements',
        formats: ['application/pdf'],
        maxSize: 5 * 1024 * 1024,
        isRequired: false,
      });
    }

    list.push({
      type: 'photograph',
      title: 'Recent Passport Size Photograph',
      description: 'Frontal portrait with clear neutral background',
      formats: ['image/jpeg', 'image/png'],
      maxSize: 2 * 1024 * 1024,
      isRequired: false,
    });

    return list;
  }, [loanType, employmentType, panVerified]);

  const handleFilesChange = (newDocs: UploadedDocument[]) => {
    setValue('documents', newDocs, { shouldValidate: true });
  };

  // Checklist counts
  const uploadedDocTypes = new Set(documents.map((d) => d.docType));
  const mandatoryCount = requiredDocSpecs.filter((d) => d.isRequired).length;
  const uploadedMandatoryCount = requiredDocSpecs.filter(
    (d) => d.isRequired && uploadedDocTypes.has(d.type)
  ).length;

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-100 pb-4">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          Document Upload & Digital E-Signature
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Upload required financial and identification documents with automatic client-side compression, followed by your legal digital signature.
        </p>
      </div>

      {/* Document Checklist Progress Card */}
      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-lendswift-blue-600" />
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
              Document Checklist ({uploadedMandatoryCount}/{mandatoryCount} Required Uploaded)
            </h3>
          </div>
          <span
            className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
              uploadedMandatoryCount === mandatoryCount
                ? 'bg-lendswift-green-100 text-lendswift-green-800'
                : 'bg-lendswift-amber-100 text-lendswift-amber-800'
            }`}
          >
            {uploadedMandatoryCount === mandatoryCount ? 'All Required Uploaded' : 'Action Required'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs">
          {requiredDocSpecs.map((spec) => {
            const isUploaded = uploadedDocTypes.has(spec.type);
            return (
              <div
                key={spec.type}
                className={`flex items-center justify-between p-2 rounded-lg border transition-colors ${
                  isUploaded
                    ? 'bg-white border-lendswift-green-200 text-lendswift-green-900'
                    : 'bg-white/60 border-slate-200 text-slate-600'
                }`}
              >
                <span className="truncate pr-2 font-medium">{spec.title.split('(')[0].trim()}</span>
                {isUploaded ? (
                  <span className="flex items-center gap-1 text-[11px] text-lendswift-green-700 font-semibold shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Uploaded
                  </span>
                ) : spec.isRequired ? (
                  <span className="flex items-center gap-1 text-[11px] text-lendswift-amber-700 font-medium shrink-0">
                    <Clock className="w-3.5 h-3.5" /> Required
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-400 shrink-0">Optional</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Upload Dropzones */}
      <div className="space-y-5">
        {requiredDocSpecs.map((spec) => (
          <div key={spec.type} className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
            <FileUpload
              docType={spec.type}
              label={spec.title}
              description={spec.description}
              isRequired={spec.isRequired}
              acceptedFormats={spec.formats}
              maxSizeBytes={spec.maxSize}
              files={documents}
              onFilesChange={handleFilesChange}
            />
          </div>
        ))}
      </div>

      {errors.documents && (
        <p role="alert" className="text-xs text-lendswift-red-600 font-medium">
          {errors.documents.message as string}
        </p>
      )}

      {/* Digital E-Signature Section */}
      <div className="pt-6 border-t border-slate-200">
        <div className="bg-slate-50/70 p-5 rounded-2xl border border-slate-200 space-y-4">
          <div className="flex items-start gap-2.5">
            <ShieldCheck className="w-5 h-5 text-lendswift-blue-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">Digital Electronic Signature</h3>
              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                Under Section 3A of the Information Technology Act 2000, your electronic signature confirms your consent to verify information and execute the preliminary loan agreement.
              </p>
            </div>
          </div>

          <SignatureCanvas
            isRequired
            value={applicantSignature}
            onChange={(sig) => setValue('applicantSignature', sig, { shouldValidate: true })}
            error={errors.applicantSignature?.message}
          />
        </div>
      </div>
    </div>
  );
};
