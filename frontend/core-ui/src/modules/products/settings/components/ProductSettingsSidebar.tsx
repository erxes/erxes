import { Sidebar } from 'erxes-ui';
import { Link, useLocation } from 'react-router-dom';
export function ProductSettingsSidebar() {
  const { pathname } = useLocation();
  return (
    <Sidebar collapsible="none" className="border-r flex-none">
      <Sidebar.Group>
        <Sidebar.GroupContent>
          <Sidebar.Menu>
            <Sidebar.MenuItem>
              <Sidebar.MenuButton
                isActive={pathname === '/settings/products'}
                asChild
              >
                <Link to="/settings/products">General</Link>
              </Sidebar.MenuButton>
            </Sidebar.MenuItem>
            <Sidebar.MenuItem>
              <Sidebar.MenuButton
                isActive={pathname === '/settings/products/uom'}
                asChild
              >
                <Link to="/settings/products/uom">Uom</Link>
              </Sidebar.MenuButton>
            </Sidebar.MenuItem>
            <Sidebar.MenuItem>
              <Sidebar.MenuButton
                isActive={pathname === '/settings/products/similarity-configs'}
                asChild
              >
                <Link to="/settings/products/similarity-configs">
                  Similarity configs
                </Link>
              </Sidebar.MenuButton>
            </Sidebar.MenuItem>
          </Sidebar.Menu>
        </Sidebar.GroupContent>
      </Sidebar.Group>
    </Sidebar>
  );
}
