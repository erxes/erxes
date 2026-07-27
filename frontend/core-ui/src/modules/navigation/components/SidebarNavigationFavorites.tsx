import { NavigationMenuGroup, NavigationMenuLinkItem, Sidebar } from 'erxes-ui';
import { useFavorites } from '../hooks/useFavorites';
import { MyInboxNavigationItem } from '@/notification/components/MyInboxNavigationItem';
import { useTranslation } from 'react-i18next';
import { IconX } from '@tabler/icons-react';
import { useToggleFavorite } from 'ui-modules';

export function SidebarNavigationFavorites() {
  const { t } = useTranslation('common', { keyPrefix: 'sidebar' });
  const favorites = useFavorites();

  return (
    <NavigationMenuGroup name={t('favorites', 'Favorites')} separate={false}>
      <MyInboxNavigationItem />
      {favorites.map((item) => {
        return <SidebarNavigationFavoritesItem key={item.path} {...item} />;
      })}
    </NavigationMenuGroup>
  );
}

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

  const handleRemove = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    void toggleFavorite();
  };

  return (
    <NavigationMenuLinkItem
      name={name}
      icon={Icon}
      path={pathWithoutUi}
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
            {!!Icon && <Icon className="mt-0.5 size-4 shrink-0" />}
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
