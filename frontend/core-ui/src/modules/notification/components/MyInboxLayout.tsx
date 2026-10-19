import { Resizable, useIsMobile } from 'erxes-ui';
import type { ReactElement } from 'react';
import { useParams } from 'react-router-dom';
import { NotificationContent } from '@/notification/components/NotificationContent';
import { Notifications } from '@/notification/components/Notifications';
import { MyInboxHeader } from '@/notification/components/MyInboxHeader';

export const MyInboxLayout = (): ReactElement => {
  const isMobile = useIsMobile();
  const { id } = useParams<'id'>();

  if (isMobile) {
    return (
      <div className="flex flex-1 flex-col overflow-hidden">
        {id ? (
          <>
            <MyInboxHeader />
            <NotificationContent />
          </>
        ) : (
          <Notifications />
        )}
      </div>
    );
  }

  return (
    <Resizable.PanelGroup
      direction="horizontal"
      className="flex-1 overflow-hidden"
    >
      <Resizable.Panel
        minSize={20}
        defaultSize={30}
        className="hidden sm:flex min-w-80 max-w-lg"
      >
        <Notifications />
      </Resizable.Panel>
      <Resizable.Handle />
      <Resizable.Panel minSize={20} defaultSize={70}>
        <NotificationContent />
      </Resizable.Panel>
    </Resizable.PanelGroup>
  );
};
