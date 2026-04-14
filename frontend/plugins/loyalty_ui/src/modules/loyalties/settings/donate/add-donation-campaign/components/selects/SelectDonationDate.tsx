import { type ApolloError } from '@apollo/client';
import { IconCalendarPlus, IconCalendarTime } from '@tabler/icons-react';
import { format } from 'date-fns';
import {
  Button,
  Calendar,
  Combobox,
  Form,
  Popover,
  PopoverScoped,
  RecordTableInlineCell,
} from 'erxes-ui';
import React, { useState, useMemo } from 'react';

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
}) => {
  return (
    <DateSelectContext.Provider
      value={useMemo(
        () => ({
          ...props,
        }),
        [props],
      )}
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
      <Button
        variant="ghost"
        className="text-muted-foreground font-semibold px-1"
        size="sm"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </Button>
    );
  }
  return (
    <Combobox.TriggerBase className="w-fit h-7">
      {children}
    </Combobox.TriggerBase>
  );
};

export const DateSelectTaskRoot = ({
  value,
  id,
  type,
  scope,
  onValueChange,
  variant = DateSelectVariant.TABLE,
}: {
  value?: Date | string;
  id?: string;
  type: 'startDate' | 'endDate' | 'finishDateOfUse';
  scope?: string;
  onValueChange: (value?: Date) => void;
  variant?: `${DateSelectVariant}`;
}) => {
  const [open, setOpen] = useState(false);

  const handleValueChange = (value?: Date) => {
    onValueChange(value);
    setOpen(false);
  };

  const Content =
    variant === 'table' ? RecordTableInlineCell.Content : Combobox.Content;

  return (
    <DateSelectProvider
      value={value ? new Date(value) : undefined}
      onValueChange={handleValueChange}
      variant={variant as DateSelectVariant}
    >
      <PopoverScoped open={open} onOpenChange={setOpen} scope={scope}>
        <DateSelectTrigger>
          <DateSelectValue placeholder="Not specified" />
        </DateSelectTrigger>
        <Content className="w-auto p-0" onClick={(e) => e.stopPropagation()}>
          <DateSelectContent />
        </Content>
      </PopoverScoped>
    </DateSelectProvider>
  );
};

export const DateSelectTaskFormItem = ({
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
          <Combobox.TriggerBase className="w-full h-8">
            <DateSelectValue placeholder={placeholder} />
          </Combobox.TriggerBase>
        </Form.Control>
        <Popover.Content className="w-auto p-0">
          <DateSelectContent />
        </Popover.Content>
      </Popover>
    </DateSelectProvider>
  );
};

export const DateSelectTask = Object.assign(DateSelectTaskRoot, {
  Provider: DateSelectProvider,
  Value: DateSelectValue,
  Content: DateSelectContent,
  FormItem: DateSelectTaskFormItem,
});
