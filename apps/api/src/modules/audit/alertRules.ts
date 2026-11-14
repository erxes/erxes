import { z } from 'zod';

/** An audit entry, as the alert rules read it. */
export interface Entry {
  action: string;
  targetType?: string | null;
  targetId?: string | null;
  targetLabel?: string | null;
  changes?: Record<string, unknown> | null;
  metadata?: Record<string, unknown> | null;
  ip?: string | null;
  userAgent?: string | null;
}

/** What the owners are told; `body` names who did it. */
interface OwnerAlert {
  title: string;
  body: (by: string) => string;
  link: string;
  /** Also by email. */
  email: boolean;
}

type OwnerRule = (label: string, entry: Entry) => OwnerAlert | null;

export const describeDevice = (userAgent?: string | null) => {
  if (!userAgent) return 'an unknown device';

  const browser = /Edg\//.test(userAgent)
    ? 'Edge'
    : /Chrome\//.test(userAgent)
      ? 'Chrome'
      : /Firefox\//.test(userAgent)
        ? 'Firefox'
        : /Safari\//.test(userAgent)
          ? 'Safari'
          : 'a browser';

  const system = /Windows/.test(userAgent)
    ? 'Windows'
    : /Mac OS X/.test(userAgent)
      ? /iPhone|iPad/.test(userAgent)
        ? 'iOS'
        : 'macOS'
      : /Android/.test(userAgent)
        ? 'Android'
        : /Linux/.test(userAgent)
          ? 'Linux'
          : 'an unknown system';

  return `${browser} on ${system}`;
};

/** `changes.role`: `[before, after]`, or an older `{ after }`. */
const RoleChange = z.object({
  role: z.union([z.array(z.unknown()), z.object({ after: z.unknown() })]).optional(),
});

const roleAfter = (changes: Entry['changes']) => {
  const role = RoleChange.safeParse(changes).data?.role;

  return Array.isArray(role) ? role[1] : role?.after;
};

const GatewayUpdate = z.object({ credentialsChanged: z.boolean().optional() });

const streamChanged: OwnerRule = (label, entry) => ({
  title: `Audit log streaming to ${label} was ${entry.action.slice('audit.stream_'.length)}`,
  body: (by) => `By ${by}.`,
  link: '/settings/audit-log',
  email: true,
});

/**
 * Rules that tell the owners, by risk. By email too: two-step sign-in turned
 * off; someone made owner or admin; audit retention changed; audit streaming
 * changed or stopped; a payment gateway connected or its credentials changed.
 * In erxes only: audit exported, a webhook created (data leaves erxes), a
 * role's permissions changed.
 */
export const OWNER_RULES: Record<string, OwnerRule> = {
  'auth.two_factor_disabled': (label) => ({
    title: `Two-step sign-in was turned off for ${label}`,
    body: (by) => `By ${by}. Their account is protected by a password only now.`,
    link: '/settings/team-members',
    email: true,
  }),
  'user.role_changed': (label, entry) => {
    const role = roleAfter(entry.changes);

    if (role !== 'owner' && role !== 'admin') return null;

    return {
      title: `${label} is now ${role === 'owner' ? 'an owner' : 'an admin'}`,
      body: (by) => `Changed by ${by}.`,
      link: '/settings/team-members',
      email: true,
    };
  },
  'settings.audit_retention_changed': () => ({
    title: 'Audit log retention was changed',
    body: (by) => `By ${by}. Older entries are deleted after the new period.`,
    link: '/settings/audit-log',
    email: true,
  }),
  'audit.stream_created': streamChanged,
  'audit.stream_updated': streamChanged,
  'audit.stream_paused': streamChanged,
  'audit.stream_resumed': streamChanged,
  'audit.stream_removed': streamChanged,
  'payment.gateway_added': (label) => ({
    title: `A payment gateway was connected: ${label}`,
    body: (by) => `By ${by}. Payments from now on may go to it.`,
    link: '/settings/payments',
    email: true,
  }),
  'payment.gateway_updated': (label, entry) =>
    GatewayUpdate.safeParse(entry.metadata).data?.credentialsChanged
      ? {
          title: `${label}'s payment credentials were changed`,
          body: (by) => `By ${by}. Check that payments still go to your account.`,
          link: '/settings/payments',
          email: true,
        }
      : null,
  'audit.exported': () => ({
    title: 'The audit log was exported',
    body: (by) => `By ${by}.`,
    link: '/settings/audit-log',
    email: false,
  }),
  'webhook.created': (label) => ({
    title: `A webhook now sends events to ${label}`,
    body: (by) => `Created by ${by}.`,
    link: '/settings/webhooks',
    email: false,
  }),
  'role.updated': (label) => ({
    title: `The ${label} role's permissions were changed`,
    body: (by) => `By ${by}.`,
    link: '/settings/roles',
    email: false,
  }),
};
