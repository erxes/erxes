import {
  DashboardWidgetEmptyState,
  DashboardWidgetListSkeleton,
  DashboardWidgetCard,
} from 'ui-modules';

import { NAVIGATION_EASE } from '@/navigation/constants/navigationMotion';
import { IconChevronRight } from '@tabler/icons-react';
import { motion, useReducedMotion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useFavoritesQuery } from '@/navigation/hooks/useFavorites';
import { useTranslation } from 'react-i18next';

/** Starred (favorite) pages from any app. */
export const HomeStarred = () => {
  const { favorites, loading } = useFavoritesQuery();
  const { t } = useTranslation('common', { keyPrefix: 'home' });
  const prefersReducedMotion = useReducedMotion();

  const renderContent = () => {
    if (loading && favorites.length === 0) {
      return <DashboardWidgetListSkeleton />;
    }

    if (favorites.length === 0) {
      return (
        <DashboardWidgetEmptyState>
          {t('starred-empty')}
        </DashboardWidgetEmptyState>
      );
    }

    return (
      <ul className="flex flex-col gap-1">
        {favorites.map(({ breadcrumb, icon: Icon, name, path }, index) => (
          <motion.li
            key={path}
            initial={prefersReducedMotion ? false : { opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              duration: 0.24,
              delay: Math.min(index * 0.03, 0.2),
              ease: NAVIGATION_EASE,
            }}
          >
            <Link
              className="group/star flex h-9 min-w-0 items-center gap-2.5 rounded-lg px-2 text-sm transition-[background-color,color,transform] duration-150 hover:bg-accent/80 active:scale-[0.99]"
              to={`/${path.replace('_ui', '').replace(/^\/+/, '')}`}
            >
              {Icon && (
                <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-muted/70 text-muted-foreground transition-colors duration-150 group-hover/star:bg-primary/12 group-hover/star:text-primary">
                  <Icon className="size-3.5 shrink-0" />
                </span>
              )}
              <span className="truncate font-medium">
                {breadcrumb.length > 1 ? breadcrumb.slice(1).join(' / ') : name}
              </span>
              {breadcrumb.length > 1 && (
                <span className="ml-auto shrink-0 truncate rounded-md bg-muted/60 px-1.5 py-0.5 text-xs text-muted-foreground">
                  {breadcrumb[0]}
                </span>
              )}
              <IconChevronRight
                aria-hidden
                className="size-3.5 shrink-0 -translate-x-1 text-muted-foreground opacity-0 transition-[transform,opacity] duration-150 group-hover/star:translate-x-0 group-hover/star:opacity-100"
              />
            </Link>
          </motion.li>
        ))}
      </ul>
    );
  };

  return (
    <DashboardWidgetCard title={t('starred')}>
      {renderContent()}
    </DashboardWidgetCard>
  );
};
