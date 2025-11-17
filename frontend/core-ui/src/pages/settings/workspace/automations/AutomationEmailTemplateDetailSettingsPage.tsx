import { useParams } from 'react-router';
import { EmailTemplateForm } from '@/automations/components/settings/components/email-templates/components/EmailTemplateForm';

export const AutomationEmailTemplateDetailSettingsPage = () => {
  const { id } = useParams<{ id: string }>();
  const isCreate = id === 'create';

  return <EmailTemplateForm templateId={isCreate ? undefined : id} />;
};
