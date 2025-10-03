import { IconCalendar, IconProgressCheck } from '@tabler/icons-react';
import { Command, Filter } from 'erxes-ui';

export const AutomationHistoriesFilterMenu = () => {
  return (
    <Filter.View>
      <Command>
        <Filter.CommandInput
          placeholder="Filter"
          variant="secondary"
          className="bg-background"
        />
        <Command.List className="p-1">
          <Filter.Item value="status">
            <IconProgressCheck />
            Status
          </Filter.Item>
          <Filter.Item value="createdAt">
            <IconCalendar />
            Filter by created
          </Filter.Item>
        </Command.List>
      </Command>
    </Filter.View>
  );
};
