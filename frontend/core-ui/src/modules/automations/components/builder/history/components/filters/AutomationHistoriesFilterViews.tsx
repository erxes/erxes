import { STATUSES_BADGE_VARIABLES } from '@/automations/constants';
import { StatusBadgeValue } from '@/automations/types';
import { IconCheck } from '@tabler/icons-react';
import { Combobox, Command, Filter, useQueryState } from 'erxes-ui';

export const AutomationHistoriesFilterViews = () => {
  const [status, setStatus] = useQueryState('status');
  return (
    <>
      <Filter.View filterKey="status">
        <Command shouldFilter={false}>
          <Command.List className="p-1 ">
            <Combobox.Empty />
            {Object.entries(STATUSES_BADGE_VARIABLES).map(
              ([value, className]) => (
                <Command.Item
                  key={value}
                  value={value}
                  className={`cursor-pointer ${className}`}
                  onSelect={() =>
                    setStatus(
                      value === status
                        ? undefined
                        : (value as StatusBadgeValue),
                    )
                  }
                >
                  <span className="capitalize">{value}</span>
                  {status === value && <IconCheck className="ml-auto" />}
                </Command.Item>
              ),
            )}
          </Command.List>
        </Command>
      </Filter.View>
      <Filter.View filterKey="createdAt">
        <Filter.DateView filterKey="createdAt" />
      </Filter.View>
    </>
  );
};
