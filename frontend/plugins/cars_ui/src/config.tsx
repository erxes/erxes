import { IconSandbox } from '@tabler/icons-react';


import { IUIConfig } from 'erxes-ui/types';
import { lazy, Suspense } from 'react';
import MainNavigationBar from './modules/module/navigation/MainNavigationBar';

const CarNavigation = lazy(() =>
  import('./modules/module/navigation/MainNavigationBar').then((module) => ({
    default: module.MainNavigationBar
  })),
);

export const CONFIG: IUIConfig = {
  name: 'cars',
  icon: IconSandbox,
  navigationGroup: {
    name: 'cars',
    icon: IconSandbox,
    content: () => (
      <Suspense fallback = {<div />}>
        <MainNavigationBar />
      </Suspense>
    ),
  },
  modules: [
    {
      name: 'cars',
      icon: IconSandbox,
      path: 'cars',
      hasSettings: false,
    },
  ],
};
