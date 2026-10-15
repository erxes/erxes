import { ScrollArea } from 'erxes-ui';
import { SettingsHeader } from 'ui-modules';
import NotificationBreadcrumb from './NotificationSettingsBreadcrumb';
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
        <div className="flex min-w-0 flex-auto flex-col overflow-hidden">
          <SettingsHeader breadcrumbs={<NotificationBreadcrumb />} />
          <ScrollArea className="flex-auto">{children}</ScrollArea>
        </div>
      </NotificationSettingsProvider>
    </div>
  );
};
