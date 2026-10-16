import { Sidebar } from 'erxes-ui';
import { ReactNode } from 'react';

export const SidebarFooter = ({ children }: { children: ReactNode }) => (
  <Sidebar.Group className="border-t px-2 py-2">
    <Sidebar.Menu>{children}</Sidebar.Menu>
  </Sidebar.Group>
);
