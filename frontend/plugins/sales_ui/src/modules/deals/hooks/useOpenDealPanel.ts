import { dealPanelTabAtom } from '@/deals/states/dealPanelTabState';
import { useAtomValue } from 'jotai';
import { IOpenRecordOptions, useSidePanel } from 'ui-modules';

export const useOpenDealPanel = () => {
  const { openRecord } = useSidePanel();
  const savedTab = useAtomValue(dealPanelTabAtom);

  return (dealId: string, options?: Omit<IOpenRecordOptions, 'tab'>) =>
    openRecord(
      { contentType: 'sales:deal', contentId: dealId },
      { ...options, tab: savedTab || undefined },
    );
};
