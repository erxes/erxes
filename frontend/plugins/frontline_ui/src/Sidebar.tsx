import { PluginSharedSettingsNavigation } from 'ui-modules';
import { FrontlineSettingsNavigation } from '@/FrontlineSettingsNavigation';
import type { ReactNode } from 'react';
import { IconSettings, IconArrowLeft } from '@tabler/icons-react';
import {
  AppLayoutFooterLink,
  Sidebar,
  AppLayout,
  useQueryState,
} from 'erxes-ui';
import { useTranslation } from 'react-i18next';
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
      path="frontline/settings/channels"
      name={t('app-settings')}
      icon={IconSettings}
    />
  );
};

/** The plugin's settings pages (`/frontline/settings/*`) with their own sidebar. */
export const FrontlineSettingsLayout = ({
  children,
}: {
  children: ReactNode;
}) => {
  const { t } = useTranslation('common', { keyPrefix: 'navigation' });
  const [inPreview] = useQueryState<boolean>('inPreview');

  // Preview iframes (messenger, form) render bare, as core's DefaultLayout does.
  if (inPreview) {
    return <>{children}</>;
  }

  return (
    <AppLayout
      id="frontline:settings"
      title={t('plugin-settings-title', { name: 'Frontline' })}
      sidebar={
        <>
          <FrontlineSettingsNavigation />
          <PluginSharedSettingsNavigation
            pluginName="frontline"
            pathPrefix="frontline/settings"
          />
        </>
      }
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
