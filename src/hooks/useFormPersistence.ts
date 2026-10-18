import { useState, useEffect, useCallback } from 'react';
import { LoanFormData, DraftMetadata, LoanType } from '../types/loan';
import { decryptData } from '../utils/encryption';

const DRAFT_TTL_HOURS = 72;

export interface DetectedDraft {
  metadata: DraftMetadata;
  loanType: LoanType;
  storageKey: string;
  metaKey: string;
}

export function useFormPersistence(
  onRestore: (data: LoanFormData) => void,
  onStartFresh: () => void
) {
  const [detectedDraft, setDetectedDraft] = useState<DetectedDraft | null>(null);
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [corruptionError, setCorruptionError] = useState<string | null>(null);

  // Check localStorage for existing drafts on mount
  useEffect(() => {
    const loanTypes: LoanType[] = ['personal', 'home', 'business'];

    for (const type of loanTypes) {
      const metaKey = `lendswift_draft_meta_${type}`;
      const storageKey = `lendswift_draft_${type}`;
      const metaJson = localStorage.getItem(metaKey);
      const encrypted = localStorage.getItem(storageKey);

      if (metaJson && encrypted) {
        try {
          const meta = JSON.parse(metaJson) as DraftMetadata;
          const draftTime = new Date(meta.timestamp).getTime();
          const now = Date.now();
          const ageHours = (now - draftTime) / (1000 * 60 * 60);

          // Purge if older than 72 hours
          if (ageHours > DRAFT_TTL_HOURS) {
            localStorage.removeItem(metaKey);
            localStorage.removeItem(storageKey);
            continue;
          }

          setDetectedDraft({
            metadata: meta,
            loanType: type,
            storageKey,
            metaKey,
          });
          setShowResumeModal(true);
          break; // Show modal for the most recent valid draft found
        } catch {
          // If metadata is unparseable, discard
          localStorage.removeItem(metaKey);
          localStorage.removeItem(storageKey);
        }
      }
    }
  }, []);

  const resumeDraft = useCallback(async () => {
    if (!detectedDraft) return;

    try {
      const encrypted = localStorage.getItem(detectedDraft.storageKey);
      if (!encrypted) throw new Error('Draft payload missing in storage');

      const plainText = await decryptData(encrypted);
      const parsedData = JSON.parse(plainText) as LoanFormData;

      // Basic structure validation to detect corruption (Section E3.1)
      if (!parsedData.loanType || typeof parsedData.currentStepIndex !== 'number') {
        throw new Error('Draft payload contains corrupted or invalid schema structure');
      }

      onRestore(parsedData);
      setShowResumeModal(false);
    } catch (err) {
      console.warn('Draft decryption/validation failed, detected corrupted state:', err);
      setCorruptionError(
        'The saved draft data is corrupted or incompatible with the current version. Starting fresh is recommended.'
      );
      // Auto-purge corrupted draft
      localStorage.removeItem(detectedDraft.storageKey);
      localStorage.removeItem(detectedDraft.metaKey);
    }
  }, [detectedDraft, onRestore]);

  const discardDraft = useCallback(() => {
    if (detectedDraft) {
      localStorage.removeItem(detectedDraft.storageKey);
      localStorage.removeItem(detectedDraft.metaKey);
    }
    setDetectedDraft(null);
    setShowResumeModal(false);
    setCorruptionError(null);
    onStartFresh();
  }, [detectedDraft, onStartFresh]);

  return {
    detectedDraft,
    showResumeModal,
    corruptionError,
    resumeDraft,
    discardDraft,
    setShowResumeModal,
  };
}
