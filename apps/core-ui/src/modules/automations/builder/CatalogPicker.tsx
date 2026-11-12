import {
  IconBolt,
  IconBuilding,
  IconCheck,
  IconChevronDown,
  IconClockHour4,
  IconCreditCard,
  IconMagnet,
  IconMail,
  IconNote,
  IconPuzzle,
  IconUser,
  IconWebhook,
  type TablerIcon,
} from '@tabler/icons-react';
import { cn, Command, Popover } from 'erxes-ui';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { pluginLabel } from '~/lib/members';

/**
 * Picking an event or an action out of what core and every installed plugin
 * offer: searchable, grouped by area (core) and by plugin, recently used
 * first, one line on each; a row of apps to narrow it when plugins are there.
 */

export interface CatalogItem {
  /** `core.customer.created`, `hr.leave.approved`, `core.email.send` … */
  type: string;
  label: string;
  description?: string | null;
  /** `core` or the plugin. */
  source: string;
}

interface Group {
  key: string;
  source?: string;
  label: string;
  icon: TablerIcon;
  order: number;
}

/** Core's areas, by the second part of the type (`core.<area>.…`), in this order. */
const CORE_AREAS: Record<string, Omit<Group, 'key'>> = {
  customer: { label: 'Customers', icon: IconUser, order: 0 },
  lead: { label: 'Leads', icon: IconMagnet, order: 1 },
  company: { label: 'Companies', icon: IconBuilding, order: 2 },
  payment: { label: 'Payments', icon: IconCreditCard, order: 3 },
  email: { label: 'Messages', icon: IconMail, order: 4 },
  notification: { label: 'Messages', icon: IconMail, order: 4 },
  note: { label: 'Timeline', icon: IconNote, order: 5 },
  webhook: { label: 'Integrations', icon: IconWebhook, order: 6 },
  http: { label: 'Integrations', icon: IconWebhook, order: 6 },
};

const groupOf = (item: CatalogItem): Group => {
  if (item.source !== 'core') return { key: `plugin:${item.source}`, source: item.source, label: pluginLabel(item.source), icon: IconPuzzle, order: 100 };

  const area = CORE_AREAS[item.type.split('.')[1] ?? ''];

  return area ? { key: `core:${area.label}`, source: 'core', ...area } : { key: 'core:general', source: 'core', label: 'General', icon: IconBolt, order: 50 };
};

/** Every word typed appears in the name, description, area or app (not cmdk's loose fuzzy match). */
const matchWords = (value: string, search: string, keywords?: string[]) => {
  const haystack = [value, ...(keywords ?? [])].join(' ').toLowerCase();

  return search
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((word) => haystack.includes(word))
    ? 1
    : 0;
};

const RECENT_LIMIT = 4;

/** The last few picked of a kind, in this browser. */
const useRecent = (kind: string) => {
  const key = `erxes_automation_recent_${kind}`;
  const read = (): string[] => {
    try {
      return JSON.parse(localStorage.getItem(key) ?? '[]') as string[];
    } catch {
      return [];
    }
  };
  const [recent, setRecent] = useState(read);

  const remember = (type: string) => {
    const next = [type, ...recent.filter((item) => item !== type)].slice(0, RECENT_LIMIT);

    setRecent(next);
    try {
      localStorage.setItem(key, JSON.stringify(next));
    } catch {
      // Private mode: no memory, still works.
    }
  };

  return { recent, remember };
};

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
        {item.description && <span className="block truncate text-xs text-muted-foreground">{item.description}</span>}
      </span>
      {selected && <IconCheck className="mt-1 size-4 shrink-0 text-primary" />}
    </Command.Item>
  );
};

export const CatalogPicker = ({
  kind,
  items,
  value,
  onChange,
  disabled,
  placeholder,
}: {
  /** Which list (`event`, `action`): recents are kept per kind. */
  kind: string;
  items: CatalogItem[];
  value: string | undefined;
  onChange: (type: string) => void;
  disabled?: boolean;
  placeholder?: string;
}) => {
  const { t } = useTranslation('automations');
  const [open, setOpen] = useState(false);
  const [app, setApp] = useState<string>('all');
  const { recent, remember } = useRecent(kind);
  const selected = items.find((item) => item.type === value);
  const apps = useMemo(() => [...new Set(items.map((item) => item.source))].sort((a, b) => (a === 'core' ? -1 : b === 'core' ? 1 : a.localeCompare(b))), [items]);
  const shown = app === 'all' ? items : items.filter((item) => item.source === app);
  const groups = useMemo(() => {
    const byKey = new Map<string, { group: Group; items: CatalogItem[] }>();

    for (const item of shown) {
      const group = groupOf(item);
      const entry = byKey.get(group.key) ?? { group, items: [] };

      entry.items.push(item);
      byKey.set(group.key, entry);
    }

    return [...byKey.values()].sort((a, b) => a.group.order - b.group.order || a.group.label.localeCompare(b.group.label));
  }, [shown]);
  const recentItems = recent.map((type) => shown.find((item) => item.type === type)).filter((item): item is CatalogItem => Boolean(item));
  const choose = (type: string) => {
    remember(type);
    onChange(type);
    setOpen(false);
  };
  const SelectedIcon = selected ? groupOf(selected).icon : IconBolt;

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setApp('all');
      }}
    >
      <Popover.Trigger asChild>
        <button
          type="button"
          disabled={disabled}
          className="flex h-auto min-h-9 w-full items-center gap-2.5 rounded-md border bg-background px-2.5 py-1.5 text-left shadow-xs transition-colors hover:bg-muted/40 focus-visible:outline-hidden focus-visible:shadow-focus disabled:cursor-not-allowed disabled:opacity-60 data-[state=open]:border-primary/40"
        >
          <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
            <SelectedIcon className="size-3.5" />
          </span>
          <span className="min-w-0 flex-1">
            {selected ? (
              <>
                <span className="block truncate text-sm">{selected.label}</span>
                <span className="block truncate text-xs text-muted-foreground">
                  {groupOf(selected).label}
                  {selected.source !== 'core' ? '' : ` · ${t('catalog-core', 'Core')}`}
                </span>
              </>
            ) : (
              <span className="block truncate text-sm text-muted-foreground">{value || placeholder || t('catalog-choose', 'Choose…')}</span>
            )}
          </span>
          <IconChevronDown className="size-4 shrink-0 text-muted-foreground" />
        </button>
      </Popover.Trigger>
      <Popover.Content align="start" sideOffset={6} className="w-(--radix-popper-anchor-width) min-w-80 max-w-[28rem] p-0">
        <Command loop filter={matchWords}>
          <Command.Input placeholder={kind === 'action' ? t('catalog-search-actions', 'Search actions…') : t('catalog-search-events', 'Search events…')} />
          {apps.length > 1 && (
            <div className="flex gap-1 overflow-x-auto border-b px-2 py-1.5">
              {['all', ...apps].map((name) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => setApp(name)}
                  className={cn(
                    'h-6 shrink-0 rounded-full px-2.5 text-xs text-muted-foreground transition-colors hover:bg-muted',
                    app === name && 'bg-primary/10 font-medium text-primary hover:bg-primary/10',
                  )}
                >
                  {name === 'all' ? t('catalog-all', 'All') : name === 'core' ? t('catalog-core', 'Core') : pluginLabel(name)}
                </button>
              ))}
            </div>
          )}
          <Command.List className="max-h-80">
            <Command.Empty>{t('catalog-empty', 'Nothing matches')}</Command.Empty>
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
                  <Row key={`recent:${item.type}`} keyPrefix="recent:" showIcon item={item} selected={item.type === value} onSelect={() => choose(item.type)} />
                ))}
              </Command.Group>
            )}
            {groups.map(({ group, items: groupItems }) => (
              <Command.Group
                key={group.key}
                heading={
                  <span className="flex items-center gap-1.5">
                    <group.icon className="size-3.5" />
                    {group.source === 'core' ? t(`catalog-group.${group.label}`, group.label) : group.label}
                  </span>
                }
              >
                {groupItems.map((item) => (
                  <Row key={item.type} item={item} selected={item.type === value} onSelect={() => choose(item.type)} />
                ))}
              </Command.Group>
            ))}
          </Command.List>
        </Command>
      </Popover.Content>
    </Popover>
  );
};
