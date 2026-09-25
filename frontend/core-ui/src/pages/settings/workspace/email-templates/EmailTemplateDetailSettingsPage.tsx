import { EmailTemplateForm } from '@/emailTemplates/components/EmailTemplateForm';
import { PageContainer } from 'erxes-ui';
import { useParams } from 'react-router';

export const EmailTemplateDetailSettingsPage = () => {
  const { id } = useParams();

  return (
    <PageContainer>
      {/* The create route shares this page: no id means a new template. */}
      <EmailTemplateForm templateId={id === 'create' ? undefined : id} />
    </PageContainer>
  );
};
