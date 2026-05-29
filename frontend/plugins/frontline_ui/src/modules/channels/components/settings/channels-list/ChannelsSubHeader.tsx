import {
  Combobox,
  Command,
  Filter,
  PageSubHeader,
  useMultiQueryState,
} from 'erxes-ui';

export const ChannelsSubHeader = () => {
  const [queries] = useMultiQueryState<{ searchValue?: string }>([
    'searchValue',
  ]);

  const hasFilters = Object.values(queries || {}).some((v) => v !== null);

  return (
    <PageSubHeader>
      <Filter id="channels-filter">
        <Filter.Popover scope="channels-settings-page">
          <Filter.Trigger isFiltered={hasFilters} />
          <Combobox.Content>
            <Filter.View>
              <Command>
                <Filter.CommandInput
                  placeholder="Filter..."
                  variant="secondary"
                  className="bg-background"
                />
                <Command.List className="p-1">
                  <Filter.SearchValueTrigger />
                </Command.List>
              </Command>
            </Filter.View>
          </Combobox.Content>
        </Filter.Popover>
        <Filter.Dialog>
          <Filter.DialogStringView filterKey="searchValue" />
        </Filter.Dialog>
        <Filter.SearchValueBarItem />
      </Filter>
    </PageSubHeader>
  );
};
