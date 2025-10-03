import { IconBox, IconDirections, IconSandbox } from '@tabler/icons-react';
import { IUIConfig } from 'erxes-ui';
import { lazy, Suspense } from 'react';

const TourismNavigation = lazy(() =>
  import('./modules/TourismNavigation').then((module) => ({
    default: module.TourismNavigation,
  })),
);

export const CONFIG: IUIConfig = {
  name: 'tourism',
  navigationGroup: {
    name: 'tourism',
    icon: IconDirections,
    content: () => (
      <Suspense fallback={<div />}>
        <TourismNavigation />
      </Suspense>
    ),
  },
  modules: [
    {
      name: 'pms',
      icon: IconSandbox,
      path: 'pms',
      hasSettings: true,
      hasRelationWidget: true,
    },
    {
      name: 'tms',
      icon: IconBox,
      path: 'tms',
      hasSettings: true,
      hasRelationWidget: true,
    },
  ],
};
