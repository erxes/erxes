import { Sidebar } from 'erxes-ui';
import { Link, useLocation } from 'react-router';

const NAV_ITEMS = [
  { label: 'Vouchers', path: '/loyalty/vouchers' },
  { label: 'Lotteries', path: '/loyalty/lotteries' },
  { label: 'Spins', path: '/loyalty/spins' },
  { label: 'Donates', path: '/loyalty/donates' },
  { label: 'Score', path: '/loyalty/score' },
  { label: 'Assignments', path: '/loyalty/assignments' },
  { label: 'Agents', path: '/loyalty/agents' },
  { label: 'Coupons', path: '/loyalty/coupons' },
];

export const LoyaltyMainSidebar = () => {
  const { pathname } = useLocation();

  return (
    <Sidebar collapsible="none" className="flex-none border-r">
      <Sidebar.Group>
        <Sidebar.GroupLabel>Loyalty modules</Sidebar.GroupLabel>
        <Sidebar.GroupContent>
          <Sidebar.Menu>
            {NAV_ITEMS.map(({ label, path }) => (
              <Sidebar.MenuItem key={path}>
                <Sidebar.MenuButton isActive={pathname.startsWith(path)} asChild>
                  <Link to={path}>{label}</Link>
                </Sidebar.MenuButton>
              </Sidebar.MenuItem>
            ))}
          </Sidebar.Menu>
        </Sidebar.GroupContent>
      </Sidebar.Group>
    </Sidebar>
  );
};
