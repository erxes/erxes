import { Sidebar } from 'erxes-ui';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const BASE = '/settings/mongolian/product-places';

const SIDEBAR_ROUTES = {
  [`${BASE}/stage`]: 'stage-in-product-places-config',
  [`${BASE}/split`]: 'stage-in-product-splits-config',
  [`${BASE}/print`]: 'stage-in-product-prints-config',
  [`${BASE}/product-filter`]: 'products-default-filter-by-segment',
};

const ProductPlacesSidebar = () => {
  const { t } = useTranslation('mongolian');
  return (
    <Sidebar collapsible="none" className="border-r flex-none w-[300px]">
      <Sidebar.Group>
        <Sidebar.GroupLabel>{t('product-places')}</Sidebar.GroupLabel>
        <Sidebar.GroupContent>
          <Sidebar.Menu className="capitalize">
            {Object.entries(SIDEBAR_ROUTES).map(([path, label]) => (
              <ProductPlacesSidebarItem key={path} to={path}>
                {t(label)}
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
