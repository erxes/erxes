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
  plugin: {
    name: 'insurance',
    color: 'oklch(0.5 0.1 232)',
    description: 'Contracts, products and risks',
    logo: (
      <>
        <path
          d="M24 9.5l12.5 4.7v8.6c0 7.6-5.1 12.8-12.5 15.7-7.4-2.9-12.5-8.1-12.5-15.7v-8.6z"
          fill="#fff"
        />
        <path
          d="M18.5 24.2l3.8 3.8 7.4-7.6"
          stroke="currentColor"
          strokeWidth="3.2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </>
    ),
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
