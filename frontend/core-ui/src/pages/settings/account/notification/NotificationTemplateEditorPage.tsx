import { NotificationTemplateEditor } from '@/notification/templates/components/NotificationTemplateEditor';
import { NotificationTemplatesGate } from '@/notification/templates/components/NotificationTemplatesGate';

export const NotificationTemplateEditorPage = () => (
  <NotificationTemplatesGate>
    <NotificationTemplateEditor />
  </NotificationTemplatesGate>
);
