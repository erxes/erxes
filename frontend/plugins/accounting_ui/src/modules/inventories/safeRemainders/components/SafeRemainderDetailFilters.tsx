import {
  IconLayoutGridAdd,
  IconSearch,
  IconToggleRightFilled,
  IconTypeface,
} from '@tabler/icons-react';
import { Combobox, Command, Filter, useMultiQueryState } from 'erxes-ui';
import { useSafeRemainderQueryParams } from '../hooks/useSafeRemainders';

const SafeRemainderDetailFilterPopover = () => {
  const queryParams = useSafeRemainderQueryParams();
  const hasFilters = Object.values(queryParams || {}).some(
    (value) => value !== null,
  );

  return (
    <>
      <Filter.Popover scope="accounts-filter">
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
                <Filter.Item value="diffType" inDialog>
                  <IconTypeface />
                  DiffType
                </Filter.Item>
                <Filter.Item value="category">
                  <IconLayoutGridAdd />
                  Category
                </Filter.Item>
                <Filter.Item value="status">
                  <IconToggleRightFilled />
                  Status
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

export const SafeRemainderDetailFilter = ({
  afterBar,
}: {
  afterBar?: React.ReactNode;
}) => {
  const [queries] = useMultiQueryState<{
    status: string;
    searchValue: string;
    productCategoryIds: string;
    diffType: string;
  }>(['status', 'searchValue', 'productCategoryIds', 'diffType']);

  const { status, searchValue, diffType } = queries;

  return (
    <Filter id="accounts-filter">
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
        <Filter.BarItem queryKey="status">
          <Filter.BarName>
            <IconToggleRightFilled />
            Status
          </Filter.BarName>
          <Filter.BarButton filterKey="status" inDialog>
            {status}
          </Filter.BarButton>
        </Filter.BarItem>
        <Filter.BarItem queryKey="status">
          <Filter.BarName>
            <IconToggleRightFilled />
            Diff Type
          </Filter.BarName>
          <Filter.BarButton filterKey="diffType" inDialog>
            {diffType}
          </Filter.BarButton>
        </Filter.BarItem>
        <SafeRemainderDetailFilterPopover />
        {afterBar && <>{afterBar}</>}
      </Filter.Bar>
    </Filter>
  );
};
