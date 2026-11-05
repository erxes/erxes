import { IconUser } from '@tabler/icons-react';
import {
  Combobox,
  Command,
  Filter,
  Popover,
  useMultiQueryState,
} from 'erxes-ui';
import type { NotificationFilterQueries } from '@/notification/types/notificationFilters';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { SelectMember } from 'ui-modules';

export const NotificationSenderFilterBarItem = () => {
  const { t } = useTranslation('common', { keyPrefix: 'notification' });
  const [{ notificationFromUserId: fromUserId }, setQueries] =
    useMultiQueryState<
      Pick<NotificationFilterQueries, 'notificationFromUserId'>
    >(['notificationFromUserId']);
  const senderIds = useMemo(
    () => fromUserId?.split(',').filter(Boolean) || [],
    [fromUserId],
  );

  return (
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
  );
};
