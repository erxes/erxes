import { useFavorites } from '@/navigation/hooks/useFavorites';
import { useNavigationActivities } from '@/navigation/hooks/useNavigationActivities';
import { findNavigationActivityByPath } from '@/navigation/utils/navigationActivities';

/** The user's favorites as links, each tagged with the app that owns it. */
export const useStarredPages = () => {
  const favorites = useFavorites();
  const activities = useNavigationActivities();

  return favorites.map(({ name, breadcrumb, icon, path }) => {
    const to = `/${path.replace('_ui', '').replace(/^\/+/, '')}`;

    return {
      to,
      icon,
      title: breadcrumb.length > 1 ? breadcrumb.slice(1).join(' / ') : name,
      section: breadcrumb[0] ?? name,
      app: findNavigationActivityByPath(activities, to),
    };
  });
};
