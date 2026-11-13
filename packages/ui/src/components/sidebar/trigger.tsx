import React from 'react';

import { Button } from 'erxes-ui/components/button';
import { cn } from 'erxes-ui/lib/utils';
import { IconLayoutSidebarLeftCollapse, IconLayoutSidebarLeftExpand } from '@tabler/icons-react';
import { useSidebar } from './context';

export const SidebarTrigger = ({
  ref,
  className,
  onClick,
  ...props
}: React.ComponentProps<typeof Button>) => {
  const { toggleSidebar, collapseState } = useSidebar();

  return (
    <Button
      ref={ref}
      data-sidebar="trigger"
      variant="ghost"
      size="icon"
      className={cn('h-7 w-7', className)}
      onClick={(event) => {
        onClick?.(event);
        toggleSidebar();
      }}
      {...props}
    >
      {collapseState === 'collapsed' ? (
        <IconLayoutSidebarLeftExpand />
      ) : (
        <IconLayoutSidebarLeftCollapse />
      )}
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  );
};
