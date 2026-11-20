import { isIntegrationType } from '@erxes/core-contract/integrationValues';
import { IconCheck, IconClockHour4, type TablerIcon } from '@tabler/icons-react';
import { cn, Command } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import {
  catalogIcon,
  type CatalogItem,
  type GroupEntry,
  groupOf,
  useCatalogLabels,
} from './catalogGroups';

const IconTile = ({ icon: Icon, selected }: { icon: TablerIcon; selected: boolean }) => (
  <span
    className={cn(
      'flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground',
      selected && 'bg-primary/10 text-primary-text',
    )}
  >
    <Icon className="size-4" />
  </span>
);

const Row = ({
  item,
  selected,
  onSelect,
  keyPrefix = '',
}: {
  item: CatalogItem;
  selected: boolean;
  onSelect: () => void;
  keyPrefix?: string;
}) => {
  const group = groupOf(item);

  return (
    <Command.Item
      value={`${keyPrefix}${item.type}`}
      keywords={[item.label, item.description ?? '', group.label, item.source]}
      onSelect={onSelect}
      variant="tile"
      checked={selected}
    >
      <IconTile icon={catalogIcon(item)} selected={selected} />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium">{item.label}</span>
        {item.description && (
          <span className="line-clamp-2 block text-xs text-muted-foreground">
            {item.description}
          </span>
        )}
      </span>
      {selected && <IconCheck className="size-4 shrink-0 text-primary-text" />}
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
}) => (
  <div className="flex flex-col gap-1">
    {items.map((item) => (
      <Row
        key={item.type}
        item={item}
        selected={item.type === value}
        onSelect={() => onChoose(item.type)}
      />
    ))}
  </div>
);

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

  const sourceKind = (items: CatalogItem[]) =>
    items.some((item) => isIntegrationType(item.type))
      ? t('catalog-integration', 'Integration')
      : t('catalog-plugin', 'Plugin');

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
          <div className="flex flex-col gap-1">
            {recentItems.map((item) => (
              <Row
                key={`recent:${item.type}`}
                keyPrefix="recent:"
                item={item}
                selected={item.type === selected?.type}
                onSelect={() => onChoose(item.type)}
              />
            ))}
          </div>
        </Command.Group>
      )}
      <Command.Group heading={t('catalog-categories', 'Categories')}>
        <div className="grid grid-cols-2 gap-1">
          {groups.map(({ group, items }) => (
            <Command.Item
              key={group.key}
              value={`category:${group.key}`}
              onSelect={() => onOpen(group.key)}
              variant="tile"
              checked={selectedKey === group.key}
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
                  {group.source !== 'core' ? `${sourceKind(items)} · ` : ''}
                  {countLabel(items.length)}
                </span>
              </span>
            </Command.Item>
          ))}
        </div>
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
    <Command.List className="max-h-96 min-h-0 flex-1">
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
