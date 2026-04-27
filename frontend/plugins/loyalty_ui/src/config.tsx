import { IconAward } from '@tabler/icons-react';
import { IUIConfig } from 'erxes-ui';
import { LoyaltySettingsNavigation } from './LoyaltySettingsNavigation';
import { Suspense } from 'react';
import { MainNavigation } from './modules/navigation/MainNavigation';

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
    icon: IconAward,
    content: () => (
      <Suspense fallback={<div />}>
        <MainNavigation />
      </Suspense>
    ),
  },
  modules: [
    {
      name: 'pricing',
      icon: IconAward,
      path: 'pricing',
    },
    {
      name: 'loyalty',
      icon: IconAward,
      path: 'loyalty',
    },
  ],
};
