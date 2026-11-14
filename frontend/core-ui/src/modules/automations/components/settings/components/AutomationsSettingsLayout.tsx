import { AutomationSettingsBreadcrumb } from '@/automations/components/settings/components/AutomationSettingsBreadcrumb';
import { PageContainer } from 'erxes-ui';
import { SettingsHeader } from 'ui-modules';
import { useMatch } from 'react-router';
import { AutomationSettingsPath } from '@/types/paths/AutomationPath';

export const AutomationSettingsLayout = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const isBotsPage = useMatch(`${AutomationSettingsPath.Bots}/*`);
  return (
    <PageContainer>
      {!isBotsPage && (
        <SettingsHeader breadcrumbs={<AutomationSettingsBreadcrumb />} />
      )}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        {children}
      </div>
    </PageContainer>
  );
};
