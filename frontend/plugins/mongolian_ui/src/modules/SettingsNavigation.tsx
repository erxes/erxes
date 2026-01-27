import { Sidebar } from 'erxes-ui';
import { Link } from 'react-router-dom';

export const SettingsNavigation = () => {
  return (
    <Sidebar.Group>
      <Sidebar.GroupLabel className="h-4">Ebarimt</Sidebar.GroupLabel>
      <Sidebar.GroupContent className="pt-1">
        <Sidebar.Menu>

          {/* Ebarimt */}
          <Sidebar.MenuItem>
            <Sidebar.MenuButton asChild>
              <Link to="/settings/mongolian/ebarimt">
                Ebarimt
              </Link>
            </Sidebar.MenuButton>
          </Sidebar.MenuItem>

          {/* Product Places — RAW LINK, NO ERXES MAGIC */}
          <Sidebar.MenuItem>
            <Sidebar.MenuButton asChild>
              <Link to="/settings/mongolian/product-places">
                Product Places
              </Link>
            </Sidebar.MenuButton>
          </Sidebar.MenuItem>

        </Sidebar.Menu>
      </Sidebar.GroupContent>
    </Sidebar.Group>
  );
};