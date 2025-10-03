import { IconBriefcase, IconSandbox } from '@tabler/icons-react';
import { lazy, Suspense } from 'react';

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
  ],
};
