import { HEADER_ITEMS } from '../constants';
import { HeaderTabItem } from './header-tab-item';
import { IHeaderItem } from '../types';

export function HeaderTabList() {
  return (
    <div className="flex items-center gap-1" role="tablist">
      {HEADER_ITEMS.map((item: IHeaderItem) => (
        <HeaderTabItem key={item.value} {...item} />
      ))}
    </div>
  );
}
