import { SettingsBreadcrumbs } from '@/settings/components/SettingsBreadcrumbs';
import { GeneralSettings } from '@/settings/general/components/GeneralSettings';
import { PageContainer, ScrollArea } from 'erxes-ui';

export function GeneralSettingsPage() {
  return (
    <PageContainer>
      <SettingsBreadcrumbs />
      <ScrollArea>
        <section className="mx-auto max-w-2xl w-full relative">
          <h2 className="font-semibold text-lg mt-4 mb-12 px-4">
            General settings
          </h2>
          <div className="flex flex-col gap-8 px-4 w-full h-auto">
            <GeneralSettings />
          </div>
        </section>
        <ScrollArea.Bar />
      </ScrollArea>
    </PageContainer>
  );
}
