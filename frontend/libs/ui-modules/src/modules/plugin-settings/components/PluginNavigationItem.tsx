import { NavigationMenuLinkItem } from 'erxes-ui';
import { useAtomValue } from 'jotai';
import {
  pluginSettingsSlotsState,
  TPluginNavigationItemProps,
} from '../states/pluginSettingsSlotsState';

export const PluginNavigationItem = ({
  subPaths,
  ...props
}: TPluginNavigationItemProps) => {
  const { navigationItem: NavigationItem } = useAtomValue(
    pluginSettingsSlotsState,
  );

  if (NavigationItem) {
    return <NavigationItem {...props} subPaths={subPaths} />;
  }

  return <NavigationMenuLinkItem {...props} />;
};
