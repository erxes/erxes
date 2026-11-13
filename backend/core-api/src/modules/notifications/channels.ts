import {
  INotificationModuleConfig,
  NOTIFICATION_CHANNELS,
  NotificationEvent,
  TNotificationChannel,
} from 'erxes-api-shared/core-modules';
import { getPlugin } from 'erxes-api-shared/utils';
import { CORE_NOTIFICATION_MODULES } from '~/modules/notifications/constants';

export type TNotificationEventDefaults = {
  // channels picked for the plugin until the user picks their own
  pluginChannels: TNotificationChannel[];
  // whether the module is on until the user switches it
  moduleEnabled: boolean;
  // channels the event uses until the user sets it
  eventChannels: TNotificationChannel[];
};

type TEventSettings = Record<string, Partial<NotificationEvent> | undefined>;

const getPluginModules = async (
  pluginName: string,
): Promise<readonly INotificationModuleConfig[]> => {
  const core = CORE_NOTIFICATION_MODULES.find(
    (item) => item.pluginName === pluginName,
  );

  if (core) {
    return core.modules;
  }

  const plugin = await getPlugin(pluginName);

  return plugin.config?.meta?.notifications?.modules || [];
};

/**
 * What the plugin's meta declares for an event; null when no plugin declares
 * it, since a key nobody declared has no settings a user could have saved.
 */
export const findNotificationEventDefaults = async (
  event: string,
): Promise<TNotificationEventDefaults | null> => {
  const [pluginName, moduleName, eventName] = event.split(':');

  const modules = await getPluginModules(pluginName);
  const moduleConfig = modules.find(({ name }) => name === moduleName);
  const definition = moduleConfig?.events.find(
    ({ name }) => name === eventName,
  );

  if (!moduleConfig || !definition) {
    return null;
  }

  const pluginChannels = new Set<TNotificationChannel>();

  for (const { events } of modules) {
    for (const { defaultChannels = [] } of events) {
      defaultChannels.forEach((channel) => pluginChannels.add(channel));
    }
  }

  return {
    pluginChannels: [...pluginChannels],
    moduleEnabled: moduleConfig.events.some(
      ({ defaultChannels }) => !!defaultChannels?.length,
    ),
    eventChannels: [...(definition.defaultChannels || [])],
  };
};

/**
 * The channels an event reaches a user on. Each level the user never saved
 * stands in for its default, so the settings page and the sender read the
 * same thing; a saved level always wins.
 */
export const resolveEventChannels = (
  events: TEventSettings,
  event: string,
  defaults: TNotificationEventDefaults,
): TNotificationChannel[] => {
  const [pluginName, moduleName] = event.split(':');

  const pluginSetting =
    events[pluginName] ??
    (defaults.pluginChannels.length
      ? { enabled: true, channels: defaults.pluginChannels }
      : undefined);

  const moduleSetting =
    events[`${pluginName}:${moduleName}`] ??
    (defaults.moduleEnabled ? { enabled: true } : undefined);

  const eventSetting =
    events[event] ??
    (defaults.eventChannels.length
      ? {
          enabled: true,
          mutedChannels: NOTIFICATION_CHANNELS.filter(
            (channel) => !defaults.eventChannels.includes(channel),
          ),
        }
      : undefined);

  if (
    !pluginSetting?.enabled ||
    !moduleSetting?.enabled ||
    !eventSetting?.enabled
  ) {
    return [];
  }

  const mutedChannels = eventSetting.mutedChannels || [];

  return NOTIFICATION_CHANNELS.filter(
    (channel) =>
      pluginSetting.channels?.includes(channel) &&
      !mutedChannels.includes(channel),
  );
};
