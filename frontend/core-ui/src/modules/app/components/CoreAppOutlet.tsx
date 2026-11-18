import { AppLayout, AppLayoutFooterLink } from 'erxes-ui';
import { IconSettings } from '@tabler/icons-react';
import { AutomationSettingsPath } from '@/types/paths/AutomationPath';
import { DocumentsContextNavigation } from '@/documents/components/DocumentsContextNavigation';
import { INavigationActivity } from '@/navigation/types/NavigationActivity';
import { NavigationChildControlsProvider } from '@/navigation/components/app-sidebar/NavigationChildControlsProvider';
import { NavigationCorePanelContent } from '@/navigation/components/app-sidebar/NavigationCoreModules';
import { Outlet, useLocation } from 'react-router-dom';
import { SegmentsContextNavigation } from '@/segments/components/SegmentsSidebar';
import { DataExtensionsContextNavigation } from '@/data-extensions/components/DataExtensionsSidebar';
import { SettingsSidebar } from '@/settings/components/SettingsSidebar';
import { AppPath } from '@/types/paths/AppPath';
import { SETTINGS_TAB_ID } from '@/navigation/hooks/useAppTabs';
import {
  findAppActivityByPath,
  isOrganizationSettingsPath,
} from '@/navigation/utils/navigationActivities';
import { useNavigationActivities } from '@/navigation/hooks/useNavigationActivities';
import { useTranslation } from 'react-i18next';

const AppPageOutlet = () => (
  <div className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
    <Outlet />
  </div>
);

const getCoreModuleSidebar = (
  activity: INavigationActivity,
  pathname: string,
) => {
  if (pathname.startsWith(`/${AppPath.Segments}`)) {
    return <SegmentsContextNavigation />;
  }

  if (pathname.startsWith(`/${AppPath.Documents}`)) {
    return <DocumentsContextNavigation />;
  }

  if (pathname.startsWith(`/${AppPath.DataExtensions}`)) {
    return <DataExtensionsContextNavigation />;
  }

  if (activity.modules.some((module) => module.submenus?.length)) {
    return <NavigationCorePanelContent activity={activity} />;
  }

  return null;
};

const getCoreModuleSidebarFooter = (pathname: string, label: string) => {
  if (pathname.startsWith(`/${AppPath.Automations}`)) {
    return (
      <AppLayoutFooterLink
        path={AutomationSettingsPath.Index}
        name={label}
        icon={IconSettings}
      />
    );
  }

  return null;
};

/**
 * Plugin routes render bare: the plugin entry draws its own sidebar, pages
 * and settings. Core apps (organization settings, core modules) get their
 * sidebar from core.
 */
export const CoreAppOutlet = () => {
  const activities = useNavigationActivities();
  const { pathname } = useLocation();
  const { t } = useTranslation('common', { keyPrefix: 'navigation' });

  if (isOrganizationSettingsPath(pathname)) {
    return (
      <AppLayout
        id={SETTINGS_TAB_ID}
        title={t('organization-settings')}
        sidebar={<SettingsSidebar />}
      >
        <AppPageOutlet />
      </AppLayout>
    );
  }

  const activity = findAppActivityByPath(activities, pathname);

  const sidebar =
    activity?.kind === 'core' ? getCoreModuleSidebar(activity, pathname) : null;

  // One element shape for every route without a core sidebar: a plugin's
  // nested pages may match none of its module paths, and switching the
  // wrapper would remount (reload) the whole plugin. The provider lets plugin
  // menu items (NavigationMenuLinkItem) offer favorite/reorder.
  if (!activity || !sidebar) {
    return (
      <NavigationChildControlsProvider
        activity={activity?.kind === 'plugin' ? activity : undefined}
      >
        <AppPageOutlet />
      </NavigationChildControlsProvider>
    );
  }

  return (
    <AppLayout
      id={activity.id}
      title={activity.label}
      footer={getCoreModuleSidebarFooter(pathname, t('app-settings'))}
      sidebar={
        <NavigationChildControlsProvider activity={activity}>
          {sidebar}
        </NavigationChildControlsProvider>
      }
    >
      <AppPageOutlet />
    </AppLayout>
  );
};
