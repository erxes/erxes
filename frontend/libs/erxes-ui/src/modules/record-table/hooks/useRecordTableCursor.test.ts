import { renderHook, act } from '@testing-library/react';
import { isValidCursor, useRecordTableCursor } from './useRecordTableCursor';

describe('useRecordTableCursor and isValidCursor', () => {
  const validCursorData = { _id: '6a501ddb0bd4990d2351f352', createdAt: '2026-01-01T00:00:00.000Z' };
  const validBase64Cursor = Buffer.from(JSON.stringify(validCursorData)).toString('base64');
  const legacyRawId = '6a501ddb0bd4990d2351f352';

  describe('isValidCursor', () => {
    test('returns true for a valid base64 JSON cursor with _id', () => {
      expect(isValidCursor(validBase64Cursor)).toBe(true);
    });

    test('returns false for legacy raw Mongo _id', () => {
      expect(isValidCursor(legacyRawId)).toBe(false);
    });

    test('returns false for empty string or whitespace', () => {
      expect(isValidCursor('')).toBe(false);
      expect(isValidCursor('   ')).toBe(false);
    });

    test('returns false for malformed base64 or non-JSON content', () => {
      expect(isValidCursor('not-base-64!!@@')).toBe(false);
      const nonJsonBase64 = Buffer.from('hello plain text').toString('base64');
      expect(isValidCursor(nonJsonBase64)).toBe(false);
    });

    test('returns false for JSON object missing _id', () => {
      const missingIdBase64 = Buffer.from(JSON.stringify({ createdAt: '2026-01-01' })).toString('base64');
      expect(isValidCursor(missingIdBase64)).toBe(false);
    });

    test('returns false for JSON array or primitive value', () => {
      const arrayBase64 = Buffer.from(JSON.stringify(['item1', 'item2'])).toString('base64');
      expect(isValidCursor(arrayBase64)).toBe(false);
    });
  });

  describe('useRecordTableCursor sessionStorage recovery', () => {
    const sessionKey = 'test_customers_table';
    const scrollKey = `${sessionKey}_scroll`;

    beforeEach(() => {
      sessionStorage.clear();
      jest.clearAllMocks();
    });

    test('loads valid cursor from sessionStorage', () => {
      sessionStorage.setItem(sessionKey, validBase64Cursor);

      const { result } = renderHook(() => useRecordTableCursor({ sessionKey }));

      expect(result.current.cursor).toBe(validBase64Cursor);
    });

    test('clears legacy raw ID from sessionStorage and falls back to empty cursor', () => {
      sessionStorage.setItem(sessionKey, legacyRawId);
      sessionStorage.setItem(scrollKey, '450');

      const { result } = renderHook(() => useRecordTableCursor({ sessionKey }));

      // Invalid/legacy cursor should be cleared and reset to empty string (first page)
      expect(result.current.cursor).toBe('');
      expect(sessionStorage.getItem(sessionKey)).toBeNull();
      expect(sessionStorage.getItem(scrollKey)).toBeNull();
    });

    test('clears corrupted string from sessionStorage and falls back to empty cursor', () => {
      sessionStorage.setItem(sessionKey, 'corrupted_garbage_value');
      sessionStorage.setItem(scrollKey, '100');

      const { result } = renderHook(() => useRecordTableCursor({ sessionKey }));

      expect(result.current.cursor).toBe('');
      expect(sessionStorage.getItem(sessionKey)).toBeNull();
      expect(sessionStorage.getItem(scrollKey)).toBeNull();
    });

    test('initializes with empty cursor when sessionStorage is empty', () => {
      const { result } = renderHook(() => useRecordTableCursor({ sessionKey }));

      expect(result.current.cursor).toBe('');
    });

    test('allows manually setting cursor', () => {
      const { result } = renderHook(() => useRecordTableCursor({ sessionKey }));

      act(() => {
        result.current.setCursor(validBase64Cursor);
      });

      expect(result.current.cursor).toBe(validBase64Cursor);
    });
  });
});
