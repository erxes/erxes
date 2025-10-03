import { NotificationsFilters } from '@/notification/my-inbox/components/filter/NotificationsFilters';
import { NotificationSort } from '@/notification/my-inbox/components/NotificationSort';
import { IconInbox } from '@tabler/icons-react';
import { Button, Separator, Sidebar } from 'erxes-ui';
import { Link } from 'react-router-dom';

export const MyInboxHeader = () => {
  return (
    <>
      <div className="flex flex-col h-[3.25rem] flex-shrink-0 bg-sidebar w-full">
        <div className="flex gap-2 px-3 flex-auto items-center">
          <Sidebar.Trigger /> <Separator.Inline />
          <Button variant="ghost" asChild>
            <Link to="/my-inbox">
              <IconInbox />
              My Inbox
            </Link>
          </Button>
          <div className="flex gap-2 items-center ml-auto">
            <NotificationsFilters />
            <NotificationSort />
          </div>
        </div>
      </div>
      <Separator className="w-auto flex-none" />
    </>
  );
};
