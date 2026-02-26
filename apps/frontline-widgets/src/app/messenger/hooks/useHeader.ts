import { useAtom, useAtomValue } from 'jotai';
import { HEADER_ITEMS } from '../constants';
import { HeaderContentType, IHeaderItem } from '../types';
import { useMessenger } from './useMessenger';
import {
  connectionAtom,
  hasTicketConfigAtom,
  headerItemsAtom,
} from '../states';
import { useEffect } from 'react';

export function useHeader() {
  const { activeTab, switchToTab, goBack } = useMessenger();
  const hasTicketConfig = useAtomValue(hasTicketConfigAtom);
  const connection = useAtomValue(connectionAtom);
  const { showVideoCallRequest } =
    connection.widgetsMessengerConnect.messengerData || {};
  const [headerItems, setHeaderItems] = useAtom(headerItemsAtom);

  const getCurrentTitle = (): string => {
    return (
      HEADER_ITEMS.find((item: IHeaderItem) => item.value === activeTab)
        ?.title ?? 'Chat'
    );
  };

  const renderHeaderContent = (): HeaderContentType => {
    switch (activeTab) {
      case 'chat':
        return 'header-tabs';
      case 'default':
        return 'hero-intro';
      default:
        return 'header-tabs';
    }
  };

  useEffect(() => {
    let items = [...HEADER_ITEMS];

    items = items.map((item) => {
      if (item.value === 'ticket') {
        return { ...item, disabled: !hasTicketConfig };
      }
      return item;
    });

    items = items.map((item) => {
      if (item.value === 'call') {
        return { ...item, disabled: !showVideoCallRequest };
      }
      return item;
    });

    setHeaderItems(items);
  }, [hasTicketConfig, showVideoCallRequest]);

  return {
    activeTab,
    switchToTab,
    goBack,
    getCurrentTitle,
    renderHeaderContent,
    headerItems,
  };
}
