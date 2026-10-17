import { IconArrowLeft, IconSettings } from '@tabler/icons-react';
import { AppLayout, AppLayoutFooterLink, Sidebar } from 'erxes-ui';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { SettingsNavigation } from '@/SettingsNavigation';
import { MainNavigation } from '@/MainNavigation';

/** The plugin's own sidebar, rendered by its entry through `AppLayout`. */
export const MongolianSidebar = () => (
  <Sidebar.Group className="px-2 py-1">
    <Sidebar.GroupContent>
      <Sidebar.Menu>
        <MainNavigation />
      </Sidebar.Menu>
    </Sidebar.GroupContent>
  </Sidebar.Group>
);

/** Pinned to the bottom of the app sidebar: the plugin's own settings. */
export const MongolianSidebarFooter = () => {
  const { t } = useTranslation('common', { keyPrefix: 'navigation' });

  return (
    <AppLayoutFooterLink
      path="settings/mongolian"
      name={t('app-settings')}
      icon={IconSettings}
    />
  );
};

/** The plugin's settings pages with its own settings sidebar. */
export const MongolianSettingsLayout = ({
  children,
}: {
  children: ReactNode;
}) => {
  const { t } = useTranslation('common', { keyPrefix: 'navigation' });

  return (
    <AppLayout
      id="mongolian:settings"
      title={t('app-settings')}
      sidebar={<SettingsNavigation />}
      footer={
        <AppLayoutFooterLink
          path="mongolian/put-response"
          name={t('back-to-app', { name: 'Mongolian' })}
          icon={IconArrowLeft}
        />
      }
    >
      {children}
    </AppLayout>
  );
};
