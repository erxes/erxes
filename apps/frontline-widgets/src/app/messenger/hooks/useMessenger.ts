import { useAtomValue, useSetAtom } from 'jotai';
import { messengerTabAtom, conversationIdAtom } from '../states';
import { TabType } from '../types';

export function useMessenger() {
  const activeTab = useAtomValue(messengerTabAtom);
  const setMessengerTab = useSetAtom(messengerTabAtom);
  const setConversationId = useSetAtom(conversationIdAtom);

  const switchToTab = (tab: TabType) => {
    setMessengerTab(tab);
  };

  const goBack = () => {
    setMessengerTab('default');
    setConversationId(null);
  };

  return {
    activeTab,
    switchToTab,
    goBack,
  };
}
