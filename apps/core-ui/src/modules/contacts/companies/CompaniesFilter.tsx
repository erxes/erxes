import { IconTags } from '@tabler/icons-react';
import { Combobox, Command, Filter, Skeleton, useMultiQueryState } from 'erxes-ui';
import { OptionFilter, type OptionFilterProps } from '~/components/OptionFilter';
import { useTags } from '~/modules/tags/useTags';
import { COMPANIES_SESSION_KEY, useCompanies } from './useCompanies';

const TotalCount = () => {
  const { totalCount } = useCompanies();

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

export const CompaniesFilter = () => {
  const [queries] = useMultiQueryState<{ searchValue: string; tagId: string }>(['searchValue', 'tagId']);
  const filtered = Object.values(queries ?? {}).some((value) => value !== null);
  const { tags } = useTags('company');
  const tagFilter: OptionFilterProps = {
    filterKey: 'tagId',
    label: 'Tag',
    icon: IconTags,
    options: tags.map((tag) => ({ value: tag.id, label: tag.name })),
  };

  return (
    <Filter id="core-companies-filter" sessionKey={COMPANIES_SESSION_KEY}>
      <Filter.Bar>
        <Filter.Popover scope="core-companies-page">
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
        <TotalCount />
      </Filter.Bar>
    </Filter>
  );
};
