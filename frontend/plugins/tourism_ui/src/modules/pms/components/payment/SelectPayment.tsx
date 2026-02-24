import {
  SelectPaymentContext,
  useSelectPaymentContext,
} from '@/pms/components/payment/contexts/SelectPaymentContext';
import { IconPlus } from '@tabler/icons-react';
import {
  Button,
  Combobox,
  Command,
  Form,
  Popover,
  PopoverScoped,
  RecordTableInlineCell,
  cn,
} from 'erxes-ui';

import { Payment, usePayments } from '@/pms/hooks/usePayments';
import React, { useState } from 'react';
import { useDebounce } from 'use-debounce';

const SelectPaymentProvider = ({
  children,
  mode = 'single',
  value,
  onValueChange,
  payments,
  setOpen,
}: {
  children: React.ReactNode;
  mode?: 'single' | 'multiple';
  value?: string[] | string;
  onValueChange?: (value: string[] | string | null) => void;
  payments?: Payment[];
  setOpen?: (open: boolean) => void;
}) => {
  const [currentPayments, setCurrentPayments] = useState<Payment[]>(
    payments || [],
  );
  const isSingleMode = mode === 'single';

  const onSelect = (payment: Payment | null) => {
    if (!payment) {
      setCurrentPayments([]);
      onValueChange?.(mode === 'single' ? null : []);
      setOpen?.(false);
      return;
    }
    if (isSingleMode) {
      setCurrentPayments([payment]);
      setOpen?.(false);
      return onValueChange?.(payment._id);
    }
    const arrayValue = Array.isArray(value) ? value : [];

    const isPaymentSelected = arrayValue.includes(payment._id);
    const newSelectedPaymentIds = isPaymentSelected
      ? arrayValue.filter((id) => id !== payment._id)
      : [...arrayValue, payment._id];

    setCurrentPayments((prev) =>
      [...prev, payment].filter((p) => newSelectedPaymentIds.includes(p._id)),
    );
    onValueChange?.(newSelectedPaymentIds);
  };

  const selectedIds = Array.isArray(value) ? value : (value && [value]) || [];

  return (
    <SelectPaymentContext.Provider
      value={{
        paymentIds: selectedIds,
        onSelect,
        payments: currentPayments,
        setPayments: setCurrentPayments,
        loading: currentPayments.length !== selectedIds.length,
      }}
    >
      {children}
    </SelectPaymentContext.Provider>
  );
};

const PaymentInline = ({
  payments,
  paymentIds,
  placeholder,
  updatePayments,
}: {
  payments?: Payment[];
  paymentIds?: string[];
  placeholder?: string;
  updatePayments?: (payments: Payment[]) => void;
}) => {
  const { payments: fetchedPayments, loading } = usePayments({
    status: 'active',
  });

  React.useEffect(() => {
    if (!paymentIds?.length || !fetchedPayments.length) return;

    const paymentsOutOfSync =
      !payments?.length ||
      payments.length !== paymentIds.length ||
      !paymentIds.every((id) => payments.some((p) => p._id === id));

    if (paymentsOutOfSync) {
      const matchedPayments = fetchedPayments.filter((p) =>
        paymentIds.includes(p._id),
      );
      if (matchedPayments.length > 0) {
        updatePayments?.(matchedPayments);
      }
    }
  }, [paymentIds, fetchedPayments, payments, updatePayments]);

  if (loading && paymentIds?.length && !payments?.length) {
    return <span className="text-sm text-muted-foreground">Loading...</span>;
  }

  if (!payments?.length) {
    return (
      <span className="text-sm text-muted-foreground">
        {placeholder || 'Select payment'}
      </span>
    );
  }

  return (
    <div className="flex flex-wrap gap-1 items-center">
      {payments.map((payment) => (
        <span
          key={payment._id}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-accent text-sm"
        >
          {payment.name}
        </span>
      ))}
    </div>
  );
};

const SelectPaymentValue = ({ placeholder }: { placeholder?: string }) => {
  const { paymentIds, payments, setPayments } = useSelectPaymentContext();
  return (
    <PaymentInline
      paymentIds={paymentIds}
      payments={payments}
      updatePayments={setPayments}
      placeholder={placeholder}
    />
  );
};

const SelectPaymentCommandItem = ({ payment }: { payment: Payment }) => {
  const { onSelect, paymentIds } = useSelectPaymentContext();

  return (
    <Command.Item
      value={payment._id}
      onSelect={() => {
        onSelect(payment);
      }}
    >
      <div className="flex gap-2 items-center">
        <span>{payment.name}</span>
        {payment.kind && (
          <span className="text-xs text-muted-foreground">
            ({payment.kind})
          </span>
        )}
      </div>
      <Combobox.Check checked={paymentIds.includes(payment._id)} />
    </Command.Item>
  );
};

const SelectPaymentContent = () => {
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebounce(search, 300);
  const { paymentIds, payments: selectedPayments } = useSelectPaymentContext();
  const { payments, loading, error } = usePayments({ status: 'active' });

  const filteredPayments = React.useMemo(() => {
    if (!debouncedSearch) return payments;
    return payments.filter((p) =>
      p.name.toLowerCase().includes(debouncedSearch.toLowerCase()),
    );
  }, [payments, debouncedSearch]);

  return (
    <Command shouldFilter={false}>
      <Command.Input
        value={search}
        onValueChange={setSearch}
        variant="secondary"
        wrapperClassName="flex-auto"
        focusOnMount
        placeholder="Search payments..."
      />
      <Command.List className="max-h-[300px] overflow-y-auto">
        <Combobox.Empty loading={loading} error={error} />
        {selectedPayments.length > 0 && (
          <>
            {selectedPayments.map((payment) => (
              <SelectPaymentCommandItem key={payment._id} payment={payment} />
            ))}
            <Command.Separator className="my-1" />
          </>
        )}

        {!loading &&
          filteredPayments
            .filter((payment) => !paymentIds.includes(payment._id))
            .map((payment) => (
              <SelectPaymentCommandItem key={payment._id} payment={payment} />
            ))}
      </Command.List>
    </Command>
  );
};

export const SelectPaymentFormItem = ({
  onValueChange,
  className,
  placeholder,
  ...props
}: Omit<React.ComponentProps<typeof SelectPaymentProvider>, 'children'> & {
  className?: string;
  placeholder?: string;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <SelectPaymentProvider
      onValueChange={(value) => {
        onValueChange?.(value);
        props.mode !== 'multiple' && setOpen(false);
      }}
      {...props}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <Form.Control>
          <Combobox.Trigger className={cn('w-full shadow-xs', className)}>
            <SelectPaymentValue placeholder={placeholder} />
          </Combobox.Trigger>
        </Form.Control>

        <Combobox.Content>
          <SelectPaymentContent />
        </Combobox.Content>
      </Popover>
    </SelectPaymentProvider>
  );
};

export const SelectPaymentInlineCell = React.forwardRef<
  React.ComponentRef<typeof RecordTableInlineCell.Trigger>,
  Omit<React.ComponentProps<typeof SelectPaymentProvider>, 'children'> &
    React.ComponentProps<typeof RecordTableInlineCell.Trigger> & {
      scope?: string;
      placeholder?: string;
    }
>(
  (
    {
      mode,
      value,
      onValueChange,
      payments,
      scope,
      placeholder,
      className,
      ...props
    },
    ref,
  ) => {
    const [open, setOpen] = useState(false);
    return (
      <SelectPaymentProvider
        mode={mode}
        value={value}
        onValueChange={onValueChange}
        payments={payments}
        setOpen={setOpen}
      >
        <PopoverScoped scope={scope} open={open} onOpenChange={setOpen}>
          <RecordTableInlineCell.Trigger
            ref={ref}
            {...props}
            className={cn(className, 'text-xs')}
          >
            <SelectPaymentValue placeholder={placeholder ?? ''} />
          </RecordTableInlineCell.Trigger>
          <RecordTableInlineCell.Content>
            <SelectPaymentContent />
          </RecordTableInlineCell.Content>
        </PopoverScoped>
      </SelectPaymentProvider>
    );
  },
);

SelectPaymentInlineCell.displayName = 'SelectPaymentInlineCell';

export const SelectPaymentDetail = ({
  onValueChange,
  className,
  placeholder,
  value,
  ...props
}: Omit<React.ComponentProps<typeof SelectPaymentProvider>, 'children'> & {
  className?: string;
  placeholder?: string;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <SelectPaymentProvider
      value={value}
      onValueChange={(value) => {
        onValueChange?.(value);
        setOpen(false);
      }}
      {...props}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <Popover.Trigger asChild>
          {value ? (
            <Button variant="ghost" className="inline-flex w-full">
              <SelectPaymentValue />
            </Button>
          ) : (
            <Combobox.TriggerBase className="font-medium">
              Add Payment <IconPlus />
            </Combobox.TriggerBase>
          )}
        </Popover.Trigger>
        <Combobox.Content>
          <SelectPaymentContent />
        </Combobox.Content>
      </Popover>
    </SelectPaymentProvider>
  );
};

export const SelectPaymentRoot = ({
  onValueChange,
  className,
  placeholder,
  scope,
  ...props
}: Omit<React.ComponentProps<typeof SelectPaymentProvider>, 'children'> & {
  className?: string;
  placeholder?: string;
  scope?: string;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <SelectPaymentProvider
      onValueChange={onValueChange}
      setOpen={setOpen}
      {...props}
    >
      <PopoverScoped open={open} onOpenChange={setOpen} scope={scope}>
        <Combobox.Trigger
          className={cn('inline-flex w-full', className)}
          variant="outline"
        >
          <SelectPaymentValue placeholder={placeholder} />
        </Combobox.Trigger>
        <Combobox.Content>
          <SelectPaymentContent />
        </Combobox.Content>
      </PopoverScoped>
    </SelectPaymentProvider>
  );
};

export const SelectPayment = Object.assign(SelectPaymentRoot, {
  Provider: SelectPaymentProvider,
  Value: SelectPaymentValue,
  Content: SelectPaymentContent,
  CommandItem: SelectPaymentCommandItem,
  FormItem: SelectPaymentFormItem,
  InlineCell: SelectPaymentInlineCell,
  Detail: SelectPaymentDetail,
});
