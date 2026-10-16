import { IconAward } from '@tabler/icons-react';
import { IUIConfig } from 'erxes-ui';
import { LoyaltySettingsNavigation } from '~/LoyaltySettingsNavigation';
import { Suspense } from 'react';
import { MainNavigation } from '@/navigation/MainNavigation';
import { SEARCH_PROVIDERS } from '~/searchProviders';

export const CONFIG: IUIConfig = {
  name: 'loyalty',
  path: 'loyalty',
  settingsNavigation: () => (
    <Suspense fallback={<div />}>
      <LoyaltySettingsNavigation />
    </Suspense>
  ),
  plugin: {
    name: 'loyalty',
    color: 'oklch(0.63 0.165 55)',
    description: 'Vouchers, coupons, scores and spins',
    logo: (
      <>
        <path
          d="M10 16a2 2 0 0 1 2-2h24a2 2 0 0 1 2 2v4.2a3.8 3.8 0 0 0 0 7.6V32a2 2 0 0 1-2 2H12a2 2 0 0 1-2-2v-4.2a3.8 3.8 0 0 0 0-7.6z"
          fill="#fff"
        />
        <path
          d="M24 17.6l1.65 4.23 4.53.26-3.52 2.88 1.16 4.39L24 26.9l-3.82 2.46 1.16-4.39-3.52-2.88 4.53-.26z"
          fill="currentColor"
        />
      </>
    ),
    defaultPath: 'loyalty/scores',
    icon: IconAward,
    content: () => (
      <Suspense fallback={<div />}>
        <MainNavigation />
      </Suspense>
    ),
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
      path: 'settings/loyalty/config',
    },
    {
      name: 'pricing',
      icon: IconAward,
      path: 'settings/loyalty/pricing',
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
