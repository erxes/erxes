import { IconPhone } from '@tabler/icons-react';
import {
  Button,
  Combobox,
  Command,
  DropdownMenu,
  formatPhoneNumber,
  Input,
  Separator,
} from 'erxes-ui';
import { useState } from 'react';
import { CustomersInline, useCustomers } from 'ui-modules';
import { useDebounce } from 'use-debounce';
import { useSetAtom } from 'jotai';
import { callUiAtom } from '@/integrations/call/states/callUiAtom';
import { callNumberState } from '@/integrations/call/states/callWidgetStates';

export const CallContacts = () => {
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebounce(search, 500);
  const setCallUi = useSetAtom(callUiAtom);
  const setPhone = useSetAtom(callNumberState);
  const {
    customers: customersData,
    loading,
    handleFetchMore,
    totalCount,
  } = useCustomers({
    variables: {
      searchValue: debouncedSearch,
    },
  });
  return (
    <Command>
      <div className="p-3">
        <Command.Input
          asChild
          wrapperClassName="border-b-0"
          className="h-7"
          value={search}
          onValueChange={setSearch}
        >
          <Input variant="secondary" />
        </Command.Input>
      </div>
      <Separator />
      <Command.List className="p-3 flex-auto max-h-full h-96 overflow-auto">
        <Command.Empty />
        {!loading &&
          customersData.map((customer) => (
            <Command.Item key={customer._id} value={customer._id}>
              <CustomersInline
                customers={[customer]}
                placeholder="Unnamed customer"
              />
              {[customer.primaryPhone, ...(customer.phones || [])].filter(
                (phone) => phone,
              ).length > 0 && (
                <DropdownMenu>
                  <DropdownMenu.Trigger asChild>
                    <Button variant="secondary" className="ml-auto" size="icon">
                      <IconPhone />
                    </Button>
                  </DropdownMenu.Trigger>
                  <DropdownMenu.Content>
                    {[customer.primaryPhone, ...(customer.phones || [])].map(
                      (phone) => (
                        <DropdownMenu.Item
                          onClick={() => {
                            setCallUi('keypad');
                            setPhone(phone || '');
                          }}
                          key={phone}
                        >
                          {formatPhoneNumber({
                            value: phone || '',
                            defaultCountry: 'MN',
                          })}
                        </DropdownMenu.Item>
                      ),
                    )}
                  </DropdownMenu.Content>
                </DropdownMenu>
              )}
            </Command.Item>
          ))}
        {!loading && (
          <Combobox.FetchMore
            fetchMore={handleFetchMore}
            currentLength={customersData.length}
            totalCount={totalCount}
          />
        )}
      </Command.List>
    </Command>
  );
};
