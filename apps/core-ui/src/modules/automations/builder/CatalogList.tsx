import { IconCheck, IconClockHour4 } from '@tabler/icons-react';
import { cn, Command } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { type CatalogItem, type GroupEntry, groupOf, useCatalogLabels } from './catalogGroups';

const Row = ({
  item,
  selected,
  onSelect,
  keyPrefix = '',
  showIcon = false,
}: {
  item: CatalogItem;
  selected: boolean;
  onSelect: () => void;
  keyPrefix?: string;
  /** Recently used mixes areas: each row shows its own. */
  showIcon?: boolean;
}) => {
  const group = groupOf(item);

  return (
    <Command.Item
      value={`${keyPrefix}${item.type}`}
      keywords={[item.label, item.description ?? '', group.label, item.source]}
      onSelect={onSelect}
      className="h-auto items-start gap-2.5 px-2.5 py-1.5"
    >
      {showIcon && (
        <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
          <group.icon className="size-3.5" />
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm">{item.label}</span>
        {item.description && (
          <span className="block truncate text-xs text-muted-foreground">{item.description}</span>
        )}
      </span>
      {selected && <IconCheck className="mt-1 size-4 shrink-0 text-primary-text" />}
    </Command.Item>
  );
};

const Rows = ({
  items,
  value,
  onChoose,
}: {
  items: CatalogItem[];
  value: string | undefined;
  onChoose: (type: string) => void;
}) =>
  items.map((item) => (
    <Row
      key={item.type}
      item={item}
      selected={item.type === value}
      onSelect={() => onChoose(item.type)}
    />
  ));

/** Matches, grouped by area: everywhere, or within the open category. */
const SearchResults = ({
  kind,
  groups,
  value,
  onChoose,
}: {
  kind: string;
  groups: GroupEntry[];
  value: string | undefined;
  onChoose: (type: string) => void;
}) => {
  const { groupName } = useCatalogLabels(kind);

  return groups.map(({ group, items }) => (
    <Command.Group
      key={group.key}
      heading={
        <span className="flex items-center gap-1.5">
          <group.icon className="size-3.5" />
          {groupName(group)}
        </span>
      }
    >
      <Rows items={items} value={value} onChoose={onChoose} />
    </Command.Group>
  ));
};

/** Recently used, then every category as a tile. */
const Categories = ({
  kind,
  groups,
  recentItems,
  selected,
  onChoose,
  onOpen,
}: {
  kind: string;
  groups: GroupEntry[];
  recentItems: CatalogItem[];
  selected: CatalogItem | undefined;
  onChoose: (type: string) => void;
  onOpen: (category: string) => void;
}) => {
  const { t } = useTranslation('automations');
  const { groupName, countLabel } = useCatalogLabels(kind);
  const selectedKey = selected ? groupOf(selected).key : null;

  return (
    <>
      {recentItems.length > 0 && (
        <Command.Group
          heading={
            <span className="flex items-center gap-1">
              <IconClockHour4 className="size-3" />
              {t('catalog-recent', 'Recently used')}
            </span>
          }
        >
          {recentItems.map((item) => (
            <Row
              key={`recent:${item.type}`}
              keyPrefix="recent:"
              showIcon
              item={item}
              selected={item.type === selected?.type}
              onSelect={() => onChoose(item.type)}
            />
          ))}
        </Command.Group>
      )}
      <Command.Group
        heading={t('catalog-categories', 'Categories')}
        className="[&_[cmdk-group-items]]:grid [&_[cmdk-group-items]]:grid-cols-2 [&_[cmdk-group-items]]:gap-1"
      >
        {groups.map(({ group, items }) => (
          <Command.Item
            key={group.key}
            value={`category:${group.key}`}
            onSelect={() => onOpen(group.key)}
            className={cn(
              'h-auto gap-2.5 rounded-md border border-transparent px-2 py-2',
              selectedKey === group.key && 'border-primary/30 bg-primary/5',
            )}
          >
            <span
              className={cn(
                'flex size-7 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground',
                group.source !== 'core' && 'bg-primary/10 text-primary-text',
              )}
            >
              <group.icon className="size-4" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium">{groupName(group)}</span>
              <span className="block truncate text-xs text-muted-foreground">
                {group.source !== 'core' ? `${t('catalog-plugin', 'Plugin')} · ` : ''}
                {countLabel(items.length)}
              </span>
            </span>
          </Command.Item>
        ))}
      </Command.Group>
    </>
  );
};

/** What the list shows: search results, one category's items, or recents and categories. */
export const CatalogList = ({
  kind,
  groups,
  current,
  searching,
  value,
  selected,
  recentItems,
  onChoose,
  onOpen,
}: {
  kind: string;
  groups: GroupEntry[];
  current: GroupEntry | null;
  searching: boolean;
  value: string | undefined;
  selected: CatalogItem | undefined;
  recentItems: CatalogItem[];
  onChoose: (type: string) => void;
  onOpen: (category: string) => void;
}) => {
  const { t } = useTranslation('automations');

  return (
    <Command.List className="max-h-80 min-h-0 flex-1">
      <Command.Empty>{t('catalog-empty', 'Nothing matches')}</Command.Empty>
      {searching && (
        <SearchResults
          kind={kind}
          groups={current ? [current] : groups}
          value={value}
          onChoose={onChoose}
        />
      )}
      {!searching && current && (
        <Command.Group>
          <Rows items={current.items} value={value} onChoose={onChoose} />
        </Command.Group>
      )}
      {!searching && !current && (
        <Categories
          kind={kind}
          groups={groups}
          recentItems={recentItems}
          selected={selected}
          onChoose={onChoose}
          onOpen={onOpen}
        />
      )}
    </Command.List>
  );
};
