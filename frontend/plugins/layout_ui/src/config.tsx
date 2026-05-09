import { IconLayoutBoard } from '@tabler/icons-react';
import { Suspense, lazy } from 'react';

import { IUIConfig } from 'erxes-ui';

const MainNavigation = lazy(() =>
  import('./modules/MainNavigation').then((module) => ({
    default: module.MainNavigation,
  })),
);

export const CONFIG: IUIConfig = {
  name: 'layout',
  path: 'layout',
  icon: IconLayoutBoard,
  navigationGroup: {
    name: 'layout',
    icon: IconLayoutBoard,
    content: () => (
      <Suspense fallback={<div />}>
        <MainNavigation />
      </Suspense>
    ),
  },
  modules: [
    {
      name: 'layout',
      icon: IconLayoutBoard,
      path: 'layout',
    },
  ],
};
