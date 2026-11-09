import { PageContainer, ScrollArea } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

import { SettingsBreadcrumbs } from '@/settings/components/SettingsBreadcrumbs';
import { ProfileActivity } from '@/settings/profile/components/ProfileActivity';

export const SettingsMyActivityPage = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'team-member' });

  return (
    <PageContainer>
      <SettingsBreadcrumbs />
      <ScrollArea>
        <section className="mx-auto max-w-2xl w-full relative">
          <h2 className="font-semibold text-lg mt-4 mb-12 px-4">
            {t('my-active-time')}
          </h2>
          <div className="px-4 w-full h-auto mb-5">
            <ProfileActivity />
          </div>
        </section>
        <ScrollArea.Bar />
      </ScrollArea>
    </PageContainer>
  );
};
