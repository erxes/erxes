import type { NotificationDelivery } from '@erxes/core-contract';
import {
  CORE_NOTIFICATION_GROUPS,
  notificationGroupOf,
  UNMUTABLE_NOTIFICATION_KINDS,
} from '@erxes/core-contract';
import type { users } from '@erxes/core-db';

export type MemberSettings = (typeof users.$inferSelect)['notificationSettings'];

/** Has the member muted this kind, its source, or a prefix of it? */
const isMuted = (muted: string[] | undefined, source: string, kind: string) =>
  !UNMUTABLE_NOTIFICATION_KINDS.includes(kind) &&
  (muted ?? []).some((entry) => entry === source || entry === kind || kind.startsWith(`${entry}.`));

/**
 * Where one notification goes for a member: security notices always reach
 * the inbox (their emails come from the alerts themselves); otherwise the
 * member's choice for its group (a core group, or the plugin), else the
 * group's default. Mutes from before groups still silence what they named.
 */
export const deliveryFor = (
  settings: MemberSettings,
  source: string,
  kind: string,
): NotificationDelivery => {
  if (UNMUTABLE_NOTIFICATION_KINDS.includes(kind)) return 'inbox';

  if (isMuted(settings.muted, source, kind)) return 'off';

  const group = notificationGroupOf(source, kind);
  const chosen = settings.groups?.[group];

  if (chosen) return chosen;

  return CORE_NOTIFICATION_GROUPS.find((item) => item.key === group)?.default ?? 'inbox';
};
