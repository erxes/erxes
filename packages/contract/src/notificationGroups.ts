import { NOTIFICATION_DELIVERIES } from '@erxes/core-db/enums';
import { z } from 'zod';

// Which notifications a member can choose about, and how. Values only (no
// table), so the browser imports them at runtime like `values.ts`.

/** What the email sending ramp tells admins as it happens; all but `resumed` are important. */
export const EMAIL_NOTIFICATION_KINDS = [
  'core.email.halted',
  'core.email.capped',
  'core.email.limit_reached',
  'core.email.events_refused',
  'core.email.resumed',
] as const;

/** Security notices, and the email sending ramp's, that a member can't mute. */
export const UNMUTABLE_NOTIFICATION_KINDS: readonly string[] = [
  'core.user.role_changed',
  'core.user.password_set',
  'core.security.mass_deletion',
  'core.security.alert',
  'core.security.new_sign_in',
  ...EMAIL_NOTIFICATION_KINDS,
];

/** Where a group of notifications goes: the inbox and email, the inbox only, or nowhere. */
export const NotificationDelivery = z.enum(NOTIFICATION_DELIVERIES);

export type NotificationDelivery = z.infer<typeof NotificationDelivery>;

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
