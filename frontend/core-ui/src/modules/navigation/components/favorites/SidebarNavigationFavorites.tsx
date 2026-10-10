import { Button, cn, NavigationMenuLinkItem, Sidebar } from 'erxes-ui';

import { IconStarFilled } from '@tabler/icons-react';
import { NavigationRailLabel } from '@/navigation/components/navigation-activity-rail/NavigationRailLabel';
import { useFavorites } from '@/navigation/hooks/useFavorites';
import { useNavigationFavorite } from '@/navigation/hooks/useNavigationFavorite';
import { useTranslation } from 'react-i18next';

const FavoriteRemoveButton = ({
  breadcrumb,
  path,
}: Readonly<{ breadcrumb: string[]; path: string }>) => {
  const { t } = useTranslation('common', { keyPrefix: 'navigation' });
  const { toggleFavorite } = useNavigationFavorite({ breadcrumb, path });

  return (
    <Button
      aria-label={t('remove-from-favorites', 'Remove from favorites')}
      className="absolute right-1 top-0.5 size-6 text-yellow-500 hover:bg-yellow-500/10 hover:text-yellow-500"
      data-sidebar="menu-action"
      size="icon"
      type="button"
      variant="ghost"
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        toggleFavorite();
      }}
    >
      <IconStarFilled className="size-3.5" />
    </Button>
  );
};

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
      action={
        expanded ? (
          <FavoriteRemoveButton breadcrumb={breadcrumb} path={path} />
        ) : undefined
      }
      name={name}
      icon={Icon}
      itemClassName={cn(
        'flex w-full shrink-0 items-center justify-start',
        'h-7',
      )}
      path={pathWithoutUi}
      className={cn(
        'h-7 justify-start rounded-md text-sm transition-[width,margin,padding] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]',
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
