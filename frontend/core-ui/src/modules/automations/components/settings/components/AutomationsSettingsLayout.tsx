import { AutomationSettingsSidebar } from '@/automations/components/settings/components/AutomationSettingsSidebar';
import { AutomationSettingsBreadcrumb } from '@/automations/components/settings/components/AutomationSettingsBreadcrumb';
import { PageContainer } from 'erxes-ui';
import { SettingsHeader } from 'ui-modules';

export const AutomationSettingsLayout = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <PageContainer>
      <SettingsHeader
        breadcrumbs={<AutomationSettingsBreadcrumb />}
      ></SettingsHeader>
      <div className="flex flex-auto overflow-hidden">
        <AutomationSettingsSidebar />
        {children}
      </div>
    </PageContainer>
  );
};
