import { IconBriefcase, IconReceipt, IconSandbox } from '@tabler/icons-react';
import { Suspense, lazy } from 'react';

import { IUIConfig, TPropertyInputProps } from 'erxes-ui';
import { SEARCH_PROVIDERS } from '~/searchProviders';

const DealStagePropertyInput = lazy(() =>
  import('@/deals/components/deal-selects/DealStagePropertyInput').then(
    (module) => ({
      default: module.DealStagePropertyInput,
    }),
  ),
);

const MainNavigation = lazy(() =>
  import('@/MainNavigation').then((module) => ({
    default: module.MainNavigation,
  })),
);

const SalesSubNavigation = lazy(() =>
  import('@/SalesSubNavigation').then((module) => ({
    default: module.SalesSubNavigation,
  })),
);

const PosOrderNavigation = lazy(() =>
  import('@/pos/PosOrderNavigation').then((module) => ({
    default: module.PosOrderNavigation,
  })),
);

const SalesSettingsNavigation = lazy(() =>
  import('@/SalesSettingsNavigation').then((module) => ({
    default: module.SalesSettingsNavigation,
  })),
);

export const CONFIG: IUIConfig = {
  name: 'sales',
  path: 'sales',
  settingsNavigation: () => (
    <Suspense fallback={<div />}>
      <SalesSettingsNavigation />
    </Suspense>
  ),
  plugin: {
    name: 'sales',
    color: 'oklch(0.55 0.16 150)',
    description: 'Deal pipelines and POS',
    logo: (
      <>
        <rect
          x="11"
          y="12"
          width="26"
          height="4.5"
          rx="2.25"
          fill="#fff"
          opacity=".6"
        />
        <path
          d="M12.5 19.5h23l-8 9.5v6.2a1.5 1.5 0 0 1-.9 1.4l-4 1.7a1.5 1.5 0 0 1-2.1-1.4V29z"
          fill="#fff"
        />
      </>
    ),
    defaultPath: 'sales/deals',
    icon: IconBriefcase,
    content: () => (
      <Suspense fallback={<div />}>
        <MainNavigation />
      </Suspense>
    ),
    subGroup: () => (
      <Suspense fallback={<div />}>
        <SalesSubNavigation />
        <PosOrderNavigation />
      </Suspense>
    ),
  },
  modules: [
    {
      name: 'deals',
      path: 'sales/deals',
      hasAutomation: true,
    },
    {
      name: 'pos',
      icon: IconBriefcase,
      path: 'sales/pos',
    },
    {
      name: 'POS settings',
      icon: IconBriefcase,
      path: 'settings/sales/pos',
    },
    {
      name: 'Deals settings',
      icon: IconBriefcase,
      path: 'settings/sales/deals',
    },
  ],
  widgets: {
    relationWidgets: [
      {
        name: 'deals',
        icon: IconSandbox,
      },
      {
        name: 'posOrders',
        icon: IconReceipt,
        label: 'POS orders',
      },
    ],
    propertyInputs: {
      dealStage: (props: TPropertyInputProps) => (
        <Suspense fallback={<div />}>
          <DealStagePropertyInput {...props} />
        </Suspense>
      ),
    },
  },
  searchProviders: SEARCH_PROVIDERS,
};
