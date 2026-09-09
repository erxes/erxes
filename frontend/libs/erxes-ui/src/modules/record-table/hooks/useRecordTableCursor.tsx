import { useAtom } from 'jotai';
import { useEffect } from 'react';
import { recordTableCursorAtomFamily } from '../states/RecordTableCursorState';

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
    return (
      typeof decoded === 'object' &&
      decoded !== null &&
      !Array.isArray(decoded) &&
      Boolean(decoded._id)
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
      if (!stored) {
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
