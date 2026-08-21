import { NavigationActivityButton } from '@/navigation/components/navigation-activity-rail/NavigationActivityButton';
import { NavigationActivitySection } from '@/navigation/components/navigation-activity-rail/NavigationActivitySection';
import { SidebarNavigationFavorites } from '@/navigation/components/SidebarNavigationFavorites';
import { INavigationActivity } from '@/navigation/types/NavigationActivity';
import { NotificationCount } from '@/notification/components/MyInboxNavigationItem';
import { IconInbox } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

export const NavigationFavoritesSection = ({
  expanded,
  isInboxActive,
  onSelectInbox,
}: Readonly<{
  expanded: boolean;
  isInboxActive: boolean;
  onSelectInbox: () => void;
}>) => {
  const { t } = useTranslation('common', { keyPrefix: 'sidebar' });
  const inboxActivity: INavigationActivity = {
    id: 'navigation:inbox',
    label: t('my-inbox'),
    icon: IconInbox,
    kind: 'core',
    modules: [],
    defaultPath: 'my-inbox',
  };

  return (
    <NavigationActivitySection expanded={expanded} label={t('favorites')}>
      <NavigationActivityButton
        activity={inboxActivity}
        active={isInboxActive}
        expanded={expanded}
        indicator={<NotificationCount />}
        onSelect={onSelectInbox}
      />
      <SidebarNavigationFavorites expanded={expanded} />
    </NavigationActivitySection>
  );
};
