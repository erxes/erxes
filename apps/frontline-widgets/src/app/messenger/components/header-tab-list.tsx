import { HEADER_ITEMS } from '../constants';
import { HeaderTabItem } from './header-tab-item';
import { IHeaderItem } from '../types';
import { useMessenger } from '../hooks/useMessenger';

export function HeaderTabList() {
  const { activeTab } = useMessenger();
  return (
    <div className="flex items-center gap-1" role="tablist">
      {HEADER_ITEMS.filter(
        (item: IHeaderItem) => !item.disabled && item.value !== activeTab,
      ).map((item: IHeaderItem) => (
        <HeaderTabItem key={item.value} {...item} />
      ))}
    </div>
  );
}
