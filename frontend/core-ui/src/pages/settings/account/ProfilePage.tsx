import { PageContainer, ScrollArea } from 'erxes-ui';

import { SettingsBreadcrumbs } from '@/settings/components/SettingsBreadcrumbs';
import { ProfileForm } from '@/settings/profile/components/ProfileForm';

export const SettingsProfilePage = () => {
  return (
    <PageContainer>
      <SettingsBreadcrumbs />
      <ScrollArea>
        <section className="mx-auto max-w-2xl w-full relative">
          <h2 className="font-semibold text-lg mt-4 mb-12 px-4">Profile</h2>
          <div className="flex flex-col gap-10 px-4 w-full h-auto mb-5">
            <ProfileForm />
          </div>
        </section>
        <ScrollArea.Bar />
      </ScrollArea>
    </PageContainer>
  );
};
