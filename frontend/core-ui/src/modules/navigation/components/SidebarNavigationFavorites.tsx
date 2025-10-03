import { NavigationMenuGroup, NavigationMenuLinkItem } from 'erxes-ui';
import { useFavorites } from '../hooks/useFavorites';
import { MyInboxNavigationItem } from '@/notification/my-inbox/components/MyInboxNavigationItem';

export function SidebarNavigationFavorites() {
  const favorites = useFavorites();

  return (
    <NavigationMenuGroup name="Favorites" separate={false}>
      <MyInboxNavigationItem />
      {favorites.map((item) => {
        return <SidebarNavigationFavoritesItem key={item.name} {...item} />;
      })}
    </NavigationMenuGroup>
  );
}

export function SidebarNavigationFavoritesItem({
  name,
  icon,
  path,
}: {
  name: string;
  icon?: React.ElementType;
  path: string;
}) {
  const Icon = icon || (() => <span />);
  const pathWithoutUi = path.replace('_ui', '');

  return (
    <NavigationMenuLinkItem name={name} icon={Icon} path={pathWithoutUi} />
  );
}
