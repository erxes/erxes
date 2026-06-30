import { IconAward } from '@tabler/icons-react';
import { IUIConfig } from 'erxes-ui';
import { LoyaltySettingsNavigation } from './LoyaltySettingsNavigation';
import { Suspense } from 'react';
import { MainNavigation } from './modules/navigation/MainNavigation';

const getLoyaltyFavoriteName = (path: string) => {
  const pathWithoutQuery = path.split('?')[0].replace(/^\/|\/$/g, '');

  if (pathWithoutQuery === 'settings/loyalty/pricing') return 'Pricing';
  if (pathWithoutQuery.startsWith('settings/loyalty/pricing/')) {
    return 'Pricing Detail';
  }

  if (pathWithoutQuery === 'loyalty') return 'Loyalty';

  if (pathWithoutQuery.endsWith('/vouchers')) return 'Vouchers';
  if (pathWithoutQuery.endsWith('/vouchers/categories')) {
    return 'Voucher Categories';
  }

  if (pathWithoutQuery.endsWith('/lotteries')) return 'Lotteries';
  if (pathWithoutQuery.endsWith('/spins')) return 'Spins';
  if (pathWithoutQuery.endsWith('/donates')) return 'Donates';
  if (pathWithoutQuery.endsWith('/scores')) return 'Scores';
  if (pathWithoutQuery.endsWith('/assignments')) {
    return 'Assignments';
  }

  if (pathWithoutQuery.endsWith('/agents')) return 'Agents';
  if (pathWithoutQuery.endsWith('/coupons')) return 'Coupons';

  return 'Loyalty';
};

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
      path: 'settings/loyalty/pricing',
      favoriteName: getLoyaltyFavoriteName,
    },
    {
      name: 'loyalty',
      icon: IconAward,
      path: 'loyalty',
      favoriteName: getLoyaltyFavoriteName,
      hasAutomation: true,
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
};
