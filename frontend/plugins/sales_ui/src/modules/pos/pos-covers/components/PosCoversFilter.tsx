import { IconLabel, IconSearch } from '@tabler/icons-react';
import {
  Combobox,
  Command,
  Filter,
  useFilterQueryState,
  useMultiQueryState,
} from 'erxes-ui';
import { SelectMember, TagsFilter, SelectBrand } from 'ui-modules';
import { useIsPosCoverLeadSessionKey } from '@/pos/pos-covers/hooks/UsePosCoverLeadSessionKey';
import { PosCoverHotKeyScope } from '@/pos/pos-covers/types/posHotkeyScope';
import { PosCoverItemTotalCount } from '@/pos/pos-covers/components/PosCoverItemTotalCount';

const PosFilterPopover = () => {
  const [queries] = useMultiQueryState<{
    tags: string[];
    searchValue: string;
    brand: string;
  }>(['tags', 'searchValue', 'brand']);

  const hasFilters = Object.values(queries || {}).some(
    (value) => value !== null,
  );

  return (
    <>
      <Filter.Popover scope={PosCoverHotKeyScope.PosPage}>
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
                <TagsFilter />
                <Filter.Item value="brand">
                  <IconLabel />
                  Brand
                </Filter.Item>
                <SelectMember.FilterItem />
              </Command.List>
            </Command>
          </Filter.View>
          <SelectMember.FilterView />
          <SelectBrand.FilterView />
        </Combobox.Content>
      </Filter.Popover>
    </>
  );
};

export const PosCoversFilter = () => {
  const [searchValue] = useFilterQueryState<string>('searchValue');
  const { sessionKey } = useIsPosCoverLeadSessionKey();

  return (
    <Filter id="pos-cover-filter" sessionKey={sessionKey}>
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
        <TagsFilter.Bar tagType="core:pos" />

        <SelectMember.FilterBar />
        <SelectBrand.FilterBar />
        <PosFilterPopover />
        <PosCoverItemTotalCount />
      </Filter.Bar>
    </Filter>
  );
};
