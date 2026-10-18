import { describe, it, expect } from 'vitest';
import { formatFileSize } from '../utils/compression';

describe('Compression Utilities Unit Tests', () => {
  it('formats byte sizes into readable units', () => {
    expect(formatFileSize(0)).toBe('0 B');
    expect(formatFileSize(1024)).toBe('1 KB');
    expect(formatFileSize(1024 * 1024)).toBe('1 MB');
    expect(formatFileSize(5 * 1024 * 1024)).toBe('5 MB');
    expect(formatFileSize(2.5 * 1024 * 1024)).toBe('2.5 MB');
  });
});
