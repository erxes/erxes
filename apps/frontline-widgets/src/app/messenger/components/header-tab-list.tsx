import { HeaderTabItem } from './header-tab-item';
import { useHeader } from '../hooks/useHeader';

export function HeaderTabList() {
  const { headerItems, activeTab } = useHeader();
  return (
    <div className="flex items-center gap-1" role="tablist">
      {headerItems
        .filter((item) => !item.disabled && item.value !== activeTab)
        .map((item) => (
          <HeaderTabItem key={item.value} {...item} disabled={item.disabled} />
        ))}
    </div>
  );
}
