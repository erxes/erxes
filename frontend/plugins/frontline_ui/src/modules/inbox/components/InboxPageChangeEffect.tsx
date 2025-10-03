import { useEffect } from 'react';
import { useIsMatchingLocation, useSetHotkeyScope } from 'erxes-ui';
import { InboxPath } from '@/inbox/types/InboxPath';
import { InboxHotkeyScope } from '@/inbox/types/InboxHotkeyScope';

export const InboxPageChangeEffect = () => {
  const isMatchingLocation = useIsMatchingLocation();
  const setHotkeyScope = useSetHotkeyScope();

  useEffect(() => {
    switch (true) {
      case isMatchingLocation(InboxPath.MainPage): {
        setHotkeyScope(InboxHotkeyScope.MainPage);
        break;
      }
      case isMatchingLocation(InboxPath.IntegrationSettingsPage): {
        setHotkeyScope(InboxHotkeyScope.IntegrationSettingsPage);
        break;
      }
    }
  }, [isMatchingLocation, setHotkeyScope]);

  return <></>;
};
