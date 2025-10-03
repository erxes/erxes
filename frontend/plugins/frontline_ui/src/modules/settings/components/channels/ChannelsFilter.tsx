import { IconChalkboard } from '@tabler/icons-react';
import {
  Combobox,
  Command,
  Filter,
  PageSubHeader,
  useMultiQueryState,
  useQueryState,
} from 'erxes-ui';

const ChannelsFilterPopover = () => {
  const [queries] = useMultiQueryState<{
    channelId: string;
  }>(['channelId']);

  const hasFilters = Object.values(queries || {}).some(
    (value) => value !== null,
  );

  return (
    <Filter.Popover scope="channels-filter">
      <Filter.Trigger isFiltered={hasFilters} />
      <Combobox.Content>
        <Filter.View>
          <Command>
            <Filter.CommandInput
              placeholder="Filter"
              variant="secondary"
              className="bg-background"
            />
            <Filter.Item value="channelId">
              <IconChalkboard />
              Channel
            </Filter.Item>
          </Command>
        </Filter.View>
      </Combobox.Content>
    </Filter.Popover>
  );
};

export const ChannelsFilter = () => {
  return (
    <Filter id="channels-filter" sessionKey="">
      <PageSubHeader>
        <Filter.Bar>
          <Filter.BarItem queryKey="channelId">
            <Filter.BarName>
              <IconChalkboard />
              Channel
            </Filter.BarName>
            <ChannelsFilterPopover />
          </Filter.BarItem>
        </Filter.Bar>
      </PageSubHeader>
    </Filter>
  );
};
