import { dealPanelTabAtom } from '@/deals/states/dealPanelTabState';
import { useSetAtom } from 'jotai';
import { useEffect } from 'react';
import { useSidePanel } from 'ui-modules';

export const useDealPanelTabMemory = () => {
  const { tab } = useSidePanel();
  const setSavedTab = useSetAtom(dealPanelTabAtom);

  useEffect(() => {
    if (tab) setSavedTab(tab);
  }, [tab, setSavedTab]);
};
