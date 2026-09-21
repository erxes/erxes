import { NavigationMenuLinkItem } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

const NAV_ITEMS = [
  { label: 'vouchers', path: '/loyalty/vouchers' },
  { label: 'lotteries', path: '/loyalty/lotteries' },
  { label: 'spins', path: '/loyalty/spins' },
  { label: 'donates', path: '/loyalty/donates' },
  { label: 'scores', path: '/loyalty/scores' },
  { label: 'assignments', path: '/loyalty/assignments' },
  { label: 'agents', path: '/loyalty/agents' },
  { label: 'coupons', path: '/loyalty/coupons' },
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
