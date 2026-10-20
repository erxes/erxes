import { AppLayout } from 'erxes-ui';
import { DocumentsContextNavigation } from '@/documents/components/DocumentsContextNavigation';
import { INavigationActivity } from '@/navigation/types/NavigationActivity';
import { NavigationChildControlsProvider } from '@/navigation/components/app-sidebar/NavigationChildControlsProvider';
import { NavigationCorePanelContent } from '@/navigation/components/app-sidebar/NavigationCoreModules';
import { Outlet, useLocation } from 'react-router-dom';
import { SegmentsContextNavigation } from '@/segments/components/SegmentsSidebar';
import { SettingsSidebar } from '@/settings/components/SettingsSidebar';
import { AppPath } from '@/types/paths/AppPath';
import {
  findAppActivityByPath,
  isOrganizationSettingsPath,
} from '@/navigation/utils/navigationActivities';
import { useNavigationActivities } from '@/navigation/hooks/useNavigationActivities';
import { useTranslation } from 'react-i18next';

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

  if (activity.modules.some((module) => module.submenus?.length)) {
    return <NavigationCorePanelContent activity={activity} />;
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
        id="core:settings"
        title={t('organization-settings')}
        sidebar={<SettingsSidebar />}
      >
        <Outlet />
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
        <Outlet />
      </NavigationChildControlsProvider>
    );
  }

  return (
    <AppLayout
      id={activity.id}
      title={activity.label}
      sidebar={
        <NavigationChildControlsProvider activity={activity}>
          {sidebar}
        </NavigationChildControlsProvider>
      }
    >
      <Outlet />
    </AppLayout>
  );
};
