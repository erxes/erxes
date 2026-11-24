import { IconCheck, IconClock } from '@tabler/icons-react';
import { cn, Command } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import {
  type CatalogItem,
  catalogIcon,
  eventIcon,
  type GroupEntry,
  groupOf,
  sectionsOf,
  useCatalogLabels,
} from './catalogGroups';
import { LOOK, type NodeIcon } from './stepLook';

export const RECENT = 'recent';

/** Which item and category show as picked. */
export type Picked = {
  item: (item: CatalogItem) => boolean;
  category: (key: string) => boolean;
};

/** An event's icon says what happened; an action's, what it works on. */
export const itemIcon = (kind: string, item: CatalogItem) =>
  kind === 'action' ? catalogIcon(item) : eventIcon(item);

/** Coloured as its card on the canvas: an event green, an action primary. */
export const ItemIcon = ({ kind, icon: Icon }: { kind: string; icon: NodeIcon }) => (
  <span
    className={cn(
      'flex size-8 shrink-0 items-center justify-center rounded-lg',
      kind === 'action' ? LOOK.action.tone : LOOK.trigger.tone,
    )}
  >
    <Icon className="size-4" />
  </span>
);

/** One choice as a card: what it is and what it does. */
const Card = ({
  kind,
  item,
  selected,
  onSelect,
}: {
  kind: string;
  item: CatalogItem;
  selected: boolean;
  onSelect: () => void;
}) => (
  <Command.Item
    value={item.type}
    keywords={[item.label, item.description ?? '', groupOf(item).label, item.source]}
    onSelect={onSelect}
    variant="choice"
    checked={selected}
  >
    <span className="flex items-start justify-between gap-2">
      <ItemIcon kind={kind} icon={itemIcon(kind, item)} />
      {selected && <IconCheck className="size-4 text-primary-text" />}
    </span>
    <span className="line-clamp-2 text-sm leading-snug font-medium">{item.label}</span>
    {item.description && (
      <span className="line-clamp-2 text-xs text-muted-foreground">{item.description}</span>
    )}
  </Command.Item>
);

const Cards = ({
  kind,
  items,
  picked,
  onChoose,
}: {
  kind: string;
  items: CatalogItem[];
  picked: Picked;
  onChoose: (type: string) => void;
}) =>
  items.map((item) => (
    <Card
      key={item.type}
      kind={kind}
      item={item}
      selected={picked.item(item)}
      onSelect={() => onChoose(item.type)}
    />
  ));

const RailButton = ({
  label,
  icon: Icon,
  active,
  picked = false,
  soon = false,
  onClick,
}: {
  label: string;
  icon: NodeIcon;
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
        'flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-left text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-60',
        active && 'bg-primary/10 text-foreground hover:bg-primary/10',
      )}
    >
      <Icon className={cn('size-4 shrink-0', active && 'text-primary-text')} />
      <span className="min-w-0 flex-1 truncate font-medium">{label}</span>
      {soon && (
        <span className="shrink-0 text-xs text-muted-foreground">
          {t('coming-soon-short', 'Soon')}
        </span>
      )}
      {picked && <span className="size-1.5 shrink-0 rounded-full bg-primary" />}
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
  const { groupName } = useCatalogLabels(kind);
  const plugins = groups.filter((entry) => !isCore(entry) && !isApp(entry));

  const button = (entry: GroupEntry) => (
    <RailButton
      key={entry.group.key}
      label={groupName(entry.group)}
      icon={entry.group.icon}
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
          icon={IconClock}
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
    <Command.Group key={group.key} heading={groupName(group)} layout="choices">
      <Cards kind={kind} items={items} picked={picked} onChoose={onChoose} />
    </Command.Group>
  ));
};

/** One category's items: a plugin's by what they are about, when there is more than one. */
const CategoryItems = ({
  kind,
  items,
  sectioned,
  picked,
  onChoose,
}: {
  kind: string;
  items: CatalogItem[];
  sectioned: boolean;
  picked: Picked;
  onChoose: (type: string) => void;
}) => {
  const sections = sectioned ? sectionsOf(items) : [];

  if (sections.length < 2)
    return (
      <Command.Group layout="choices">
        <Cards kind={kind} items={items} picked={picked} onChoose={onChoose} />
      </Command.Group>
    );

  return sections.map((section) => (
    <Command.Group key={section.name} heading={section.name} layout="choices">
      <Cards kind={kind} items={section.items} picked={picked} onChoose={onChoose} />
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
    <div className="flex h-112 max-h-full min-h-0">
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
            kind={kind}
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
