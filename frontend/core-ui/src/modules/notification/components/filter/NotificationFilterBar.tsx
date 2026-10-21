import {
  IconCalendar,
  IconFlag,
  IconLock,
  IconNotification,
} from '@tabler/icons-react';
import {
  Combobox,
  Filter,
  PageSubHeader,
  Popover,
  useMultiQueryState,
} from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { NotificationPriorityCommandBar } from './NotificationPriorityCommandBar';
import { NotificationTypeCommandBar } from './NotificationTypeCommandBar';
import { NotificationPriority } from '@/notification/components/NotificationPriority';
import { NotificationPluginFilterBarItem } from './NotificationPluginFilterBarItem';
import { NotificationSenderFilterBarItem } from './NotificationSenderFilterBarItem';
import type { NotificationFilterQueries } from '@/notification/types/notificationFilters';

export const NotificationFilterBar = () => {
  const { t } = useTranslation('common', { keyPrefix: 'notification' });
  const [queries] = useMultiQueryState<NotificationFilterQueries>([
    'notificationPriority',
    'notificationType',
    'notificationCreatedAt',
    'notificationFromUserId',
    'notificationModule',
    'notificationPlugin',
  ]);

  if (!Object.values(queries).some(Boolean)) return null;

  return (
    <PageSubHeader>
      <Filter id="notification-active-filters">
        <Filter.Bar aria-label={t('active-filters', 'Active filters')}>
          <NotificationPluginFilterBarItem />
          <Filter.BarItem queryKey="notificationPriority">
            <Filter.BarName>
              <IconFlag />
              {t('priority')}
            </Filter.BarName>
            <Popover>
              <Popover.Trigger asChild>
                <Filter.BarButton className="capitalize">
                  <NotificationPriority
                    priority={queries.notificationPriority}
                  />
                </Filter.BarButton>
              </Popover.Trigger>
              <Combobox.Content>
                <NotificationPriorityCommandBar />
              </Combobox.Content>
            </Popover>
          </Filter.BarItem>
          <Filter.BarItem queryKey="notificationType">
            <Filter.BarName>
              <IconNotification />
              {t('notification-type')}
            </Filter.BarName>
            <Popover>
              <Popover.Trigger asChild>
                <Filter.BarButton className="capitalize">
                  {queries.notificationType}
                </Filter.BarButton>
              </Popover.Trigger>
              <Combobox.Content>
                <NotificationTypeCommandBar />
              </Combobox.Content>
            </Popover>
          </Filter.BarItem>
          <Filter.BarItem queryKey="notificationCreatedAt">
            <Filter.BarName>
              <IconCalendar />
              {t('created-at')}
            </Filter.BarName>
            <Filter.Date filterKey="notificationCreatedAt" />
          </Filter.BarItem>
          <NotificationSenderFilterBarItem />
          <Filter.BarItem queryKey="notificationModule">
            <Filter.BarName>
              <IconLock />
              {t('approval')}
            </Filter.BarName>
          </Filter.BarItem>
        </Filter.Bar>
      </Filter>
    </PageSubHeader>
  );
};
