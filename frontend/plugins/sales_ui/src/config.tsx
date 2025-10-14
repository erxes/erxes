import { IconBriefcase, IconCashRegister } from '@tabler/icons-react';
import { lazy, Suspense } from 'react';

const SalesNavigation = lazy(() =>
  import('./modules/navigation/SalesNavigation').then((module) => ({
    default: module.SalesNavigation,
  })),
);

const PosOrderNavigation = lazy(() =>
  import('./modules/navigation/PosOrderNavigation').then((module) => ({
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
        <SalesNavigation />
      </Suspense>
    ),
    subGroups: () => (
      <Suspense fallback={<div />}>
        <PosOrderNavigation />
      </Suspense>
    ),
  },
  modules: [
    {
      name: 'sales',
      icon: IconBriefcase,
      path: 'sales',
      hasSettings: false,
      hasRelationWidget: true,
      hasFloatingWidget: false,
    },
  ],
};
