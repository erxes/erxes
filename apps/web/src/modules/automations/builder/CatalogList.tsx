import { IconCheck, IconClockHour4 } from '@tabler/icons-react';
import type { ComponentType } from 'react';
import { cn, Command } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import {
  type CatalogGroup,
  catalogIcon,
  type CatalogItem,
  type GroupEntry,
  groupOf,
  useCatalogLabels,
} from './catalogGroups';

const IconTile = ({
  icon: Icon,
  selected,
}: {
  icon: ComponentType<{ className?: string }>;
  selected: boolean;
}) => (
  <span
    className={cn(
      'flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground',
      selected && 'bg-primary/10 text-primary-text',
    )}
  >
    <Icon className="size-4" />
  </span>
);

/** A category's icon or app logo, as the action picker shows it. */
const GroupTile = ({ group }: { group: CatalogGroup }) => (
  <span
    className={cn(
      'flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted text-muted-foreground',
      group.source !== 'core' && 'bg-primary/10 text-primary-text',
      group.logo && 'border bg-white',
    )}
  >
    <group.icon className={group.logo ? 'size-5' : 'size-4'} />
  </span>
);

/** Which items and categories show as picked: one in a picker, several in a checklist. */
export type Picked = {
  item: (item: CatalogItem) => boolean;
  category: (key: string) => boolean;
};

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
        {item.warning && <span className="block text-xs text-warning-text">{item.warning}</span>}
      </span>
      {selected && <IconCheck className="size-4 shrink-0 text-primary-text" />}
    </Command.Item>
  );
};

const Rows = ({
  items,
  picked,
  onChoose,
}: {
  items: CatalogItem[];
  picked: Picked;
  onChoose: (type: string) => void;
}) => (
  <div className="flex flex-col gap-1">
    {items.map((item) => (
      <Row
        key={item.type}
        item={item}
        selected={picked.item(item)}
        onSelect={() => onChoose(item.type)}
      />
    ))}
  </div>
);

/** Matches, grouped by area: everywhere, or within the open category. */
const SearchResults = ({
  kind,
  groups,
  picked,
  onChoose,
}: {
  kind: string;
  groups: GroupEntry[];
  picked: Picked;
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
      <Rows items={items} picked={picked} onChoose={onChoose} />
    </Command.Group>
  ));
};

/** Recently used, then every category as a tile. */
const Categories = ({
  kind,
  groups,
  recentItems,
  picked,
  categoryHint,
  onChoose,
  onOpen,
}: {
  kind: string;
  groups: GroupEntry[];
  recentItems: CatalogItem[];
  picked: Picked;
  categoryHint: ((entry: GroupEntry) => string) | undefined;
  onChoose: (type: string) => void;
  onOpen: (category: string) => void;
}) => {
  const { t } = useTranslation('automations');
  const { groupName, countLabel } = useCatalogLabels(kind);

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
                selected={picked.item(item)}
                onSelect={() => onChoose(item.type)}
              />
            ))}
          </div>
        </Command.Group>
      )}
      <Command.Group heading={t('catalog-categories', 'Categories')}>
        <div className="grid grid-cols-2 gap-1">
          {groups.map((entry) => (
            <Command.Item
              key={entry.group.key}
              value={`category:${entry.group.key}`}
              onSelect={() => onOpen(entry.group.key)}
              variant="tile"
              checked={picked.category(entry.group.key)}
            >
              <GroupTile group={entry.group} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium">{groupName(entry.group)}</span>
                <span className="block truncate text-xs text-muted-foreground">
                  {categoryHint?.(entry) ?? (
                    <>
                      {entry.group.source !== 'core' ? `${t('catalog-plugin', 'Plugin')} · ` : ''}
                      {countLabel(entry.items.length)}
                    </>
                  )}
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
  picked,
  recentItems,
  categoryHint,
  onChoose,
  onOpen,
}: {
  kind: string;
  groups: GroupEntry[];
  current: GroupEntry | null;
  searching: boolean;
  picked: Picked;
  recentItems: CatalogItem[];
  /** A category tile's second line, in place of its size. */
  categoryHint?: (entry: GroupEntry) => string;
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
          picked={picked}
          onChoose={onChoose}
        />
      )}
      {!searching && current && (
        <Command.Group>
          <Rows items={current.items} picked={picked} onChoose={onChoose} />
        </Command.Group>
      )}
      {!searching && !current && (
        <Categories
          kind={kind}
          groups={groups}
          recentItems={recentItems}
          picked={picked}
          categoryHint={categoryHint}
          onChoose={onChoose}
          onOpen={onOpen}
        />
      )}
    </Command.List>
  );
};
