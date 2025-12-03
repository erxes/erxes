import { useHeader } from '../hooks/useHeader';
import { HeaderItem } from './header-item';

export function HeaderItemsList() {
  const { headerItems, activeTab } = useHeader();
  return (
    <div className="flex flex-wrap gap-2" role="tablist">
      {headerItems
        .filter((item) => !item.disabled && item.value !== activeTab && item.value !== 'chat')
        .map((item) => (
          <HeaderItem key={item.value} {...item} disabled={item.disabled} />
        ))}
    </div>
  );
}
