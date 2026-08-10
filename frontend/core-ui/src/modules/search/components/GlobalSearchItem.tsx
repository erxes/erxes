import { highlightMatch } from '@/search/utils/highlightMatch';
import { Command, TSearchResultItem } from 'erxes-ui';

export const GlobalSearchItem = ({
  item,
  providerKey,
  icon: Icon,
  searchValue,
  onSelect,
}: {
  item: TSearchResultItem;
  providerKey: string;
  icon?: React.ElementType;
  searchValue: string;
  onSelect: (path: string) => void;
}) => (
  <Command.Item
    value={`${providerKey}:${item.id}`}
    onSelect={() => onSelect(item.path)}
  >
    {Icon && <Icon />}
    <span className="truncate">{highlightMatch(item.title, searchValue)}</span>
    {item.description ? (
      <Command.Shortcut className="truncate">
        {highlightMatch(item.description, searchValue)}
      </Command.Shortcut>
    ) : null}
  </Command.Item>
);
