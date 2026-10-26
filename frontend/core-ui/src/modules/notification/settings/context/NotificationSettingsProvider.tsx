import {
  PluginsNotificationConfigEvents,
  PluginsNotificationConfigModules,
} from '@/notification/types/notifications';
import { createContext, useContext } from 'react';
import { useParams } from 'react-router';
import { useNotificationPluginsTypes } from '../hooks/useNotificationPluginsTypes';
import { useNotificationSettings } from '../hooks/useNotificationSettings';
import { useNotificationSettingsEventUpdate } from '../hooks/useNotificationSettingsEventUpdate';

interface NotificationSettingsPlugin {
  name: string;
  enabled: boolean;
  channels: string[];
}

interface NotificationSettingsContext {
  plugin: NotificationSettingsPlugin;

  module: PluginsNotificationConfigModules & { enabled?: boolean };
  events: Array<
    PluginsNotificationConfigEvents & {
      enabled?: boolean;
      channels?: string[];
      mutedChannels?: string[];
    }
  >;

  toggleChannel: (channel: string) => void;
  toggleEventChannel: (eventName: string, channel: string) => void;
  togglePlugin: (enabled: boolean) => void;
  toggleModule: (enabled: boolean) => void;
}

const NotificationContext = createContext<NotificationSettingsContext | null>(
  null,
);

export const NotificationSettingsProvider = ({
  children,
  pluginName: pluginProp,
  moduleName: moduleProp,
}: {
  children: React.ReactNode;
  // given by a plugin's own settings page; otherwise read from the route
  pluginName?: string;
  moduleName?: string;
}) => {
  const { event } = useParams<{ event: string }>();

  const [routePlugin, routeModule] = (event || '').split(':');
  const pluginName = pluginProp ?? routePlugin;
  const moduleName = moduleProp ?? routeModule;

  const { pluginsNotifications } = useNotificationPluginsTypes();
  const { notificationSettings } = useNotificationSettings();
  const { updateNotificationSettingsEvent } =
    useNotificationSettingsEventUpdate();

  const pluginRecord = notificationSettings?.events?.[pluginName];

  const currentPlugin = pluginsNotifications?.find(
    (p) => p.pluginName === pluginName,
  );

  // A level the user never saved stands in for what the events declare as
  // their default, the same way the sender reads it.
  const pluginDefaultChannels = [
    ...new Set(
      (currentPlugin?.modules || []).flatMap((m) =>
        (m.events || []).flatMap((e) => e.defaultChannels || []),
      ),
    ),
  ];

  const plugin: NotificationSettingsPlugin = {
    name: pluginName,
    enabled: pluginRecord?.enabled ?? true,
    channels: pluginRecord?.channels ?? pluginDefaultChannels,
  };

  const moduleConfig = currentPlugin?.modules?.find(
    (m) => m.name === moduleName,
  );

  const moduleRecord =
    notificationSettings?.events?.[`${pluginName}:${moduleName}`];

  const currentModule = {
    ...moduleConfig,
    ...moduleRecord,
    enabled:
      moduleRecord?.enabled ??
      moduleConfig?.events?.some((e) => e.defaultChannels?.length),
  } as PluginsNotificationConfigModules & { enabled?: boolean };

  const currentEvents =
    currentModule?.events?.map((event) => ({
      ...event,
      ...(notificationSettings?.events?.[
        `${pluginName}:${moduleName}:${event.name}`
      ] ??
        (event.defaultChannels?.length
          ? {
              enabled: true,
              mutedChannels: plugin.channels.filter(
                (c) => !event.defaultChannels?.includes(c),
              ),
            }
          : {})),
    })) || [];

  const toggleChannel = async (channel: string) => {
    const current = plugin.channels;

    const channels = current.includes(channel)
      ? current.filter((c) => c !== channel)
      : [...current, channel];

    await updateNotificationSettingsEvent({
      event: pluginName,
      enabled: plugin.enabled,
      channels,
    });
  };

  const togglePlugin = async (enabled: boolean) => {
    await updateNotificationSettingsEvent({
      event: pluginName,
      enabled,
      channels: plugin.channels,
    });
  };

  const toggleModule = async (enabled: boolean) => {
    const moduleUpdate = updateNotificationSettingsEvent({
      event: `${pluginName}:${moduleName}`,
      enabled,
      channels: plugin.channels,
    });

    if (!enabled) {
      await moduleUpdate;
      return;
    }

    // turning the group on selects, on all of the plugin's channels, only the
    // events the user never set; a saved choice is left as it is
    const untouched = currentEvents.filter(
      (e) =>
        !notificationSettings?.events?.[
          `${pluginName}:${moduleName}:${e.name}`
        ],
    );

    await Promise.all([
      moduleUpdate,
      ...untouched.map((e) =>
        updateNotificationSettingsEvent({
          event: `${pluginName}:${moduleName}:${e.name}`,
          enabled: true,
          channels: plugin.channels,
          // an event with a default keeps it; any other takes every channel
          mutedChannels: e.mutedChannels ?? [],
        }),
      ),
    ]);
  };

  const toggleEventChannel = async (eventName: string, channel: string) => {
    const current = currentEvents.find((e) => e.name === eventName);
    const active = current?.enabled
      ? plugin.channels.filter((c) => !current.mutedChannels?.includes(c))
      : [];
    const nextActive = active.includes(channel)
      ? active.filter((c) => c !== channel)
      : [...active, channel];

    await updateNotificationSettingsEvent({
      event: `${pluginName}:${moduleName}:${eventName}`,
      // with no channel left the event is off
      enabled: nextActive.length > 0,
      channels: plugin.channels,
      mutedChannels: plugin.channels.filter((c) => !nextActive.includes(c)),
    });
  };

  return (
    <NotificationContext.Provider
      value={{
        plugin,
        module: currentModule,
        events: currentEvents,
        toggleChannel,
        toggleEventChannel,
        togglePlugin,
        toggleModule,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotificationSettingsContext = () => {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error(
      'useNotificationSettings must be used within NotificationSettingsProvider',
    );
  }

  return context;
};
