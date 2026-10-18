import { IconAward } from '@tabler/icons-react';
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
  },
  searchProviders: SEARCH_PROVIDERS,
};
