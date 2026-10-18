import { describe, it, expect } from 'vitest';
import { encryptData, decryptData } from '../utils/encryption';

describe('Encryption & Decryption (AES-256-GCM / Web Crypto)', () => {
  it('encrypts and decrypts sensitive draft form data correctly', async () => {
    const originalData = JSON.stringify({
      loanType: 'personal',
      loanAmount: 500000,
      fullName: 'Rahul Sharma',
      panNumber: 'ABCPE1234F',
      aadhaarNumber: '999999990019',
    });

    const encrypted = await encryptData(originalData);
    expect(encrypted).not.toBe(originalData);
    expect(typeof encrypted).toBe('string');
    expect(encrypted.length).toBeGreaterThan(10);

    const decrypted = await decryptData(encrypted);
    expect(decrypted).toBe(originalData);
    const parsed = JSON.parse(decrypted);
    expect(parsed.fullName).toBe('Rahul Sharma');
    expect(parsed.panNumber).toBe('ABCPE1234F');
  });

  it('handles corrupted cipher string safely by throwing error', async () => {
    await expect(decryptData('INVALID_BASE64_CORRUPTED_STRING_###')).rejects.toThrow();
  });
});
