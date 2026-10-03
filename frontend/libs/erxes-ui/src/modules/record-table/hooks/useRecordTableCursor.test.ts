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

    test.each([
      ['numeric _id 0', Buffer.from(JSON.stringify({ _id: 0 })).toString('base64')],
      ['positive numeric _id', Buffer.from(JSON.stringify({ _id: 12345 })).toString('base64')],
    ])('returns true for cursor with %s', (_, cursor) => {
      expect(isValidCursor(cursor)).toBe(true);
    });

    test.each([
      ['legacy raw Mongo _id', legacyRawId],
      ['empty string', ''],
      ['whitespace string', '   '],
      ['malformed base64', 'not-base-64!!@@'],
      ['non-JSON base64', Buffer.from('hello plain text').toString('base64')],
      ['missing _id field', Buffer.from(JSON.stringify({ createdAt: '2026-01-01' })).toString('base64')],
      ['JSON array', Buffer.from(JSON.stringify(['item1', 'item2'])).toString('base64')],
      ['boolean _id', Buffer.from(JSON.stringify({ _id: true })).toString('base64')],
      ['object _id', Buffer.from(JSON.stringify({ _id: {} })).toString('base64')],
      ['blank string _id', Buffer.from(JSON.stringify({ _id: '   ' })).toString('base64')],
    ])('returns false for invalid cursor: %s', (_, cursor) => {
      expect(isValidCursor(cursor)).toBe(false);
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

    test.each([
      ['legacy raw Mongo _id', legacyRawId, '450'],
      ['corrupted string', 'corrupted_garbage_value', '100'],
      ['empty string', '', '200'],
    ])('clears %s from sessionStorage and falls back to empty cursor', (_, invalidCursor, scrollVal) => {
      sessionStorage.setItem(sessionKey, invalidCursor);
      sessionStorage.setItem(scrollKey, scrollVal);

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
