import { IconCheck } from '@tabler/icons-react';
import { cn, Command } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import {
  type CatalogItem,
  type GroupEntry,
  groupOf,
  sectionsOf,
  useCatalogLabels,
} from './catalogGroups';

export const RECENT = 'recent';

/** Which item and category show as picked. */
export type Picked = {
  item: (item: CatalogItem) => boolean;
  category: (key: string) => boolean;
};

const Row = ({
  item,
  selected,
  onSelect,
}: {
  item: CatalogItem;
  selected: boolean;
  onSelect: () => void;
}) => (
  <Command.Item
    value={item.type}
    keywords={[item.label, item.description ?? '', groupOf(item).label, item.source]}
    onSelect={onSelect}
    variant="tile"
    checked={selected}
  >
    <span className="min-w-0 flex-1">
      <span className="block truncate text-sm font-medium">{item.label}</span>
      {item.description && (
        <span className="line-clamp-2 block text-xs text-muted-foreground">{item.description}</span>
      )}
      {item.warning && <span className="block text-xs text-warning-text">{item.warning}</span>}
    </span>
    {selected && <IconCheck className="size-4 shrink-0 text-primary-text" />}
  </Command.Item>
);

const Rows = ({
  items,
  picked,
  onChoose,
}: {
  items: CatalogItem[];
  picked: Picked;
  onChoose: (type: string) => void;
}) => (
  <div className="flex flex-col gap-0.5">
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

const RailButton = ({
  label,
  count,
  countHint,
  active,
  picked = false,
  soon = false,
  onClick,
}: {
  label: string;
  count: number;
  countHint: string;
  active: boolean;
  picked?: boolean;
  soon?: boolean;
  onClick: () => void;
}) => {
  const { t } = useTranslation('automations');

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={soon}
      aria-pressed={active}
      className={cn(
        'flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-sm transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-60',
        active && 'bg-primary/10 text-primary-text hover:bg-primary/10',
      )}
    >
      <span className={cn('min-w-0 flex-1 truncate font-medium', picked && 'text-primary-text')}>
        {label}
      </span>
      {soon ? (
        <span className="shrink-0 text-xs text-muted-foreground">
          {t('coming-soon-short', 'Soon')}
        </span>
      ) : (
        <span
          aria-label={countHint}
          className={cn(
            'text-xs tabular-nums text-muted-foreground',
            active && 'text-primary-text/70',
          )}
        >
          {count}
        </span>
      )}
    </button>
  );
};

const RailHeading = ({ children }: { children: string }) => (
  <span className="px-2.5 pt-3 pb-1 text-2xs font-medium tracking-wide text-muted-foreground uppercase">
    {children}
  </span>
);

const isApp = (entry: GroupEntry) => entry.group.key.startsWith('integration:');

const isCore = (entry: GroupEntry) => entry.group.key.startsWith('core:');

/** Recently used, core's areas, the plugins, then the apps: one click shows a category's items. */
const Rail = ({
  kind,
  groups,
  recentCount,
  active,
  picked,
  onOpen,
}: {
  kind: string;
  groups: GroupEntry[];
  recentCount: number;
  active: string | null;
  picked: Picked;
  onOpen: (category: string) => void;
}) => {
  const { t } = useTranslation('automations');
  const { groupName, countLabel } = useCatalogLabels(kind);
  const plugins = groups.filter((entry) => !isCore(entry) && !isApp(entry));

  const button = (entry: GroupEntry) => (
    <RailButton
      key={entry.group.key}
      label={groupName(entry.group)}
      count={entry.items.length}
      countHint={countLabel(entry.items.length)}
      active={active === entry.group.key}
      picked={picked.category(entry.group.key)}
      soon={entry.group.comingSoon}
      onClick={() => onOpen(entry.group.key)}
    />
  );

  const section = (heading: string, entries: GroupEntry[]) =>
    entries.length > 0 && [
      <RailHeading key={`heading:${heading}`}>{heading}</RailHeading>,
      ...entries.map(button),
    ];

  return (
    <nav className="flex w-48 shrink-0 flex-col gap-0.5 overflow-y-auto border-r p-1.5">
      {recentCount > 0 && (
        <RailButton
          label={t('catalog-recent', 'Recently used')}
          count={recentCount}
          countHint={countLabel(recentCount)}
          active={active === RECENT}
          onClick={() => onOpen(RECENT)}
        />
      )}
      {groups.filter(isCore).map(button)}
      {section(t('catalog-plugins', 'Plugins'), plugins)}
      {section(t('catalog-apps', 'Apps'), groups.filter(isApp))}
    </nav>
  );
};

/** Matches across every category, under their names. */
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
    <Command.Group key={group.key} heading={groupName(group)}>
      <Rows items={items} picked={picked} onChoose={onChoose} />
    </Command.Group>
  ));
};

/** One category's items: a plugin's by what they are about, when there is more than one. */
const CategoryItems = ({
  items,
  sectioned,
  picked,
  onChoose,
}: {
  items: CatalogItem[];
  sectioned: boolean;
  picked: Picked;
  onChoose: (type: string) => void;
}) => {
  const sections = sectioned ? sectionsOf(items) : [];

  if (sections.length < 2)
    return (
      <Command.Group>
        <Rows items={items} picked={picked} onChoose={onChoose} />
      </Command.Group>
    );

  return sections.map((section) => (
    <Command.Group key={section.name} heading={section.name}>
      <Rows items={section.items} picked={picked} onChoose={onChoose} />
    </Command.Group>
  ));
};

/** Categories on the left, the open one's items (or what search finds) on the right. */
export const CatalogList = ({
  kind,
  groups,
  category,
  searching,
  picked,
  recentItems,
  onChoose,
  onOpen,
}: {
  kind: string;
  groups: GroupEntry[];
  category: string | null;
  searching: boolean;
  picked: Picked;
  recentItems: CatalogItem[];
  onChoose: (type: string) => void;
  onOpen: (category: string) => void;
}) => {
  const { t } = useTranslation('automations');
  const current = groups.find((entry) => entry.group.key === category);

  return (
    <div className="flex h-96 max-h-full min-h-0">
      <Rail
        kind={kind}
        groups={groups}
        recentCount={recentItems.length}
        active={searching ? null : category}
        picked={picked}
        onOpen={onOpen}
      />
      <Command.List className="max-h-none min-h-0 flex-1 overflow-y-auto">
        <Command.Empty>{t('catalog-empty', 'Nothing matches')}</Command.Empty>
        {searching ? (
          <SearchResults
            kind={kind}
            groups={groups.filter((entry) => !entry.group.comingSoon)}
            picked={picked}
            onChoose={onChoose}
          />
        ) : (
          <CategoryItems
            items={category === RECENT ? recentItems : (current?.items ?? [])}
            sectioned={current !== undefined && current.group.source !== 'core'}
            picked={picked}
            onChoose={onChoose}
          />
        )}
      </Command.List>
    </div>
  );
};
