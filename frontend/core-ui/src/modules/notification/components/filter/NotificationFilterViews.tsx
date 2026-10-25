import { NotificationPriorityCommandBar } from '@/notification/components/filter/NotificationPriorityCommandBar';
import { NotificationTypeCommandBar } from '@/notification/components/filter/NotificationTypeCommandBar';
import { NotificationPluginCommandBar } from '@/notification/components/filter/NotificationPluginCommandBar';
import { Command, Filter, useMultiQueryState } from 'erxes-ui';
import { IconCheck, IconLock } from '@tabler/icons-react';
import { SelectMember } from 'ui-modules';
import { useMemo } from 'react';
import type { NotificationFilterQueries } from '@/notification/types/notificationFilters';

export const NotificationFilterViews = () => {
  const [queries, setQueries] = useMultiQueryState<
    Pick<
      NotificationFilterQueries,
      'notificationFromUserId' | 'notificationModule'
    >
  >(['notificationFromUserId', 'notificationModule']);

  const { notificationFromUserId: fromUserId, notificationModule } = queries;
  const senderIds = useMemo(
    () => fromUserId?.split(',').filter(Boolean) || [],
    [fromUserId],
  );

  return (
    <>
      <Filter.View filterKey="notificationPlugin">
        <NotificationPluginCommandBar />
      </Filter.View>
      <Filter.View filterKey="notificationType">
        <NotificationTypeCommandBar />
      </Filter.View>

      <Filter.View filterKey="notificationPriority">
        <NotificationPriorityCommandBar />
      </Filter.View>
      <Filter.View filterKey="notificationModule">
        <Command>
          <Command.List>
            <Command.Item
              value="approval"
              onSelect={() =>
                setQueries({
                  notificationModule:
                    notificationModule === 'approval' ? null : 'approval',
                })
              }
            >
              <IconLock />
              Approval
              {notificationModule === 'approval' && (
                <IconCheck className="ml-auto" />
              )}
            </Command.Item>
          </Command.List>
        </Command>
      </Filter.View>
      <Filter.View filterKey="notificationCreatedAt">
        <Filter.DateView filterKey="notificationCreatedAt" />
      </Filter.View>

      <Filter.View filterKey="notificationFromUserId">
        <Command shouldFilter={false}>
          <SelectMember.Provider
            value={senderIds}
            mode="multiple"
            onValueChange={(memberId) =>
              setQueries({
                notificationFromUserId: Array.isArray(memberId)
                  ? memberId.join(',')
                  : memberId,
              })
            }
          >
            <SelectMember.Content />
          </SelectMember.Provider>
        </Command>
      </Filter.View>
    </>
  );
};
