import {
  IconBriefcase,
  IconCashRegister,
  IconSandbox,
} from '@tabler/icons-react';
import { IUIConfig } from 'erxes-ui/types';
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
};
