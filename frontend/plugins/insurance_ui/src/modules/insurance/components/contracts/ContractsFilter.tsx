import { IconSearch } from '@tabler/icons-react';
import { Combobox, Command, Filter } from 'erxes-ui';

const CONTRACTS_CURSOR_SESSION_KEY = 'contracts-cursor';

export const ContractsFilter = () => {
  return (
    <Filter id="contracts-filter" sessionKey={CONTRACTS_CURSOR_SESSION_KEY}>
      <Filter.Bar>
        <ContractsFilterPopover />
      </Filter.Bar>
    </Filter>
  );
};

export const ContractsFilterPopover = () => {
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
