import { IconSandbox } from '@tabler/icons-react';
import { IUIConfig } from 'erxes-ui/types';
import { lazy, Suspense } from 'react';
const MainNavigation = lazy(() =>
  import('./modules/MainNavigation').then((module) => ({
    default: module.MainNavigation,
  })),
);
export const CONFIG: IUIConfig = {
  name: 'mongolian',
  icon: IconSandbox,
  navigationGroup: {
    name: 'mongolian',
    icon: IconSandbox,
    content: () => (
      <Suspense fallback={<div />}>
        <MainNavigation />
      </Suspense>
    ),
  },
  modules: [
    {
      name: 'ebarimt',
      icon: IconSandbox,
      path: 'mongolian/ebarimt',
      hasSettings: true,
      hasRelationWidget: true,
      hasFloatingWidget: false,
    },
    {
      name: 'put-response',
      icon: IconSandbox,
      path: 'mongolian/put-response',
      hasSettings: true,
      hasRelationWidget: false,
      hasFloatingWidget: false,
    },
    {
      name: 'by-date',
      icon: IconSandbox,
      path: 'mongolian/by-date',
      hasSettings: true,
      hasRelationWidget: false,
      hasFloatingWidget: false,
    },
    {
      name: 'duplicated',
      icon: IconSandbox,
      path: 'mongolian/duplicated',
      hasSettings: true,
      hasRelationWidget: false,
      hasFloatingWidget: false,
    },
  ],
};
