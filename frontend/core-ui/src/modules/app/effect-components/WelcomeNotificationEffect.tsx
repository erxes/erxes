import { TNotification, currentUserState, useVersion } from 'ui-modules';
import { useLocation, useNavigate } from 'react-router-dom';

import { AppPath } from '@/types/paths/AppPath';
import { ICursorListResponse } from 'erxes-ui';
import { NOTIFICATIONS } from '@/notification/graphql/notificationsQueries';
import { useAtomValue } from 'jotai';
import { useEffect } from 'react';
import { useQuery } from '@apollo/client';

declare global {
  interface Window {
    Erxes?: { showMessenger?: () => void };
  }
}

const isWelcomeNotification = (notification: TNotification) =>
  notification.kind === 'system' &&
  notification.contentType?.endsWith('system.welcome') &&
  !notification.isRead;

export const WelcomeNotificationEffect = () => {
  const currentUser = useAtomValue(currentUserState);
  const isSaas = useVersion('saas');
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const { data } = useQuery<ICursorListResponse<TNotification>>(NOTIFICATIONS, {
    variables: { limit: 10, status: 'UNREAD' },
    skip: !currentUser || !isSaas,
  });

  useEffect(() => {
    const isInboxRoot =
      pathname === AppPath.Index || pathname === `/${AppPath.MyInbox}`;

    if (!isInboxRoot) {
      return;
    }

    const welcomeNotification = data?.notifications?.list?.find(
      isWelcomeNotification,
    );

    if (welcomeNotification) {
      navigate(`/${AppPath.MyInbox}/${welcomeNotification._id}`, {
        replace: true,
      });

      let attempts = 0;
      const timer = window.setInterval(() => {
        attempts += 1;
        if (window.Erxes?.showMessenger) {
          window.Erxes.showMessenger();
          window.clearInterval(timer);
        } else if (attempts >= 20) {
          window.clearInterval(timer);
        }
      }, 500);

      return () => window.clearInterval(timer);
    }
  }, [data?.notifications?.list, pathname, navigate]);

  return null;
};
