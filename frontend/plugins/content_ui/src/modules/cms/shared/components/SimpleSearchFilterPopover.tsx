import { IconSearch } from '@tabler/icons-react';
import { Combobox, Command, Filter, useMultiQueryState } from 'erxes-ui';

export const SimpleSearchFilterPopover = ({
  extraQueryKeys = [],
  extraItems,
  extraViews,
}: {
  extraQueryKeys?: string[];
  extraItems?: React.ReactNode;
  extraViews?: React.ReactNode;
} = {}) => {
  const [queries] = useMultiQueryState<Record<string, unknown>>([
    'searchValue',
    ...extraQueryKeys,
  ]);

  const hasFilters = Object.values(queries || {}).some((value) =>
    typeof value === 'string' ? value.trim().length > 0 : value != null,
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
                {extraItems}
              </Command.List>
            </Command>
          </Filter.View>
          {extraViews}
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
