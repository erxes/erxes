import { useAtom } from 'jotai';
import {
  messengerTabAtom,
  setActiveTabAtom,
  resetTabAtom,
  conversationIdAtom,
} from '../states';
import { TabType } from '../types';
import { postMessage } from '@libs/utils';

export function useMessenger() {
  const [activeTab] = useAtom(messengerTabAtom);
  const [, setActiveTab] = useAtom(setActiveTabAtom);
  const [, resetTab] = useAtom(resetTabAtom);
  const [, setConversationId] = useAtom(conversationIdAtom);

  const switchToTab = (tab: TabType) => {
    setActiveTab(tab);
  };

  function resetExpand() {
    postMessage('fromMessenger', 'collapseMessenger');
  }

  function expandWindow() {
    postMessage('fromMessenger', 'expandMessenger');
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
