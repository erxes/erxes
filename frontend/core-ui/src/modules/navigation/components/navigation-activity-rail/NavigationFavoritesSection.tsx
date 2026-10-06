import { NavigationActivitySection } from '@/navigation/components/navigation-activity-rail/NavigationActivitySection';
import { SidebarNavigationFavorites } from '@/navigation/components/SidebarNavigationFavorites';
import { useFavorites } from '@/navigation/hooks/useFavorites';
import { useTranslation } from 'react-i18next';

export const NavigationFavoritesSection = ({
  expanded,
}: Readonly<{
  expanded: boolean;
}>) => {
  const { t } = useTranslation('common', { keyPrefix: 'sidebar' });
  const favorites = useFavorites();

  if (favorites.length === 0) {
    return null;
  }

  return (
    <NavigationActivitySection expanded={expanded} label={t('favorites')}>
      <SidebarNavigationFavorites expanded={expanded} />
    </NavigationActivitySection>
  );
};
