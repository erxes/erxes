import { IconSearch } from '@tabler/icons-react';
import { Combobox, Command, Filter } from 'erxes-ui';

const RISKS_CURSOR_SESSION_KEY = 'risks-cursor';

export const RisksFilter = () => {
  return (
    <Filter id="risks-filter" sessionKey={RISKS_CURSOR_SESSION_KEY}>
      <Filter.Bar>
        <RisksFilterPopover />
      </Filter.Bar>
    </Filter>
  );
};

export const RisksFilterPopover = () => {
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
