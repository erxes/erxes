import { SettingsBreadcrumbs } from '@/settings/components/SettingsBreadcrumbs';
import { MessageProSettings } from '@/settings/general/components/MessageProSettings';
import { PageContainer } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export function MessageProSettingsPage() {
  const { t } = useTranslation('settings', {
    keyPrefix: 'general',
  });
  return (
    <PageContainer>
      <SettingsBreadcrumbs />
      <section className="mx-auto max-w-2xl w-full relative">
        <h2 className="font-semibold text-lg mt-4 mb-12 px-4">
          {t('messagePro', 'Message Pro')}
        </h2>
        <div className="flex flex-col gap-8 px-4 w-full h-auto">
          <MessageProSettings />
        </div>
      </section>
    </PageContainer>
  );
}
