import { PluginSharedSettingsNavigation } from '@/settings/components/PluginSharedSettingsNavigation';
import { SettingsNavigationItem } from '@/settings/components/SettingsSidebar';
import { PermissionRouteGuard } from '@/auth/components/PermissionRouteGuard';
import { PropertiesScopeContext } from '@/properties/context/PropertiesScopeContext';
import { Spinner } from 'erxes-ui';
import { lazy, Suspense, useEffect } from 'react';
import { pluginSettingsSlotsState } from 'ui-modules';
import { useSetAtom } from 'jotai';

const TagsPage = lazy(() =>
  import('~/pages/settings/workspace/tags/TagsPage').then((module) => ({
    default: module.TagsPage,
  })),
);

const PropertiesSettingsRoutes = lazy(() =>
  import('@/properties/components/PropertiesRoutes').then((module) => ({
    default: module.PropertiesSettingsRoutes,
  })),
);

const PluginNotificationSettings = lazy(() =>
  import(
    '@/notification/settings/components/PluginNotificationSettings'
  ).then((module) => ({
    default: module.PluginNotificationSettings,
  })),
);

// a member's own choices, so it needs no permission beyond signing in
const PluginNotificationSettingsSlot = ({ pluginName }: { pluginName: string }) => (
  <Suspense fallback={<Spinner />}>
    <PluginNotificationSettings pluginName={pluginName} />
  </Suspense>
);

const PluginTagsSettings = ({ pluginName }: { pluginName: string }) => (
  <PermissionRouteGuard module="tags">
    <Suspense fallback={<Spinner />}>
      <TagsPage pluginName={pluginName} />
    </Suspense>
  </PermissionRouteGuard>
);

const PluginPropertiesSettings = ({
  pluginName,
  basePath,
}: {
  pluginName: string;
  basePath: string;
}) => (
  <PermissionRouteGuard module="properties">
    <PropertiesScopeContext.Provider value={{ basePath, pluginName }}>
      <Suspense fallback={<Spinner />}>
        <PropertiesSettingsRoutes />
      </Suspense>
    </PropertiesScopeContext.Provider>
  </PermissionRouteGuard>
);

/**
 * Hands the plugin-scoped Tags / Properties / Notification pages to plugins
 * (through `ui-modules`), so each plugin shows them inside its own settings.
 */
export const PluginSettingsSlotsEffect = () => {
  const setSlots = useSetAtom(pluginSettingsSlotsState);

  useEffect(() => {
    setSlots({
      tags: PluginTagsSettings,
      properties: PluginPropertiesSettings,
      notifications: PluginNotificationSettingsSlot,
      navigation: PluginSharedSettingsNavigation,
      navigationItem: SettingsNavigationItem,
    });
  }, [setSlots]);

  return null;
};
