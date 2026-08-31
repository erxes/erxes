import { NavigationInboxButton } from '@/navigation/components/navigation-activity-rail/NavigationInboxButton';
import { NavigationActivitySection } from '@/navigation/components/navigation-activity-rail/NavigationActivitySection';
import { SidebarNavigationFavorites } from '@/navigation/components/SidebarNavigationFavorites';
import { useFavorites } from '@/navigation/hooks/useFavorites';
import { useTranslation } from 'react-i18next';

export const NavigationFavoritesSection = ({
  expanded,
  isInboxActive,
  onSelectInbox,
  showInbox = true,
}: Readonly<{
  expanded: boolean;
  isInboxActive: boolean;
  onSelectInbox: () => void;
  showInbox?: boolean;
}>) => {
  const { t } = useTranslation('common', { keyPrefix: 'sidebar' });
  const favorites = useFavorites();

  if (!showInbox && favorites.length === 0) {
    return null;
  }

  return (
    <NavigationActivitySection expanded={expanded} label={t('favorites')}>
      {showInbox ? (
        <NavigationInboxButton
          expanded={expanded}
          isInboxActive={isInboxActive}
          onSelectInbox={onSelectInbox}
        />
      ) : null}
      <SidebarNavigationFavorites expanded={expanded} />
    </NavigationActivitySection>
  );
};
