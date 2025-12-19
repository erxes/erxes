import React from 'react';
import { Link, useLocation } from 'react-router-dom';

import { Sidebar } from 'erxes-ui/components/sidebar';

const ProductPlacesSidebar = () => {
  const location = useLocation();

  const isActive = (url: string) => location.pathname.includes(url);

  const renderItem = (url: string, label: string) => (
    <Sidebar.MenuItem key={url}>
      <Sidebar.MenuButton
        asChild
        isActive={isActive(url)}
        tooltip={label}
      >
        <Link to={url}>
          <span>{label}</span>
        </Link>
      </Sidebar.MenuButton>
    </Sidebar.MenuItem>
  );

  return (
    <Sidebar collapsible="icon">
      <Sidebar.Header>
        <div className="px-2 py-1 text-xs font-semibold uppercase text-muted-foreground">
          Product Places
        </div>
      </Sidebar.Header>

      <Sidebar.Content>
        <Sidebar.Menu>
          {renderItem(
            '/erxes-plugin-product-places/settings/stage',
            'Stage in product places config',
          )}

          {renderItem(
            '/erxes-plugin-product-places/settings/split',
            'Stage in product splits config',
          )}

          {renderItem(
            '/erxes-plugin-product-places/settings/print',
            'Stage in product prints config',
          )}

          {renderItem(
            '/erxes-plugin-product-places/settings/productFilter',
            'Products default filter by segment',
          )}
        </Sidebar.Menu>
      </Sidebar.Content>
    </Sidebar>
  );
};

export default ProductPlacesSidebar;
