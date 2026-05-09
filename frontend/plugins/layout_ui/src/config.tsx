import {
  IconLayoutDashboard,
  IconLayoutGrid,
} from '@tabler/icons-react';
import { lazy, Suspense } from 'react';
import { IUIConfig } from 'erxes-ui';

const LayoutSettingsNavigation = lazy(() =>
  import('@/LayoutSettingsNavigation').then((module) => ({
    default: module.LayoutSettingsNavigation,
  })),
);

const LayoutNavigation = lazy(() =>
  import('@/LayoutNavigation').then((module) => ({
    default: module.LayoutNavigation,
  })),
);

export const CONFIG: IUIConfig = {
  name: 'layout',
  path: 'layout',
  icon: IconLayoutGrid,
  settingsNavigation: () => (
    <Suspense fallback={<div />}>
      <LayoutSettingsNavigation />
    </Suspense>
  ),
  navigationGroup: {
    name: 'layout',
    icon: IconLayoutGrid,
    content: () => (
      <Suspense fallback={<div />}>
        <LayoutNavigation />
      </Suspense>
    ),
  },
  modules: [
    {
      name: 'pages',
      icon: IconLayoutGrid,
      path: 'layout/pages/sample',
    },
    {
      name: 'dashboards',
      icon: IconLayoutDashboard,
      path: 'layout/dashboards/demo',
    },
  ],
};
