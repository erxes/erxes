import { Sidebar } from 'erxes-ui/components/sidebar';
import { Link, useLocation } from 'react-router-dom';

import { cn } from 'erxes-ui/lib/utils';
import { useNavigationMenuItemControls } from './NavigationMenuItemControls';

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
