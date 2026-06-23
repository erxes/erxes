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
  displayNum,
} from 'erxes-ui';

import { IconFilter } from '@tabler/icons-react';
import { FORMAT_OPTIONS } from '../../constants/formatNumberData';
import {
  SelectContent,
  SelectTrigger,
  SelectTriggerVariantType,
} from './SelectShared';

export const formatNumberByPattern = (
  value: number,
  pattern: string,
): string => {
  const numStr = Math.floor(value).toString();

  switch (pattern) {
    case '[0-9]':
      return numStr.replaceAll(/\D/g, '');
    case '[a-z]':
      return numStr.replaceAll(/[^a-z]/g, '');
    case '[A-Z]':
      return numStr.replaceAll(/[^A-Z]/g, '');
    case '[a-z][A-Z]':
      return numStr.replaceAll(/[^a-zA-Z]/g, '');
    case '[0-9][a-z]':
      return numStr.replaceAll(/[^0-9a-z]/g, '');
    case '[0-9][A-Z]':
      return numStr.replaceAll(/[^0-9A-Z]/g, '');
    case '[0-9a-z][A-Z]':
      return numStr.replaceAll(/[^0-9a-zA-Z]/g, '');
    default:
      return displayNum(value);
  }
};

interface IFormatOption {
  value: string;
  label: string;
}

interface SelectFormatNumberContextType {
  value: string;
  onValueChange: (formatOption: string) => void;
  formatOptions?: IFormatOption[];
}

const SelectFormatNumberContext =
  createContext<SelectFormatNumberContextType | null>(null);

const useSelectFormatNumberContext = () => {
  const context = useContext(SelectFormatNumberContext);
  if (!context) {
    throw new Error(
      'useSelectFormatNumberContext must be used within SelectFormatNumberProvider',
    );
  }
  return context;
};

export const SelectFormatNumberProvider = ({
  value,
  onValueChange,
  children,
  mode = 'single',
}: {
  value: string | string[];
  onValueChange: (formatOption: string) => void;
  children: React.ReactNode;
  mode?: 'single' | 'multiple';
}) => {
  const formatOptions = FORMAT_OPTIONS.map((option) => ({
    value: option,
    label: option,
  }));

  const handleValueChange = useCallback(
    (formatOption: string) => {
      if (!formatOption) return;
      onValueChange?.(formatOption);
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
      formatOptions,
    }),
    [value, handleValueChange, formatOptions, mode],
  );

  return (
    <SelectFormatNumberContext.Provider value={contextValue}>
      {children}
    </SelectFormatNumberContext.Provider>
  );
};

const SelectFormatNumberValue = ({
  placeholder,
  className,
}: {
  placeholder?: string;
  className?: string;
}) => {
  const { value, formatOptions } = useSelectFormatNumberContext();
  const selectedFormatOption = formatOptions?.find(
    (type) => type.value === value,
  );

  if (!selectedFormatOption) {
    return (
      <span className="text-accent-foreground/80">
        {placeholder || 'Select format option'}
      </span>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <p className={cn('font-medium text-sm', className)}>
        {selectedFormatOption.label}
      </p>
    </div>
  );
};

const SelectFormatNumberCommandItem = ({
  formatOption,
}: {
  formatOption: IFormatOption;
}) => {
  const { onValueChange, value } = useSelectFormatNumberContext();
  const { value: formatOptionValue, label } = formatOption || {};

  return (
    <Command.Item
      value={formatOptionValue}
      onSelect={() => {
        onValueChange(formatOptionValue);
      }}
    >
      <span className="font-medium">{label}</span>
      <Combobox.Check checked={value === formatOptionValue} />
    </Command.Item>
  );
};

const SelectFormatNumberContent = () => {
  const { formatOptions } = useSelectFormatNumberContext();

  return (
    <Command>
      <Command.Input placeholder="Search format option" />
      <Command.Empty>
        <span className="text-muted-foreground">No format options found</span>
      </Command.Empty>
      <Command.List>
        {formatOptions?.map((formatOption) => (
          <SelectFormatNumberCommandItem
            key={formatOption.value}
            formatOption={formatOption}
          />
        ))}
      </Command.List>
    </Command>
  );
};

export const SelectFormatNumberFilterItem = () => {
  return (
    <Filter.Item value="formatNumber">
      <IconFilter />
      Format Number
    </Filter.Item>
  );
};

export const SelectFormatNumberFilterView = ({
  onValueChange,
  queryKey,
  mode = 'single',
}: {
  onValueChange?: (value: string[] | string) => void;
  queryKey?: string;
  mode?: 'single' | 'multiple';
}) => {
  const [formatNumber, setFormatNumber] = useQueryState<string[] | string>(
    queryKey || 'formatNumber',
  );
  const { resetFilterState } = useFilterContext();

  return (
    <Filter.View filterKey={queryKey || 'formatNumber'}>
      <SelectFormatNumberProvider
        mode={mode}
        value={formatNumber || (mode === 'single' ? '' : [])}
        onValueChange={(value) => {
          setFormatNumber(value as string[] | string);
          resetFilterState();
          onValueChange?.(value);
        }}
      >
        <SelectFormatNumberContent />
      </SelectFormatNumberProvider>
    </Filter.View>
  );
};

export const SelectFormatNumberFilterBar = ({
  iconOnly,
  onValueChange,
  mode = 'single',
}: {
  iconOnly?: boolean;
  onValueChange?: (value: string[] | string) => void;
  mode?: 'single' | 'multiple';
}) => {
  const [formatNumber, setFormatNumber] = useQueryState<string[] | string>(
    'formatNumber',
  );
  const [open, setOpen] = useState(false);

  return (
    <Filter.BarItem queryKey={'formatNumber'}>
      <Filter.BarName>
        <IconFilter />
        Format Number
      </Filter.BarName>
      <SelectFormatNumberProvider
        mode={mode}
        value={formatNumber || (mode === 'single' ? '' : [])}
        onValueChange={(value) => {
          if (value.length > 0) {
            setFormatNumber(value as string[] | string);
          } else {
            setFormatNumber(null);
          }
          setOpen(false);
          onValueChange?.(value);
        }}
      >
        <Popover open={open} onOpenChange={setOpen}>
          <Popover.Trigger asChild>
            <Filter.BarButton filterKey={'formatNumber'}>
              <SelectFormatNumberValue />
            </Filter.BarButton>
          </Popover.Trigger>
          <Combobox.Content>
            <SelectFormatNumberContent />
          </Combobox.Content>
        </Popover>
      </SelectFormatNumberProvider>
    </Filter.BarItem>
  );
};

export const SelectFormatNumberFormItem = ({
  onValueChange,
  className,
  placeholder,
  ...props
}: Omit<React.ComponentProps<typeof SelectFormatNumberProvider>, 'children'> & {
  className?: string;
  placeholder?: string;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <SelectFormatNumberProvider
      onValueChange={(value) => {
        onValueChange?.(value);
        setOpen(false);
      }}
      {...props}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <Form.Control>
          <Combobox.Trigger className={cn('w-full shadow-xs', className)}>
            <SelectFormatNumberValue placeholder={placeholder} />
          </Combobox.Trigger>
        </Form.Control>

        <Combobox.Content>
          <SelectFormatNumberContent />
        </Combobox.Content>
      </Popover>
    </SelectFormatNumberProvider>
  );
};

SelectFormatNumberFormItem.displayName = 'SelectFormatNumberFormItem';

const SelectFormatNumberRoot = ({
  value,
  variant = 'form',
  scope,
  onValueChange,
  disabled,
}: {
  value: string;
  variant?: `${SelectTriggerVariantType}`;
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
    <SelectFormatNumberProvider value={value} onValueChange={handleValueChange}>
      <PopoverScoped open={open} onOpenChange={setOpen} scope={scope}>
        <SelectTrigger variant={variant} disabled={disabled}>
          <SelectFormatNumberValue />
        </SelectTrigger>
        <SelectContent variant={variant}>
          <SelectFormatNumberContent />
        </SelectContent>
      </PopoverScoped>
    </SelectFormatNumberProvider>
  );
};

export const SelectFormatNumber = Object.assign(SelectFormatNumberRoot, {
  Provider: SelectFormatNumberProvider,
  Value: SelectFormatNumberValue,
  Content: SelectFormatNumberContent,
  FilterItem: SelectFormatNumberFilterItem,
  FilterView: SelectFormatNumberFilterView,
  FilterBar: SelectFormatNumberFilterBar,
  FormItem: SelectFormatNumberFormItem,
});
