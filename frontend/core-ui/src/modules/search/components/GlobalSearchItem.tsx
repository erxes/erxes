import { Command, TSearchResultItem } from 'erxes-ui';

export const GlobalSearchItem = ({
  item,
  providerKey,
  icon: Icon,
  onSelect,
}: {
  item: TSearchResultItem;
  providerKey: string;
  icon?: React.ElementType;
  onSelect: (path: string) => void;
}) => (
  <Command.Item
    value={`${providerKey}:${item.id}`}
    onSelect={() => onSelect(item.path)}
  >
    {Icon && <Icon />}
    <span className="truncate">{item.title}</span>
    {Boolean(item.description) && (
      <Command.Shortcut className="truncate">
        {item.description}
      </Command.Shortcut>
    )}
  </Command.Item>
);
