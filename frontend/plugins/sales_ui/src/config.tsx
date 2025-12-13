import { IconBriefcase, IconSandbox } from '@tabler/icons-react';
import { Suspense, lazy } from 'react';
import { IUIConfig } from 'erxes-ui';

const MainNavigation = lazy(() =>
  import('./modules/MainNavigation').then((module) => ({
    default: module.MainNavigation,
  })),
);

const SalesSubNavigation = lazy(() =>
  import('./modules/SalesSubNavigation').then((module) => ({
    default: module.SalesSubNavigation,
  })),
);

const PosOrderNavigation = lazy(() =>
  import('./modules/pos/PosOrderNavigation').then((module) => ({
    default: module.PosOrderNavigation,
  })),
);


const GoalsNavigation = lazy(() =>
  import('./modules/goals/GoalsNavigation').then((module) => ({
    default: module.GoalsNavigation,
  })),
);


export const CONFIG: IUIConfig = {
  name: 'sales',
  icon: IconBriefcase,
  navigationGroup: {
    name: 'sales',
    icon: IconBriefcase,
    content: () => (
      <Suspense fallback={<div />}>
        <MainNavigation />
      </Suspense>
    ),
    subGroups: () => (
      <Suspense fallback={<div />}>
        <SalesSubNavigation />
        <PosOrderNavigation />
        <GoalsNavigation />
      </Suspense>
    ),
  },
  modules: [
    {
      name: 'sales',
      icon: IconBriefcase,
      path: 'sales',
      hasSettings: true,
      hasAutomation: true,
    },
    {
    name: 'goals',
    icon: IconSandbox,
    path: 'goals',
    hasSettings: false,
    hasAutomation: false,
    hasSegmentConfigWidget: true
    },
  ],
  widgets: {
    relationWidgets: [
      {
        name: 'deals',
        icon: IconSandbox,
      },
    ],
  },
};
