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
      path: 'ebarimt',
      hasSettings: true,
      hasRelationWidget: true,
      hasFloatingWidget: false,
    },
    {
      name: 'sync-erkhet',
      icon: IconSandbox,
      path: 'sync-erkhet',
      hasSettings: true,
      hasRelationWidget: true,
      hasFloatingWidget: false,
    },
    {
      name: 'sync-erkhet-history',
      icon: IconSandbox,
      path: 'mongolian/sync-erkhet-history',
      hasRelationWidget: true,
      hasFloatingWidget: false,
    },
    {
      name: 'check-synced-deals',
      icon: IconSandbox,
      path: 'mongolian/check-synced-deals',
      hasRelationWidget: true,
      hasFloatingWidget: false,
    },
    {
      name: 'check-pos-orders',
      icon: IconSandbox,
      path: 'mongolian/check-pos-orders',
      hasRelationWidget: true,
      hasFloatingWidget: false,
    },
    {
      name: 'check-category',
      icon: IconSandbox,
      path: 'mongolian/check-category',
      hasRelationWidget: true,
      hasFloatingWidget: false,
    },
    {
      name: 'check-products',
      icon: IconSandbox,
      path: 'mongolian/check-products',
      hasRelationWidget: true,
      hasFloatingWidget: false,
    },
    {
      name: 'put-response',
      icon: IconSandbox,
      path: 'mongolian/put-response',
      hasRelationWidget: false,
      hasFloatingWidget: false,
    },
    {
      name: 'put-responses-by-date',
      icon: IconSandbox,
      path: 'mongolian/put-responses-by-date',
      hasRelationWidget: false,
      hasFloatingWidget: false,
    },
    {
      name: 'put-responses-duplicated',
      icon: IconSandbox,
      path: 'mongolian/put-responses-duplicated',
      hasRelationWidget: false,
      hasFloatingWidget: false,
    },
  ],
};
