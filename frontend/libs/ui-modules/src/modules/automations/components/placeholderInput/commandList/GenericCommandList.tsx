import { Combobox, Command } from 'erxes-ui';
import type { ReactNode } from 'react';

interface GenericCommandListProps<TItem extends Record<string, any>> {
  heading: string;
  items: TItem[];
  totalCount: number;
  handleFetchMore: () => void;
  onSelect: (value: string) => void;
  getKey: (item: TItem) => string;
  renderItem: (item: TItem) => ReactNode;
  selectField?: string; // defaults to _id
  getSelectValue?: (item: TItem) => string; // overrides selectField when provided
  loading?: boolean;
}

export function GenericCommandList<TItem extends Record<string, any>>({
  heading,
  items = [],
  totalCount,
  handleFetchMore,
  onSelect,
  getKey,
  renderItem,
  selectField = '_id',
  getSelectValue,
  loading,
}: GenericCommandListProps<TItem>) {
  const resolveValue = (item: TItem) => {
    if (getSelectValue) return getSelectValue(item);
    const raw = item[selectField];
    return typeof raw === 'string' ? raw : String(raw ?? '');
  };

  return (
    <Command.Group heading={heading}>
      {items.map((item) => (
        <Command.Item
          key={getKey(item)}
          value={getKey(item)}
          onSelect={() => onSelect(resolveValue(item))}
        >
          {renderItem(item)}
        </Command.Item>
      ))}
      <Combobox.FetchMore
        fetchMore={handleFetchMore}
        currentLength={items.length}
        totalCount={totalCount}
      />
      <Combobox.Empty loading={loading} />
    </Command.Group>
  );
}
