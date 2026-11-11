import type { CustomerState } from '@erxes/core-contract';
import { IconTags } from '@tabler/icons-react';
import { Combobox, Command, Filter, Skeleton, useMultiQueryState } from 'erxes-ui';
import { OptionFilter, type OptionFilterProps } from '~/components/OptionFilter';
import { useTags } from '~/modules/tags/useTags';
import { customersSessionKey, useCustomers } from './useCustomers';

const TotalCount = ({ state }: { state: CustomerState }) => {
  const { totalCount } = useCustomers(state);

  return (
    <div className="h-7 whitespace-nowrap text-sm font-medium leading-7 text-muted-foreground">
      {totalCount === undefined ? (
        <Skeleton className="mt-1.5 inline-block h-4 w-20" />
      ) : (
        `${totalCount} records found`
      )}
    </div>
  );
};

/** The filter bar under the page header, as old core-ui (search for now). */
export const CustomersFilter = ({ state }: { state: CustomerState }) => {
  const sessionKey = customersSessionKey(state);
  const [queries] = useMultiQueryState<{ searchValue: string; tagId: string }>(['searchValue', 'tagId']);
  const { tags } = useTags('customer');
  const tagFilter: OptionFilterProps = {
    filterKey: 'tagId',
    label: 'Tag',
    icon: IconTags,
    options: tags.map((tag) => ({ value: tag.id, label: tag.name })),
  };
  const filtered = Object.values(queries ?? {}).some((value) => value !== null);

  return (
    <Filter id={`core-${state}s-filter`} sessionKey={sessionKey}>
      <Filter.Bar>
        <Filter.Popover scope={`core-${state}s-page`}>
          <Filter.Trigger isFiltered={filtered} />
          <Combobox.Content>
            <Filter.View>
              <Command>
                <Filter.CommandInput placeholder="Filter" variant="secondary" className="bg-background" />
                <Command.List className="p-1">
                  <Filter.SearchValueTrigger />
                  <OptionFilter.Item {...tagFilter} />
                </Command.List>
              </Command>
            </Filter.View>
            <OptionFilter.View {...tagFilter} />
          </Combobox.Content>
        </Filter.Popover>
        <Filter.Dialog>
          <Filter.View filterKey="searchValue" inDialog>
            <Filter.DialogStringView filterKey="searchValue" />
          </Filter.View>
        </Filter.Dialog>
        <Filter.SearchValueBarItem />
        <OptionFilter.Bar {...tagFilter} />
        <TotalCount state={state} />
      </Filter.Bar>
    </Filter>
  );
};
