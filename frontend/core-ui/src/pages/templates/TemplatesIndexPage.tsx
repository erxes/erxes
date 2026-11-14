import { TemplateInstallationsList } from '@/template/components/TemplateInstallationsList';
import { TemplatesGallery } from '@/template/components/TemplatesGallery';
import { TemplatesHeader } from '@/template/components/TemplatesHeader';
import { PageContainer, Tabs, useQueryState } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const TemplatesIndexPage = () => {
  const { t } = useTranslation('templates');
  const [tab, setTab] = useQueryState<string>('tab');

  return (
    <PageContainer>
      <TemplatesHeader />
      <Tabs
        value={tab === 'installed' ? 'installed' : 'templates'}
        onValueChange={(value) => setTab(value === 'templates' ? null : value)}
        className="flex min-h-0 flex-1 flex-col"
      >
        <Tabs.List className="mx-5 mt-4 w-fit">
          <Tabs.Trigger value="templates">{t('templates')}</Tabs.Trigger>
          <Tabs.Trigger value="installed">{t('installed')}</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="templates" className="min-h-0 flex-1 overflow-y-auto">
          <TemplatesGallery />
        </Tabs.Content>
        <Tabs.Content value="installed" className="min-h-0 flex-1 overflow-y-auto">
          <TemplateInstallationsList />
        </Tabs.Content>
      </Tabs>
    </PageContainer>
  );
};
