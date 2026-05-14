import { BroadcastSettings } from '@/broadcast/components/settings/BroadcastSettings';
import { BroadcastSettingsBreadcrumbs } from '@/broadcast/components/settings/BroadcastSettingsBreadcrumbs';
import { PageContainer, ScrollArea } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const BroadcastSettingsPage = () => {
  const { t } = useTranslation('settings', {
    keyPrefix: 'sidebar',
  });

  return (
    <PageContainer>
      <BroadcastSettingsBreadcrumbs />
      <ScrollArea className="h-full">
        <section className="mx-auto max-w-2xl w-full h-full relative">
          <h2 className="font-semibold text-lg mt-4 mb-12 px-4">
            {t('broadcast-config')}
          </h2>
          <div className="flex flex-col items-center justify-center gap-8 px-4 w-full h-full">
            <BroadcastSettings />
          </div>
        </section>
        <ScrollArea.Bar />
      </ScrollArea>
    </PageContainer>
  );
};
