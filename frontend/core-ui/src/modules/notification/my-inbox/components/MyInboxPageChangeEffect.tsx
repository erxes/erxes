import { MyInboxHotkeyScope } from '@/notification/my-inbox/types/notifications';
import { useIsMatchingLocation, useSetHotkeyScope } from 'erxes-ui';
import { useEffect } from 'react';

export const MyInboxPageChangeEffect = () => {
  const isMatchingLocation = useIsMatchingLocation();
  const setHotkeyScope = useSetHotkeyScope();

  useEffect(() => {
    setHotkeyScope(MyInboxHotkeyScope.MainPage);
  }, [isMatchingLocation, setHotkeyScope]);

  return <></>;
};
