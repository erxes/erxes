import React, { useState } from 'react';
import { format } from 'date-fns';
import {
  Calendar,
  RecordTableInlineCell,
  Combobox,
  PopoverScoped,
  Popover,
  Button,
  Form,
} from 'erxes-ui';
import {
  IconCalendarPlus,
  IconCalendarTime,
  IconAlertCircleFilled,
} from '@tabler/icons-react';
import { type ApolloError } from '@apollo/client';
import { useDealsEdit } from '@/deals/cards/hooks/useDeals';

export enum DateSelectVariant {
  TABLE = 'table',
  FILTER = 'filter',
  DETAIL = 'detail',
  CARD = 'card',
  FORM = 'form',
}

interface DateSelectContextType {
  value?: Date;
  onValueChange: (date?: Date) => void;
  loading?: boolean;
  error?: ApolloError;
  variant: DateSelectVariant;
}

const DateSelectContext = React.createContext<DateSelectContextType | null>(
  null,
);

const useDateSelectContext = () => {
  const context = React.useContext(DateSelectContext);
  if (!context) {
    throw new Error(
      'useDateSelectContext must be used within DateSelectProvider',
    );
  }
  return context;
};

export const DateSelectProvider = ({
  children,
  ...props
}: DateSelectContextType & {
  children: React.ReactNode;
} & DateSelectContextType) => {
  return (
    <DateSelectContext.Provider
      value={{
        ...props,
      }}
    >
      {children}
    </DateSelectContext.Provider>
  );
};

const DateSelectValue = ({ placeholder }: { placeholder?: string }) => {
  const { value } = useDateSelectContext();

  if (!value) {
    return (
      <>
        <IconCalendarPlus className="text-accent-foreground" />
        <span className="text-accent-foreground font-medium">
          {placeholder || 'Select date...'}
        </span>
      </>
    );
  }

  return (
    <>
      <IconCalendarTime className="size-4 text-muted-foreground" />
      {format(
        value,
        value.getFullYear() === new Date().getFullYear()
          ? 'MMM d'
          : 'MMM d, yyyy',
      )}
    </>
  );
};

const DateSelectContent = () => {
  const { value, onValueChange } = useDateSelectContext();

  return (
    <Calendar
      mode="single"
      selected={value}
      onSelect={onValueChange}
      defaultMonth={value}
    />
  );
};

export const DateSelectTrigger = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { variant } = useDateSelectContext();
  if (variant === DateSelectVariant.TABLE) {
    return (
      <RecordTableInlineCell.Trigger>{children}</RecordTableInlineCell.Trigger>
    );
  }
  if (variant === DateSelectVariant.CARD) {
    return (
      <Popover.Trigger asChild>
        <Button
          variant="ghost"
          className="text-muted-foreground font-semibold px-1"
          size="sm"
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </Button>
      </Popover.Trigger>
    );
  }
  return (
    <Combobox.TriggerBase className="w-fit h-7">
      {children}
    </Combobox.TriggerBase>
  );
};

export const DateSelectDealRoot = ({
  value,
  id,
  type,
  scope,
  variant = DateSelectVariant.TABLE,
  placeholder,
}: {
  value?: Date | string;
  id?: string;
  type: 'startDate' | 'closeDate';
  scope?: string;
  variant?: `${DateSelectVariant}`;
  placeholder?: string;
}) => {
  const [open, setOpen] = useState(false);
  const { editDeals, loading, error } = useDealsEdit();
  const closeDate = type === 'closeDate';
  const now = new Date();
  const dateValue = value ? new Date(value) : undefined;
  const closeDateValue = closeDate && dateValue;
  const isEnded = closeDateValue && closeDateValue < now;
  const formatted =
    dateValue &&
    dateValue.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });

  const endedDiff = closeDateValue
    ? Math.floor(
        (now.getTime() - closeDateValue.getTime()) / (1000 * 60 * 60 * 24),
      )
    : 0;
  const handleValueChange = (value?: Date) => {
    if (id) {
      editDeals({
        variables: {
          _id: id,
          [type]: value?.toISOString(),
        },
      });
    }
    setOpen(false);
  };

  const Content =
    variant === 'table' ? RecordTableInlineCell.Content : Combobox.Content;
  if (isEnded) {
    return (
      <>
        <DateSelectProvider
          value={dateValue}
          onValueChange={handleValueChange}
          variant={variant as DateSelectVariant}
          loading={loading}
          error={error}
        >
          <PopoverScoped open={open} onOpenChange={setOpen} scope={scope}>
            <DateSelectTrigger>
              <div className="text-sm bg-yellow-50 text-yellow-400 px-2 py-1 rounded flex items-center gap-1">
                <IconAlertCircleFilled className="size-4" />
                Ended {endedDiff} {endedDiff === 1 ? 'day' : 'days'} ago{' '}
                {formatted && `(${formatted})`}
              </div>
            </DateSelectTrigger>
            <Content className="w-fit" onClick={(e) => e.stopPropagation()}>
              <DateSelectContent />
            </Content>
          </PopoverScoped>
        </DateSelectProvider>
      </>
    );
  }
  return (
    <DateSelectProvider
      value={dateValue}
      onValueChange={handleValueChange}
      variant={variant as DateSelectVariant}
      loading={loading}
      error={error}
    >
      <PopoverScoped open={open} onOpenChange={setOpen} scope={scope}>
        <DateSelectTrigger>
          <DateSelectValue placeholder={placeholder} />
        </DateSelectTrigger>
        <Content className="w-fit" onClick={(e) => e.stopPropagation()}>
          <DateSelectContent />
        </Content>
      </PopoverScoped>
    </DateSelectProvider>
  );
};

export const DateSelectDealFormItem = ({
  value,
  onValueChange,
  placeholder,
}: {
  value?: Date | string;
  onValueChange?: (value?: Date) => void;
  placeholder?: string;
}) => {
  return (
    <DateSelectProvider
      value={value ? new Date(value) : undefined}
      onValueChange={(date) => onValueChange?.(date)}
      variant={DateSelectVariant.FORM}
    >
      <Popover>
        <Form.Control>
          <Combobox.TriggerBase className="w-fit h-7">
            <DateSelectValue placeholder={placeholder} />
          </Combobox.TriggerBase>
        </Form.Control>
        <Popover.Content className="w-fit">
          <DateSelectContent />
        </Popover.Content>
      </Popover>
    </DateSelectProvider>
  );
};

export const DateSelectDeal = Object.assign(DateSelectDealRoot, {
  Provider: DateSelectProvider,
  Value: DateSelectValue,
  Content: DateSelectContent,
  FormItem: DateSelectDealFormItem,
});
