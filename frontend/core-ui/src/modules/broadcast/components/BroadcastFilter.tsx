import { IconSearch } from '@tabler/icons-react';
import {
  Combobox,
  Command,
  Filter,
  useFilterQueryState,
  useMultiQueryState,
} from 'erxes-ui';

const BroadcastFilterPopover = () => {
  const [queries] = useMultiQueryState<{
    searchValue: string;
  }>(['searchValue']);

  const hasFilters = Object.values(queries || {}).some(
    (value) => value !== null,
  );

  return (
    <>
      <Filter.Popover>
        <Filter.Trigger isFiltered={hasFilters} />
        <Combobox.Content>
          <Filter.View>
            <Command>
              <Filter.CommandInput
                placeholder="Filter"
                variant="secondary"
                className="bg-background"
              />
              <Command.List className="p-1">
                <Filter.Item value="searchValue" inDialog>
                  <IconSearch />
                  Search
                </Filter.Item>
              </Command.List>
            </Command>
          </Filter.View>
        </Combobox.Content>
      </Filter.Popover>
      <Filter.Dialog>
        <Filter.View filterKey="searchValue" inDialog>
          <Filter.DialogStringView filterKey="searchValue" />
        </Filter.View>
      </Filter.Dialog>
    </>
  );
};

export const BroadcastFilter = () => {
  const [searchValue] = useFilterQueryState<string>('searchValue');

  return (
    <Filter id="broadcast-filter">
      <Filter.Bar>
        <Filter.BarItem queryKey="searchValue">
          <Filter.BarName>
            <IconSearch />
            Search
          </Filter.BarName>
          <Filter.BarButton filterKey="searchValue" inDialog>
            {searchValue}
          </Filter.BarButton>
        </Filter.BarItem>

        <BroadcastFilterPopover />
      </Filter.Bar>
    </Filter>
  );
};
