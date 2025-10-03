import { Sidebar } from 'erxes-ui';
import React from 'react';

export const CustomerSidebarMenuItem = React.forwardRef<
  React.ElementRef<typeof Sidebar.MenuItem>,
  React.ComponentPropsWithoutRef<typeof Sidebar.MenuItem> & {
    isActive: boolean;
  }
>(({ children, isActive, ...props }, ref) => {
  return (
    <Sidebar.MenuItem ref={ref} {...props}>
      <Sidebar.MenuButton
        isActive={isActive}
        className="font-medium data-[active=true]:text-primary data-[active=true]:font-semibold"
      >
        {children}
      </Sidebar.MenuButton>
    </Sidebar.MenuItem>
  );
});

CustomerSidebarMenuItem.displayName = 'CustomerSidebarMenuItem';
