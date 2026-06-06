import { IconBox, IconDirections } from '@tabler/icons-react';
import { IUIConfig } from 'erxes-ui';
import { lazy, Suspense } from 'react';

const TourismNavigation = lazy(() =>
  import('./modules/TourismNavigation').then((module) => ({
    default: module.TourismNavigation,
  })),
);

export const CONFIG: IUIConfig = {
  name: 'tourism',
  path: 'tourism',
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
      name: 'tourism',
      icon: IconBox,
      path: 'tourism',
      hasRelationWidget: true,
    },
  ],
};
