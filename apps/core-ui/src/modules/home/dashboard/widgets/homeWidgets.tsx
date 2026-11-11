import {
  IconAddressBook,
  IconApps,
  IconBuilding,
  IconChartBar,
  IconLayoutGrid,
  IconUsers,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { HomeApps } from '../../components/HomeApps';
import { HomeContactsOverview } from '../../components/HomeContactsOverview';
import { HomeRecentCompanies } from '../../components/HomeRecentCompanies';
import { HomeRecentCustomers } from '../../components/HomeRecentCustomers';
import { HomeTeamMembers } from '../../components/HomeTeamMembers';
import { HOME_NS } from '../../i18n';
import type { TDashboardWidgetDefinition } from '../types/dashboardTypes';

const HomePluginsWidget = () => {
  const { t } = useTranslation('common', { keyPrefix: 'home' });

  return <HomeApps kind="plugin" title={t('installed-plugins')} emptyLabel={t('plugins-empty')} />;
};

const HomeCoreModulesWidget = () => {
  const { t } = useTranslation('common', { keyPrefix: 'home' });

  return <HomeApps kind="core" title={t('core-modules')} emptyLabel={t('core-modules-empty')} />;
};

// Every widget the home dashboard can place, in catalog order.
export const DASHBOARD_WIDGETS: TDashboardWidgetDefinition[] = [
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
  {
    type: 'home.team-members',
    group: 'home',
    preview: 'list',
    ns: HOME_NS,
    labelKey: 'widgets.team-members',
    descriptionKey: 'widgets.team-members-description',
    icon: IconUsers,
    singleton: true,
    defaultSize: { w: 6, h: 6 },
    minSize: { w: 3, h: 4 },
    Component: HomeTeamMembers,
  },
  {
    type: 'home.contacts-overview',
    group: 'contacts',
    preview: 'kpi',
    ns: HOME_NS,
    labelKey: 'widgets.contacts-overview',
    descriptionKey: 'widgets.contacts-overview-description',
    icon: IconChartBar,
    singleton: true,
    defaultSize: { w: 12, h: 3 },
    minSize: { w: 4, h: 3 },
    Component: HomeContactsOverview,
  },
  {
    type: 'home.recent-customers',
    group: 'contacts',
    preview: 'list',
    ns: HOME_NS,
    labelKey: 'widgets.recent-customers',
    descriptionKey: 'widgets.recent-customers-description',
    icon: IconAddressBook,
    singleton: true,
    defaultSize: { w: 6, h: 6 },
    minSize: { w: 3, h: 4 },
    Component: HomeRecentCustomers,
  },
  {
    type: 'home.recent-companies',
    group: 'contacts',
    preview: 'list',
    ns: HOME_NS,
    labelKey: 'widgets.recent-companies',
    descriptionKey: 'widgets.recent-companies-description',
    icon: IconBuilding,
    singleton: true,
    defaultSize: { w: 6, h: 6 },
    minSize: { w: 3, h: 4 },
    Component: HomeRecentCompanies,
  },
];

export const DASHBOARD_WIDGETS_BY_TYPE = new Map(
  DASHBOARD_WIDGETS.map((widget) => [widget.type, widget]),
);
