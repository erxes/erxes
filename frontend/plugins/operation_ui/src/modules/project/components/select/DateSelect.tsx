import React, { useState } from 'react';
import { ProjectHotKeyScope } from '@/project/constants/ProjectHotKeyScope';
import { format } from 'date-fns';
import { useUpdateProject } from '@/project/hooks/useUpdateProject';
import {
  Calendar,
  Popover,
  RecordTableInlineCell,
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

const DateSelectValue = ({
  placeholder,
}: {
  placeholder?: string;
  type?: 'start' | 'target';
  status?: number;
}) => {
  const { value } = useDateSelectContext();

  if (!value) {
    return (
      <span className="text-accent-foreground/80 capitalize">
        {placeholder || 'Select date...'}
      </span>
    );
  }

  return (
    <span className="flex items-center justify-center gap-2">
      <IconCalendarTime className={`size-4`} />
      {format(value, 'MMM d, yyyy')}
    </span>
  );
};

const DateSelectFormItemValue = ({
  placeholder,
  type,
}: {
  placeholder?: string;
  type?: 'start' | 'target';
}) => {
  const { value } = useDateSelectContext();

  if (!value) {
    return (
      <span className="text-accent-foreground font-medium text-base flex items-center justify-center gap-2 ">
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
      <IconCalendarTime className={`size-4`} />
      <p className="font-medium text-base text-foreground">
        {format(value, 'MMM d, yyyy')}
      </p>
    </span>
  );
};
const DateSelectContent = () => {
  const { value, onSelect } = useDateSelectContext();

  return (
    <Calendar
      mode="single"
      selected={value}
      onSelect={onSelect}
      defaultMonth={value}
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

  const dateValue = date ? new Date(date) : undefined;

  return (
    <Filter.BarItem queryKey={queryKey || 'Date'}>
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
    </Filter.BarItem>
  );
};

export const DateSelectInlineCell = ({
  value,
  id,
  onValueChange,
  scope,
  type,
  status,
}: {
  value?: Date;
  id?: string;
  onValueChange?: (value?: Date) => void;
  scope?: string;
  type?: 'start' | 'target';
  status?: number;
}) => {
  const { updateProject } = useUpdateProject();
  const [open, setOpen] = useState(false);

  const handleValueChange = (value?: Date) => {
    if (id) {
      updateProject({
        variables: {
          _id: id,
          startDate: type === 'start' ? value?.toISOString() : undefined,
          targetDate: type === 'target' ? value?.toISOString() : undefined,
        },
      });
    }
    onValueChange?.(value);
    setOpen(false);
  };

  const finalScope =
    scope ||
    (id
      ? `${ProjectHotKeyScope.ProjectTableCell}.${id}.${type}Date`
      : undefined);

  return (
    <DateSelectProvider value={value} onValueChange={handleValueChange}>
      <PopoverScoped
        open={open}
        onOpenChange={setOpen}
        scope={finalScope}
        closeOnEnter
      >
        <RecordTableInlineCell.Trigger>
          <DateSelectValue
            placeholder="not specified"
            type={type}
            status={status}
          />
        </RecordTableInlineCell.Trigger>
        <RecordTableInlineCell.Content className="w-fit">
          <DateSelectContent />
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
    type?: 'start' | 'target';
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
    onValueChange?: (value?: Date) => void;
    type?: 'start' | 'target';
    id?: string;
  }
>(({ onValueChange, className, placeholder, value, type, id }, ref) => {
  const [open, setOpen] = useState(false);
  const { updateProject } = useUpdateProject();

  const handleValueChange = (value?: Date) => {
    if (id) {
      updateProject({
        variables: {
          _id: id,
          startDate: type === 'start' ? value?.toISOString() : undefined,
          targetDate: type === 'target' ? value?.toISOString() : undefined,
        },
      });
    }
    onValueChange?.(value);
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
