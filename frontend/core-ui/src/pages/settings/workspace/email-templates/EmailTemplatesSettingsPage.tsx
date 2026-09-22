import { EmailTemplatesSettings } from '@/emailTemplates/components/EmailTemplatesSettings';
import { SettingsBreadcrumbs } from '@/settings/components/SettingsBreadcrumbs';
import { EmailTemplatePath } from '@/types/paths/EmailTemplatePath';
import { IconPlus } from '@tabler/icons-react';
import { Button, PageContainer, Separator } from 'erxes-ui';
import { Link } from 'react-router';

export const EmailTemplatesSettingsPage = () => (
  <PageContainer>
    <SettingsBreadcrumbs>
      <Separator.Inline />
      <Button asChild size="sm">
        <Link to={EmailTemplatePath.Create}>
          <IconPlus />
          Create template
        </Link>
      </Button>
    </SettingsBreadcrumbs>

    <EmailTemplatesSettings />
  </PageContainer>
);
