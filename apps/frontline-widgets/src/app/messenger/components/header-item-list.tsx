import { HEADER_ITEMS } from '../constants';
import { IHeaderItem } from '../types';
import { HeaderItem } from './header-item';

export function HeaderItemsList() {
  return (
    <div className="flex flex-wrap gap-2" role="tablist">
      {HEADER_ITEMS.filter(
        (item: IHeaderItem) => !item.disabled && item.value !== 'chat',
      ).map((item: IHeaderItem) => (
        <HeaderItem key={item.value} {...item} />
      ))}
    </div>
  );
}
