import { useCallback } from 'react';
import { IOpenRecordOptions, useSidePanel } from 'ui-modules';

export const useSettingsPanel = (contentType: string) => {
  const { openNewRecord, openRecord, close, back, canGoBack } = useSidePanel();

  const openDraft = useCallback(
    () => openNewRecord(contentType),
    [openNewRecord, contentType],
  );

  const openDetail = useCallback(
    (contentId: string, options?: IOpenRecordOptions) =>
      openRecord({ contentType, contentId }, options),
    [openRecord, contentType],
  );

  const cancelDraft = useCallback(
    () => (canGoBack ? back() : close()),
    [canGoBack, back, close],
  );

  return { openDraft, openDetail, cancelDraft, closePanel: close };
};
