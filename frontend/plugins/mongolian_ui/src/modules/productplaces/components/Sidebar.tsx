import { Link, useLocation } from 'react-router-dom';
import { Sidebar } from 'erxes-ui';

const BASE = '/settings/mongolian/product-places';

const ProductPlacesSidebar = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const Item = ({ to, label }: { to: string; label: string }) => {
    const path = `${BASE}/${to}`;

    return (
      <Sidebar.MenuItem>
        <Sidebar.MenuButton asChild isActive={isActive(path)}>
          <Link to={path}>{label}</Link>
        </Sidebar.MenuButton>
      </Sidebar.MenuItem>
    );
  };

  return (
    <Sidebar collapsible="none" className="border-r flex-none">
      <Sidebar.Group>
        <Sidebar.GroupLabel className="h-4">Product Places</Sidebar.GroupLabel>

        <Sidebar.GroupContent className="pt-1">
          <Sidebar.Menu>
            <Item to="stage" label="Stage in product places config" />
            <Item to="split" label="Stage in product splits config" />
            <Item to="print" label="Stage in product prints config" />
            <Item
              to="product-filter"
              label="Products default filter by segment"
            />
          </Sidebar.Menu>
        </Sidebar.GroupContent>
      </Sidebar.Group>
    </Sidebar>
  );
};

export default ProductPlacesSidebar;
