import { NotificationsFilters } from '@/notification/components/filter/NotificationsFilters';
import { NotificationSort } from '@/notification/components/NotificationSort';
import {
  IconCommand,
  IconBackspace,
  IconInbox,
  IconMailOpened,
} from '@tabler/icons-react';
import { Button, Separator, Sidebar, Tooltip } from 'erxes-ui';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export const MyInboxHeader = () => {
  const { t } = useTranslation('common');
  return (
    <>
      <div className="flex flex-col h-13 shrink-0 bg-sidebar w-full">
        <div className="flex gap-2 px-3 flex-auto items-center">
          <Sidebar.Trigger /> <Separator.Inline />
          <Button variant="ghost" asChild>
            <Link to="/my-inbox">
              <IconInbox />
              {t('my-inbox')}
            </Link>
          </Button>
          <div className="flex gap-2 items-center ml-auto">
            <Tooltip defaultOpen>
              <Tooltip.Trigger asChild>
                <Button variant="ghost" size="icon">
                  <IconMailOpened />
                </Button>
              </Tooltip.Trigger>
              <Tooltip.Content>
                <div className="inline-flex flex-none items-center">
                  <IconCommand className="size-4" />
                  +
                  <IconBackspace className="size-4 mr-1" />
                  mark as read
                </div>
              </Tooltip.Content>
            </Tooltip>
            <NotificationsFilters />
            <NotificationSort />
          </div>
        </div>
      </div>
      <Separator className="w-auto flex-none" />
    </>
  );
};
