import { PageContainer, ScrollArea } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

import { SettingsBreadcrumbs } from '@/settings/components/SettingsBreadcrumbs';
import { AppearanceSettings } from '@/settings/appearance/components/AppearanceSettings';

export const SettingsAppearancePage = () => {
  const { t } = useTranslation('organization');

  return (
    <PageContainer>
      <SettingsBreadcrumbs />
      <ScrollArea>
        <section className="relative mx-auto w-full max-w-2xl">
          <h2 className="mt-4 mb-8 px-4 text-lg font-semibold">
            {t('appearance', 'Appearance')}
          </h2>
          <div className="mb-5 px-4">
            <AppearanceSettings />
          </div>
        </section>
        <ScrollArea.Bar />
      </ScrollArea>
    </PageContainer>
  );
};
