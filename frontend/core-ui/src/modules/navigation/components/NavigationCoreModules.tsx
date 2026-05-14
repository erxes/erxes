import { NavigationMenuGroup, NavigationMenuLinkItem } from 'erxes-ui';
import { useVersion, usePermissionCheck } from 'ui-modules';
import { GET_CORE_MODULES } from '~/plugins/constants/core-plugins.constants';
import { useTranslation } from 'react-i18next';
import { useMemo } from 'react';

export const NavigationCoreModules = () => {
  const version = useVersion();
  const { t } = useTranslation('common', { keyPrefix: 'core-modules' });
  const { isLoaded, hasModulePermission, isWildcard } = usePermissionCheck();

  const CORE_MODULES = useMemo(
    () => GET_CORE_MODULES(t, version),
    [t, version],
  );

  const filteredModules = useMemo(() => {
    if (!isLoaded || isWildcard) {
      return CORE_MODULES.filter((item) => !item.settingsOnly);
    }

    return CORE_MODULES.filter((item) => {
      if (item.settingsOnly) return false;
      return hasModulePermission(item.path);
    });
  }, [CORE_MODULES, isLoaded, isWildcard, hasModulePermission]);

  return (
    <NavigationMenuGroup name={t('_')}>
      {filteredModules.map((item) => (
        <NavigationMenuLinkItem
          key={item.name}
          name={item.name}
          icon={item.icon}
          path={item.path}
        />
      ))}
    </NavigationMenuGroup>
  );
};
