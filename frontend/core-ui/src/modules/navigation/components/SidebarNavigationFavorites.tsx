import { cn, NavigationMenuLinkItem, Sidebar } from 'erxes-ui';
import { useFavorites } from '../hooks/useFavorites';

export function SidebarNavigationFavorites({
  expanded,
}: Readonly<{
  expanded: boolean;
}>) {
  const favorites = useFavorites();

  return (
    <section className="w-full shrink-0">
      <Sidebar.Menu className={cn(expanded ? 'gap-1' : 'items-center gap-1')}>
        {favorites.map((item) => {
          return (
            <SidebarNavigationFavoritesItem
              key={item.path}
              {...item}
              expanded={expanded}
            />
          );
        })}
      </Sidebar.Menu>
    </section>
  );
}

export function SidebarNavigationFavoritesItem({
  name,
  breadcrumb,
  icon,
  path,
  expanded,
}: Readonly<{
  name: string;
  breadcrumb: string[];
  icon?: React.ElementType;
  path: string;
  expanded: boolean;
}>) {
  const Icon = icon;
  const pathWithoutUi = path.replace('_ui', '');
  const sidebarLabel =
    breadcrumb.length > 1 ? breadcrumb.slice(1).join(' / ') : name;

  return (
    <NavigationMenuLinkItem
      name={name}
      icon={Icon}
      itemClassName={cn(
        'flex w-full shrink-0 items-center justify-center',
        'h-7',
      )}
      path={pathWithoutUi}
      className={cn(
        'rounded-md',
        expanded
          ? 'h-7 w-full justify-start px-2 text-sm'
          : 'mx-auto size-7 justify-center px-0',
      )}
      label={
        expanded ? (
          <span className="min-w-0 flex-1 truncate">{sidebarLabel}</span>
        ) : (
          <span className="sr-only">{sidebarLabel}</span>
        )
      }
      tooltipVisibility="always"
      tooltip={{
        align: 'start',
        className:
          'max-w-80 border bg-background px-3 py-2 text-foreground shadow-md',
        children: (
          <div className="flex items-start gap-2">
            {Icon && <Icon className="mt-0.5 size-4 shrink-0" />}
            <div className="min-w-0">
              <div className="font-medium">{breadcrumb[0]}</div>
              {breadcrumb.length > 1 && (
                <div className="mt-0.5 text-muted-foreground">
                  {breadcrumb.slice(1).join(' / ')}
                </div>
              )}
            </div>
          </div>
        ),
      }}
    />
  );
}
