import React, { useRef, useState } from 'react';
import { UploadCloud, FileText, CheckCircle2, Trash2, Image as ImageIcon, Loader2 } from 'lucide-react';
import { compressImage, formatFileSize } from '../../utils/compression';
import { UploadedDocument } from '../../types/loan';
import { ErrorMessage } from '../common/ErrorMessage';

export interface FileUploadProps {
  docType: string;
  label: string;
  description?: string;
  acceptedFormats?: string[]; // e.g. ['application/pdf', 'image/jpeg', 'image/png']
  maxSizeBytes?: number; // default 5MB
  maxFiles?: number; // default 3
  files: UploadedDocument[];
  onFilesChange: (files: UploadedDocument[]) => void;
  isRequired?: boolean;
  error?: string;
  children?: (props: {
    files: UploadedDocument[];
    removeFile: (id: string) => void;
  }) => React.ReactNode;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  docType,
  label,
  description,
  acceptedFormats = ['application/pdf', 'image/jpeg', 'image/png'],
  maxSizeBytes = 5 * 1024 * 1024,
  maxFiles = 3,
  files,
  onFilesChange,
  isRequired = false,
  error: parentError,
  children,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const currentDocs = files.filter((f) => f.docType === docType);

  const processFile = async (file: File): Promise<UploadedDocument | null> => {
    // 1. File Type validation
    const isValidType =
      acceptedFormats.includes(file.type) ||
      (file.type === '' && file.name.endsWith('.pdf'));

    if (!isValidType) {
      setLocalError(`Unsupported file type: ${file.name}. Only PDF, JPG, and PNG are allowed.`);
      return null;
    }

    // 2. File Size validation
    if (file.size > maxSizeBytes) {
      setLocalError(
        `File ${file.name} (${formatFileSize(file.size)}) exceeds the maximum allowed limit of ${formatFileSize(
          maxSizeBytes
        )}.`
      );
      return null;
    }

    // 3. Client-Side Image Compression if image
    let dataUrl: string | undefined;
    let compressedSize: number | undefined;

    if (file.type.startsWith('image/')) {
      try {
        const compressed = await compressImage(file);
        dataUrl = compressed.dataUrl;
        compressedSize = compressed.compressedSize;
      } catch (e) {
        console.warn('Image compression fallback to direct FileReader:', e);
        dataUrl = await readFileAsDataUrl(file);
      }
    } else {
      // PDF document
      dataUrl = await readFileAsDataUrl(file);
    }

    return {
      id: `${docType}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      docType,
      fileName: file.name,
      fileSize: file.size,
      compressedSize,
      mimeType: file.type || 'application/pdf',
      dataUrl,
      uploadedAt: new Date().toISOString(),
      verified: true,
    };
  };

  const readFileAsDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });
  };

  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    setLocalError(null);

    if (currentDocs.length + fileList.length > maxFiles) {
      setLocalError(`Maximum ${maxFiles} files allowed for this document category.`);
      return;
    }

    setIsProcessing(true);
    const newItems: UploadedDocument[] = [];

    for (let i = 0; i < fileList.length; i++) {
      const doc = await processFile(fileList[i]);
      if (doc) newItems.push(doc);
    }

    setIsProcessing(false);
    if (newItems.length > 0) {
      onFilesChange([...files, ...newItems]);
    }
  };

  const removeFile = (id: string) => {
    onFilesChange(files.filter((f) => f.id !== id));
  };

  const error = localError || parentError;

  return (
    <div className="flex flex-col w-full">
      <div className="flex items-center justify-between mb-1.5">
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
          {label}
          {isRequired && (
            <span className="text-lendswift-red-600 ml-1 font-bold" aria-hidden="true">
              *
            </span>
          )}
        </label>
        <span className="text-[11px] text-slate-400">
          Max {maxFiles} files (Up to {formatFileSize(maxSizeBytes)})
        </span>
      </div>

      {description && <p className="text-xs text-slate-500 mb-2">{description}</p>}

      {/* Drag & Drop Input Box */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200
          ${
            isDragging
              ? 'border-lendswift-blue-500 bg-lendswift-blue-50/60 ring-2 ring-lendswift-blue-300'
              : 'border-slate-300 hover:border-slate-400 bg-slate-50/50 hover:bg-white'
          }
          ${error ? 'border-lendswift-red-400 bg-lendswift-red-50/20' : ''}
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept={acceptedFormats.join(',')}
          multiple={maxFiles > 1}
          onChange={(e) => handleFiles(e.target.files)}
          className="sr-only"
        />

        {isProcessing ? (
          <div className="flex flex-col items-center gap-2 text-lendswift-blue-600 py-1">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span className="text-xs font-medium">Compressing and processing document...</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1.5 text-slate-600">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 mb-0.5">
              <UploadCloud className="w-5 h-5 text-lendswift-blue-600" />
            </div>
            <p className="text-xs font-semibold text-slate-700">
              <span className="text-lendswift-blue-600 hover:underline">Click to upload</span> or drag and drop
            </p>
            <p className="text-[11px] text-slate-400">PDF, JPG, or PNG</p>
          </div>
        )}
      </div>

      {error && <ErrorMessage message={error} />}

      {/* Custom Render Function or Default Preview Gallery */}
      {children ? (
        children({ files: currentDocs, removeFile })
      ) : (
        currentDocs.length > 0 && (
          <div className="mt-3 flex flex-col gap-2">
            {currentDocs.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-2.5 bg-white border border-slate-200 rounded-xl shadow-xs"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {file.mimeType.startsWith('image/') ? (
                    <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-200 shrink-0 bg-slate-100 flex items-center justify-center">
                      {file.dataUrl ? (
                        <img
                          src={file.dataUrl}
                          alt={file.fileName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ImageIcon className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-lg border border-red-200 bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                  )}

                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-800 truncate max-w-xs sm:max-w-md">
                      {file.fileName}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500">
                      <span>{formatFileSize(file.fileSize)}</span>
                      {file.compressedSize && file.compressedSize < file.fileSize && (
                        <span className="text-lendswift-green-600 font-medium">
                          → {formatFileSize(file.compressedSize)} (
                          {Math.round(((file.fileSize - file.compressedSize) / file.fileSize) * 100)}% saved)
                        </span>
                      )}
                      <span className="inline-flex items-center gap-0.5 text-lendswift-green-600 font-semibold">
                        <CheckCircle2 className="w-3 h-3" /> Ready
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => removeFile(file.id)}
                  aria-label={`Remove file ${file.fileName}`}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-lendswift-red-600 hover:bg-slate-100 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
};
