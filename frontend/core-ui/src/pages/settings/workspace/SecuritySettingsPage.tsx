import { PageContainer, ScrollArea } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { SettingsBreadcrumbs } from '@/settings/components/SettingsBreadcrumbs';
import { TwoFactorPolicyForm } from '@/settings/two-factor/components/TwoFactorPolicyForm';

export function SecuritySettingsPage() {
  const { t } = useTranslation('settings', { keyPrefix: 'two-factor' });

  return (
    <PageContainer>
      <SettingsBreadcrumbs />
      <ScrollArea className="h-full">
        <section className="mx-auto max-w-2xl w-full relative">
          <h2 className="font-semibold text-lg mt-4 mb-2 px-4">
            {t('policy-title')}
          </h2>
          <p className="text-sm text-muted-foreground mb-8 px-4">
            {t('policy-description')}
          </p>
          <div className="px-4 w-full">
            <TwoFactorPolicyForm />
          </div>
        </section>
        <ScrollArea.Bar />
      </ScrollArea>
    </PageContainer>
  );
}
