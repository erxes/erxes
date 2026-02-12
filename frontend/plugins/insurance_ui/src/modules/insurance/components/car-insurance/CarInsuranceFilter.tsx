import { IconSearch } from '@tabler/icons-react';
import { Combobox, Command, Filter } from 'erxes-ui';

const CAR_INSURANCE_CURSOR_SESSION_KEY = 'car-insurance-cursor';

export const CarInsuranceFilter = () => {
  return (
    <Filter id="car-insurance-filter" sessionKey={CAR_INSURANCE_CURSOR_SESSION_KEY}>
      <Filter.Bar>
        <CarInsuranceFilterPopover />
      </Filter.Bar>
    </Filter>
  );
};

export const CarInsuranceFilterPopover = () => {
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
