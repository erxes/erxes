import {
  HomeEmptyState,
  HomeListSkeleton,
  HomeSection,
} from '@/home/components/HomeSection';

import { Link } from 'react-router-dom';
import { useFavoritesQuery } from '@/navigation/hooks/useFavorites';
import { useTranslation } from 'react-i18next';

/** Starred (favorite) pages from any app. */
export const HomeStarred = () => {
  const { favorites, loading } = useFavoritesQuery();
  const { t } = useTranslation('common', { keyPrefix: 'home' });

  const renderContent = () => {
    if (loading && favorites.length === 0) {
      return <HomeListSkeleton />;
    }

    if (favorites.length === 0) {
      return <HomeEmptyState>{t('starred-empty')}</HomeEmptyState>;
    }

    return (
      <ul className="flex flex-col gap-0.5">
        {favorites.map(({ breadcrumb, icon: Icon, name, path }) => (
          <li key={path}>
            <Link
              className="flex h-9 min-w-0 items-center gap-2 rounded-md px-2 text-sm hover:bg-accent/60"
              to={`/${path.replace('_ui', '').replace(/^\/+/, '')}`}
            >
              {Icon && (
                <Icon className="size-4 shrink-0 text-muted-foreground" />
              )}
              <span className="truncate font-medium">
                {breadcrumb.length > 1 ? breadcrumb.slice(1).join(' / ') : name}
              </span>
              {breadcrumb.length > 1 && (
                <span className="ml-auto shrink-0 truncate text-xs text-muted-foreground">
                  {breadcrumb[0]}
                </span>
              )}
            </Link>
          </li>
        ))}
      </ul>
    );
  };

  return <HomeSection title={t('starred')}>{renderContent()}</HomeSection>;
};
