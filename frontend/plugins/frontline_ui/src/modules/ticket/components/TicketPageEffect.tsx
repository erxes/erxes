import { useEffect } from 'react';
import { useIsMatchingLocation, useSetHotkeyScope } from 'erxes-ui';
import { FrontlinePaths } from '@/types/FrontlinePaths';
import { TicketHotKeyScope } from '@/ticket/types';

export const TicketPageEffect = () => {
  const isMatchingLocation = useIsMatchingLocation('/frontline');
  const setHotkeyScope = useSetHotkeyScope();
  useEffect(() => {
    if (isMatchingLocation(FrontlinePaths.Tickets)) {
      setHotkeyScope(TicketHotKeyScope.TicketPage);
    }
  }, [isMatchingLocation, setHotkeyScope]);

  return null;
};
