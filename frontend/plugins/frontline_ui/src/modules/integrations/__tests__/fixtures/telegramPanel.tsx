import type { PropsWithChildren } from 'react';
import { useSidePanel } from 'ui-modules';
import { TelegramSetup } from '../../telegram/TelegramIntegrationDetail';

/** Mounts the actual Telegram setup surface only while its record is selected. */
export const TelegramPanel = ({ children }: PropsWithChildren) => {
  const { record } = useSidePanel();
  return (
    <>
      {children}
      {record && (
        <TelegramSetup
          integrationId={record.contentId === 'new' ? null : record.contentId}
        />
      )}
    </>
  );
};
