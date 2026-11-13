import { useEffect } from 'react';
import { useIsMatchingLocation, useSetHotkeyScope } from 'erxes-ui';
import { FrontlinePaths } from '@/types/FrontlinePaths';
import { TicketHotKeyScope } from '@/ticket/types';
import { TICKET_PROPERTY_CONTENT_TYPE } from '@/ticket/constants/createLayout';
import { NEW_RECORD_ID, useSidePanel } from 'ui-modules';

export const TicketPageEffect = () => {
  const isMatchingLocation = useIsMatchingLocation('/frontline');
  const setHotkeyScope = useSetHotkeyScope();
  const { record } = useSidePanel();
  const isTicketDraft =
    record?.contentType === TICKET_PROPERTY_CONTENT_TYPE &&
    record.contentId === NEW_RECORD_ID;
  useEffect(() => {
    if (!isTicketDraft && isMatchingLocation(FrontlinePaths.Tickets)) {
      setHotkeyScope(TicketHotKeyScope.TicketPage);
    }
  }, [isMatchingLocation, isTicketDraft, setHotkeyScope]);

  return null;
};
