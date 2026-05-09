import * as React from 'react';
import { Sidebar } from 'erxes-ui';
import { Icon } from '@tabler/icons-react';
import { Link } from 'react-router-dom';

export type SidebarItem = {
  label: string;
  path: string;
  icon?: Icon;
};

export type LayoutSidebarProps = {
  groupLabel?: string;
  items: SidebarItem[];
};

export const LayoutSidebar: React.FC<LayoutSidebarProps> = ({
  groupLabel = 'Layout',
  items,
}) => (
  <Sidebar.Group>
    <Sidebar.GroupLabel className="h-4">{groupLabel}</Sidebar.GroupLabel>
    <Sidebar.GroupContent className="pt-1">
      <Sidebar.Menu>
        {items.map((item) => (
          <Sidebar.MenuItem key={item.path}>
            <Sidebar.MenuButton asChild>
              <Link to={item.path}>
                {item.icon ? <item.icon size={16} /> : null}
                <span>{item.label}</span>
              </Link>
            </Sidebar.MenuButton>
          </Sidebar.MenuItem>
        ))}
      </Sidebar.Menu>
    </Sidebar.GroupContent>
  </Sidebar.Group>
);
