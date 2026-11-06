import {
  IconAward,
  IconChartHistogram,
  IconCoins,
  IconDiscount,
  IconTicket,
} from '@tabler/icons-react';
import { IUIConfig } from 'erxes-ui';
import { SEARCH_PROVIDERS } from '~/searchProviders';

export const CONFIG: IUIConfig = {
  name: 'loyalty',
  path: 'loyalty',
  navigationGroup: {
    name: 'loyalty',
    defaultPath: 'loyalty/scores',
    icon: IconAward,
  },
  modules: [
    {
      name: 'vouchers',
      icon: IconAward,
      path: 'loyalty/vouchers',
      hasAutomation: true,
      hasRelationWidget: true,
    },
    {
      name: 'lotteries',
      path: 'loyalty/lotteries',
      icon: IconAward,
    },
    {
      name: 'spins',
      path: 'loyalty/spins',
      icon: IconAward,
    },
    {
      name: 'donates',
      path: 'loyalty/donates',
      icon: IconAward,
    },
    {
      name: 'scores',
      path: 'loyalty/scores',
      icon: IconAward,
    },
    {
      name: 'accounts',
      path: 'loyalty/accounts',
      icon: IconAward,
    },
    {
      name: 'assignments',
      path: 'loyalty/assignments',
      icon: IconAward,
    },
    {
      name: 'agents',
      path: 'loyalty/agents',
      icon: IconAward,
    },
    {
      name: 'coupons',
      path: 'loyalty/coupons',
      icon: IconAward,
    },
    {
      name: 'configs',
      icon: IconAward,
      path: 'loyalty/settings/config',
    },
    {
      name: 'pricing',
      icon: IconAward,
      path: 'loyalty/settings/pricing',
    },
  ],
  widgets: {
    relationSettingsWidgets: [
      {
        name: 'loyalty',
        label: 'Loyalty',
        icon: IconAward,
      },
    ],
    relationWidgets: [
      {
        name: 'loyalty',
        icon: IconAward,
      },
    ],
    recordPickerWidgets: [
      { name: 'scoreCampaign', contentType: 'loyalty:score.campaigns' },
    ],
    dashboardWidgets: [
      {
        name: 'scoreSummary',
        preview: 'kpi',
        label: 'dashboard.score-summary',
        description: 'dashboard.score-summary-description',
        icon: IconChartHistogram,
        defaultSize: { w: 4, h: 7 },
        minSize: { w: 3, h: 6 },
        configurable: true,
      },
      {
        name: 'recentScoreLogs',
        preview: 'list',
        label: 'dashboard.recent-score-logs',
        description: 'dashboard.recent-score-logs-description',
        icon: IconCoins,
        defaultSize: { w: 6, h: 6 },
        minSize: { w: 4, h: 4 },
        configurable: true,
      },
      {
        name: 'recentVouchers',
        preview: 'list',
        label: 'dashboard.recent-vouchers',
        description: 'dashboard.recent-vouchers-description',
        icon: IconTicket,
        defaultSize: { w: 6, h: 6 },
        minSize: { w: 4, h: 4 },
        configurable: true,
      },
      {
        name: 'recentCoupons',
        preview: 'table',
        label: 'dashboard.recent-coupons',
        description: 'dashboard.recent-coupons-description',
        icon: IconDiscount,
        defaultSize: { w: 6, h: 6 },
        minSize: { w: 5, h: 4 },
      },
    ],
  },
  searchProviders: SEARCH_PROVIDERS,
};
