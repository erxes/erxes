import { HomeApps } from '@/home/components/HomeApps';
import { HomeNotifications } from '@/home/components/HomeNotifications';
import { HomeStarred } from '@/home/components/HomeStarred';
import { TDashboardWidgetDefinition } from '@/home/dashboard/types/dashboardTypes';
import {
  IconApps,
  IconBell,
  IconLayoutGrid,
  IconStar,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

const HomePluginsWidget = () => {
  const { t } = useTranslation('common', { keyPrefix: 'home' });

  return (
    <HomeApps
      kind="plugin"
      title={t('installed-plugins')}
      emptyLabel={t('plugins-empty')}
    />
  );
};

const HomeCoreModulesWidget = () => {
  const { t } = useTranslation('common', { keyPrefix: 'home' });

  return (
    <HomeApps
      kind="core"
      title={t('core-modules')}
      emptyLabel={t('core-modules-empty')}
    />
  );
};

export const HOME_DASHBOARD_WIDGETS: TDashboardWidgetDefinition[] = [
  {
    type: 'home.notifications',
    group: 'home',
    preview: 'list',
    ns: 'common',
    labelKey: 'home.widgets.notifications',
    descriptionKey: 'home.widgets.notifications-description',
    icon: IconBell,
    singleton: true,
    defaultSize: { w: 6, h: 6 },
    minSize: { w: 4, h: 4 },
    Component: HomeNotifications,
  },
  {
    type: 'home.starred',
    group: 'home',
    preview: 'list',
    ns: 'common',
    labelKey: 'home.widgets.starred',
    descriptionKey: 'home.widgets.starred-description',
    icon: IconStar,
    singleton: true,
    defaultSize: { w: 6, h: 6 },
    minSize: { w: 3, h: 4 },
    Component: HomeStarred,
  },
  {
    type: 'home.plugins',
    group: 'home',
    preview: 'kpi',
    ns: 'common',
    labelKey: 'home.widgets.plugins',
    descriptionKey: 'home.widgets.plugins-description',
    icon: IconApps,
    singleton: true,
    defaultSize: { w: 12, h: 7 },
    minSize: { w: 4, h: 4 },
    Component: HomePluginsWidget,
  },
  {
    type: 'home.core-modules',
    group: 'home',
    preview: 'kpi',
    ns: 'common',
    labelKey: 'home.widgets.core-modules',
    descriptionKey: 'home.widgets.core-modules-description',
    icon: IconLayoutGrid,
    singleton: true,
    defaultSize: { w: 12, h: 6 },
    minSize: { w: 4, h: 4 },
    Component: HomeCoreModulesWidget,
  },
];
