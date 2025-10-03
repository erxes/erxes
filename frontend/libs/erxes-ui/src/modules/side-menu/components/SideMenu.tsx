import { Icon } from '@tabler/icons-react';
import { Separator, Tabs, Tooltip } from 'erxes-ui/components';
import { cn } from 'erxes-ui/lib/utils';
import {
  SideMenuContext,
  useSideMenuContext,
} from '../context/SideMenuContext';

import { forwardRef, useState } from 'react';

export const SideMenuRoot = forwardRef<
  React.ElementRef<typeof Tabs>,
  React.ComponentProps<typeof Tabs>
>(({ className, defaultValue, ...props }, ref) => {
  const [activeTab, setActiveTab] = useState<string | undefined>(defaultValue);
  return (
    <SideMenuContext.Provider value={{ activeTab, setActiveTab }}>
      <Tabs
        ref={ref}
        className={cn('flex', className)}
        orientation="horizontal"
        value={activeTab || undefined}
        {...props}
      >
        {props.children}
      </Tabs>
    </SideMenuContext.Provider>
  );
});
SideMenuRoot.displayName = 'SideMenuRoot';

export const SideMenuContent = forwardRef<
  React.ElementRef<typeof Tabs.Content>,
  React.ComponentProps<typeof Tabs.Content>
>(({ className, children, ...props }, ref) => {
  const { activeTab } = useSideMenuContext();
  if (!activeTab) {
    return null;
  }

  return (
    <Tabs.Content
      ref={ref}
      className={cn(
        'data-[state=active]:border-l data-[state=active]:w-80 w-full transition-all flex flex-col overflow-hidden',
        className,
      )}
      {...props}
    >
      {children}
    </Tabs.Content>
  );
});
SideMenuContent.displayName = 'SideMenuContent';

export const SideMenuContentHeader = forwardRef<
  React.ElementRef<'div'>,
  React.ComponentProps<'div'> & {
    Icon?: Icon;
    label?: string;
  }
>(({ className, Icon, label, children, ...props }, ref) => {
  return (
    <>
      <div
        ref={ref}
        className={cn(
          'h-11 px-5 flex items-center gap-2 bg-sidebar flex-none',
          className,
        )}
        {...props}
      >
        {!!Icon && (
          <Icon className="size-4 flex-none text-primary" strokeWidth={3} />
        )}
        <div className="mr-auto font-medium text-primary">{label}</div>
        {children}
      </div>
      <Separator />
    </>
  );
});
SideMenuContentHeader.displayName = 'SideMenuContentHeader';

export const SideMenuSidebar = forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof Tabs.List>
>(({ className, ...props }, ref) => {
  return (
    <Tabs.List
      ref={ref}
      className={cn(
        'w-16 border-l bg-sidebar h-full py-4 flex flex-col items-center justify-start gap-3',
        className,
      )}
      {...props}
    >
      <Tooltip.Provider>{props.children}</Tooltip.Provider>
    </Tabs.List>
  );
});
SideMenuSidebar.displayName = 'SideMenuSidebar';

export const SideMenuTrigger = forwardRef<
  React.ElementRef<typeof Tabs.Trigger>,
  React.ComponentPropsWithoutRef<typeof Tabs.Trigger> & {
    label?: string;
    Icon?: Icon;
  }
>(({ className, Icon, label, ...props }, ref) => {
  const { activeTab, setActiveTab } = useSideMenuContext();
  return (
    <Tooltip>
      <Tabs.Trigger
        ref={ref}
        className={cn(
          'size-10 bg-sidebar data-[state=active]:bg-primary/10 data-[state=active]:text-foreground data-[state=active]:shadow-none [&_svg]:size-5 data-[state=active]:after:hidden [&_svg]:text-primary hover:bg-primary/10 rounded',
          className,
        )}
        onClick={(e) => {
          e.preventDefault();
          setActiveTab(activeTab === props.value ? undefined : props.value);
        }}
        {...props}
        asChild
      >
        <Tooltip.Trigger>
          {!!Icon && <Icon className="size-5 flex-none" />}
        </Tooltip.Trigger>
      </Tabs.Trigger>

      <Tooltip.Content side="left">{label}</Tooltip.Content>
    </Tooltip>
  );
});

export const SideMenu = Object.assign(SideMenuRoot, {
  Sidebar: SideMenuSidebar,
  Content: SideMenuContent,
  Header: SideMenuContentHeader,
  Trigger: SideMenuTrigger,
});
