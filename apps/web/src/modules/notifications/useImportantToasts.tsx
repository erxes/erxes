import type { Notification } from '@erxes/core-contract';
import { useQueryClient } from '@tanstack/react-query';
import { Button, toast } from 'erxes-ui';
import { useEffect, useEffectEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { watchArrivals } from './arrivals';
import { useNotificationText } from './notificationText';
import { useNotificationActions } from './useNotifications';

/**
 * Important notifications (priority `high`: email sending halted, its limit
 * reached, …) that arrive while erxes is the tab in front also show as a
 * toast, with a button that opens them. Only the front tab toasts, so several
 * open tabs show it once; a tab in the background leaves it to the desktop
 * popup and the inbox. Those there on page load aren't news.
 */
export const useImportantToasts = () => {
  const client = useQueryClient();
  const navigate = useNavigate();
  const text = useNotificationText();
  const { t } = useTranslation('common', { keyPrefix: 'notifications' });
  const { markRead } = useNotificationActions();

  const show = useEffectEvent((item: Notification) => {
    if (item.priority !== 'high' || document.visibilityState !== 'visible') return;

    const { link } = item;

    const shown = toast({
      variant: 'warning',
      title: text(item).title,
      description: text(item).body ?? undefined,
      action: link ? (
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            shown.dismiss();
            markRead.mutate({ ids: [item.id] });
            void navigate(link);
          }}
        >
          {t('open', 'Open')}
        </Button>
      ) : undefined,
    });
  });

  useEffect(() => watchArrivals(client, (item) => show(item)), [client]);
};
