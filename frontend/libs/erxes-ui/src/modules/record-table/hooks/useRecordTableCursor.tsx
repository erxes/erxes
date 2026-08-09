import { useAtom } from 'jotai';
import { useEffect } from 'react';
import { recordTableCursorAtomFamily } from '../states/RecordTableCursorState';
import { isValidCursor } from '../utils/cursorUtils';

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

    const stored = sessionStorage.getItem(sessionKey);

    if (isValidCursor(stored)) {
      setCursor(stored);
      return;
    }

    // Purge a poisoned or legacy value so it cannot be read back again.
    if (stored) sessionStorage.removeItem(sessionKey);
    setCursor('');
  }, [sessionKey, setCursor]);

  return {
    cursor,
    setCursor,
  };
};
