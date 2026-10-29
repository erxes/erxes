import { SettingsBreadcrumbs } from '@/settings/components/SettingsBreadcrumbs';
import { LdapConfigForm } from '@/settings/ldap/components/LdapConfigForm';
import { PageContainer, ScrollArea } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export function LdapSettingsPage() {
  const { t } = useTranslation('settings', { keyPrefix: 'ldap' });

  return (
    <PageContainer>
      <SettingsBreadcrumbs />
      <ScrollArea className="h-full">
        <section className="mx-auto max-w-2xl w-full relative">
          <h2 className="font-semibold text-lg mt-4 mb-2 px-4">{t('title')}</h2>
          <p className="text-sm text-muted-foreground mb-8 px-4">
            {t('description')}
          </p>
          <div className="px-4 w-full">
            <LdapConfigForm />
          </div>
        </section>
        <ScrollArea.Bar />
      </ScrollArea>
    </PageContainer>
  );
}
