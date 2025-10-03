import { IconCaretRightFilled } from '@tabler/icons-react';
import { Collapsible, Sidebar } from 'erxes-ui/components';
import { cn } from 'erxes-ui/lib';
import { forwardRef } from 'react';
import { Link, useLocation } from 'react-router-dom';

export const NavigationMenuLinkItem = forwardRef<
  React.ElementRef<typeof Sidebar.MenuButton>,
  React.ComponentProps<typeof Sidebar.MenuButton> & {
    name: string;
    icon?: React.ElementType;
    path: string;
    pathPrefix?: string;
  }
>(
  (
    {
      name,
      icon: IconComponent,
      path,
      pathPrefix,
      children,
      className,
      ...props
    },
    ref,
  ) => {
    const { pathname } = useLocation();
    const fullPath = pathPrefix ? `${pathPrefix}/${path}` : path;
    const isActive = pathname.startsWith(`/${fullPath}`);
    return (
      <Sidebar.MenuItem>
        <Sidebar.MenuButton
          asChild
          isActive={isActive}
          ref={ref}
          className={className}
          {...props}
        >
          <Link to={fullPath}>
            {!!IconComponent && (
              <IconComponent
                className={cn(
                  'text-accent-foreground',
                  isActive && 'text-primary',
                )}
              />
            )}
            <span className="capitalize">{name}</span>
            {children}
          </Link>
        </Sidebar.MenuButton>
      </Sidebar.MenuItem>
    );
  },
);

NavigationMenuLinkItem.displayName = 'NavigationMenuLinkItem';

export const NavigationMenuItem = forwardRef<
  React.ElementRef<typeof Sidebar.MenuButton>,
  React.ComponentProps<typeof Sidebar.MenuButton> & {
    name: string;
    icon?: React.ElementType;
  }
>(({ name, icon: IconComponent, ...props }, ref) => {
  return (
    <Sidebar.MenuItem>
      <Sidebar.MenuButton ref={ref} {...props}>
        {!!IconComponent && (
          <IconComponent className="text-accent-foreground" />
        )}
        <span className="capitalize">{name}</span>
      </Sidebar.MenuButton>
    </Sidebar.MenuItem>
  );
});

NavigationMenuItem.displayName = 'NavigationMenuItem';

export const NavigationMenuGroup = forwardRef<
  React.ElementRef<typeof Sidebar.Group>,
  React.ComponentProps<typeof Sidebar.Group> & {
    name: string;
    children: React.ReactNode;
    separate?: boolean;
    defaultOpen?: boolean;
  }
>(({ name, children, separate = true, defaultOpen = true, ...props }, ref) => {
  return (
    <>
      {separate && <Sidebar.Separator />}
      <Collapsible defaultOpen={defaultOpen} className="group/collapsible-menu">
        <Sidebar.Group {...props} ref={ref}>
          <Sidebar.GroupLabel asChild>
            <Collapsible.Trigger className="flex items-center gap-2">
              <IconCaretRightFilled className="size-3.5 transition-transform group-data-[state=open]/collapsible-menu:rotate-90" />
              <span className="font-sans text-xs font-semibold normal-case">
                {name}
              </span>
            </Collapsible.Trigger>
          </Sidebar.GroupLabel>
          <Collapsible.Content>
            <Sidebar.GroupContent className="pt-2">
              <Sidebar.Menu>{children}</Sidebar.Menu>
            </Sidebar.GroupContent>
          </Collapsible.Content>
        </Sidebar.Group>
      </Collapsible>
    </>
  );
});

NavigationMenuGroup.displayName = 'NavigationMenuGroup';
