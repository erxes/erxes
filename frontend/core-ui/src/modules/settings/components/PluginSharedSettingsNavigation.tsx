import { NavigationMenuLinkItem, Sidebar, cn } from 'erxes-ui';
import { IconChevronRight, IconHierarchy2, IconTag } from '@tabler/icons-react';
import { Link, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';

import { NavigationDisclosure } from '@/navigation/components/app-sidebar/NavigationDisclosure';
import { findActiveNavigationPath } from '@/navigation/utils/navigationPathMatch';
import { usePermissionCheck } from 'ui-modules';
import { usePropertyTypes } from '@/properties/hooks/usePropertyTypes';
import { useTagTypes } from 'ui-modules/modules/tags-new/hooks/useTagTypes';
import { useTranslation } from 'react-i18next';

type TSubPath = { path: string; name: string };

/**
 * A shared entry (tags, properties) listing the plugin's own types under it,
 * so those pages need no side panel. A single type needs no list: its page
 * opens that type by default.
 */
const PluginSharedNavigationItem = ({
  pathPrefix,
  path,
  name,
  icon,
  subPaths,
}: Readonly<{
  pathPrefix: string;
  path: string;
  name: string;
  icon: React.ElementType;
  subPaths: TSubPath[];
}>) => {
  const location = useLocation();
  const itemPath = `/${pathPrefix}${path}`;
  const inItem =
    location.pathname === itemPath ||
    location.pathname.startsWith(`${itemPath}/`);
  const [open, setOpen] = useState(inItem);

  useEffect(() => {
    if (inItem) setOpen(true);
  }, [inItem]);

  if (subPaths.length < 2) {
    return (
      <NavigationMenuLinkItem
        pathPrefix={pathPrefix}
        path={path}
        name={name}
        icon={icon}
      />
    );
  }

  const activeSubPath = inItem
    ? findActiveNavigationPath(
        subPaths.map((subPath) => subPath.path),
        location,
      )
    : undefined;

  const subList = (
    <Sidebar.Sub className="border-l">
      {subPaths.map((subPath) => (
        <Sidebar.SubItem key={subPath.path}>
          <Sidebar.SubButton asChild isActive={subPath.path === activeSubPath}>
            <Link to={subPath.path}>{subPath.name}</Link>
          </Sidebar.SubButton>
        </Sidebar.SubItem>
      ))}
    </Sidebar.Sub>
  );

  const handleParentClick = (event: React.MouseEvent) => {
    if (!inItem) return setOpen(true);
    event.preventDefault();
    setOpen((previous) => !previous);
  };

  return (
    <NavigationMenuLinkItem
      pathPrefix={pathPrefix}
      path={path}
      name={name}
      icon={icon}
      aria-expanded={open}
      onClick={handleParentClick}
      action={
        <NavigationDisclosure open={open}>{subList}</NavigationDisclosure>
      }
    >
      <span
        className={cn(
          'ml-auto flex shrink-0 text-muted-foreground transition-transform duration-200',
          open && 'rotate-90',
        )}
      >
        <IconChevronRight className="size-3.5!" />
      </span>
    </NavigationMenuLinkItem>
  );
};

/**
 * Organization settings a plugin uses (tags, properties), appended to the
 * plugin's own settings list and filtered to that plugin's types. Hidden
 * entirely for plugins with neither.
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

  return (
    // No heading: continues the plugin's own settings list.
    <Sidebar.Group className="pt-0">
      <Sidebar.GroupContent>
        <Sidebar.Menu>
          {showTags && (
            <PluginSharedNavigationItem
              pathPrefix={pathPrefix}
              path="/tags"
              name={t('sidebar.tags')}
              icon={IconTag}
              subPaths={tagTypes.map((tagType) => ({
                path: `/${pathPrefix}/tags?tagType=${encodeURIComponent(
                  tagType.contentType,
                )}`,
                name: tTags('type-tags', { type: tagType.description }),
              }))}
            />
          )}
          {showProperties && (
            <PluginSharedNavigationItem
              pathPrefix={pathPrefix}
              path="/properties"
              name={t('sidebar.properties', 'Properties')}
              icon={IconHierarchy2}
              subPaths={pluginPropertyTypes.map((propertyType) => ({
                path: `/${pathPrefix}/properties/${propertyType.contentType}`,
                name: tProperties(
                  `content-type.${propertyType.contentType.replace(':', '-')}`,
                  propertyType.description,
                ),
              }))}
            />
          )}
        </Sidebar.Menu>
      </Sidebar.GroupContent>
    </Sidebar.Group>
  );
};
