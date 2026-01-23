import {
  Button,
  Input,
  ScrollArea,
  Separator,
  Sheet,
  Spinner,
  Tooltip,
  cn,
} from 'erxes-ui';
import { IconCheck, IconPlus, IconX } from '@tabler/icons-react';
import { useEffect, useState } from 'react';

import { CustomersInline } from './CustomersInline';
import { ICustomer } from '../types/Customer';
import { useCustomers } from '../hooks/useCustomers';
import { useDebounce } from 'use-debounce';
import { useInView } from 'react-intersection-observer';

interface SelectCustomersProps {
  onSelect: (customerIds: string[], customers?: ICustomer[]) => void;
  children: React.ReactNode;
  customerIds?: string[];
}

interface CustomersListProps {
  selectedCustomerIds: string[];
  setSelectedCustomerIds: React.Dispatch<React.SetStateAction<string[]>>;
  selectedCustomers: ICustomer[];
  setSelectedCustomers: React.Dispatch<React.SetStateAction<ICustomer[]>>;
}

export const SelectCustomersBulk = ({
  onSelect,
  children,
  customerIds,
}: SelectCustomersProps) => {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <Sheet.Trigger asChild>{children}</Sheet.Trigger>

      <Sheet.View className="sm:max-w-5xl">
        <Sheet.Header>
          <Sheet.Title>Select Customers</Sheet.Title>
          <Sheet.Close />
        </Sheet.Header>

        <SelectCustomersBulkContent
          setOpen={setOpen}
          onSelect={onSelect}
          customerIds={customerIds}
        />
      </Sheet.View>
    </Sheet>
  );
};

const SelectCustomersBulkContent = ({
  setOpen,
  onSelect,
  customerIds,
}: {
  setOpen: (open: boolean) => void;
  onSelect: (customerIds: string[], customers?: ICustomer[]) => void;
  customerIds?: string[];
}) => {
  const [selectedCustomerIds, setSelectedCustomerIds] = useState<string[]>([]);
  const [selectedCustomers, setSelectedCustomers] = useState<ICustomer[]>([]);

  useEffect(() => {
    if (customerIds?.length) {
      setSelectedCustomerIds([...new Set(customerIds)]);
    }
  }, [customerIds]);

  const handleSelect = () => {
    onSelect(
      selectedCustomerIds,
      selectedCustomers.filter((c) => selectedCustomerIds.includes(c._id)),
    );
    setOpen(false);
  };

  return (
    <>
      <Sheet.Content className="grid grid-cols-2 overflow-hidden">
        <CustomersList
          selectedCustomerIds={selectedCustomerIds}
          setSelectedCustomerIds={setSelectedCustomerIds}
          selectedCustomers={selectedCustomers}
          setSelectedCustomers={setSelectedCustomers}
        />

        <SelectedCustomersList
          selectedCustomerIds={selectedCustomerIds}
          setSelectedCustomerIds={setSelectedCustomerIds}
          selectedCustomers={selectedCustomers}
          setSelectedCustomers={setSelectedCustomers}
        />
      </Sheet.Content>

      <Sheet.Footer className="sm:justify-end">
        <div className="flex items-center gap-2">
          <Sheet.Close asChild>
            <Button variant="secondary" className="bg-border">
              Cancel
            </Button>
          </Sheet.Close>
          <Button onClick={handleSelect}>{`Set ${selectedCustomerIds.length} customer(s)`}</Button>
        </div>
      </Sheet.Footer>
    </>
  );
};

const CustomersList = ({
  selectedCustomerIds,
  setSelectedCustomerIds,
  selectedCustomers,
  setSelectedCustomers,
}: CustomersListProps) => {
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebounce(search, 500);

  const { customers, handleFetchMore, totalCount } = useCustomers({
    variables: { searchValue: debouncedSearch },
  });

  const { ref: bottomRef } = useInView({
    onChange: (inView) => inView && handleFetchMore(),
  });

  const handleCustomerSelect = (customer: ICustomer) => {
    setSelectedCustomerIds((prev) =>
      prev.includes(customer._id) ? prev : [...prev, customer._id],
    );

    setSelectedCustomers((prev) => {
      if (prev.some((c) => c._id === customer._id)) return prev;
      return [...prev, customer];
    });
  };

  const getCustomerTitle = (customer: ICustomer) => {
    const { firstName, lastName, primaryEmail, primaryPhone } = customer;
    return (
      (firstName || lastName
        ? `${firstName || ''} ${lastName || ''}`.trim()
        : primaryEmail || primaryPhone) || 'anonymous customer'
    );
  };

  return (
    <div className="border-r overflow-hidden flex flex-col">
      <div className="p-4">
        <Input
          placeholder="Search customers"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="text-accent-foreground text-xs mt-4">
          {totalCount} results
        </div>
      </div>

      <Separator />

      <ScrollArea>
        <div className="p-4 flex flex-col gap-1">
          <Tooltip.Provider>
            {customers.map((customer) => {
              const isSelected = selectedCustomerIds.includes(customer._id);

              return (
                <Tooltip key={customer._id}>
                  <Tooltip.Trigger asChild>
                    <Button
                      variant="ghost"
                      className={cn(
                        'min-h-9 h-auto justify-start font-normal',
                        isSelected && 'bg-primary/10',
                      )}
                      onClick={() => handleCustomerSelect(customer)}
                    >
                      {getCustomerTitle(customer)}
                      {isSelected ? (
                        <IconCheck className="ml-auto" />
                      ) : (
                        <IconPlus className="ml-auto" />
                      )}
                    </Button>
                  </Tooltip.Trigger>

                  <Tooltip.Content>
                    <span className="opacity-50">#</span>{' '}
                    {customer.code || customer._id}
                  </Tooltip.Content>
                </Tooltip>
              );
            })}

            {customers.length < totalCount && (
              <div ref={bottomRef} className="flex items-center gap-2 h-8">
                <Spinner />
                <span className="text-accent-foreground animate-pulse">
                  Loading more customers...
                </span>
              </div>
            )}
          </Tooltip.Provider>
        </div>
      </ScrollArea>
    </div>
  );
};

const SelectedCustomersList = ({
  selectedCustomerIds,
  setSelectedCustomerIds,
  selectedCustomers,
  setSelectedCustomers,
}: CustomersListProps) => {
  const handleRemoveCustomer = (customerId: string) => {
    setSelectedCustomerIds((prev) => prev.filter((id) => id !== customerId));
    setSelectedCustomers((prev) => prev.filter((c) => c._id !== customerId));
  };

  return (
    <ScrollArea className="h-full">
      <div className="p-4 flex flex-col gap-1">
        <div className="text-accent-foreground text-xs px-3 mb-1">Added</div>

        {selectedCustomerIds.map((customerId) => {
          return (
            <Button
              key={customerId}
              variant="ghost"
              className="min-h-9 h-auto justify-start font-normal"
              onClick={() => handleRemoveCustomer(customerId)}
            >
              <CustomersInline customerIds={[customerId]} />
              <IconX className="ml-auto" />
            </Button>
          );
        })}
      </div>
    </ScrollArea>
  );
};
