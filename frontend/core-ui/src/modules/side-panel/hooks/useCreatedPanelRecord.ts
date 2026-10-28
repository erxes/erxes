import { useEffect, useRef } from 'react';
import { NEW_RECORD_ID, useSidePanel } from 'ui-modules';

// A save can finish while a related record is open. Replace its draft in the
// history without moving the user; a closed editor must not reopen itself.
export const useCreatedPanelRecord = (
  contentType: string,
): ((id: string) => void) => {
  const { replaceRecord } = useSidePanel();
  const mounted = useRef(false);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  return (id: string) => {
    if (!mounted.current) return;
    replaceRecord(
      { contentType, contentId: NEW_RECORD_ID },
      { contentType, contentId: id },
    );
  };
};
