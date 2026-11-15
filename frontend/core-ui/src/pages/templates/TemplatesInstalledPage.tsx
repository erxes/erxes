import { TemplateInstallationsList } from '@/template/components/TemplateInstallationsList';
import { TemplatesHeader } from '@/template/components/TemplatesHeader';
import { PageContainer } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const TemplatesInstalledPage = () => {
  const { t } = useTranslation('templates');

  return (
    <PageContainer>
      <TemplatesHeader current={t('installed')} />
      <div className="min-h-0 flex-1 overflow-y-auto">
        <TemplateInstallationsList />
      </div>
    </PageContainer>
  );
};
