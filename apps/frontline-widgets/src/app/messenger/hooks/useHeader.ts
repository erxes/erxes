import { useAtom, useAtomValue } from 'jotai';
import { HEADER_ITEMS } from '../constants';
import { HeaderContentType, IHeaderItem } from '../types';
import { useMessenger } from './useMessenger';
import { hasTicketConfigAtom, headerItemsAtom } from '../states';
import { useEffect } from 'react';

export function useHeader() {
  const { activeTab, switchToTab, goBack } = useMessenger();
  const hasTicketConfig = useAtomValue(hasTicketConfigAtom);
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
    if (!hasTicketConfig) {
      setHeaderItems(HEADER_ITEMS.filter((item) => item.value !== 'ticket'));
    } else {
      setHeaderItems([
        ...HEADER_ITEMS.filter((item) => item.value !== 'ticket'),
        {
          ...(HEADER_ITEMS.find(
            (item) => item.value === 'ticket',
          ) as IHeaderItem),
          disabled: false,
        },
      ]);
    }
  }, [hasTicketConfig]);

  return {
    activeTab,
    switchToTab,
    goBack,
    getCurrentTitle,
    renderHeaderContent,
    headerItems,
  };
}
