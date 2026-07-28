import { Sidebar } from 'erxes-ui';
import { NavLink } from 'react-router';
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

export const LoyaltyMainSidebar = () => {
  const { t } = useTranslation('loyalty');
  return (
    <Sidebar collapsible="none" className="flex-none border-r">
      <Sidebar.Group>
        <Sidebar.GroupLabel>{t('loyalty-modules')}</Sidebar.GroupLabel>
        <Sidebar.GroupContent>
          <Sidebar.Menu>
            {NAV_ITEMS.map(({ label, path }) => (
              <Sidebar.MenuItem key={path}>
                <NavLink to={path} end className="w-full">
                  {({ isActive }) => (
                    <Sidebar.MenuButton isActive={isActive} asChild={false}>
                      {t(label)}
                    </Sidebar.MenuButton>
                  )}
                </NavLink>
              </Sidebar.MenuItem>
            ))}
          </Sidebar.Menu>
        </Sidebar.GroupContent>
      </Sidebar.Group>
    </Sidebar>
  );
};
