import { useAtom } from 'jotai';
import {
  messengerTabAtom,
  setActiveTabAtom,
  resetTabAtom,
  conversationIdAtom,
} from '../states';
import { TabType } from '../types';

export function useMessenger() {
  const [activeTab] = useAtom(messengerTabAtom);
  const [, setActiveTab] = useAtom(setActiveTabAtom);
  const [, resetTab] = useAtom(resetTabAtom);
  const [, setConversationId] = useAtom(conversationIdAtom);

  const switchToTab = (tab: TabType) => {
    setActiveTab(tab);
  };

  const goBack = () => {
    resetTab();
    setConversationId(null);
  };

  return {
    activeTab,
    switchToTab,
    goBack,
  };
}
