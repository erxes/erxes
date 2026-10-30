import { NotificationTemplatesGate } from '@/notification/templates/components/NotificationTemplatesGate';
import { NotificationTemplatesList } from '@/notification/templates/components/NotificationTemplatesList';

export const NotificationTemplatesPage = () => (
  <NotificationTemplatesGate>
    <NotificationTemplatesList />
  </NotificationTemplatesGate>
);
