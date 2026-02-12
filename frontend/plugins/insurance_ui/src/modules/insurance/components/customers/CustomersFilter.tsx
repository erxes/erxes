import { IconSearch } from '@tabler/icons-react';
import { Combobox, Command, Filter } from 'erxes-ui';

const CUSTOMERS_CURSOR_SESSION_KEY = 'customers-cursor';

export const CustomersFilter = () => {
  return (
    <Filter id="customers-filter" sessionKey={CUSTOMERS_CURSOR_SESSION_KEY}>
      <Filter.Bar>
        <CustomersFilterPopover />
      </Filter.Bar>
    </Filter>
  );
};

export const CustomersFilterPopover = () => {
  return (
    <>
      <Filter.Popover>
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
