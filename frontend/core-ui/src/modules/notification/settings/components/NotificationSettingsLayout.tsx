import { ScrollArea } from 'erxes-ui';
import { NotificationSettingsProvider } from '../context/NotificationSettingsProvider';
import { NotificationSettingsSidebar } from './NotificationSettingsSidebar';

export const NotificationSettingsLayout = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <div className="flex flex-auto overflow-hidden">
      <NotificationSettingsProvider>
        <NotificationSettingsSidebar />
        <ScrollArea className="flex-auto">{children}</ScrollArea>
      </NotificationSettingsProvider>
    </div>
  );
};
