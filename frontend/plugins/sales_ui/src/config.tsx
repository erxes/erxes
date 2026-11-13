import {
  IconBriefcase,
  IconChartAreaLine,
  IconChartBar,
  IconCoins,
  IconCreditCard,
  IconMedal,
  IconReceipt,
  IconSandbox,
  IconTable,
  IconTrendingDown,
  IconTrophy,
} from '@tabler/icons-react';
import { Suspense, lazy } from 'react';

import { IUIConfig, TPropertyInputProps } from 'erxes-ui';
import {
  POS_COVER_CONTENT_TYPE,
  POS_ORDER_CONTENT_TYPE,
  getPosCoverDetailPath,
  getPosOrderDetailPath,
} from '@/pos/constants/posPanel';
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
    // Loyalty points sections on the home dashboard (`./dashboardWidget`);
    // each asks which pipelines it sums. Sizes are 12-column grid units.
    dashboardWidgets: [
      {
        name: 'loyaltyKpis',
        label: 'dashboard-loyalty-kpis',
        description: 'dashboard-loyalty-kpis-description',
        icon: IconCoins,
        defaultSize: { w: 12, h: 4 },
        minSize: { w: 4, h: 3 },
        preview: 'kpi',
        configurable: true,
      },
      {
        name: 'loyaltyFlow',
        label: 'loyalty-timeline-flow',
        description: 'dashboard-loyalty-flow-description',
        icon: IconChartBar,
        defaultSize: { w: 8, h: 7 },
        minSize: { w: 4, h: 5 },
        preview: 'bar',
        configurable: true,
      },
      {
        name: 'loyaltyRunningNet',
        label: 'loyalty-timeline-cumulative-label',
        description: 'dashboard-loyalty-running-net-description',
        icon: IconChartAreaLine,
        defaultSize: { w: 4, h: 7 },
        minSize: { w: 3, h: 5 },
        preview: 'area',
        configurable: true,
      },
      {
        name: 'loyaltyByPipeline',
        label: 'loyalty-insight-by-pipeline',
        description: 'dashboard-loyalty-by-pipeline-description',
        icon: IconTable,
        // Seven columns; narrower the table only scrolls sideways.
        defaultSize: { w: 12, h: 6 },
        minSize: { w: 6, h: 4 },
        preview: 'table',
        configurable: true,
      },
      {
        name: 'loyaltyTopDeals',
        label: 'loyalty-insight-top-deals',
        description: 'dashboard-loyalty-top-deals-description',
        icon: IconTrophy,
        defaultSize: { w: 4, h: 7 },
        minSize: { w: 3, h: 4 },
        preview: 'progress',
        configurable: true,
      },
      {
        name: 'loyaltyTopEarners',
        label: 'loyalty-insight-top-earners',
        description: 'dashboard-loyalty-top-earners-description',
        icon: IconMedal,
        defaultSize: { w: 4, h: 7 },
        minSize: { w: 3, h: 4 },
        preview: 'progress',
        configurable: true,
      },
      {
        name: 'loyaltyTopSpenders',
        label: 'loyalty-insight-top-spenders',
        description: 'dashboard-loyalty-top-spenders-description',
        icon: IconTrendingDown,
        defaultSize: { w: 4, h: 7 },
        minSize: { w: 3, h: 4 },
        preview: 'progress',
        configurable: true,
      },
    ],
    // A customer's / company's deals on their overview (`./contactWidget`).
    contactWidgets: [
      { name: 'deals', label: 'Deals', icon: IconSandbox },
      { name: 'posOrders', label: 'POS orders', icon: IconReceipt },
    ],
    recordPanels: [
      {
        contentType: POS_ORDER_CONTENT_TYPE,
        properties: false,
        detailPath: getPosOrderDetailPath,
        tabs: [
          {
            value: 'payments',
            label: 'Payments',
            labelKey: 'payments',
            icon: IconCreditCard,
            after: 'detail',
          },
        ],
      },
      {
        contentType: POS_COVER_CONTENT_TYPE,
        properties: false,
        detailPath: getPosCoverDetailPath,
      },
    ],
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
