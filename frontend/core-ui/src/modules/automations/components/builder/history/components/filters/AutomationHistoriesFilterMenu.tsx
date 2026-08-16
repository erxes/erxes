import {
  IconAlertTriangle,
  IconCalendar,
  IconClockPause,
  IconProgressCheck,
  IconTargetArrow,
} from '@tabler/icons-react';
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
          <Command.Group heading="Run">
            <Filter.Item value="status">
              <IconProgressCheck />
              Status
            </Filter.Item>
            <Filter.Item value="createdAt">
              <IconCalendar />
              Filter by created
            </Filter.Item>
          </Command.Group>
          <Command.Group heading="Where it stopped">
            <Filter.Item value="failedActionId">
              <IconTargetArrow />
              Failed at action
            </Filter.Item>
            <Filter.Item value="errorCode">
              <IconAlertTriangle />
              Error code
            </Filter.Item>
            <Filter.Item value="waitingActionId">
              <IconClockPause />
              Waiting at action
            </Filter.Item>
          </Command.Group>
        </Command.List>
      </Command>
    </Filter.View>
  );
};
