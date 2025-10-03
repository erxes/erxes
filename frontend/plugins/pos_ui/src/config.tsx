import { IconBriefcase, IconCashRegister } from '@tabler/icons-react';
import { IUIConfig } from 'erxes-ui';
import { lazy, Suspense } from 'react';

const PosNavigation = lazy(() =>
  import('./modules/PosNavigation').then((module) => ({
    default: module.PosNavigation,
  })),
);

export const CONFIG: IUIConfig = {
  name: 'pos',
  icon: IconCashRegister,
  navigationGroup: {
    name: 'sales',
    icon: IconBriefcase,
    content: () => (
      <Suspense fallback={<div />}>
        <PosNavigation />
      </Suspense>
    ),
  },
  modules: [
    {
      name: 'pos',
      icon: IconCashRegister,
      path: 'pos',
      hasSettings: true,
      hasRelationWidget: true,
    },
  ],
};
