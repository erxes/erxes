import { Sidebar } from 'erxes-ui';
import { Link, useLocation } from 'react-router-dom';

type SettingSideBarItemProps = {
  to: string;
  children: React.ReactNode;
};

export const SettingSideBarItem = ({
  to,
  children,
}: SettingSideBarItemProps) => {
  const pathname = useLocation().pathname.replace(/\/$/, '');
  const normalizedTo = to.replace(/\/$/, '');
  const isActive = pathname === normalizedTo;

  return (
    <Sidebar.MenuItem>
      <Sidebar.MenuButton asChild isActive={isActive}>
        <Link to={to}>{children}</Link>
      </Sidebar.MenuButton>
    </Sidebar.MenuItem>
  );
};

export const SettingSideBar = () => {
  return (
    <Sidebar collapsible="none" className="h-full w-[300px] flex-none border-r">
      <Sidebar.Group>
        <Sidebar.GroupLabel>MS Dynamics</Sidebar.GroupLabel>
        <Sidebar.GroupContent>
          <Sidebar.Menu>
            <SettingSideBarItem to="/settings/mongolian/msdynamic">
              General config
            </SettingSideBarItem>
          </Sidebar.Menu>
        </Sidebar.GroupContent>
      </Sidebar.Group>
    </Sidebar>
  );
};
