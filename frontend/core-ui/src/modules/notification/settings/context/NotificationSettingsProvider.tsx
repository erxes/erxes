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
    PluginsNotificationConfigEvents & { enabled?: boolean; channels?: string[] }
  >;

  toggleChannel: (channel: string) => void;
  togglePlugin: (enabled: boolean) => void;
  toggleModule: (enabled: boolean) => void;
  toggleEvent: (eventName: string, enabled: boolean) => void;
}

const NotificationContext = createContext<NotificationSettingsContext | null>(
  null,
);

export const NotificationSettingsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { event } = useParams<{ event: string }>();

  const [pluginName, moduleName] = (event || '').split(':');

  const { pluginsNotifications } = useNotificationPluginsTypes();
  const { notificationSettings } = useNotificationSettings();
  const { updateNotificationSettingsEvent } =
    useNotificationSettingsEventUpdate();

  const pluginRecord = notificationSettings?.events?.[pluginName];

  const plugin: NotificationSettingsPlugin = {
    name: pluginName,
    enabled: pluginRecord?.enabled ?? true,
    channels: pluginRecord?.channels ?? [],
  };

  const currentPlugin = pluginsNotifications?.find(
    (p) => p.pluginName === pluginName,
  );

  const currentModule = {
    ...currentPlugin?.modules?.find((m) => m.name === moduleName),
    ...notificationSettings?.events?.[`${pluginName}:${moduleName}`],
  } as PluginsNotificationConfigModules & { enabled?: boolean };

  const currentEvents =
    currentModule?.events?.map((event) => ({
      ...event,
      ...notificationSettings?.events?.[
        `${pluginName}:${moduleName}:${event.name}`
      ],
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
    await updateNotificationSettingsEvent({
      event: `${pluginName}:${moduleName}`,
      enabled,
      channels: plugin.channels,
    });
  };

  const toggleEvent = async (eventName: string, enabled: boolean) => {
    await updateNotificationSettingsEvent({
      event: `${pluginName}:${moduleName}:${eventName}`,
      enabled,
      channels: plugin.channels,
    });
  };

  return (
    <NotificationContext.Provider
      value={{
        plugin,
        module: currentModule,
        events: currentEvents,
        toggleChannel,
        togglePlugin,
        toggleModule,
        toggleEvent,
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
