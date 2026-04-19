import { useParams } from 'react-router';
import { EmailTemplateEditor } from '@/automations/components/settings/components/email-templates/editor/EmailTemplateEditor';

export const AutomationEmailTemplateDetailSettingsPage = () => {
  const { id } = useParams<{ id: string }>();
  const isCreate = id === 'create';

  return <EmailTemplateEditor templateId={isCreate ? undefined : id} />;
};
