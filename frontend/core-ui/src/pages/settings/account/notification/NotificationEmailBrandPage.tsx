import { NotificationEmailBrandForm } from '@/notification/templates/components/NotificationEmailBrandForm';
import { NotificationTemplatesGate } from '@/notification/templates/components/NotificationTemplatesGate';

export const NotificationEmailBrandPage = () => (
  <NotificationTemplatesGate>
    <NotificationEmailBrandForm />
  </NotificationTemplatesGate>
);
