import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePinCodeLookup } from '../hooks/usePinCodeLookup';
import { useVerification } from '../hooks/useVerification';

describe('Custom Hooks Unit Tests', () => {
  it('usePinCodeLookup successfully looks up Indian PIN code', async () => {
    const { result } = renderHook(() => usePinCodeLookup());

    let lookupResult: any = null;
    await act(async () => {
      lookupResult = await result.current.lookupPinCode('560034'); // Koramangala, Bengaluru
    });

    expect(lookupResult).not.toBeNull();
    expect(lookupResult.city).toBe('Bengaluru');
    expect(lookupResult.state).toBe('Karnataka');
    expect(result.current.error).toBeNull();
  });

  it('usePinCodeLookup returns error for non-6-digit PIN', async () => {
    const { result } = renderHook(() => usePinCodeLookup());

    let lookupResult: any = null;
    await act(async () => {
      lookupResult = await result.current.lookupPinCode('123');
    });

    expect(lookupResult).toBeNull();
    expect(result.current.error).toContain('PIN code must be exactly 6 digits');
  });

  it('useVerification handles PAN validation simulation with delay', async () => {
    const { result } = renderHook(() => useVerification());

    let verifyPromise: Promise<boolean>;
    act(() => {
      verifyPromise = result.current.verifyField('testPan', 'pan', 'ABCPE1234F', 'personal');
    });

    // In-flight state
    expect(result.current.states.testPan?.isVerifying).toBe(true);

    let isSuccess = false;
    await act(async () => {
      isSuccess = await verifyPromise;
    });

    expect(isSuccess).toBe(true);
    expect(result.current.states.testPan?.isVerified).toBe(true);
    expect(result.current.states.testPan?.message).toContain('NSDL Records Match');
  });

  it('useVerification rejects invalid PAN immediately without delay', async () => {
    const { result } = renderHook(() => useVerification());

    let isSuccess = true;
    await act(async () => {
      isSuccess = await result.current.verifyField('testPan', 'pan', 'INVALID_PAN', 'personal');
    });

    expect(isSuccess).toBe(false);
    expect(result.current.states.testPan?.isVerified).toBe(false);
    expect(result.current.states.testPan?.error).toBeDefined();
  });
});
