import { NavigationMenuGroup, NavigationMenuLinkItem } from 'erxes-ui';
import { useVersion } from 'ui-modules';
import { GET_CORE_MODULES } from '~/plugins/constants/core-plugins.constants';

export const NavigationCoreModules = () => {
  const version = useVersion();

  const CORE_MODULES = GET_CORE_MODULES(version);

  return (
    <NavigationMenuGroup name="Core modules">
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
