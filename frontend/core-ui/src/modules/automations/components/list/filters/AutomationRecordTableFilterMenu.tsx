import {
  IconCalendar,
  IconPointerBolt,
  IconProgressCheck,
  IconSearch,
  IconShare,
  IconTags,
  IconUser,
  IconUserUp,
} from '@tabler/icons-react';
import { Filter, Command } from 'erxes-ui';

export const AutomationRecordTableFilterMenu = () => {
  return (
    <Filter.View>
      <Command>
        <Filter.CommandInput
          placeholder="Filter"
          variant="secondary"
          className="bg-background"
        />
        <Command.List className="p-1">
          <Filter.Item value="searchValue">
            <IconSearch />
            Search
          </Filter.Item>
          <Filter.Item value="status">
            <IconProgressCheck />
            Status
          </Filter.Item>
          <Filter.Item value="createdAt">
            <IconCalendar />
            Created At
          </Filter.Item>
          <Filter.Item value="createdByIds">
            <IconUser />
            Created By
          </Filter.Item>
          <Filter.Item value="updatedAt">
            <IconCalendar />
            Updated At
          </Filter.Item>
          <Filter.Item value="updatedByIds">
            <IconUserUp />
            Updated By
          </Filter.Item>
          <Filter.Item value="triggerTypes">
            <IconPointerBolt />
            Trigger Types
          </Filter.Item>
          <Filter.Item value="actionTypes">
            <IconShare />
            Action Types
          </Filter.Item>
          <Filter.Item value="tagIds">
            <IconTags />
            Tags
          </Filter.Item>
        </Command.List>
      </Command>
    </Filter.View>
  );
};
