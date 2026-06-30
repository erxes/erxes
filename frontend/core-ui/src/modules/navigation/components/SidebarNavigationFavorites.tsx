import { NavigationMenuGroup, NavigationMenuLinkItem } from 'erxes-ui';
import { useFavorites } from '../hooks/useFavorites';
import { MyInboxNavigationItem } from '@/notification/components/MyInboxNavigationItem';
import { useTranslation } from 'react-i18next';

export function SidebarNavigationFavorites() {
  const { t } = useTranslation('common', { keyPrefix: 'sidebar' });
  const favorites = useFavorites();

  return (
    <NavigationMenuGroup name={t('favorites')} separate={false}>
      <MyInboxNavigationItem />
      {favorites.map((item) => {
        return <SidebarNavigationFavoritesItem key={item.path} {...item} />;
      })}
    </NavigationMenuGroup>
  );
}

export function SidebarNavigationFavoritesItem({
  name,
  icon,
  path,
  favoriteNameComponent: FavoriteNameComponent,
}: {
  name: string;
  icon?: React.ElementType;
  path: string;
  favoriteNameComponent?: React.ComponentType<{
    path: string;
    fallbackName: string;
  }>;
}) {
  const Icon = icon || (() => <span />);
  const pathWithoutUi = path.replace('_ui', '');
  const label = FavoriteNameComponent ? (
    <FavoriteNameComponent path={path} fallbackName={name} />
  ) : (
    name
  );

  return (
    <NavigationMenuLinkItem name={label} icon={Icon} path={pathWithoutUi} />
  );
}
