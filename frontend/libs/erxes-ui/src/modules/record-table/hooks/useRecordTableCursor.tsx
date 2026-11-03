import { useAtom } from 'jotai';
import { useEffect } from 'react';
import { recordTableCursorAtomFamily } from '../states/RecordTableCursorState';

/**
 * Validates that a value retrieved from `sessionStorage` is a properly formed
 * cursor token — a base64-encoded JSON object with an own `_id` property that
 * is a valid non-empty string or number.
 *
 * Returns `false` for legacy raw Mongo ObjectId strings, empty values, JSON
 * arrays or primitives, non-string/non-numeric `_id` values, and any corrupted
 * or non-base64 content, ensuring the table always falls back to the first page.
 */
export const isValidCursor = (cursor: string): boolean => {
  if (!cursor || typeof cursor !== 'string' || !cursor.trim()) {
    return false;
  }
  try {
    const jsonStr =
      typeof window !== 'undefined' && typeof window.atob === 'function'
        ? window.atob(cursor)
        : Buffer.from(cursor, 'base64').toString('utf-8');
    const decoded = JSON.parse(jsonStr);
    if (
      typeof decoded !== 'object' ||
      decoded === null ||
      Array.isArray(decoded) ||
      !Object.prototype.hasOwnProperty.call(decoded, '_id')
    ) {
      return false;
    }
    const id = decoded._id;
    return (
      (typeof id === 'string' && id.trim().length > 0) ||
      (typeof id === 'number' && !Number.isNaN(id))
    );
  } catch {
    return false;
  }
};

export const useRecordTableCursor = ({
  sessionKey,
}: {
  sessionKey?: string;
}) => {
  const [cursor, setCursor] = useAtom(
    recordTableCursorAtomFamily(sessionKey ?? '') ?? '',
  );

  useEffect(() => {
    if (!sessionKey) return;
    try {
      const stored = sessionStorage.getItem(sessionKey);
      if (stored === null) {
        setCursor('');
        return;
      }
      if (isValidCursor(stored)) {
        setCursor(stored);
      } else {
        sessionStorage.removeItem(sessionKey);
        sessionStorage.removeItem(`${sessionKey}_scroll`);
        setCursor('');
      }
    } catch {
      setCursor('');
    }
  }, [sessionKey, setCursor]);

  return {
    cursor,
    setCursor,
  };
};
