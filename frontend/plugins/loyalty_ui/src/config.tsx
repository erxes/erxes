import { IconAward } from '@tabler/icons-react';
import { IUIConfig } from 'erxes-ui';
import { LoyaltySettingsNavigation } from './LoyaltySettingsNavigation';
import { Suspense } from 'react';
import { MainNavigation } from './modules/navigation/MainNavigation';
import { SEARCH_PROVIDERS } from './searchProviders';

export const CONFIG: IUIConfig = {
  name: 'loyalty',
  path: 'loyalty',
  settingsNavigation: () => (
    <Suspense fallback={<div />}>
      <LoyaltySettingsNavigation />
    </Suspense>
  ),
  navigationGroup: {
    name: 'loyalty',
    defaultPath: 'loyalty/vouchers',
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
    relationWidgets: [
      {
        name: 'loyalty',
        icon: IconAward,
      },
    ],
  },
  searchProviders: SEARCH_PROVIDERS,
};
