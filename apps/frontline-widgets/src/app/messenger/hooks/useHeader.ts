import { HEADER_ITEMS } from '../constants';
import { HeaderContentType, IHeaderItem } from '../types';
import { useMessenger } from './useMessenger';

export function useHeader() {
  const { activeTab, switchToTab, goBack } = useMessenger();

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

  return {
    activeTab,
    switchToTab,
    goBack,
    getCurrentTitle,
    renderHeaderContent,
  };
}
