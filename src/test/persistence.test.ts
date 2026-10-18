import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFormPersistence } from '../hooks/useFormPersistence';
import { encryptData } from '../utils/encryption';

describe('Form Persistence & Data Corruption Recovery (Section E3.1)', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('detects and recovers from corrupted encrypted draft by offering start fresh', async () => {
    const metaKey = 'lendswift_draft_meta_personal';
    const storageKey = 'lendswift_draft_personal';

    // Set valid metadata
    localStorage.setItem(
      metaKey,
      JSON.stringify({
        version: '1.0',
        timestamp: new Date().toISOString(),
        step: 2,
        loanType: 'personal',
      })
    );

    // Corrupt the storage payload with arbitrary invalid string
    localStorage.setItem(storageKey, 'CORRUPTED_NON_BASE64_PAYLOAD_!@#$%^');

    const onRestore = vi.fn();
    const onStartFresh = vi.fn();

    const { result } = renderHook(() => useFormPersistence(onRestore, onStartFresh));

    expect(result.current.detectedDraft).not.toBeNull();
    expect(result.current.showResumeModal).toBe(true);

    // Attempt to resume the corrupted draft
    await act(async () => {
      await result.current.resumeDraft();
    });

    // Verify corruption was caught, corruptionError set, and corrupt storage cleaned up
    expect(result.current.corruptionError).toContain('corrupted');
    expect(onRestore).not.toHaveBeenCalled();
    expect(localStorage.getItem(storageKey)).toBeNull();
  });

  it('purges drafts older than 72 hours TTL on load', () => {
    const metaKey = 'lendswift_draft_meta_home';
    const storageKey = 'lendswift_draft_home';

    // Set draft timestamp 75 hours ago
    const oldTimestamp = new Date(Date.now() - 75 * 60 * 60 * 1000).toISOString();

    localStorage.setItem(
      metaKey,
      JSON.stringify({
        version: '1.0',
        timestamp: oldTimestamp,
        step: 3,
        loanType: 'home',
      })
    );
    localStorage.setItem(storageKey, 'DRAFT_DATA');

    const onRestore = vi.fn();
    const onStartFresh = vi.fn();

    const { result } = renderHook(() => useFormPersistence(onRestore, onStartFresh));

    // Stored keys must be purged due to >72h TTL
    expect(localStorage.getItem(metaKey)).toBeNull();
    expect(localStorage.getItem(storageKey)).toBeNull();
    expect(result.current.detectedDraft).toBeNull();
    expect(result.current.showResumeModal).toBe(false);
  });
});
