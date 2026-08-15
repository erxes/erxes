import { highlightMatch } from '@/search/utils/highlightMatch';
import { IconCornerDownLeft } from '@tabler/icons-react';
import { Command, TSearchResultItem } from 'erxes-ui';

export const GlobalSearchItem = ({
  item,
  commandValue,
  icon: Icon,
  searchValue,
  actionLabel,
  onSelect,
}: {
  item: TSearchResultItem;
  commandValue: string;
  icon?: React.ElementType;
  searchValue: string;
  actionLabel: string;
  onSelect: (path: string) => void;
}) => (
  <Command.Item
    className="group h-auto min-h-14 gap-3 rounded-md px-3 py-2"
    value={commandValue}
    onSelect={() => onSelect(item.path)}
  >
    <span className="flex size-9 shrink-0 items-center justify-center rounded-md border bg-muted/40 text-muted-foreground">
      {Icon && <Icon className="size-4" />}
    </span>
    <span className="min-w-0 flex-1">
      <span className="block truncate font-medium text-foreground">
        {highlightMatch(item.title, searchValue)}
      </span>
      {item.description ? (
        <span className="block truncate text-xs text-muted-foreground">
          {highlightMatch(item.description, searchValue)}
        </span>
      ) : null}
    </span>
    <Command.Shortcut className="flex shrink-0 items-center gap-2 tracking-normal">
      <span className="hidden sm:inline">{actionLabel}</span>
      <IconCornerDownLeft className="hidden size-4 group-data-[selected=true]:block" />
    </Command.Shortcut>
  </Command.Item>
);
