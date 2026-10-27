import { PluginSharedSettingsNavigation } from 'ui-modules';
import { LoyaltySettingsNavigation } from '~/LoyaltySettingsNavigation';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { IconSettings, IconChevronLeft } from '@tabler/icons-react';
import { AppLayoutFooterLink, Sidebar, AppLayout, Button } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
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
      path="loyalty/settings"
      name={t('app-settings')}
      icon={IconSettings}
    />
  );
};

/** The plugin's settings pages (`/loyalty/settings/*`) with their own sidebar. */
export const LoyaltySettingsLayout = ({
  children,
}: {
  children: ReactNode;
}) => {
  const { t } = useTranslation('common', { keyPrefix: 'navigation' });

  return (
    <AppLayout
      id="loyalty:settings"
      title={
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="-ml-2 h-7 max-w-full gap-1 px-1.5 font-medium"
        >
          <Link
            to="/loyalty/scores"
            title={t('back-to-app', { name: 'Loyalty' })}
          >
            <IconChevronLeft />
            <span className="truncate">
              {t('plugin-settings-title', { name: 'Loyalty' })}
            </span>
          </Link>
        </Button>
      }
      sidebar={
        <>
          <LoyaltySettingsNavigation />
          <PluginSharedSettingsNavigation
            pluginName="loyalty"
            pathPrefix="loyalty/settings"
          />
        </>
      }
    >
      {children}
    </AppLayout>
  );
};
