import { Sidebar } from 'erxes-ui';
import { IconHierarchy2, IconTag } from '@tabler/icons-react';

import { usePermissionCheck } from 'ui-modules';
import { usePropertyTypes } from '@/properties/hooks/usePropertyTypes';
import { useTagTypes } from 'ui-modules/modules/tags-new/hooks/useTagTypes';
import { useTranslation } from 'react-i18next';
import { SettingsNavigationItem } from '@/settings/components/SettingsSidebar';
import {
  SETTINGS_INLINE_TYPES_LIMIT,
  TSettingSubPath,
} from '@/settings/constants/data';

const inlineSubPaths = (subPaths: TSettingSubPath[]) =>
  subPaths.length > 1 && subPaths.length <= SETTINGS_INLINE_TYPES_LIMIT
    ? subPaths
    : undefined;

export const PluginSharedSettingsNavigation = ({
  pluginName,
  pathPrefix,
}: {
  pluginName: string;
  pathPrefix: string;
}) => {
  const { t } = useTranslation('common');
  const { t: tTags } = useTranslation('settings', { keyPrefix: 'tags' });
  const { t: tProperties } = useTranslation('settings', {
    keyPrefix: 'properties',
  });
  const { types } = useTagTypes();
  const { propertyTypes } = usePropertyTypes();
  const { isLoaded, isWildcard, hasModulePermission } = usePermissionCheck();
  const canUse = (module: string) =>
    !isLoaded || isWildcard || hasModulePermission(module);
  const tagTypes = types[pluginName] || [];
  const pluginPropertyTypes = propertyTypes[pluginName] || [];
  const showTags = Boolean(tagTypes.length) && canUse('tags');
  const showProperties =
    Boolean(pluginPropertyTypes.length) && canUse('properties');

  if (!showTags && !showProperties) {
    return null;
  }

  const tagSubPaths = inlineSubPaths(
    tagTypes.map((tagType) => ({
      name: tTags('type-tags', { type: tagType.description }),
      path: `/${pathPrefix}/tags?tagType=${encodeURIComponent(
        tagType.contentType,
      )}`,
    })),
  );
  const propertySubPaths = inlineSubPaths(
    pluginPropertyTypes.map((propertyType) => ({
      name: tProperties(
        `content-type.${propertyType.contentType.replace(':', '-')}`,
        propertyType.description,
      ),
      path: `/${pathPrefix}/properties/${propertyType.contentType}`,
    })),
  );

  return (
    <Sidebar.Group className="pt-0">
      <Sidebar.GroupContent>
        <Sidebar.Menu>
          {showTags && (
            <SettingsNavigationItem
              pathPrefix={pathPrefix}
              path="tags"
              name={t('sidebar.tags')}
              icon={IconTag}
              subPaths={tagSubPaths}
            />
          )}
          {showProperties && (
            <SettingsNavigationItem
              pathPrefix={pathPrefix}
              path="properties"
              name={t('sidebar.properties', 'Properties')}
              icon={IconHierarchy2}
              subPaths={propertySubPaths}
            />
          )}
        </Sidebar.Menu>
      </Sidebar.GroupContent>
    </Sidebar.Group>
  );
};
