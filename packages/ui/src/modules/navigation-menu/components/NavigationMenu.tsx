import { IconChevronRight } from '@tabler/icons-react';
import { Collapsible } from 'erxes-ui/components/collapsible';
import { Sidebar } from 'erxes-ui/components/sidebar';
import { Link, useLocation } from 'react-router-dom';

import { cn } from 'erxes-ui/lib/utils';
import { useNavigationMenuItemControls } from './NavigationMenuItemControls';

/** A sidebar link that lights up while the address is under its `to`. */
export const NavigationMenuLinkItem = ({
  ref,
  name,
  icon: IconComponent,
  to,
  children,
  className,
  isActive: isActiveProp,
  label,
  action,
  itemClassName,
  ...props
}: React.ComponentProps<typeof Sidebar.MenuButton> & {
  name: string;
  icon?: React.ElementType;
  /** The address, from the app's paths. */
  to: string;
  isActive?: boolean;
  label?: React.ReactNode;
  action?: React.ReactNode;
  itemClassName?: string;
}) => {
  const { pathname } = useLocation();
  const base = to.replace(/\/$/, '');
  const onPath = pathname === (base || '/') || pathname.startsWith(`${base}/`);
  const isActive = isActiveProp === true || onPath;
  const controls = useNavigationMenuItemControls();
  const order = controls?.getOrder(to);

  return (
    <Sidebar.MenuItem
      className={cn(itemClassName, order !== undefined && 'order-(--order)')}
      data-nav-path={controls ? to : undefined}
      style={{ '--order': order }}
    >
      <Sidebar.MenuButton
        isActive={isActive}
        aria-current={isActive ? 'page' : undefined}
        ref={ref}
        className={className}
        {...props}
        render={<Link to={to} />}
      >
        {IconComponent && (
          <IconComponent
            className={cn('text-accent-foreground', isActive && 'text-primary-text')}
          />
        )}
        {label || <span className="min-w-0 flex-1 truncate capitalize">{name}</span>}
        {children}
      </Sidebar.MenuButton>
      {action}
      {controls?.renderActions({ name, path: to, icon: IconComponent })}
    </Sidebar.MenuItem>
  );
};

/**
 * A titled group of sidebar links that folds open and shut, open at first.
 * A line separates it from the group above unless `separate` is false; `actions` show on hover
 * beside the title.
 */
export const NavigationMenuGroup = ({
  name,
  children,
  separate = true,
  defaultOpen = true,
  actions,
  className,
  ...props
}: React.ComponentProps<typeof Sidebar.Group> & {
  name: string;
  children: React.ReactNode;
  separate?: boolean;
  defaultOpen?: boolean;
  actions?: React.ReactNode;
}) => (
  <>
    {separate && <Sidebar.Separator />}
    <Collapsible defaultOpen={defaultOpen}>
      <Sidebar.Group {...props} className={cn('py-4', className)}>
        <Sidebar.GroupLabel className="group/label">
          <Collapsible.Trigger className="flex flex-1 items-center gap-2">
            <span className="flex shrink-0 transition-transform duration-250 ease-out-quint in-data-panel-open:rotate-90 motion-reduce:transition-none">
              <IconChevronRight className="size-3.5" />
            </span>
            <span>{name}</span>
          </Collapsible.Trigger>
          {actions && <div className="invisible ml-auto group-hover/label:visible">{actions}</div>}
        </Sidebar.GroupLabel>
        <Collapsible.Panel>
          <Sidebar.GroupContent className="pt-2">
            <Sidebar.Menu>{children}</Sidebar.Menu>
          </Sidebar.GroupContent>
        </Collapsible.Panel>
      </Sidebar.Group>
    </Collapsible>
  </>
);
