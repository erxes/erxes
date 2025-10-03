import { NotificationPriorityCommandBar } from '@/notification/my-inbox/components/filter/NotificationPriorityCommandBar';
import { NotificationTypeCommandBar } from '@/notification/my-inbox/components/filter/NotificationTypeCommandBar';
import { MyInboxHotkeyScope } from '@/notification/my-inbox/types/notifications';
import {
  IconCalendarPlus,
  IconEyeUp,
  IconNotification,
} from '@tabler/icons-react';
import {
  Filter,
  PageSubHeader,
  Popover,
  ScrollArea,
  useMultiQueryState,
} from 'erxes-ui';

export const NotificationFilterBar = () => {
  const [queries, setQueries] = useMultiQueryState<{
    priority?: string;
    type?: string;
    createdAt: string;
  }>(['priority', 'type', 'createdAt']);

  const hasFilters = Object.values(queries || {}).some(
    (value) => value !== null,
  );

  if (!hasFilters) {
    return null;
  }

  return (
    <PageSubHeader className="p-0">
      <ScrollArea className="w-full">
        <div className="flex gap-1 p-2">
          <Filter id={MyInboxHotkeyScope.MainPage}>
            <Filter.Bar className="flex-nowrap">
              <Filter.BarItem queryKey="type">
                <Filter.BarName className="whitespace-nowrap">
                  <IconNotification />
                  Notification Type
                </Filter.BarName>
                <Popover>
                  <Popover.Trigger>
                    <Filter.BarButton filterKey="type">
                      {queries.type}
                    </Filter.BarButton>
                  </Popover.Trigger>
                  <Popover.Content className="p-0">
                    <NotificationTypeCommandBar />
                  </Popover.Content>
                </Popover>
              </Filter.BarItem>
              <Filter.BarItem queryKey="priority">
                <Filter.BarName className="whitespace-nowrap">
                  <IconEyeUp />
                  Priority
                </Filter.BarName>
                <Popover>
                  <Popover.Trigger>
                    <Filter.BarButton filterKey="priority">
                      {queries.priority}
                    </Filter.BarButton>
                  </Popover.Trigger>
                  <Popover.Content className="p-0">
                    <NotificationPriorityCommandBar
                      priority={queries.priority || ''}
                      setQueries={setQueries}
                    />
                  </Popover.Content>
                </Popover>
              </Filter.BarItem>
              <Filter.BarItem queryKey="createdAt">
                <Filter.BarName className="whitespace-nowrap">
                  <IconCalendarPlus />
                  Created at
                </Filter.BarName>
                <Filter.Date filterKey="createdAt" />
              </Filter.BarItem>
            </Filter.Bar>
          </Filter>
        </div>
        <ScrollArea.Bar orientation="horizontal" />
      </ScrollArea>
    </PageSubHeader>
  );
};
