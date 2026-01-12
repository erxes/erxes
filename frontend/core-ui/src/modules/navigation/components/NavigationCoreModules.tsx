import { NavigationMenuGroup, NavigationMenuLinkItem } from 'erxes-ui';
import { useVersion } from 'ui-modules';
import { GET_CORE_MODULES } from '~/plugins/constants/core-plugins.constants';
import { useTranslation } from 'react-i18next';
import { useMemo } from 'react';

export const NavigationCoreModules = () => {
  const version = useVersion();
  const { t } = useTranslation('common', { keyPrefix: 'core-modules' });

  const CORE_MODULES = useMemo(
    () => GET_CORE_MODULES(t, version),
    [t, version],
  );

  return (
    <NavigationMenuGroup name={t('_')}>
      {CORE_MODULES.filter((item) => !item.settingsOnly).map((item) => (
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
