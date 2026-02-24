import { IconSearch } from '@tabler/icons-react';
import { Combobox, Command, Filter } from 'erxes-ui';
import { CategoryHotKeyScope } from '../types/CategoryHotKeyScope';

export const CategoryFilter = () => {
  return (
    <Filter id="products-filter">
      <Filter.Bar>
        <CategoriesFilterPopover />
      </Filter.Bar>
    </Filter>
  );
};

export const CategoriesFilterPopover = () => {
  return (
    <>
      <Filter.Popover scope={CategoryHotKeyScope.CategoriesPage}>
        <Filter.Trigger />
        <Combobox.Content>
          <Filter.View>
            <Command>
              <Filter.CommandInput placeholder="Filter" variant="secondary" />

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
