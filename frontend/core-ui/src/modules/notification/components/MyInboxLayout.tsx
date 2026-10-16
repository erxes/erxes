import { Resizable, useIsMobile } from 'erxes-ui';
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

  if (isMobile) {
    return (
      <div className="flex flex-1 flex-col overflow-hidden">
        {id ? <NotificationContent /> : <Notifications />}
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
        defaultSize={32}
        className="hidden min-w-80 max-w-lg border-r sm:flex"
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
