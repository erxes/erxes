import { useNavigationActivities } from '@/navigation/hooks/useNavigationActivities';
import { useTranslation } from 'react-i18next';

/**
 * The plugin that sent a notification, read from its contentType prefix, and
 * a label for it even when that plugin has no app, like settings-only ones.
 */
export const useNotificationApp = (contentType?: string) => {
  const { t } = useTranslation('common', { keyPrefix: 'notification' });
  const activities = useNavigationActivities();
  const plugin = (contentType ?? '').split(/[:.]/)[0];
  const app = activities.find(
    (activity) => activity.kind === 'plugin' && activity.id === plugin,
  );
  const label =
    app?.label ??
    (!plugin || plugin === 'core'
      ? t('workspace')
      : plugin.charAt(0).toUpperCase() + plugin.slice(1));

  return { app, label };
};
