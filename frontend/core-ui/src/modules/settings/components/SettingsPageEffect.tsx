import {
  SettingsPath,
  SettingsWorkspacePath,
} from '@/types/paths/SettingsPath';
import { SettingsHotKeyScope } from '@/types/SettingsHotKeyScope';
import { BrandsHotKeyScope } from '@/settings/brands/types';
import { ClientPortalHotKeyScope } from '@/client-portal/types/clientPortal';
import {
  useIsMatchingLocation,
  useSetHotkeyScope,
  useQueryState,
} from 'erxes-ui';
import { useEffect } from 'react';

export const SettingsPageEffect = () => {
  const isMatchingLocation = useIsMatchingLocation(SettingsPath.Index);
  const setHotkeyScope = useSetHotkeyScope();
  const [tagType] = useQueryState('tagType');
  useEffect(() => {
    switch (true) {
      case isMatchingLocation(SettingsWorkspacePath.Tags):
        setHotkeyScope(SettingsHotKeyScope.TagsPage);
        break;
      case isMatchingLocation(SettingsWorkspacePath.Brands):
        setHotkeyScope(BrandsHotKeyScope.BrandsSettingsPage);
        break;
      case isMatchingLocation(SettingsWorkspacePath.ClientPortals):
        setHotkeyScope(ClientPortalHotKeyScope.ClientPortalSettingsPage);
        break;
      case isMatchingLocation(SettingsWorkspacePath.AppTokens):
        setHotkeyScope(SettingsHotKeyScope.AppTokensPage);
        break;
    }
  }, [isMatchingLocation, tagType]);

  return <></>;
};
