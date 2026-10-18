import { useEffect, useRef, useCallback, useState } from 'react';
import { LoanFormData, DraftMetadata } from '../types/loan';
import { encryptData } from '../utils/encryption';

export interface UseAutoSaveOptions {
  interval?: number; // default 30000 ms (30 seconds)
  enabled?: boolean;
  onSaved?: (timestamp: string) => void;
  onError?: (err: unknown) => void;
}

export function useAutoSave(
  formData: LoanFormData,
  options: UseAutoSaveOptions = {}
) {
  const { interval = 30000, enabled = true, onSaved, onError } = options;
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isSavingRef = useRef(false);
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const saveDraft = useCallback(
    async (dataToSave: LoanFormData): Promise<boolean> => {
      if (isSavingRef.current || !dataToSave.loanType) return false;
      isSavingRef.current = true;
      setIsSaving(true);

      try {
        const metadata: DraftMetadata = {
          version: '1.0',
          timestamp: new Date().toISOString(),
          step: dataToSave.currentStepIndex,
          loanType: dataToSave.loanType,
        };

        const jsonString = JSON.stringify(dataToSave);
        const encryptedData = await encryptData(jsonString);

        const storageKey = `lendswift_draft_${dataToSave.loanType}`;
        const metaKey = `lendswift_draft_meta_${dataToSave.loanType}`;

        localStorage.setItem(storageKey, encryptedData);
        localStorage.setItem(metaKey, JSON.stringify(metadata));

        // Format time in Indian standard time (HH:MM:SS AM/PM)
        const timeStr = new Date().toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        });

        setLastSavedTime(timeStr);
        onSaved?.(timeStr);
        return true;
      } catch (err) {
        console.error('AutoSave failed:', err);
        onError?.(err);
        return false;
      } finally {
        isSavingRef.current = false;
        setIsSaving(false);
      }
    },
    [onSaved, onError]
  );

  // Set up debounced auto-save timer triggered on form state change
  useEffect(() => {
    if (!enabled) return;

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      saveDraft(formData);
    }, interval);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [formData, interval, enabled, saveDraft]);

  const clearDraft = useCallback((loanType: string) => {
    try {
      localStorage.removeItem(`lendswift_draft_${loanType}`);
      localStorage.removeItem(`lendswift_draft_meta_${loanType}`);
      setLastSavedTime(null);
    } catch (e) {
      console.warn('Failed to clear draft from localStorage:', e);
    }
  }, []);

  return {
    saveNow: () => saveDraft(formData),
    clearDraft,
    lastSavedTime,
    isSaving,
  };
}
