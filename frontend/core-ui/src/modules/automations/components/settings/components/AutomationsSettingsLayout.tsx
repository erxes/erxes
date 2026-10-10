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
      <SettingsHeader breadcrumbs={<AutomationSettingsBreadcrumb />} />
      <div className="min-w-0 flex-1 overflow-hidden">{children}</div>
    </PageContainer>
  );
};
