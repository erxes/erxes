import React, { useState } from 'react';
import { format } from 'date-fns';
import { useUpdateCycle } from '@/cycle/hooks/useUpdateCycle';
import {
  Calendar,
  RecordTableInlineCell,
  Popover,
  cn,
  Filter,
  Form,
  useFilterContext,
  useQueryState,
  Combobox,
  Button,
  PopoverScoped,
} from 'erxes-ui';
import {
  IconCalendarQuestion,
  IconCalendarTime,
  IconCalendarUp,
} from '@tabler/icons-react';
import { CycleHotKeyScope } from '@/cycle/CycleHotkeyScope';

interface DateSelectContextType {
  value?: Date;
  onSelect: (date?: Date) => void;
  loading: boolean;
  error: any;
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
  value,
  onValueChange,
}: {
  children: React.ReactNode;
  value?: Date;
  onValueChange: (value?: Date) => void;
}) => {
  const onSelect = (date?: Date) => {
    onValueChange?.(date);
  };

  return (
    <DateSelectContext.Provider
      value={{
        value,
        onSelect,
        loading: false,
        error: null,
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
      <span className="text-accent-foreground/80">
        {placeholder || 'Select date...'}
      </span>
    );
  }

  return (
    <span className="flex items-center justify-center gap-2">
      <IconCalendarTime className="size-4 text-muted-foreground" />
      {format(value, 'MMM d, yyyy')}
    </span>
  );
};

const DateSelectFormItemValue = ({
  placeholder,
  type,
}: {
  placeholder?: string;
  type?: 'start' | 'end';
}) => {
  const { value } = useDateSelectContext();

  if (!value) {
    return (
      <span className="text-muted-foreground font-medium text-base flex items-center justify-center gap-2 ">
        {type === 'start' ? (
          <IconCalendarUp className="size-4" />
        ) : (
          <IconCalendarQuestion className="size-4" />
        )}
        {placeholder || 'Select date'}
      </span>
    );
  }

  return (
    <span className="flex items-center justify-center gap-2">
      <IconCalendarTime className="size-4 text-muted-foreground" />
      <p className="font-medium text-base text-foreground">
        {format(value, 'MMM d, yyyy')}
      </p>
    </span>
  );
};
const DateSelectContent = ({ startDate }: { startDate?: Date }) => {
  const { value, onSelect } = useDateSelectContext();

  return (
    <Calendar
      mode="single"
      selected={value}
      onSelect={onSelect}
      defaultMonth={value}
      disabled={startDate ? { before: startDate } : undefined}
    />
  );
};

export const DateSelectFilterItem = () => {
  return (
    <Filter.Item value="Date">
      <IconCalendarTime />
      Date
    </Filter.Item>
  );
};

export const DateSelectFilterView = ({
  onValueChange,
  queryKey,
}: {
  onValueChange?: (value?: Date) => void;
  queryKey?: string;
}) => {
  const [date, setDate] = useQueryState<string>(queryKey || 'Date');
  const { resetFilterState } = useFilterContext();

  const dateValue = date ? new Date(date) : undefined;

  return (
    <Filter.View filterKey={queryKey || 'Date'}>
      <DateSelectProvider
        value={dateValue}
        onValueChange={(value) => {
          setDate(value?.toISOString() || null);
          resetFilterState();
          onValueChange?.(value);
        }}
      >
        <div className="w-fit">
          <DateSelectContent />
        </div>
      </DateSelectProvider>
    </Filter.View>
  );
};

export const DateSelectFilterBar = ({
  iconOnly,
  onValueChange,
  queryKey,
}: {
  iconOnly?: boolean;
  onValueChange?: (value?: Date) => void;
  queryKey?: string;
}) => {
  const [date, setDate] = useQueryState<string>(queryKey || 'Date');
  const [open, setOpen] = useState(false);

  if (!date) return null;

  const dateValue = new Date(date);

  return (
    <Filter.BarItem>
      <Filter.BarName>
        <IconCalendarTime />
        {!iconOnly && ' Date'}
      </Filter.BarName>
      <DateSelectProvider
        value={dateValue}
        onValueChange={(value) => {
          if (value) {
            setDate(value.toISOString());
          } else {
            setDate(null);
          }
          setOpen(false);
          onValueChange?.(value);
        }}
      >
        <Popover open={open} onOpenChange={setOpen}>
          <Combobox.TriggerBase asChild>
            <Filter.BarButton filterKey={queryKey || 'Date'}>
              <DateSelectValue />
            </Filter.BarButton>
          </Combobox.TriggerBase>
          <Popover.Content className="w-fit">
            <DateSelectContent />
          </Popover.Content>
        </Popover>
      </DateSelectProvider>
      <Filter.BarClose filterKey={queryKey || 'Date'} />
    </Filter.BarItem>
  );
};

type DateSelectInlineCellBaseProps = {
  id?: string;
  onValueChange?: (value?: Date) => void;
  scope?: string;
  value?: Date;
};

type StartProps = DateSelectInlineCellBaseProps & {
  type: 'start';
  startDate?: Date;
};

type EndProps = DateSelectInlineCellBaseProps & {
  type: 'end';
  startDate: Date | undefined;
};

type DateSelectInlineCellProps = StartProps | EndProps;

export const DateSelectInlineCell = ({
  value,
  id,
  onValueChange,
  scope,
  type,
  startDate,
}: DateSelectInlineCellProps) => {
  const { updateCycle } = useUpdateCycle();
  const [open, setOpen] = useState(false);
  const handleValueChange = (value?: Date) => {
    if (id) {
      updateCycle({
        variables: {
          _id: id,
          startDate: type === 'start' ? value?.toISOString() : undefined,
          endDate: type === 'end' ? value?.toISOString() : undefined,
        },
      });
    }
    onValueChange?.(value);
    setOpen(false);
  };

  const finalScope =
    scope ||
    (id ? `${CycleHotKeyScope.CycleTableCell}.${id}.${type}Date` : undefined);

  return (
    <DateSelectProvider value={value} onValueChange={handleValueChange}>
      <PopoverScoped
        open={open}
        onOpenChange={setOpen}
        scope={finalScope}
        closeOnEnter
      >
        <RecordTableInlineCell.Trigger>
          <DateSelectValue placeholder="not specified" />
        </RecordTableInlineCell.Trigger>
        <RecordTableInlineCell.Content className="w-fit">
          <DateSelectContent startDate={startDate} />
        </RecordTableInlineCell.Content>
      </PopoverScoped>
    </DateSelectProvider>
  );
};

export const DateSelectFormItem = React.forwardRef<
  HTMLButtonElement,
  {
    className?: string;
    placeholder?: string;
    value?: Date;
    onChange?: (value?: Date) => void;
    type?: 'start' | 'end';
  }
>(({ onChange, className, placeholder, value, type }, ref) => {
  const [open, setOpen] = useState(false);

  return (
    <DateSelectProvider
      value={value}
      onValueChange={(value) => {
        onChange?.(value);
        setOpen(false);
      }}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <Form.Control>
          <Combobox.TriggerBase
            ref={ref}
            className={cn('w-full shadow-xs', className)}
            asChild
          >
            <Button variant="secondary" className="h-7">
              <DateSelectFormItemValue placeholder={placeholder} type={type} />
            </Button>
          </Combobox.TriggerBase>
        </Form.Control>
        <Popover.Content className="w-fit">
          <DateSelectContent />
        </Popover.Content>
      </Popover>
    </DateSelectProvider>
  );
});

DateSelectFormItem.displayName = 'DateSelectFormItem';

const DateSelectRoot = React.forwardRef<
  HTMLButtonElement,
  {
    onValueChange?: (value?: Date) => void;
    className?: string;
    value?: Date;
    placeholder?: string;
  }
>(({ onValueChange, className, value, placeholder, ...props }, ref) => {
  const [open, setOpen] = useState(false);
  return (
    <DateSelectProvider
      onValueChange={(value) => {
        onValueChange?.(value);
        setOpen(false);
      }}
      value={value}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <Popover.Trigger
          ref={ref}
          className={cn('w-full shadow-xs', className)}
          {...props}
        >
          <DateSelectValue placeholder={placeholder} />
        </Popover.Trigger>
        <Popover.Content className="w-fit">
          <DateSelectContent />
        </Popover.Content>
      </Popover>
    </DateSelectProvider>
  );
});

DateSelectRoot.displayName = 'DateSelectRoot';

export const DateSelectDetail = React.forwardRef<
  HTMLButtonElement,
  {
    className?: string;
    placeholder?: string;
    value?: Date;
    id?: string;
    type?: 'start' | 'end';
  }
>(({ className, placeholder, value, id, type }, ref) => {
  const [open, setOpen] = useState(false);
  const { updateCycle } = useUpdateCycle();

  const handleValueChange = (value?: Date) => {
    if (id) {
      updateCycle({
        variables: {
          _id: id,
          startDate: type === 'start' ? value?.toISOString() : undefined,
          endDate: type === 'end' ? value?.toISOString() : undefined,
        },
      });
    }
    setOpen(false);
  };

  return (
    <DateSelectProvider value={value} onValueChange={handleValueChange}>
      <Popover open={open} onOpenChange={setOpen}>
        <Combobox.TriggerBase
          ref={ref}
          className={cn('w-min shadow-xs', className)}
          asChild
        >
          <Button variant="secondary" className="h-7">
            <DateSelectFormItemValue placeholder={placeholder} type={type} />
          </Button>
        </Combobox.TriggerBase>
        <Popover.Content className="w-fit">
          <DateSelectContent />
        </Popover.Content>
      </Popover>
    </DateSelectProvider>
  );
});

DateSelectDetail.displayName = 'DateSelectDetail';

export const DateSelect = Object.assign(DateSelectRoot, {
  Provider: DateSelectProvider,
  Value: DateSelectValue,
  Content: DateSelectContent,
  FilterItem: DateSelectFilterItem,
  FilterView: DateSelectFilterView,
  FilterBar: DateSelectFilterBar,
  InlineCell: DateSelectInlineCell,
  FormItem: DateSelectFormItem,
  Detail: DateSelectDetail,
});
