import { NavigationRailLabel } from '@/navigation/components/NavigationRailLabel';
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
      <Sidebar.Menu className="gap-1">
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
        'flex w-full shrink-0 items-center justify-start',
        'h-7',
      )}
      path={pathWithoutUi}
      className={cn(
        'h-7 justify-start rounded-md text-sm transition-[width,margin,padding] duration-200 ease-linear',
        expanded ? 'w-full px-2' : 'ml-0.5 w-7 px-1.5',
        'group-data-[collapsible=icon]:[&&]:h-7! group-data-[collapsible=icon]:[&&]:w-7! group-data-[collapsible=icon]:[&&]:px-1.5!',
      )}
      label={
        <NavigationRailLabel className="flex-1 truncate" expanded={expanded}>
          {sidebarLabel}
        </NavigationRailLabel>
      }
      tooltipVisibility="collapsed"
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
