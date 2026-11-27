import { PageContainer, ScrollArea } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

import { SettingsBreadcrumbs } from '@/settings/components/SettingsBreadcrumbs';
import { AppearanceSettings } from '@/settings/appearance/components/AppearanceSettings';

export const SettingsAppearancePage = () => {
  const { t } = useTranslation('organization');

  return (
    <PageContainer>
      <SettingsBreadcrumbs />
      <ScrollArea className="ui-home-backdrop bg-muted/20">
        <section className="relative mx-auto w-full max-w-2xl px-4 py-6">
          <h2 className="mb-6 text-xl font-semibold tracking-tight">
            {t('appearance', 'Appearance')}
          </h2>
          <div className="mb-6">
            <AppearanceSettings />
          </div>
        </section>
        <ScrollArea.Bar />
      </ScrollArea>
    </PageContainer>
  );
};
