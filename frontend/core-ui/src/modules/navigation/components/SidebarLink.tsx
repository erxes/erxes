import { Sidebar } from 'erxes-ui';
import { ReactNode } from 'react';
import { Link } from 'react-router-dom';

export const SidebarLink = ({
  to,
  icon,
  children,
  isActive,
}: {
  to: string;
  icon: ReactNode;
  children: ReactNode;
  isActive?: boolean;
}) => (
  <Sidebar.MenuItem>
    <Sidebar.MenuButton asChild isActive={isActive}>
      <Link to={to}>
        {icon}
        <span className="flex min-w-0 flex-1 items-center">{children}</span>
      </Link>
    </Sidebar.MenuButton>
  </Sidebar.MenuItem>
);
