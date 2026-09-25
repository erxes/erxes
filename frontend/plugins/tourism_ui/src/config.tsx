import { IconDirections } from '@tabler/icons-react';
import { IUIConfig } from 'erxes-ui';
import { lazy, Suspense } from 'react';
import { SEARCH_PROVIDERS } from '~/searchProviders';

const TourismNavigation = lazy(() =>
  import('@/TourismNavigation').then((module) => ({
    default: module.TourismNavigation,
  })),
);

export const CONFIG: IUIConfig = {
  name: 'tourism',
  path: 'tourism',
  navigationGroup: {
    name: 'tourism',
    defaultPath: 'tourism/pms',
    icon: IconDirections,
    content: () => (
      <Suspense fallback={<div />}>
        <TourismNavigation />
      </Suspense>
    ),
  },
  modules: [
    {
      name: 'PMS',
      icon: IconDirections,
      path: 'tourism/pms',
      hasRelationWidget: true,
    },
    {
      name: 'TMS',
      icon: IconDirections,
      path: 'tourism/tms',
    },
  ],
  searchProviders: SEARCH_PROVIDERS,
};
