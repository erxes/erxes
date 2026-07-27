import { navigationPanelViewState } from '@/navigation/states/navigationPanelState';
import { MyInboxHeader } from '@/notification/components/MyInboxHeader';
import { Resizable, useIsMobile } from 'erxes-ui';
import { useAtomValue } from 'jotai';
import { useParams } from 'react-router-dom';

type Props = {
  Notifications: React.ComponentType;
  NotificationContent: React.ComponentType;
};

export const MyInboxLayout = ({
  Notifications,
  NotificationContent,
}: Props) => {
  const isMobile = useIsMobile();
  const { id } = useParams();
  const panelView = useAtomValue(navigationPanelViewState);

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

  if (panelView === 'favorites') {
    return (
      <div className="flex min-w-0 flex-1 overflow-hidden">
        <NotificationContent />
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
