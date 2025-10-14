import {
  IconBriefcase,
  IconCashRegister,
  IconSandbox,
} from '@tabler/icons-react';
import { Suspense, lazy } from 'react';

const MainNavigation = lazy(() =>
  import('./modules/MainNavigation').then((module) => ({
    default: module.MainNavigation,
  })),
);

const SalesNavigation = lazy(() =>
  import('./modules/SalesNavigation').then((module) => ({
    default: module.SalesNavigation,
  })),
);

export const CONFIG = {
  name: 'sales',
  icon: IconBriefcase,
  hasRelationWidget: true,
  widgetsIcon: IconBriefcase,
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
        <SalesNavigation />
      </Suspense>
    ),
  },
  modules: [
    {
      name: 'deals',
      icon: IconSandbox,
      path: 'deals',
      hasSettings: true,
    },
    {
      name: 'pos',
      icon: IconCashRegister,
      path: 'pos',
      hasSettings: true,
      hasRelationWidget: true,
    },
  ],
};
