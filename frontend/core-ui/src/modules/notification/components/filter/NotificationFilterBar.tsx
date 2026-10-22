import {
  IconCalendar,
  IconFlag,
  IconLock,
  IconNotification,
  IconUser,
} from '@tabler/icons-react';
import {
  Combobox,
  Command,
  Filter,
  PageSubHeader,
  Popover,
  useMultiQueryState,
} from 'erxes-ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { SelectMember } from 'ui-modules';
import { NotificationPriorityCommandBar } from './NotificationPriorityCommandBar';
import { NotificationTypeCommandBar } from './NotificationTypeCommandBar';

export const NotificationFilterBar = () => {
  const { t } = useTranslation('common', { keyPrefix: 'notification' });
  const [queries, setQueries] = useMultiQueryState<{
    notificationPriority: string;
    notificationType: string;
    notificationCreatedAt: string;
    notificationFromUserId: string;
    notificationModule: string;
  }>([
    'notificationPriority',
    'notificationType',
    'notificationCreatedAt',
    'notificationFromUserId',
    'notificationModule',
  ]);
  const senderIds = useMemo(
    () => queries.notificationFromUserId?.split(',').filter(Boolean) || [],
    [queries.notificationFromUserId],
  );

  if (!Object.values(queries).some(Boolean)) return null;

  return (
    <PageSubHeader>
      <Filter id="notification-active-filters">
        <Filter.Bar aria-label={t('active-filters', 'Active filters')}>
          <Filter.BarItem queryKey="notificationPriority">
            <Filter.BarName>
              <IconFlag />
              {t('priority')}
            </Filter.BarName>
            <Popover>
              <Popover.Trigger asChild>
                <Filter.BarButton className="capitalize">
                  {queries.notificationPriority}
                </Filter.BarButton>
              </Popover.Trigger>
              <Combobox.Content>
                <NotificationPriorityCommandBar
                  priority={queries.notificationPriority}
                  setQueries={setQueries}
                />
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
          <Filter.BarItem queryKey="notificationFromUserId">
            <Filter.BarName>
              <IconUser />
              {t('filter-by-sender')}
            </Filter.BarName>
            <SelectMember.Provider
              value={senderIds}
              mode="multiple"
              onValueChange={(value) =>
                setQueries({
                  notificationFromUserId: Array.isArray(value)
                    ? value.join(',') || null
                    : value,
                })
              }
            >
              <Popover>
                <Popover.Trigger asChild>
                  <Filter.BarButton>
                    {t('members-selected', {
                      defaultValue: '{{count}} selected',
                      count: senderIds.length,
                    })}
                  </Filter.BarButton>
                </Popover.Trigger>
                <Combobox.Content>
                  <Command shouldFilter={false}>
                    <SelectMember.Content />
                  </Command>
                </Combobox.Content>
              </Popover>
            </SelectMember.Provider>
          </Filter.BarItem>
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
