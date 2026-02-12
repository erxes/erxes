import { IconSearch } from '@tabler/icons-react';
import { Combobox, Command, Filter } from 'erxes-ui';

const VENDORS_CURSOR_SESSION_KEY = 'vendors-cursor';

export const VendorsFilter = () => {
  return (
    <Filter id="vendors-filter" sessionKey={VENDORS_CURSOR_SESSION_KEY}>
      <Filter.Bar>
        <VendorsFilterPopover />
      </Filter.Bar>
    </Filter>
  );
};

export const VendorsFilterPopover = () => {
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
