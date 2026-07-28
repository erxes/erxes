import { Collapsible, Sidebar } from 'erxes-ui/components';
import { Link, useLocation } from 'react-router-dom';

import { IconCaretRightFilled } from '@tabler/icons-react';
import { cn } from 'erxes-ui/lib';
import { forwardRef, useState } from 'react';

export const NavigationMenuLinkItem = forwardRef<
  React.ElementRef<typeof Sidebar.MenuButton>,
  React.ComponentProps<typeof Sidebar.MenuButton> & {
    name: string;
    icon?: React.ElementType;
    path: string;
    pathPrefix?: string;
    isActive?: boolean;
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
      isActive: isActiveProp,
      ...props
    },
    ref,
  ) => {
    const { pathname } = useLocation();
    const normalizedPathPrefix = pathPrefix
      ? `${pathPrefix.replace(/\/$/, '')}/`
      : '';
    const normalizedPath = path.replace(/^\//, '');
    const fullPath =
      `/${normalizedPathPrefix}${normalizedPath}`.replace(/\/$/, '') || '/';
    const isActive =
      fullPath === '/'
        ? pathname === '/'
        : pathname === fullPath || pathname.startsWith(`${fullPath}/`);

    return (
      <Sidebar.MenuItem>
        <Sidebar.MenuButton
          asChild
          isActive={isActiveProp ?? isActive}
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

export const SettingsNavigationMenuLinkItemHover = forwardRef<
  React.ElementRef<typeof Sidebar.MenuButton>,
  React.ComponentProps<typeof NavigationMenuLinkItem>
>(({ pathPrefix, ...props }, ref) => {
  const settingsPathPrefix = pathPrefix ? `settings/${pathPrefix}` : 'settings';
  return (
    <NavigationMenuLinkItem
      {...props}
      pathPrefix={settingsPathPrefix}
      ref={ref}
    />
  );
});

SettingsNavigationMenuLinkItemHover.displayName =
  'SettingsNavigationMenuLinkItemHover';

export const NavigationMenuItemHover = forwardRef<
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

NavigationMenuItemHover.displayName = 'NavigationMenuItemHover';

export const NavigationMenuGroupHover = forwardRef<
  React.ElementRef<typeof Sidebar.Group>,
  React.ComponentProps<typeof Sidebar.Group> & {
    name: string;
    children: React.ReactNode;
    separate?: boolean;
    defaultOpen?: boolean;
    actions?: React.ReactNode;
    onNameClick?: () => void;
  }
>(
  (
    {
      name,
      children,
      separate = true,
      defaultOpen = false,
      actions,
      onNameClick,
      ...props
    },
    ref,
  ) => {
    const [open, setOpen] = useState(defaultOpen);

    return (
      <>
        {separate && <Sidebar.Separator />}
        <Collapsible
          open={open}
          onOpenChange={setOpen}
          className="group/collapsible-menu"
        >
          <Sidebar.Group
            {...props}
            ref={ref}
            onMouseEnter={() => setOpen(true)}
            onMouseLeave={() => setOpen(false)}
          >
            <Sidebar.GroupLabel asChild>
              <Collapsible.Trigger
                className="group/collapsible-trigger flex items-center gap-2"
                onClick={(e) => {
                  e.preventDefault();
                  onNameClick?.();
                }}
              >
                <IconCaretRightFilled className="size-3.5 transition-transform duration-300 group-data-[state=open]/collapsible-menu:rotate-90" />
                <span className="font-sans text-xs font-semibold normal-case">
                  {name}
                </span>
                {actions && (
                  <div className="ml-auto invisible group-hover/collapsible-trigger:visible hover:[&_button]:bg-transparent hover:[&_button]:text-foreground focus-visible:[&_button]:outline-hidden focus-visible:[&_button]:ring-0">
                    {actions}
                  </div>
                )}
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
  },
);

NavigationMenuGroupHover.displayName = 'NavigationMenuGroupHover';

export const NavigationMenuGroupStaticHover = forwardRef<
  React.ElementRef<typeof Sidebar.Group>,
  React.ComponentProps<typeof Sidebar.Group> & {
    children: React.ReactNode;
    separate?: boolean;
  }
>(({ children, separate = false, ...props }, ref) => {
  return (
    <>
      {separate && <Sidebar.Separator />}
      <Sidebar.Group {...props} ref={ref}>
        <Sidebar.GroupContent className="pt-2">
          <Sidebar.Menu>{children}</Sidebar.Menu>
        </Sidebar.GroupContent>
      </Sidebar.Group>
    </>
  );
});

NavigationMenuGroupStaticHover.displayName = 'NavigationMenuGroupStaticHover';
