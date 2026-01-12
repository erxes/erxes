import { Sidebar } from 'erxes-ui';
import { Link, useLocation } from 'react-router-dom';

export const ContactsSidebar = () => {
  const { pathname } = useLocation();
  return (
    <Sidebar collapsible="none" className="border-r flex-none">
      <Sidebar.Group>
        <Sidebar.GroupContent>
          <Sidebar.Menu>
            <Sidebar.MenuItem>
              <Sidebar.MenuButton
                isActive={pathname === '/settings/contacts'}
                asChild
              >
                <Link to="/settings/contacts">Customers</Link>
              </Sidebar.MenuButton>
            </Sidebar.MenuItem>
            <Sidebar.MenuItem>
              <Sidebar.MenuButton
                isActive={pathname === '/settings/contacts/companies'}
                asChild
              >
                <Link to="/settings/contacts/companies">Companies</Link>
              </Sidebar.MenuButton>
            </Sidebar.MenuItem>
          </Sidebar.Menu>
        </Sidebar.GroupContent>
      </Sidebar.Group>
    </Sidebar>
  );
};
