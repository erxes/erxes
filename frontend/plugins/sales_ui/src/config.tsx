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

export const CONFIG: IUIConfig = {
  name: 'sales',
  path: 'sales',
  navigationGroup: {
    name: 'sales',
    defaultPath: 'sales/deals',
    icon: IconBriefcase,
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
      path: 'sales/settings/pos',
    },
    {
      name: 'Deals settings',
      icon: IconBriefcase,
      path: 'sales/settings/deals',
    },
  ],
  widgets: {
    // A customer's / company's deals on their overview (`./contactWidget`).
    contactWidgets: [{ name: 'deals', label: 'Deals', icon: IconSandbox }],
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
