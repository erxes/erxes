import { CreateEmailTemplate } from '@/emailTemplates/components/CreateEmailTemplate';
import { EmailTemplatesSettings } from '@/emailTemplates/components/EmailTemplatesSettings';
import { SettingsBreadcrumbs } from '@/settings/components/SettingsBreadcrumbs';
import { PageContainer } from 'erxes-ui';

export const EmailTemplatesSettingsPage = () => (
  <PageContainer>
    <SettingsBreadcrumbs actions={<CreateEmailTemplate />} />
    <EmailTemplatesSettings />
  </PageContainer>
);
