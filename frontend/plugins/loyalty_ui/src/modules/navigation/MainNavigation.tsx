import { IconUserFilled } from '@tabler/icons-react';
import { cn } from 'erxes-ui/lib';
import { Sidebar } from 'erxes-ui';
import { Link, useLocation } from 'react-router';

export const MainNavigation = () => {
  const { pathname } = useLocation();
  const isActive = pathname.startsWith('/loyalty');

  return (
    <Sidebar.MenuItem>
      <Sidebar.MenuButton asChild isActive={isActive}>
        <Link to="/loyalty/vouchers">
          <IconUserFilled
            className={cn('text-accent-foreground', isActive && 'text-primary')}
          />
          <span className="capitalize">Loyalty</span>
        </Link>
      </Sidebar.MenuButton>
    </Sidebar.MenuItem>
  );
};
