import { ChooseTheme } from '@/settings/components/ChooseTheme';
import { SettingsBreadcrumbs } from '@/settings/components/SettingsBreadcrumbs';
import { PageContainer, ScrollArea } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const SettingsExperiencePage = () => {
  const { t } = useTranslation('common', { keyPrefix: 'sidebar' });

  return (
    <PageContainer>
      <SettingsBreadcrumbs />
      <ScrollArea className="ui-home-backdrop bg-muted/20">
        <section className="relative mx-auto w-full max-w-2xl px-4 py-6">
          <h2 className="mb-6 text-xl font-semibold tracking-tight">
            {t('experience')}
          </h2>
          <div className="rounded-2xl border border-border/75 bg-background/95 p-5 shadow-2xs backdrop-blur-xs">
            <ChooseTheme />
          </div>
        </section>
        <ScrollArea.Bar />
      </ScrollArea>
    </PageContainer>
  );
};
