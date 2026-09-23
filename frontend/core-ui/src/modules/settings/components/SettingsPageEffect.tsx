import {
  SettingsPath,
  SettingsWorkspacePath,
} from '@/types/paths/SettingsPath';
import { SettingsHotKeyScope } from '@/types/SettingsHotKeyScope';
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
      case isMatchingLocation(SettingsWorkspacePath.AppTokens):
        setHotkeyScope(SettingsHotKeyScope.AppsPage);
        break;
    }
  }, [isMatchingLocation, tagType]);

  return <></>;
};
