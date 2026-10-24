import { NavigationMenuLinkItem, Sidebar } from 'erxes-ui';
import {
  IconHierarchy2,
  IconNotification,
  IconTag,
} from '@tabler/icons-react';
import { useNotificationPluginsTypes } from '@/notification/settings/hooks/useNotificationPluginsTypes';

import { usePermissionCheck } from 'ui-modules';
import { usePropertyTypes } from '@/properties/hooks/usePropertyTypes';
import { useTagTypes } from 'ui-modules/modules/tags-new/hooks/useTagTypes';
import { useTranslation } from 'react-i18next';

/**
 * Organization settings a plugin uses (tags, properties, notifications),
 * appended to the plugin's own settings list and filtered to that plugin's
 * types. Hidden entirely for plugins with none of them.
 */
export const PluginSharedSettingsNavigation = ({
  pluginName,
  pathPrefix,
}: {
  pluginName: string;
  /** The plugin's settings base, e.g. `sales/settings`. */
  pathPrefix: string;
}) => {
  const { t } = useTranslation('common');
  const { types } = useTagTypes();
  const { propertyTypes } = usePropertyTypes();
  const { pluginsNotifications } = useNotificationPluginsTypes();
  const { isLoaded, isWildcard, hasModulePermission } = usePermissionCheck();
  const canUse = (module: string) =>
    !isLoaded || isWildcard || hasModulePermission(module);
  const showTags = Boolean(types[pluginName]?.length) && canUse('tags');
  const showProperties =
    Boolean(propertyTypes[pluginName]?.length) && canUse('properties');
  // each member's own choices: shown whenever the plugin declares events
  const showNotifications = pluginsNotifications.some(
    (plugin) => plugin.pluginName === pluginName && plugin.modules?.length,
  );

  if (!showTags && !showProperties && !showNotifications) {
    return null;
  }

  return (
    // No heading: continues the plugin's own settings list.
    <Sidebar.Group className="pt-0">
      <Sidebar.GroupContent>
        <Sidebar.Menu>
          {showTags && (
            <NavigationMenuLinkItem
              pathPrefix={pathPrefix}
              path="/tags"
              name={t('sidebar.tags')}
              icon={IconTag}
            />
          )}
          {showProperties && (
            <NavigationMenuLinkItem
              pathPrefix={pathPrefix}
              path="/properties"
              name={t('sidebar.properties', 'Properties')}
              icon={IconHierarchy2}
            />
          )}
          {showNotifications && (
            <NavigationMenuLinkItem
              pathPrefix={pathPrefix}
              path="/notifications"
              name={t('sidebar.notification')}
              icon={IconNotification}
            />
          )}
        </Sidebar.Menu>
      </Sidebar.GroupContent>
    </Sidebar.Group>
  );
};
