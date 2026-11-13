import { Sidebar } from 'erxes-ui/components/sidebar';
import { Link, useLocation } from 'react-router-dom';

import { cn } from 'erxes-ui/lib/utils';
import { useNavigationMenuItemControls } from './NavigationMenuItemControls';

export const NavigationMenuLinkItem = ({
  ref,
  name,
  icon: IconComponent,
  path,
  pathPrefix,
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
  path: string;
  pathPrefix?: string;
  isActive?: boolean;
  label?: React.ReactNode;
  action?: React.ReactNode;
  itemClassName?: string;
}) => {
  const { pathname } = useLocation();
  const normalizedPathPrefix = pathPrefix ? `${pathPrefix.replace(/\/$/, '')}/` : '';
  const normalizedPath = path.replace(/^\//, '');
  const fullPath = `/${normalizedPathPrefix}${normalizedPath}`.replace(/\/$/, '') || '/';
  const isActive = pathname.startsWith(fullPath);
  const controls = useNavigationMenuItemControls();
  const order = controls?.getOrder(fullPath);

  return (
    <Sidebar.MenuItem
      className={itemClassName}
      data-nav-path={controls ? fullPath : undefined}
      style={order === undefined ? undefined : { order }}
    >
      <Sidebar.MenuButton
        asChild
        isActive={isActiveProp === true || isActive}
        ref={ref}
        className={className}
        {...props}
      >
        <Link to={fullPath}>
          {IconComponent && (
            <IconComponent
              className={cn('text-accent-foreground', isActive && 'text-primary-text')}
            />
          )}
          {label || <span className="min-w-0 flex-1 truncate capitalize">{name}</span>}
          {children}
        </Link>
      </Sidebar.MenuButton>
      {action}
      {controls?.renderActions({ name, path: fullPath, icon: IconComponent })}
    </Sidebar.MenuItem>
  );
};
