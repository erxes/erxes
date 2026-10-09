import { NavigationMenuLinkItem } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

const NAV_ITEMS = [
  { label: 'scores', path: '/loyalty/scores' },
  { label: 'loyalty-accounts', path: '/loyalty/accounts' },
  { label: 'vouchers', path: '/loyalty/vouchers' },
  { label: 'coupons', path: '/loyalty/coupons' },
  { label: 'donates', path: '/loyalty/donates' },
  { label: 'spins', path: '/loyalty/spins' },
  { label: 'lotteries', path: '/loyalty/lotteries' },
  { label: 'assignments', path: '/loyalty/assignments' },
  { label: 'agents', path: '/loyalty/agents' },
];

export const MainNavigation = () => {
  const { t } = useTranslation('loyalty');
  return (
    <div>
      {NAV_ITEMS.map(({ label, path }) => (
        <NavigationMenuLinkItem key={path} name={t(label)} path={path} />
      ))}
    </div>
  );
};
