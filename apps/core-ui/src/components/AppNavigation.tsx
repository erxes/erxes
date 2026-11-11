import { NavigationMenuLinkItem, Sidebar } from 'erxes-ui';
import type { ComponentType } from 'react';

export interface NavItem {
  name: string;
  path: string;
  icon: ComponentType<{ className?: string }>;
}

/** An app sidebar group of links under `/<pathPrefix>/<path>`. */
export const AppNavigation = ({
  label,
  pathPrefix,
  items,
}: {
  label?: string;
  pathPrefix: string;
  items: NavItem[];
}) => (
  <Sidebar.Group>
    {label && <Sidebar.GroupLabel>{label}</Sidebar.GroupLabel>}
    <Sidebar.GroupContent>
      <Sidebar.Menu>
        {items.map((item) => (
          <NavigationMenuLinkItem
            key={item.path}
            name={item.name}
            icon={item.icon}
            pathPrefix={pathPrefix}
            path={item.path}
          />
        ))}
      </Sidebar.Menu>
    </Sidebar.GroupContent>
  </Sidebar.Group>
);
