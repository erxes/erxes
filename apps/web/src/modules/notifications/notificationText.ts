import type { Notification } from '@erxes/core-contract';
import { useTranslation } from 'react-i18next';

/** Core's own kinds have translated titles, and bodies filled from `data`; plugins send theirs ready to read. */
export const useNotificationText = () => {
  const { t, i18n } = useTranslation('common', { keyPrefix: 'notifications' });

  return {
    title: (notification: Notification) =>
      notification.source === 'core'
        ? t(`kinds.${notification.kind}`, notification.title)
        : notification.title,
    // Only a kind with a translated body: another's (a note's text) is never read as a template.
    body: (notification: Notification) =>
      notification.source === 'core' &&
      notification.body &&
      i18n.exists(`notifications.bodies.${notification.kind}`, { ns: 'common' })
        ? t(`bodies.${notification.kind}`, {
            ...notification.data,
            defaultValue: notification.body,
          })
        : notification.body,
  };
};
