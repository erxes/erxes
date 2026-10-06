import { INavigationActivity } from '@/navigation/types/NavigationActivity';
import { IconSparkles } from '@tabler/icons-react';
import { NavigationActivityButton } from '@/navigation/components/navigation-activity-rail/NavigationActivityButton';
import { useTranslation } from 'react-i18next';
import { useVersion } from 'ui-modules';

export const NavigationWelcomeButton = ({
  expanded,
  isWelcomeActive,
  onSelectWelcome,
}: Readonly<{
  expanded: boolean;
  isWelcomeActive: boolean;
  onSelectWelcome: () => void;
}>) => {
  const { t } = useTranslation('common', { keyPrefix: 'sidebar' });
  const isSaas = useVersion('saas');
  const welcomeActivity: INavigationActivity = {
    id: 'navigation:welcome',
    label: t('welcome', { defaultValue: 'Welcome' }),
    icon: IconSparkles,
    kind: 'core',
    modules: [],
    defaultPath: 'welcome-home',
  };

  if (isSaas) {
    return null;
  }

  return (
    <NavigationActivityButton
      activity={welcomeActivity}
      active={isWelcomeActive}
      expanded={expanded}
      onSelect={onSelectWelcome}
    />
  );
};
