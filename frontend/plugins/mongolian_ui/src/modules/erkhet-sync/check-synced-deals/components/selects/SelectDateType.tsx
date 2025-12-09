import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import {
  cn,
  Combobox,
  Command,
  Filter,
  Popover,
  PopoverScoped,
  Form,
  useFilterContext,
  useQueryState,
} from 'erxes-ui';
import { DATE_TYPE_DATA } from '../../constants/dateTypeData';
import {
  SelectTriggerVariant,
  SelectTrigger,
  SelectContent,
} from './SelectShared';
import { IconClock } from '@tabler/icons-react';

interface IDateType {
  value: string;
  label: string;
}

interface SelectDateTypeContextType {
  value: string;
  onValueChange: (dateType: string) => void;
  dateTypes?: IDateType[];
}

const SelectDateTypeContext = createContext<SelectDateTypeContextType | null>(
  null,
);

const useSelectDateTypeContext = () => {
  const context = useContext(SelectDateTypeContext);
  if (!context) {
    throw new Error(
      'useSelectDateTypeContext must be used within SelectDateTypeProvider',
    );
  }
  return context;
};

export const SelectDateTypeProvider = ({
  value,
  onValueChange,
  children,
  mode = 'single',
}: {
  value: string | string[];
  onValueChange: (dateType: string) => void;
  children: React.ReactNode;
  mode?: 'single' | 'multiple';
}) => {
  const dateTypes = DATE_TYPE_DATA;

  const handleValueChange = useCallback(
    (dateType: string) => {
      if (!dateType) return;
      onValueChange?.(dateType);
    },
    [onValueChange],
  );

  const contextValue = useMemo(
    () => ({
      value:
        mode === 'single'
          ? (value as string) || ''
          : (value as string[]).join(','),
      onValueChange: handleValueChange,
      dateTypes,
    }),
    [value, handleValueChange, dateTypes, mode],
  );

  return (
    <SelectDateTypeContext.Provider value={contextValue}>
      {children}
    </SelectDateTypeContext.Provider>
  );
};

const SelectDateTypeValue = ({
  placeholder,
  className,
}: {
  placeholder?: string;
  className?: string;
}) => {
  const { value, dateTypes } = useSelectDateTypeContext();
  const selectedDateType = dateTypes?.find((type) => type.value === value);

  if (!selectedDateType) {
    return (
      <span className="text-accent-foreground/80">
        {placeholder || 'Select date type'}
      </span>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <p className={cn('font-medium text-sm', className)}>
        {selectedDateType.label}
      </p>
    </div>
  );
};

const SelectDateTypeCommandItem = ({ dateType }: { dateType: IDateType }) => {
  const { onValueChange, value } = useSelectDateTypeContext();
  const { value: typeValue, label } = dateType || {};

  return (
    <Command.Item
      value={typeValue}
      onSelect={() => {
        onValueChange(typeValue);
      }}
    >
      <span className="font-medium">{label}</span>
      <Combobox.Check checked={value === typeValue} />
    </Command.Item>
  );
};

const SelectDateTypeContent = () => {
  const { dateTypes } = useSelectDateTypeContext();

  return (
    <Command>
      <Command.Input placeholder="Search date type" />
      <Command.Empty>
        <span className="text-muted-foreground">No date types found</span>
      </Command.Empty>
      <Command.List>
        {dateTypes?.map((dateType) => (
          <SelectDateTypeCommandItem key={dateType.value} dateType={dateType} />
        ))}
      </Command.List>
    </Command>
  );
};

export const SelectDateTypeFilterItem = () => {
  return (
    <Filter.Item value="dateType">
      <IconClock />
      Date Type
    </Filter.Item>
  );
};

export const SelectDateTypeFilterView = ({
  onValueChange,
  queryKey,
  mode = 'single',
}: {
  onValueChange?: (value: string[] | string) => void;
  queryKey?: string;
  mode?: 'single' | 'multiple';
}) => {
  const [dateType, setDateType] = useQueryState<string[] | string>(
    queryKey || 'dateType',
  );
  const { resetFilterState } = useFilterContext();

  return (
    <Filter.View filterKey={queryKey || 'dateType'}>
      <SelectDateTypeProvider
        mode={mode}
        value={dateType || (mode === 'single' ? '' : [])}
        onValueChange={(value) => {
          setDateType(value as string[] | string);
          resetFilterState();
          onValueChange?.(value);
        }}
      >
        <SelectDateTypeContent />
      </SelectDateTypeProvider>
    </Filter.View>
  );
};

export const SelectDateTypeFilterBar = ({
  iconOnly,
  onValueChange,
  mode = 'single',
}: {
  iconOnly?: boolean;
  onValueChange?: (value: string[] | string) => void;
  mode?: 'single' | 'multiple';
}) => {
  const [dateType, setDateType] = useQueryState<string[] | string>('dateType');
  const [open, setOpen] = useState(false);

  return (
    <Filter.BarItem queryKey={'dateType'}>
      <Filter.BarName>
        <IconClock />
        Date Type
      </Filter.BarName>
      <SelectDateTypeProvider
        mode={mode}
        value={dateType || (mode === 'single' ? '' : [])}
        onValueChange={(value) => {
          if (value.length > 0) {
            setDateType(value as string[] | string);
          } else {
            setDateType(null);
          }
          setOpen(false);
          onValueChange?.(value);
        }}
      >
        <Popover open={open} onOpenChange={setOpen}>
          <Popover.Trigger asChild>
            <Filter.BarButton filterKey={'dateType'}>
              <SelectDateTypeValue />
            </Filter.BarButton>
          </Popover.Trigger>
          <Combobox.Content>
            <SelectDateTypeContent />
          </Combobox.Content>
        </Popover>
      </SelectDateTypeProvider>
    </Filter.BarItem>
  );
};

export const SelectDateTypeFormItem = ({
  onValueChange,
  className,
  placeholder,
  ...props
}: Omit<React.ComponentProps<typeof SelectDateTypeProvider>, 'children'> & {
  className?: string;
  placeholder?: string;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <SelectDateTypeProvider
      onValueChange={(value) => {
        onValueChange?.(value);
        setOpen(false);
      }}
      {...props}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <Form.Control>
          <Combobox.Trigger className={cn('w-full shadow-xs', className)}>
            <SelectDateTypeValue placeholder={placeholder} />
          </Combobox.Trigger>
        </Form.Control>

        <Combobox.Content>
          <SelectDateTypeContent />
        </Combobox.Content>
      </Popover>
    </SelectDateTypeProvider>
  );
};

SelectDateTypeFormItem.displayName = 'SelectDateTypeFormItem';

const SelectDateTypeRoot = ({
  value,
  variant = 'form',
  scope,
  onValueChange,
  disabled,
}: {
  value: string;
  variant?: `${SelectTriggerVariant}`;
  scope?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
}) => {
  const [open, setOpen] = useState(false);

  const handleValueChange = useCallback(
    (value: string) => {
      onValueChange?.(value);
      setOpen(false);
    },
    [onValueChange],
  );

  return (
    <SelectDateTypeProvider value={value} onValueChange={handleValueChange}>
      <PopoverScoped open={open} onOpenChange={setOpen} scope={scope}>
        <SelectTrigger variant={variant} disabled={disabled}>
          <SelectDateTypeValue />
        </SelectTrigger>
        <SelectContent variant={variant}>
          <SelectDateTypeContent />
        </SelectContent>
      </PopoverScoped>
    </SelectDateTypeProvider>
  );
};

export const SelectDateType = Object.assign(SelectDateTypeRoot, {
  Provider: SelectDateTypeProvider,
  Value: SelectDateTypeValue,
  Content: SelectDateTypeContent,
  FilterItem: SelectDateTypeFilterItem,
  FilterView: SelectDateTypeFilterView,
  FilterBar: SelectDateTypeFilterBar,
  FormItem: SelectDateTypeFormItem,
});
