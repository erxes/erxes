import { IconArrowLeft, IconSettings } from '@tabler/icons-react';
import { AppLayout, AppLayoutFooterLink, Sidebar } from 'erxes-ui';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { LoyaltySettingsNavigation } from '~/LoyaltySettingsNavigation';
import { MainNavigation } from '@/navigation/MainNavigation';

/** The plugin's own sidebar, rendered by its entry through `AppLayout`. */
export const LoyaltySidebar = () => (
  <Sidebar.Group className="px-2 py-1">
    <Sidebar.GroupContent>
      <Sidebar.Menu>
        <MainNavigation />
      </Sidebar.Menu>
    </Sidebar.GroupContent>
  </Sidebar.Group>
);

/** Pinned to the bottom of the app sidebar: the plugin's own settings. */
export const LoyaltySidebarFooter = () => {
  const { t } = useTranslation('common', { keyPrefix: 'navigation' });

  return (
    <AppLayoutFooterLink
      path="settings/loyalty"
      name={t('app-settings')}
      icon={IconSettings}
    />
  );
};

/** The plugin's settings pages with its own settings sidebar. */
export const LoyaltySettingsLayout = ({
  children,
}: {
  children: ReactNode;
}) => {
  const { t } = useTranslation('common', { keyPrefix: 'navigation' });

  return (
    <AppLayout
      id="loyalty:settings"
      title={t('app-settings')}
      sidebar={<LoyaltySettingsNavigation />}
      footer={
        <AppLayoutFooterLink
          path="loyalty/scores"
          name={t('back-to-app', { name: 'Loyalty' })}
          icon={IconArrowLeft}
        />
      }
    >
      {children}
    </AppLayout>
  );
};
