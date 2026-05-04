import { Sidebar } from 'erxes-ui';
import { Link, useLocation } from 'react-router-dom';

const BASE = '/settings/mongolian/product-places';

const SIDEBAR_ROUTES = {
  [`${BASE}/stage`]: 'Stage in product places config',
  [`${BASE}/split`]: 'Stage in product splits config',
  [`${BASE}/print`]: 'Stage in product prints config',
  [`${BASE}/product-filter`]: 'Products default filter by segment',
};

const ProductPlacesSidebar = () => {
  return (
    <Sidebar collapsible="none" className="border-r flex-none w-[300px]">
      <Sidebar.Group>
        <Sidebar.GroupLabel>Product Places</Sidebar.GroupLabel>
        <Sidebar.GroupContent>
          <Sidebar.Menu className="capitalize">
            {Object.entries(SIDEBAR_ROUTES).map(([path, label]) => (
              <ProductPlacesSidebarItem key={path} to={path}>
                {label}
              </ProductPlacesSidebarItem>
            ))}
          </Sidebar.Menu>
        </Sidebar.GroupContent>
      </Sidebar.Group>
    </Sidebar>
  );
};

const ProductPlacesSidebarItem = ({
  to,
  children,
}: {
  to: string;
  children: React.ReactNode;
}) => {
  const isActive = useLocation().pathname === to;
  return (
    <Sidebar.MenuItem>
      <Sidebar.MenuButton asChild isActive={isActive}>
        <Link to={to}>{children}</Link>
      </Sidebar.MenuButton>
    </Sidebar.MenuItem>
  );
};

export default ProductPlacesSidebar;
