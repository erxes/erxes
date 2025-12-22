import { IconSandbox } from '@tabler/icons-react';
import { IUIConfig } from 'erxes-ui/types';
import { lazy, Suspense } from 'react';

const InsuranceNavigation = lazy(() =>
  import('./modules/InsuranceNavigation').then((module) => ({
    default: module.InsuranceNavigation,
  })),
);

export const CONFIG: IUIConfig = {
  name: 'insurance',
  icon: IconSandbox,
  navigationGroup: {
    name: 'insurance',
    icon: IconSandbox,
    content: () => (
      <Suspense fallback={<div />}>
        <InsuranceNavigation />
      </Suspense>
    ),
  },
  modules: [
    {
      name: 'insurance',
      icon: IconSandbox,
      path: 'insurance',
      hasSettings: true,
      hasRelationWidget: false,
      hasFloatingWidget: false,
    },
  ],
};
