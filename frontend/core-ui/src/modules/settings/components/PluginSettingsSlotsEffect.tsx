import { PluginSharedSettingsNavigation } from '@/settings/components/PluginSharedSettingsNavigation';
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
 * Hands the plugin-scoped Tags / Properties pages to plugins (through
 * `ui-modules`), so each plugin shows them inside its own settings.
 */
export const PluginSettingsSlotsEffect = () => {
  const setSlots = useSetAtom(pluginSettingsSlotsState);

  useEffect(() => {
    setSlots({
      tags: PluginTagsSettings,
      properties: PluginPropertiesSettings,
      navigation: PluginSharedSettingsNavigation,
    });
  }, [setSlots]);

  return null;
};
