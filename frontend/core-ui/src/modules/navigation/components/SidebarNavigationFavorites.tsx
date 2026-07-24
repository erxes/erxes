import { NavigationMenuLinkItem, Sidebar } from 'erxes-ui';
import { useFavorites } from '../hooks/useFavorites';
import { MyInboxNavigationItem } from '@/notification/components/MyInboxNavigationItem';
import { useTranslation } from 'react-i18next';

export function SidebarNavigationFavorites() {
  const { t } = useTranslation('common', { keyPrefix: 'sidebar' });
  const favorites = useFavorites();

  return (
    <section className="px-2 pb-2">
      <h2 className="px-2 pb-1 pt-1 font-mono text-[10px] font-semibold uppercase tracking-wide text-accent-foreground">
        {t('favorites')}
      </h2>
      <Sidebar.Menu>
        <MyInboxNavigationItem />
        {favorites.map((item) => {
          return <SidebarNavigationFavoritesItem key={item.path} {...item} />;
        })}
      </Sidebar.Menu>
    </section>
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
    <NavigationMenuLinkItem
      name={name}
      icon={Icon}
      path={pathWithoutUi}
      className="h-7 px-2 text-[13px]"
    />
  );
}
