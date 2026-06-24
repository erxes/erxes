import { IconSearch } from '@tabler/icons-react';
import {
  Combobox,
  Command,
  Filter,
  useFilterQueryState,
  useMultiQueryState,
} from 'erxes-ui';
import { PAGES_CURSOR_SESSION_KEY } from '../constants/pagesCursorSessionKey';
import { PagesTotalCount } from './PagesTotalCount';

const PagesFilterPopover = () => {
  const [queries] = useMultiQueryState<{ searchValue: string }>([
    'searchValue',
  ]);

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

export const PagesFilter = () => {
  const [searchValue] = useFilterQueryState<string>('searchValue');

  return (
    <Filter id="pages-filter" sessionKey={PAGES_CURSOR_SESSION_KEY}>
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
        <PagesFilterPopover />
        <PagesTotalCount />
      </Filter.Bar>
    </Filter>
  );
};
