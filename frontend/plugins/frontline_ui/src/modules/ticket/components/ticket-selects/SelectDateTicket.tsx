import React, { useEffect, useRef, useState } from 'react';
import { format } from 'date-fns';
import { useUpdateTicket } from '@/ticket/hooks/useUpdateTicket';
import {
  RecordTableInlineCell,
  Combobox,
  PopoverScoped,
  Popover,
  Button,
  Form,
  DatePicker,
  useToast,
} from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { IconCalendarPlus, IconCalendarTime } from '@tabler/icons-react';
import { type ApolloError } from '@apollo/client';

export enum DateSelectVariant {
  TABLE = 'table',
  FILTER = 'filter',
  DETAIL = 'detail',
  INPUT = 'input',
  CARD = 'card',
  FORM = 'form',
}

interface DateSelectContextType {
  value?: Date;
  onValueChange: (date?: Date) => void;
  loading?: boolean;
  error?: ApolloError;
  variant: DateSelectVariant;
  disabled?: boolean;
  onClose?: () => void;
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

const toSingleDate = (date: unknown) =>
  date instanceof Date ? date : undefined;

const formatDateLabel = (date: Date) =>
  format(
    date,
    date.getFullYear() === new Date().getFullYear() ? 'MMM d' : 'MMM d, yyyy',
  );

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
  const { t } = useTranslation('frontline');
  const { value } = useDateSelectContext();

  if (!value) {
    return (
      <>
        <IconCalendarPlus className="text-accent-foreground" />
        <span className="text-accent-foreground font-medium">
          {placeholder || t('select-date', 'Select date')}
        </span>
      </>
    );
  }

  return (
    <>
      <IconCalendarTime className="size-4 text-muted-foreground" />
      {formatDateLabel(value)}
    </>
  );
};

const DateSelectContent = () => {
  const { t } = useTranslation('frontline');
  const { value, onValueChange, onClose } = useDateSelectContext();

  return (
    <div
      onKeyDownCapture={(e) => {
        if (e.key === 'Enter') onClose?.();
      }}
    >
      <DatePicker
        inline
        value={value}
        onChange={(date) => onValueChange(toSingleDate(date))}
        placeholder={t('select-date', 'Select date')}
        clearLabel={t('clear', 'Clear')}
        className="h-8"
      />
    </div>
  );
};

export const DateSelectTrigger = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { variant, disabled } = useDateSelectContext();
  if (variant === DateSelectVariant.TABLE) {
    return (
      <RecordTableInlineCell.Trigger>{children}</RecordTableInlineCell.Trigger>
    );
  }
  if (variant === DateSelectVariant.CARD) {
    return (
      <Popover.Trigger asChild disabled={disabled}>
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
    <Combobox.TriggerBase className="w-fit h-7" disabled={disabled}>
      {children}
    </Combobox.TriggerBase>
  );
};

export const DateSelectTicketRoot = ({
  value,
  id,
  type,
  scope,
  variant = DateSelectVariant.TABLE,
  disabled,
  label,
}: {
  value?: Date | string;
  id?: string;
  type: 'startDate' | 'targetDate';
  scope?: string;
  variant?: `${DateSelectVariant}`;
  disabled?: boolean;
  label?: string;
}) => {
  const { t } = useTranslation('frontline');
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const { updateTicket, loading, error } = useUpdateTicket();
  const parsedValue = value ? new Date(value) : undefined;
  const valueTime = parsedValue?.getTime();
  const [dateValue, setDateValue] = useState<Date | undefined>(parsedValue);

  const latestRequestRef = useRef(0);
  const confirmedTimeRef = useRef(valueTime);

  useEffect(() => {
    confirmedTimeRef.current = valueTime;
    setDateValue(valueTime === undefined ? undefined : new Date(valueTime));
  }, [valueTime, id]);

  const commitValue = (nextValue?: Date) => {
    if (nextValue?.getTime() === dateValue?.getTime()) return;

    setDateValue(nextValue);

    if (!id) return;

    const requestId = ++latestRequestRef.current;

    updateTicket({
      variables: {
        _id: id,
        [type]: nextValue ? nextValue.toISOString() : null,
      },
      onError: (e) => {
        toast({
          title: t('error', 'Error'),
          description: e.message,
          variant: 'destructive',
        });

        if (requestId !== latestRequestRef.current) return;

        const confirmedTime = confirmedTimeRef.current;
        setDateValue(
          confirmedTime === undefined ? undefined : new Date(confirmedTime),
        );
      },
    });
  };

  const handleValueChange = (nextValue?: Date) => {
    commitValue(nextValue);
    setOpen(false);
  };

  const Content =
    variant === 'table' ? RecordTableInlineCell.Content : Combobox.Content;

  if (variant === DateSelectVariant.INPUT && label) {
    return (
      <DateSelectProvider
        value={dateValue}
        onValueChange={handleValueChange}
        variant={DateSelectVariant.INPUT}
        loading={loading}
        error={error}
        disabled={disabled}
        onClose={() => setOpen(false)}
      >
        <PopoverScoped open={open} onOpenChange={setOpen} scope={scope}>
          <Combobox.ChipTrigger
            label={label}
            disabled={disabled}
            onClear={
              dateValue && !disabled ? () => commitValue() : undefined
            }
            clearLabel={t('clear', 'Clear')}
          >
            {dateValue ? (
              formatDateLabel(dateValue)
            ) : (
              <span className="text-accent-foreground">
                {t('not-specified', 'Not specified')}
              </span>
            )}
          </Combobox.ChipTrigger>
          <Combobox.Content className="w-fit">
            <DateSelectContent />
          </Combobox.Content>
        </PopoverScoped>
      </DateSelectProvider>
    );
  }

  return (
    <DateSelectProvider
      value={dateValue}
      onValueChange={handleValueChange}
      variant={variant as DateSelectVariant}
      loading={loading}
      error={error}
      disabled={disabled}
      onClose={() => setOpen(false)}
    >
      <PopoverScoped open={open} onOpenChange={setOpen} scope={scope}>
        <DateSelectTrigger>
          <DateSelectValue placeholder={t('not-specified', 'Not specified')} />
        </DateSelectTrigger>
        <Content className="w-fit" onClick={(e) => e.stopPropagation()}>
          <DateSelectContent />
        </Content>
      </PopoverScoped>
    </DateSelectProvider>
  );
};

export const DateSelectTicketFormItem = ({
  value,
  onValueChange,
  placeholder,
  label,
}: {
  value?: Date | string;
  onValueChange?: (value?: Date) => void;
  placeholder?: string;
  label?: string;
}) => {
  const { t } = useTranslation('frontline');
  const [open, setOpen] = useState(false);
  const dateValue = value ? new Date(value) : undefined;

  return (
    <DateSelectProvider
      value={dateValue}
      onValueChange={(date) => {
        onValueChange?.(date);
        setOpen(false);
      }}
      variant={DateSelectVariant.FORM}
      onClose={() => setOpen(false)}
    >
      <Popover open={open} onOpenChange={setOpen}>
        {label ? (
          <Combobox.ChipTrigger
            label={label}
            onClear={dateValue ? () => onValueChange?.() : undefined}
            clearLabel={t('clear', 'Clear')}
          >
            {dateValue ? (
              formatDateLabel(dateValue)
            ) : (
              <span className="text-accent-foreground">
                {t('not-specified', 'Not specified')}
              </span>
            )}
          </Combobox.ChipTrigger>
        ) : (
          <Form.Control>
            <Combobox.TriggerBase className="w-fit h-7">
              <DateSelectValue placeholder={placeholder} />
            </Combobox.TriggerBase>
          </Form.Control>
        )}
        <Popover.Content className="w-fit">
          <DateSelectContent />
        </Popover.Content>
      </Popover>
    </DateSelectProvider>
  );
};

export const SelectDateTicket = Object.assign(DateSelectTicketRoot, {
  Provider: DateSelectProvider,
  Value: DateSelectValue,
  Content: DateSelectContent,
  FormItem: DateSelectTicketFormItem,
});
