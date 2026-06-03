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

  function resetExpand() {
    const frame = window.parent.document.querySelector(
      '.erxes-messenger-frame',
    );
    frame?.classList.replace('erxes-messenger-expand', 'erxes-messenger-shown');
  }

  function expandWindow() {
    const frame = window.parent.document.querySelector(
      '.erxes-messenger-frame',
    );
    frame?.classList.replace('erxes-messenger-shown', 'erxes-messenger-expand');
  }

  function closeWindow() {
    window.postMessage({ action: 'closeMessenger' }, '*');
  }

  const goBack = () => {
    setActiveTab('messages');
    resetExpand();
    setConversationId(null);
  };

  return {
    activeTab,
    switchToTab,
    goBack,
    resetTab,
    expandWindow,
    resetExpand,
    closeWindow,
  };
}
