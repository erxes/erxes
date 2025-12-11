import { IconLibraryPhoto } from '@tabler/icons-react';
import { IUIConfig } from 'erxes-ui/types';
import { IconBooks } from '@tabler/icons-react';
import { lazy, Suspense } from 'react';

const ContentNavigation = lazy(() =>
  import('./modules/ContentNavigation').then((module) => ({
    default: module.ContentNavigation,
  })),
);

export const CONFIG: IUIConfig = {
  name: 'loyalty',
  navigationGroup: {
    name: 'loyalty',
    icon: IconLibraryPhoto,
    content: () => (
      <Suspense fallback={<div />}>
        <ContentNavigation />
      </Suspense>
    ),
    subGroups: () => (
      <Suspense fallback={<div />}>{/* <SalesNavigation /> */}</Suspense>
    ),
  },
  modules: [
    {
      name: 'loyalty',
      icon: IconBooks,
      path: 'loyalty',
      hasSettings: true,
      hasRelationWidget: false,
    },
    // {
    //   name: 'loyalty',
    //   icon: IconBooks,
    //   path: 'loyalty/assignment',
    //   hasSettings: false,
    //   hasRelationWidget: false,
    // },
    // {
    //   name: 'loyalty',
    //   icon: IconBooks,
    //   path: 'loyalty/coupen',
    //   hasSettings: false,
    //   hasRelationWidget: false,
    // },
    // {
    //   name: 'loyalty',
    //   icon: IconBooks,
    //   path: 'loyalty/donation',
    //   hasSettings: false,
    //   hasRelationWidget: false,
    // },
    // {
    //   name: 'loyalty',
    //   icon: IconBooks,
    //   path: 'loyalty/lottery',
    //   hasSettings: false,
    //   hasRelationWidget: false,
    // },
    // {
    //   name: 'loyalty',
    //   icon: IconBooks,
    //   path: 'loyalty/score',
    //   hasSettings: false,
    //   hasRelationWidget: false,
    // },
    // {
    //   name: 'loyalty',
    //   icon: IconBooks,
    //   path: 'loyalty/spin',
    //   hasSettings: true,
    //   hasRelationWidget: false,
    // },
    // {
    //   name: 'loyalty',
    //   icon: IconBooks,
    //   path: 'loyalty/voucher',
    //   hasSettings: true,
    //   hasRelationWidget: false,
    // },
  ],
};
