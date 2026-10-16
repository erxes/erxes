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
  plugin: {
    name: 'tourism',
    color: 'oklch(0.56 0.12 205)',
    description: 'Hotel PMS and tour management',
    logo: (
      <>
        <path
          d="M9.5 25.5C11.6 18.6 17.3 14 24 14s12.4 4.6 14.5 11.5z"
          fill="#fff"
        />
        <rect
          x="11.5"
          y="25.5"
          width="25"
          height="11"
          rx="1.5"
          fill="#fff"
          opacity=".55"
        />
        <rect x="21" y="28" width="6" height="8.5" rx="1" fill="currentColor" />
        <circle cx="24" cy="12.8" r="2.6" fill="#fff" />
      </>
    ),
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
