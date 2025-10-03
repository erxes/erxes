import { useAtom } from 'jotai';
import { useEffect } from 'react';
import { recordTableCursorAtomFamily } from '../states/RecordTableCursorState';
export const useRecordTableCursor = ({
  sessionKey,
}: {
  sessionKey?: string;
}) => {
  const [cursor, setCursor] = useAtom(
    recordTableCursorAtomFamily(sessionKey || ''),
  );

  useEffect(() => {
    if (!sessionKey) return;
    setCursor(sessionStorage.getItem(sessionKey) || '');
  }, [sessionKey, setCursor]);

  return {
    cursor,
    setCursor,
  };
};
