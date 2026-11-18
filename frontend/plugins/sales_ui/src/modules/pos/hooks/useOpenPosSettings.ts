import { useCallback } from 'react';
import { useSidePanel } from 'ui-modules';
import { POS_CONTENT_TYPE } from '@/pos/constants/posPanel';

export const useOpenPosSettings = () => {
  const { openRecord } = useSidePanel();

  return useCallback(
    (posId: string, options?: { replace?: boolean }) =>
      openRecord({ contentType: POS_CONTENT_TYPE, contentId: posId }, options),
    [openRecord],
  );
};
