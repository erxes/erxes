import {
  CustomersInlineContext,
  useCustomersInlineContext,
} from '../contexts/CustomersInlineContext';
import {
  Avatar,
  AvatarProps,
  cn,
  Combobox,
  isUndefinedOrNull,
  Tooltip,
} from 'erxes-ui';
import { ICustomer } from '../types';
import React, { useEffect, useState } from 'react';
import { useCustomerInline } from '../hooks';

interface CustomersInlineProviderProps {
  children: React.ReactNode;
  customerIds?: string[];
  customers?: ICustomer[];
  placeholder?: string;
  updateCustomers?: (customers: ICustomer[]) => void;
}

const CustomersInlineProvider = ({
  children,
  placeholder,
  customerIds,
  customers,
  updateCustomers,
}: CustomersInlineProviderProps) => {
  const [_customers, _setCustomers] = useState<ICustomer[]>(customers || []);

  const getCustomerTitle = (customer?: ICustomer) => {
    const { firstName, lastName, primaryEmail, primaryPhone } = customer || {};
    const fullName =
      firstName || lastName
        ? `${firstName || ''} ${lastName || ''}`.trim()
        : primaryEmail || primaryPhone || placeholder || 'anonymous customer';
    return fullName;
  };

  return (
    <CustomersInlineContext.Provider
      value={{
        customers: customers || _customers,
        loading: false,
        placeholder: isUndefinedOrNull(placeholder)
          ? 'Select Customers'
          : placeholder,
        updateCustomers: updateCustomers || _setCustomers,
        getCustomerTitle,
      }}
    >
      <Tooltip.Provider>{children}</Tooltip.Provider>
      {customerIds
        ?.filter((id) => !customers?.some((customer) => customer._id === id))
        ?.map((id) => (
          <CustomerInlineEffectComponent key={id} customerId={id} />
        ))}
    </CustomersInlineContext.Provider>
  );
};

const CustomerInlineEffectComponent = ({
  customerId,
}: {
  customerId: string;
}) => {
  const { updateCustomers, customers } = useCustomersInlineContext();
  const { customer } = useCustomerInline({
    variables: {
      _id: customerId,
    },
    skip: !customerId,
  });

  useEffect(() => {
    if (customer) {
      const newCustomers = (customers || []).filter(
        (c) => c._id !== customerId,
      );

      if (newCustomers.some((c) => c._id === customerId)) {
        updateCustomers?.(newCustomers);
        return;
      }
      updateCustomers?.([...newCustomers, { ...customer }]);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customer]);

  return null;
};

const CustomersInlineAvatar = ({ className, ...props }: AvatarProps) => {
  const { customers, loading, customerIds, getCustomerTitle } =
    useCustomersInlineContext();

  if (loading)
    return (
      <div className="flex -space-x-1.5">
        {customerIds?.map((customerId) => (
          <Avatar key={customerId} className={cn('bg-background', className)}>
            <Avatar.Fallback />
          </Avatar>
        ))}
      </div>
    );

  const renderAvatar = (customer?: ICustomer) => {
    return (
      <Tooltip delayDuration={100}>
        <Tooltip.Trigger asChild>
          <Avatar
            key={customer?._id}
            className={cn(
              'bg-background',
              customers && customers.length > 1 && 'ring-2 ring-background',
              className,
            )}
            size="lg"
            {...props}
          >
            <Avatar.Image src={customer?.avatar} />
            <Avatar.Fallback>
              {getCustomerTitle(customer).charAt(0)}
            </Avatar.Fallback>
          </Avatar>
        </Tooltip.Trigger>
        <Tooltip.Content>
          <p>{getCustomerTitle(customer)}</p>
        </Tooltip.Content>
      </Tooltip>
    );
  };

  if (customers?.length === 0) return null;

  if (customers?.length === 1) return renderAvatar(customers[0]);

  const withAvatar = customers?.slice(0, customers.length > 3 ? 2 : 3);
  const restMembers = customers?.slice(withAvatar?.length || 0);

  return (
    <div className="flex -space-x-1.5">
      {withAvatar?.map(renderAvatar)}
      {restMembers && restMembers?.length > 0 && (
        <Tooltip delayDuration={100}>
          <Tooltip.Trigger asChild>
            <Avatar
              key={restMembers?.[0]?._id}
              className={cn('ring-2 ring-background bg-background', className)}
              {...props}
              size="lg"
            >
              <Avatar.Fallback className="bg-primary/10 text-primary">
                +{restMembers.length}
              </Avatar.Fallback>
            </Avatar>
          </Tooltip.Trigger>
          <Tooltip.Content>
            <p>
              {restMembers
                .map((c) => `${c.firstName || ''} ${c.lastName || ''}`)
                .join(', ')}
            </p>
          </Tooltip.Content>
        </Tooltip>
      )}
    </div>
  );
};

const CustomersInlineTitle = ({ className }: { className?: string }) => {
  const { getCustomerTitle, customers, loading, placeholder } =
    useCustomersInlineContext();

  const getDisplayValue = () => {
    if (!customers || customers.length === 0) return;

    if (customers.length === 1) {
      return getCustomerTitle(customers[0]);
    }

    return `${customers.length} customers`;
  };

  return (
    <Combobox.Value
      value={getDisplayValue()}
      loading={loading}
      placeholder={placeholder}
      className={className}
    />
  );
};

const CustomersInlineRoot = React.forwardRef<
  HTMLSpanElement,
  Omit<React.ComponentPropsWithoutRef<'span'>, 'children'> &
    Omit<CustomersInlineProviderProps, 'children'>
>(
  (
    {
      customerIds,
      customers,
      placeholder,
      updateCustomers,
      className,
      ...props
    },
    ref,
  ) => {
    return (
      <CustomersInlineProvider
        customerIds={customerIds}
        customers={customers}
        placeholder={placeholder}
        updateCustomers={updateCustomers}
      >
        <span
          ref={ref}
          {...props}
          className={cn(
            'inline-flex items-center gap-2 overflow-hidden',
            className,
          )}
        >
          <CustomersInlineAvatar />
          <CustomersInlineTitle />
        </span>
      </CustomersInlineProvider>
    );
  },
);

export const CustomersInline = Object.assign(CustomersInlineRoot, {
  Provider: CustomersInlineProvider,
  Avatar: CustomersInlineAvatar,
  Title: CustomersInlineTitle,
});
