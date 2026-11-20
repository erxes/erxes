import type { NotificationDelivery } from './values';
import { UNMUTABLE_NOTIFICATION_KINDS } from './values';

/**
 * Core's notifications in groups a member chooses for at once (each plugin
 * is a group of its own). `security` is always on.
 */
export const CORE_NOTIFICATION_GROUPS = [
  {
    key: 'assigned',
    label: 'Assigned to me',
    kinds: ['core.customer.assigned', 'core.company.assigned'],
    default: 'email',
  },
  {
    key: 'records',
    label: 'Changes to records I own',
    kinds: [
      'core.customer.updated',
      'core.customer.merged',
      'core.customer.deleted',
      'core.company.updated',
      'core.company.merged',
      'core.company.deleted',
      'core.customer.activity',
      'core.company.activity',
    ],
    default: 'inbox',
  },
  { key: 'mentions', label: 'Mentions', kinds: ['core.note.mentioned'], default: 'email' },
  {
    key: 'automations',
    label: 'Automations',
    kinds: ['core.automation.message', 'core.automation.failed'],
    default: 'inbox',
  },
  {
    key: 'transfer',
    label: 'Imports and exports',
    kinds: ['core.import.done', 'core.export.ready'],
    default: 'inbox',
  },
  {
    key: 'integrations',
    label: 'Integrations',
    kinds: ['core.integration.broken'],
    default: 'email',
  },
  { key: 'security', label: 'Security', kinds: UNMUTABLE_NOTIFICATION_KINDS, default: 'inbox' },
] as const satisfies readonly {
  key: string;
  label: string;
  kinds: readonly string[];
  default: NotificationDelivery;
}[];

/** The group a notification belongs to: a core group, or the plugin that sent it. */
export const notificationGroupOf = (source: string, kind: string) =>
  source === 'core'
    ? (CORE_NOTIFICATION_GROUPS.find((group) => (group.kinds as readonly string[]).includes(kind))
        ?.key ?? 'records')
    : source;
