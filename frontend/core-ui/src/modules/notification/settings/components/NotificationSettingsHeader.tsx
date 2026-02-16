import { SettingsHeader } from 'ui-modules';
import NotificationBreadcrumb from './NotificationSettingsBreadcrumb';

export const NotificationSettingsHeader = () => {
  return <SettingsHeader breadcrumbs={<NotificationBreadcrumb />} />;
};
