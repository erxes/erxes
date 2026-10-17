import { IconArrowLeft, IconSettings } from '@tabler/icons-react';
import { AppLayout, AppLayoutFooterLink, Sidebar } from 'erxes-ui';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { OperationSettingsNavigation } from '@/OperationSettingsNavigation';
import { MainNavigation } from '@/navigation/MainNavigation';
import { TeamsNavigation } from '@/navigation/TeamsNavigation';

/** The plugin's own sidebar, rendered by its entry through `AppLayout`. */
export const OperationSidebar = () => (
  <>
    <Sidebar.Group className="px-2 py-1">
      <Sidebar.GroupContent>
        <Sidebar.Menu>
          <MainNavigation />
        </Sidebar.Menu>
      </Sidebar.GroupContent>
    </Sidebar.Group>
    <TeamsNavigation />
  </>
);

/** Pinned to the bottom of the app sidebar: the plugin's own settings. */
export const OperationSidebarFooter = () => {
  const { t } = useTranslation('common', { keyPrefix: 'navigation' });

  return (
    <AppLayoutFooterLink
      path="settings/operation/team"
      name={t('app-settings')}
      icon={IconSettings}
    />
  );
};

/** The plugin's settings pages with its own settings sidebar. */
export const OperationSettingsLayout = ({
  children,
}: {
  children: ReactNode;
}) => {
  const { t } = useTranslation('common', { keyPrefix: 'navigation' });

  return (
    <AppLayout
      id="operation:settings"
      title={t('app-settings')}
      sidebar={<OperationSettingsNavigation />}
      footer={
        <AppLayoutFooterLink
          path="operation/projects"
          name={t('back-to-app', { name: 'Operation' })}
          icon={IconArrowLeft}
        />
      }
    >
      {children}
    </AppLayout>
  );
};
