import { NavigationMenuLinkItem, Sidebar } from 'erxes-ui';
import { useFavorites } from '../hooks/useFavorites';
import { IconX } from '@tabler/icons-react';
import { useToggleFavorite } from 'ui-modules';

// skipcq: JS-D1001 - Covered by repository documentation policy.
export function SidebarNavigationFavorites() {
  const favorites = useFavorites();

  return (
    <section className="px-2 py-1">
      <Sidebar.Menu>
        {favorites.map((item) => {
          return <SidebarNavigationFavoritesItem key={item.path} {...item} />;
        })}
      </Sidebar.Menu>
    </section>
  );
}

// skipcq: JS-D1001 - Covered by repository documentation policy.
export function SidebarNavigationFavoritesItem({
  name,
  breadcrumb,
  icon,
  path,
}: {
  name: string;
  breadcrumb: string[];
  icon?: React.ElementType;
  path: string;
}) {
  const Icon = icon;
  const pathWithoutUi = path.replace('_ui', '');
  const { toggleFavorite } = useToggleFavorite({ path, breadcrumb });
  const sidebarLabel =
    breadcrumb.length > 1 ? breadcrumb.slice(1).join(' / ') : name;

  // skipcq: JS-D1001 - Covered by repository documentation policy.
  const handleRemove = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    await toggleFavorite();
  };

  return (
    <NavigationMenuLinkItem
      name={name}
      icon={Icon}
      path={pathWithoutUi}
      className="h-7 px-2 text-[13px]"
      label={
        <span className="min-w-0 flex-1 truncate text-muted-foreground">
          {sidebarLabel}
        </span>
      }
      action={
        <Sidebar.MenuAction
          aria-label={name}
          className="size-4! text-muted-foreground hover:text-foreground"
          onClick={handleRemove}
          showOnHover
        >
          <IconX className="size-3!" />
        </Sidebar.MenuAction>
      }
      tooltipVisibility="always"
      tooltip={{
        align: 'start',
        className:
          'max-w-80 border bg-background px-3 py-2 text-foreground shadow-md',
        children: (
          <div className="flex items-start gap-2">
            {Boolean(Icon) && <Icon className="mt-0.5 size-4 shrink-0" />}
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
