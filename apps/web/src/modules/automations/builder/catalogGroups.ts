import {
  IconBolt,
  IconBuilding,
  IconCreditCard,
  IconMagnet,
  IconMail,
  IconNote,
  IconPuzzle,
  IconUser,
  IconWebhook,
  type TablerIcon,
} from '@tabler/icons-react';
import { storedFamily } from 'erxes-ui';
import { useAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { pluginLabel } from '~/lib/members';

export interface CatalogItem {
  /** `core.customer.created`, `hr.leave.approved`, `core.email.send` … */
  type: string;
  label: string;
  description?: string | null;
  /** `core` or the plugin. */
  source: string;
}

export interface CatalogGroup {
  key: string;
  source?: string;
  label: string;
  icon: TablerIcon;
  order: number;
}

/** Core's areas, by the second part of the type (`core.<area>.…`), in this order. */
const CORE_AREAS: Record<string, Omit<CatalogGroup, 'key'>> = {
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

export const groupOf = (item: CatalogItem): CatalogGroup => {
  if (item.source !== 'core') {
    return {
      key: `plugin:${item.source}`,
      source: item.source,
      label: pluginLabel(item.source),
      icon: IconPuzzle,
      order: 100,
    };
  }

  const area = CORE_AREAS[item.type.split('.')[1] ?? ''];

  return area
    ? { key: `core:${area.label}`, source: 'core', ...area }
    : { key: 'core:general', source: 'core', label: 'General', icon: IconBolt, order: 50 };
};

/** The icon of an event's or action's area (a mail for email, a person for customers, a puzzle for plugins). */
export const catalogIcon = (item: CatalogItem) => groupOf(item).icon;

export type GroupEntry = { group: CatalogGroup; items: CatalogItem[] };

/** The items by area (core's in a fixed order, then plugins by name). */
export const groupItems = (items: CatalogItem[]) => {
  const byKey = new Map<string, GroupEntry>();

  for (const item of items) {
    const group = groupOf(item);
    const entry = byKey.get(group.key) ?? { group, items: [] };

    entry.items.push(item);
    byKey.set(group.key, entry);
  }

  return [...byKey.values()].toSorted(
    (a, b) => a.group.order - b.group.order || a.group.label.localeCompare(b.group.label),
  );
};

/** Every word typed appears in the name, description, area or app (not cmdk's loose fuzzy match). */
export const matchWords = (value: string, search: string, keywords?: string[]) => {
  const haystack = [value, ...(keywords ?? [])].join(' ').toLowerCase();

  return search
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((word) => haystack.includes(word))
    ? 1
    : 0;
};

/** A group's name and an "N events" / "N actions" count, translated. */
export const useCatalogLabels = (kind: string) => {
  const { t } = useTranslation('automations');

  const groupName = (group: CatalogGroup) =>
    group.source === 'core' ? t(`catalog-group.${group.label}`, group.label) : group.label;

  const countLabel = (count: number) =>
    kind === 'action'
      ? t('catalog-count-action', {
          count,
          defaultValue_one: '{{count}} action',
          defaultValue_other: '{{count}} actions',
        })
      : t('catalog-count-event', {
          count,
          defaultValue_one: '{{count}} event',
          defaultValue_other: '{{count}} events',
        });

  /** Inside a category, its name; otherwise what is searched. */
  const searchPlaceholder = (group?: CatalogGroup) => {
    if (group) {
      return t('catalog-search-in', {
        name: groupName(group),
        defaultValue: 'Search in {{name}}…',
      });
    }

    return kind === 'action'
      ? t('catalog-search-actions', 'Search actions…')
      : t('catalog-search-events', 'Search events…');
  };

  return { groupName, countLabel, searchPlaceholder };
};

const RECENT_LIMIT = 4;

const recentState = storedFamily({
  key: 'erxes:automations:recent',
  schema: z.array(z.string()).max(RECENT_LIMIT),
  initial: [],
});

/** The last few picked of a kind (trigger or action), in this browser. */
export const useRecent = (kind: string) => {
  const [recent, setRecent] = useAtom(recentState(kind));

  const remember = (type: string) =>
    setRecent((current) =>
      [type, ...current.filter((item) => item !== type)].slice(0, RECENT_LIMIT),
    );

  return { recent, remember };
};
