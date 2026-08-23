import { IconSandbox } from '@tabler/icons-react';
import { IUIConfig } from 'erxes-ui/types';
import { lazy, Suspense } from 'react';
import { SEARCH_PROVIDERS } from '~/searchProviders';

const InsuranceNavigation = lazy(() =>
  import('@/InsuranceNavigation').then((module) => ({
    default: module.InsuranceNavigation,
  })),
);

export const CONFIG: IUIConfig = {
  name: 'insurance',
  path: 'insurance',
  icon: IconSandbox,
  navigationGroup: {
    name: 'insurance',
    defaultPath: 'insurance/types',
    icon: IconSandbox,
    content: () => (
      <Suspense fallback={<div />}>
        <InsuranceNavigation />
      </Suspense>
    ),
  },
  modules: [
    {
      name: 'insurance-types',
      icon: IconSandbox,
      path: 'insurance/types',
    },
    {
      name: 'products',
      path: 'insurance/products',
    },
    {
      name: 'risks',
      path: 'insurance/risks',
    },
    {
      name: 'vendors',
      path: 'insurance/vendors',
    },
    {
      name: 'vendor-users',
      path: 'insurance/vendor-users',
    },
    {
      name: 'customers',
      path: 'insurance/customers',
    },
    {
      name: 'regions',
      path: 'insurance/regions',
    },
    {
      name: 'contracts',
      path: 'insurance/contracts',
    },
  ],
  searchProviders: SEARCH_PROVIDERS,
};
