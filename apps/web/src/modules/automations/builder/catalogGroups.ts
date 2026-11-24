import {
  IconActivity,
  IconAlertTriangle,
  IconArchive,
  IconArrowBackUp,
  IconArrowRight,
  IconAutomation,
  IconBolt,
  IconBrandDiscord,
  IconBrandFacebook,
  IconBrandInstagram,
  IconBrandTelegram,
  IconBuilding,
  IconCash,
  IconChecklist,
  IconCirclePlus,
  IconCircleX,
  IconClockX,
  IconCreditCard,
  IconFolder,
  IconForms,
  IconGitMerge,
  IconLink,
  IconLogin2,
  IconMagnet,
  IconMail,
  IconMessage,
  IconMessageCircle,
  IconNote,
  IconPackage,
  IconPencil,
  IconPhone,
  IconPlugConnected,
  IconPuzzle,
  IconReceiptRefund,
  IconRestore,
  IconTag,
  IconTicket,
  IconTransform,
  IconTrash,
  IconUnlink,
  IconUser,
  IconUserCheck,
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
  /** Listed, but not offered yet. */
  comingSoon?: boolean;
}

export interface CatalogGroup {
  key: string;
  source?: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  logo?: boolean;
  order: number;
  comingSoon?: boolean;
}

/** Core's categories (`catalogCategory`), in this order. */
const CORE_AREAS: Record<string, Omit<CatalogGroup, 'key'>> = {
  'core:customers': { label: 'Customers', icon: IconUser, order: 0 },
  'core:leads': { label: 'Leads', icon: IconMagnet, order: 1 },
  'core:companies': { label: 'Companies', icon: IconBuilding, order: 2 },
  'core:payments': { label: 'Payments', icon: IconCreditCard, order: 3 },
  'core:products': { label: 'Products', icon: IconPackage, order: 3 },
  'core:messages': { label: 'Messages', icon: IconMail, order: 4 },
  'core:timeline': { label: 'Timeline', icon: IconNote, order: 5 },
  'core:integrations': { label: 'Integrations', icon: IconWebhook, order: 6 },
  'core:automations': { label: 'Automations', icon: IconAutomation, order: 7 },
};

const GENERAL = { label: 'General', icon: IconBolt, order: 50 };

const CORE_ICONS: Record<string, TablerIcon> = {
  'core.webhook.reply': IconArrowBackUp,
};

const areaOf = (item: CatalogItem): CatalogGroup => {
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

/** An item's category; one not offered yet comes last. */
export const groupOf = (item: CatalogItem): CatalogGroup =>
  item.comingSoon ? { ...areaOf(item), comingSoon: true, order: 200 } : areaOf(item);

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

/** What an event's last word says happened, first match first (`core.payment.paid`). */
const VERB_ICONS: [RegExp, TablerIcon][] = [
  [/^(created|signed_up)$/, IconCirclePlus],
  [/^(updated|changed|role_changed|password_set)$/, IconPencil],
  [/^deleted$/, IconTrash],
  [/^restored$/, IconRestore],
  [/^merged$/, IconGitMerge],
  [/^tagged$/, IconTag],
  [/unlinked$/, IconUnlink],
  [/linked$/, IconLink],
  [/^assigned$/, IconUserCheck],
  [/^note_added$/, IconNote],
  [/^stage_changed$/, IconArrowRight],
  [/^converted$/, IconTransform],
  [/^paid$/, IconCash],
  [/^refunded$/, IconReceiptRefund],
  [/^cancelled$/, IconCircleX],
  [/^expired$/, IconClockX],
  [/^archived$/, IconArchive],
  [/^signed_in$/, IconLogin2],
  [/^activity$/, IconActivity],
  [/failed$/, IconAlertTriangle],
];

/** An event's icon: what happened (created, paid, merged), else what it is about. */
export const eventIcon = (item: CatalogItem) => {
  const verb = item.type.split('.').at(-1) ?? '';

  return VERB_ICONS.find(([word]) => word.test(verb))?.[1] ?? catalogIcon(item);
};

export type GroupEntry = { group: CatalogGroup; items: CatalogItem[] };

const CHANNEL_WORDS =
  /^(facebook|instagram|messenger|telegram|discord|whatsapp|viber|mail|email|sms|call)$/;

const sectionName = (word: string) => {
  const name = word.replaceAll('_', ' ');
  const plural = name.endsWith('s') ? name : `${name}s`;

  return plural.charAt(0).toUpperCase() + plural.slice(1);
};

/** A plugin's items by what they are about (`frontline.ticket.…` under Tickets), channels together. */
export const sectionsOf = (items: CatalogItem[]) => {
  const byName = new Map<string, CatalogItem[]>();

  for (const item of items) {
    const word = item.type.split('.')[1] ?? '';
    const name = CHANNEL_WORDS.test(word) ? 'Channels' : sectionName(word);

    byName.set(name, [...(byName.get(name) ?? []), item]);
  }

  return [...byName].map(([name, sectionItems]) => ({ name, items: sectionItems }));
};

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

/** A group's name, the search placeholder and the picker's name, translated. */
export const useCatalogLabels = (kind: string) => {
  const { t } = useTranslation('automations');

  const groupName = (group: CatalogGroup) =>
    group.key.startsWith('core:') ? t(`catalog-group.${group.label}`, group.label) : group.label;

  const searchPlaceholder =
    kind === 'action'
      ? t('catalog-search-actions', 'Search actions…')
      : t('catalog-search-events', 'Search events…');

  /** The picker's name, for screen readers. */
  const pickerLabel =
    kind === 'action'
      ? t('catalog-pick-action', 'Choose an action')
      : t('catalog-pick-event', 'Choose an event');

  return { groupName, searchPlaceholder, pickerLabel };
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
