import { useCallback, useEffect, useRef } from 'react';
import { useSidePanel } from 'ui-modules';

type CloseRemovedSettingsRecord = (contentId?: string | null) => void;

/** Closes only the matching active record while this hook remains mounted. */
export const useCloseRemovedSettingsRecord = (
  contentType: string,
): CloseRemovedSettingsRecord => {
  const panel = useSidePanel();
  const currentPanel = useRef(panel);
  const active = useRef(true);

  useEffect(() => {
    currentPanel.current = panel;
  }, [panel]);

  useEffect(() => {
    active.current = true;
    return () => {
      active.current = false;
    };
  }, []);

  return useCallback(
    (contentId) => {
      if (!active.current) return;
      const { record, close } = currentPanel.current;
      if (
        contentId &&
        record?.contentType === contentType &&
        record.contentId === contentId
      ) {
        close();
      }
    },
    [contentType],
  );
};
