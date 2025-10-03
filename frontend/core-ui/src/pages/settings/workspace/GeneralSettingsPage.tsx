import { SettingsBreadcrumbs } from '@/settings/components/SettingsBreadcrumbs';
import { GeneralSettings } from '@/settings/general/components/GeneralSettings';

export function GeneralSettingsPage() {
  return (
    <section className="mx-auto max-w-2xl w-full relative">
      <div className="px-4 h-16 flex items-center">
        <SettingsBreadcrumbs />
      </div>
      <h2 className="font-semibold text-lg mt-4 mb-12 px-4">
        General settings
      </h2>
      <div className="flex flex-col gap-8 px-4 w-full">
        <GeneralSettings />
      </div>
    </section>
  );
}
