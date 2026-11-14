import type { NotificationDelivery, NotificationSettings } from '@erxes/core-contract';
import { CORE_NOTIFICATION_GROUPS } from '@erxes/core-contract';
import {
  caller,
  type Db,
  notifications,
  pluginInstallations,
  plugins,
  users,
} from '@erxes/core-db';
import { eq } from 'drizzle-orm';
import { HttpError } from '~/http/errors';
import type { MemberSettings } from './delivery';
import { mine } from './inbox.service';

/** Plugins that are installed or have notified the member, by name, with their titles. */
const pluginGroups = async (client: Db) => {
  const sources = await client
    .selectDistinct({ source: notifications.source })
    .from(notifications)
    .where(mine());

  const installed = await client
    .select({ name: pluginInstallations.plugin, manifest: plugins.manifest })
    .from(pluginInstallations)
    .innerJoin(plugins, eq(plugins.name, pluginInstallations.plugin))
    .where(eq(pluginInstallations.status, 'active'));

  const titles = new Map(installed.map((row) => [row.name, row.manifest?.title ?? row.name]));

  const names = [
    ...new Set([...installed.map((row) => row.name), ...sources.map((row) => row.source)]),
  ]
    .filter((name) => name !== 'core')
    .toSorted();

  return names.map((name) => ({ name, title: titles.get(name) ?? name }));
};

/**
 * The member's settings by group: core's groups, then each plugin that is
 * installed or has notified them. Plugins muted before groups show as off.
 */
export const notificationSettings = async (client: Db): Promise<NotificationSettings> => {
  const [user] = await client
    .select({ settings: users.notificationSettings })
    .from(users)
    .where(eq(users.id, caller('user').userId))
    .limit(1);

  const settings: MemberSettings = user?.settings ?? {};

  return {
    groups: [
      ...CORE_NOTIFICATION_GROUPS.map((group) => ({
        key: group.key,
        label: group.label,
        plugin: false,
        locked: group.key === 'security',
        delivery:
          group.key === 'security'
            ? ('inbox' as const)
            : (settings.groups?.[group.key] ?? group.default),
      })),
      ...(await pluginGroups(client)).map(({ name, title }) => ({
        key: name,
        label: title,
        plugin: true,
        locked: false,
        delivery:
          settings.groups?.[name] ??
          ((settings.muted ?? []).includes(name) ? ('off' as const) : ('inbox' as const)),
      })),
    ],
    email: settings.email !== false,
    browser: settings.browser === true,
  };
};

/**
 * Saves the member's choices. Security can't be turned off. Mutes from
 * before groups become their plugin's setting, and are then dropped.
 */
export const updateNotificationSettings = async (
  client: Db,
  input: { groups?: Record<string, NotificationDelivery>; email?: boolean; browser?: boolean },
) => {
  const current = await notificationSettings(client);

  const groups = Object.fromEntries(
    current.groups.filter((group) => !group.locked).map((group) => [group.key, group.delivery]),
  );

  for (const [key, delivery] of Object.entries(input.groups ?? {})) {
    if (key === 'security')
      throw new HttpError(400, 'ALWAYS_ON', 'Security notifications are always on');
    groups[key] = delivery;
  }

  const next: MemberSettings = {
    groups,
    email: input.email ?? current.email,
    browser: input.browser ?? current.browser,
  };

  await client
    .update(users)
    .set({ notificationSettings: next })
    .where(eq(users.id, caller('user').userId));

  return notificationSettings(client);
};
