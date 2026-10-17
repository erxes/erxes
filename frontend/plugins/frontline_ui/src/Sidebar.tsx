import { IconArrowLeft, IconSettings } from '@tabler/icons-react';
import { AppLayout, AppLayoutFooterLink, Sidebar } from 'erxes-ui';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { FrontlineSettingsNavigation } from '@/FrontlineSettingsNavigation';
import { FrontlineNavigation } from '@/FrontlineNavigation';
import { FrontlineSubGroups } from '@/FrontlineSubGroups';

/** The plugin's own sidebar, rendered by its entry through `AppLayout`. */
export const FrontlineSidebar = () => (
  <>
    <Sidebar.Group className="px-2 py-1">
      <Sidebar.GroupContent>
        <Sidebar.Menu>
          <FrontlineNavigation />
        </Sidebar.Menu>
      </Sidebar.GroupContent>
    </Sidebar.Group>
    <FrontlineSubGroups />
  </>
);

/** Pinned to the bottom of the app sidebar: the plugin's own settings. */
export const FrontlineSidebarFooter = () => {
  const { t } = useTranslation('common', { keyPrefix: 'navigation' });

  return (
    <AppLayoutFooterLink
      path="settings/frontline/channels"
      name={t('app-settings')}
      icon={IconSettings}
    />
  );
};

/** The plugin's settings pages with its own settings sidebar. */
export const FrontlineSettingsLayout = ({
  children,
}: {
  children: ReactNode;
}) => {
  const { t } = useTranslation('common', { keyPrefix: 'navigation' });

  return (
    <AppLayout
      id="frontline:settings"
      title={t('app-settings')}
      sidebar={<FrontlineSettingsNavigation />}
      footer={
        <AppLayoutFooterLink
          path="frontline/inbox"
          name={t('back-to-app', { name: 'Frontline' })}
          icon={IconArrowLeft}
        />
      }
    >
      {children}
    </AppLayout>
  );
};
