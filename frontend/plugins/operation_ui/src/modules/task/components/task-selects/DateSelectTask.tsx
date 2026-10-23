import { useTranslation } from 'react-i18next';
import { useUpdateTask } from '@/task/hooks/useUpdateTask';
import { type ApolloError } from '@apollo/client';
import { IconCalendarPlus, IconCalendarTime } from '@tabler/icons-react';
import { format } from 'date-fns';
import {
  Button,
  Combobox,
  DatePicker,
  Form,
  Popover,
  PopoverScoped,
  RecordTableInlineCell,
} from 'erxes-ui';
import React, { useEffect, useRef, useState } from 'react';

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
}) => {
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
  const { t } = useTranslation('operation');
  const { value } = useDateSelectContext();

  if (!value) {
    return (
      <>
        <IconCalendarPlus className="text-accent-foreground" />
        <span className="text-accent-foreground font-medium">
          {placeholder || t('select-date')}
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

const DateSelectChipValue = ({ value }: { value?: Date }) => {
  const { t } = useTranslation('operation');

  if (!value) {
    return <span className="text-accent-foreground">{t('not-specified')}</span>;
  }

  return <>{formatDateLabel(value)}</>;
};

const DateSelectContent = () => {
  const { t } = useTranslation('operation');
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
        placeholder={t('select-date')}
        clearLabel={t('clear')}
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

export const DateSelectTaskRoot = ({
  value,
  id,
  type,
  scope,
  variant = DateSelectVariant.TABLE,
  label,
}: {
  value?: Date | string | null;
  id?: string;
  type: 'startDate' | 'targetDate';
  scope?: string;
  variant?: `${DateSelectVariant}`;
  label?: string;
}) => {
  const { t } = useTranslation('operation');
  const [open, setOpen] = useState(false);
  const { updateTask, loading, error } = useUpdateTask();
  const valueTime = value ? new Date(value).getTime() : undefined;
  const [dateValue, setDateValue] = useState<Date | undefined>(
    valueTime === undefined ? undefined : new Date(valueTime),
  );

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

    updateTask({
      variables: {
        _id: id,
        [type]: nextValue ? nextValue.toISOString() : null,
      },
      onError: () => {
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

  return (
    <DateSelectProvider
      value={dateValue}
      onValueChange={handleValueChange}
      variant={variant as DateSelectVariant}
      loading={loading}
      error={error}
      onClose={() => setOpen(false)}
    >
      <PopoverScoped open={open} onOpenChange={setOpen} scope={scope}>
        {variant === DateSelectVariant.INPUT && label ? (
          <Combobox.ChipTrigger
            label={label}
            onClear={dateValue ? () => commitValue() : undefined}
            clearLabel={t('clear')}
          >
            <DateSelectChipValue value={dateValue} />
          </Combobox.ChipTrigger>
        ) : (
          <DateSelectTrigger>
            <DateSelectValue
              placeholder={
                variant === DateSelectVariant.INPUT
                  ? t(type === 'startDate' ? 'start-date' : 'due-date')
                  : t('not-specified')
              }
            />
          </DateSelectTrigger>
        )}
        <Content className="w-fit" onClick={(e) => e.stopPropagation()}>
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
  label,
  variant = DateSelectVariant.FORM,
}: {
  value?: Date | string | null;
  onValueChange?: (value?: Date) => void;
  placeholder?: string;
  label?: string;
  // `table` draws it as a record table cell, as in the side panel.
  variant?: `${DateSelectVariant}`;
}) => {
  const { t } = useTranslation('operation');
  const [open, setOpen] = useState(false);
  const dateValue = value ? new Date(value) : undefined;

  return (
    <DateSelectProvider
      value={dateValue}
      onValueChange={(date) => {
        onValueChange?.(date);
        setOpen(false);
      }}
      variant={variant as DateSelectVariant}
      onClose={() => setOpen(false)}
    >
      <Popover open={open} onOpenChange={setOpen}>
        {variant === DateSelectVariant.TABLE ? (
          <DateSelectTrigger>
            <DateSelectValue placeholder={placeholder || t('not-specified')} />
          </DateSelectTrigger>
        ) : label ? (
          <Combobox.ChipTrigger
            label={label}
            onClear={dateValue ? () => onValueChange?.() : undefined}
            clearLabel={t('clear')}
          >
            <DateSelectChipValue value={dateValue} />
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

export const DateSelectTask = Object.assign(DateSelectTaskRoot, {
  Provider: DateSelectProvider,
  Value: DateSelectValue,
  Content: DateSelectContent,
  FormItem: DateSelectTaskFormItem,
});
