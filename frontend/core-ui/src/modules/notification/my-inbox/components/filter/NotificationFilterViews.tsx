import { NotificationPriorityCommandBar } from '@/notification/my-inbox/components/filter/NotificationPriorityCommandBar';
import { NotificationTypeCommandBar } from '@/notification/my-inbox/components/filter/NotificationTypeCommandBar';
import { Command, Filter, useMultiQueryState } from 'erxes-ui';
import { SelectMember } from 'ui-modules';

export const NotificationFilterViews = () => {
  const [queries, setQueries] = useMultiQueryState<{
    status?: string;
    priority?: string;
    fromUserId?: string;
  }>(['priority', 'fromUserId']);

  const { priority, fromUserId } = queries;

  return (
    <>
      <Filter.View filterKey="type">
        <NotificationTypeCommandBar />
      </Filter.View>

      <Filter.View filterKey="priority">
        <NotificationPriorityCommandBar
          priority={priority || ''}
          setQueries={setQueries}
        />
      </Filter.View>
      <Filter.View filterKey="createdAt">
        <Filter.DateView filterKey="createdAt" />
      </Filter.View>

      <Filter.View filterKey="fromUserId">
        <Command shouldFilter={false}>
          <SelectMember.Provider
            value={fromUserId || ''}
            mode="multiple"
            onValueChange={(memberId) =>
              setQueries({ fromUserId: memberId as string })
            }
          >
            <SelectMember.Content />
          </SelectMember.Provider>
        </Command>
      </Filter.View>
    </>
  );
};
