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

const PosOrderNavigation = lazy(() =>
  import('./modules/pos/PosOrderNavigation').then((module) => ({
    default: module.PosOrderNavigation,
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
        <PosOrderNavigation />
      </Suspense>
    ),
  },
  modules: [
    {
      name: 'deals',
      icon: IconSandbox,
      path: 'sales/deals',
      hasSettings: true,
    },
    {
      name: 'pos',
      icon: IconCashRegister,
      path: 'sales/pos',
      hasSettings: true,
      hasRelationWidget: true,
    },
    {
      name: 'sales',
      icon: IconBriefcase,
      path: 'sales',
      hasSettings: false,
      hasRelationWidget: true,
    },
  ],
  relationWidgets: [
    {
      name: 'deals',
      icon: IconSandbox,
    },
  ],
};
