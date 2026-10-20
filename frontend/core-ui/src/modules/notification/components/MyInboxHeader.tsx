import { NotificationsFilters } from '@/notification/components/filter/NotificationsFilters';
import { NotificationSort } from '@/notification/components/NotificationSort';
import { IconInbox } from '@tabler/icons-react';
import { Button, Separator, ToggleGroup, useQueryState } from 'erxes-ui';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAtomValue } from 'jotai';
import { inboxDisplayOptionsState } from '@/notification/states/notificationState';
import { NotificationDisplayOptions } from './NotificationDisplayOptions';
import { NotificationFilterBar } from './filter/NotificationFilterBar';

export const MyInboxHeader = () => {
  const { t } = useTranslation('common', { keyPrefix: 'notification' });
  const [attention, setAttention] = useQueryState<string>(
    'notificationAttention',
  );
  const display = useAtomValue(inboxDisplayOptionsState);
  return (
    <>
      <div className="flex flex-col h-10 shrink-0 bg-sidebar w-full">
        <div className="flex flex-auto items-center gap-2 px-3 pl-[calc(0.75rem_+_var(--navigation-panel-toggle-space,0rem)_+_var(--visited-page-tabs-open-button-space,0rem))]">
          <Button variant="ghost" asChild>
            <Link to="/my-inbox">
              <IconInbox />
              {t('my-inbox')}
            </Link>
          </Button>
          <div className="flex gap-2 items-center ml-auto">
            <NotificationsFilters />
            <NotificationSort />
            <NotificationDisplayOptions />
          </div>
        </div>
      </div>
      {display.priorityInbox && (
        <div
          className="px-3 pb-2"
          title={t(
            'priority-explanation',
            'High and urgent notifications, assignments, mentions, and approval requests',
          )}
        >
          <ToggleGroup
            type="single"
            variant="outline"
            className="w-full"
            value={attention || 'priority'}
            onValueChange={(value) => {
              if (value) setAttention(value);
            }}
          >
            <ToggleGroup.Item className="flex-1 h-7" value="priority">
              {t('priority')}
            </ToggleGroup.Item>
            <ToggleGroup.Item className="flex-1 h-7" value="other">
              {t('other', 'Other')}
            </ToggleGroup.Item>
          </ToggleGroup>
        </div>
      )}
      <NotificationFilterBar />
      <Separator className="w-auto flex-none" />
    </>
  );
};
