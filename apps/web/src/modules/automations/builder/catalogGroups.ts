import {
  IconArrowBackUp,
  IconAutomation,
  IconBolt,
  IconBrandDiscord,
  IconBrandFacebook,
  IconBrandInstagram,
  IconBrandTelegram,
  IconBuilding,
  IconChecklist,
  IconCreditCard,
  IconFolder,
  IconForms,
  IconMagnet,
  IconMail,
  IconMessage,
  IconMessageCircle,
  IconNote,
  IconPhone,
  IconPlugConnected,
  IconPuzzle,
  IconSparkles,
  IconTicket,
  IconUser,
  IconUsers,
  IconWebhook,
  type TablerIcon,
} from '@tabler/icons-react';
import { catalogCategory } from '@erxes/core-contract/values';
import { storedFamily } from 'erxes-ui';
import { useAtom } from 'jotai';
import type { ComponentType } from 'react';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { pluginLabel } from '~/lib/members';
import { initialMark, logoOf } from '~/modules/settings/integrations/logos';

export interface CatalogItem {
  /** `core.customer.created`, `hr.leave.approved`, `core.email.send` … */
  type: string;
  label: string;
  description?: string | null;
  /** `core` or the plugin. */
  source: string;
  /** The integration an action belongs to (`qpay`, `frontline.facebook`), and its name. */
  integration?: string | null;
  integrationName?: string | null;
  /** What picking it would break in the flow ("Removes 1 step"). */
  warning?: string;
}

export interface CatalogGroup {
  key: string;
  source?: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  logo?: boolean;
  order: number;
}

/** Core's categories (`catalogCategory`), in this order. */
const CORE_AREAS: Record<string, Omit<CatalogGroup, 'key'>> = {
  'core:customers': { label: 'Customers', icon: IconUser, order: 0 },
  'core:leads': { label: 'Leads', icon: IconMagnet, order: 1 },
  'core:companies': { label: 'Companies', icon: IconBuilding, order: 2 },
  'core:payments': { label: 'Payments', icon: IconCreditCard, order: 3 },
  'core:messages': { label: 'Messages', icon: IconMail, order: 4 },
  'core:timeline': { label: 'Timeline', icon: IconNote, order: 5 },
  'core:integrations': { label: 'Integrations', icon: IconWebhook, order: 6 },
  'core:agents': { label: 'AI agents', icon: IconSparkles, order: 7 },
  'core:automations': { label: 'Automations', icon: IconAutomation, order: 8 },
};

const GENERAL = { label: 'General', icon: IconBolt, order: 50 };

const CORE_ICONS: Record<string, TablerIcon> = {
  'core.webhook.reply': IconArrowBackUp,
};

export const groupOf = (item: CatalogItem): CatalogGroup => {
  const key = catalogCategory(item);

  if (item.integration) {
    const label = item.integrationName ?? item.integration;
    const builtIn = !item.integration.includes('.');

    return {
      key,
      source: item.source,
      label,
      icon: builtIn ? (logoOf(item.integration) ?? initialMark(label)) : IconPlugConnected,
      ...(builtIn && { logo: logoOf(item.integration) !== null }),
      order: 60,
    };
  }

  if (item.source !== 'core') {
    return {
      key,
      source: item.source,
      label: pluginLabel(item.source),
      icon: IconPuzzle,
      order: 100,
    };
  }

  return { key, source: 'core', ...(CORE_AREAS[key] ?? GENERAL) };
};

/** What a word in a plugin's type usually means, first match first (`frontline.facebook.message_received`). */
const WORD_ICONS: [RegExp, TablerIcon][] = [
  [/^facebook$/, IconBrandFacebook],
  [/^instagram$/, IconBrandInstagram],
  [/^telegram$/, IconBrandTelegram],
  [/^discord$/, IconBrandDiscord],
  [/^e?mail$/, IconMail],
  [/^comment$/, IconMessageCircle],
  [/^(message|conversation|chat)$/, IconMessage],
  [/^ticket$/, IconTicket],
  [/^(form|survey)$/, IconForms],
  [/^(task|triage)$/, IconChecklist],
  [/^project$/, IconFolder],
  [/^(team|member)$/, IconUsers],
  [/^call$/, IconPhone],
];

/**
 * An event's or action's icon: for a plugin's, what a word of its type names (a channel, a
 * ticket, a task), else its area's (a mail for email, a person for customers, a puzzle for plugins).
 */
export const catalogIcon = (item: CatalogItem) => {
  const words = item.source === 'core' ? [] : item.type.split(/[._]/).slice(1);
  const found = WORD_ICONS.find(([word]) => words.some((part) => word.test(part)));

  return found?.[1] ?? CORE_ICONS[item.type] ?? groupOf(item).icon;
};

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
    group.key.startsWith('core:') ? t(`catalog-group.${group.label}`, group.label) : group.label;

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

  /** The picker's name, for screen readers. */
  const pickerLabel =
    kind === 'action'
      ? t('catalog-pick-action', 'Choose an action')
      : t('catalog-pick-event', 'Choose an event');

  return { groupName, countLabel, searchPlaceholder, pickerLabel };
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
