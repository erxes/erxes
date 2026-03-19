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

import { IconTag } from '@tabler/icons-react';

import {
  SelectContent,
  SelectTrigger,
  SelectTriggerVariantType,
} from './SelectShared';
import { GROUP_TYPE_DATA } from '../../constants/groupTypeData';

interface IGroupType {
  value: string;
  label: string;
}

interface SelectGroupTypeContextType {
  value: string;
  onValueChange: (groupType: string) => void;
  groupTypes?: IGroupType[];
}

const SelectGroupTypeContext = createContext<SelectGroupTypeContextType | null>(
  null,
);

const useSelectGroupTypeContext = () => {
  const context = useContext(SelectGroupTypeContext);
  if (!context) {
    throw new Error(
      'useSelectGroupTypeContext must be used within SelectGroupTypeProvider',
    );
  }
  return context;
};

export const SelectGroupTypeProvider = ({
  value,
  onValueChange,
  children,
  mode = 'single',
}: {
  value: string | string[];
  onValueChange: (groupType: string) => void;
  children: React.ReactNode;
  mode?: 'single' | 'multiple';
}) => {
  const groupTypes = GROUP_TYPE_DATA;

  const handleValueChange = useCallback(
    (groupType: string) => {
      if (!groupType) return;
      onValueChange?.(groupType);
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
      groupTypes,
    }),
    [value, handleValueChange, groupTypes, mode],
  );

  return (
    <SelectGroupTypeContext.Provider value={contextValue}>
      {children}
    </SelectGroupTypeContext.Provider>
  );
};

const SelectGroupTypeValue = ({
  placeholder,
  className,
}: {
  placeholder?: string;
  className?: string;
}) => {
  const { value, groupTypes } = useSelectGroupTypeContext();
  const selectedGroupType = groupTypes?.find((type) => type.value === value);

  if (!selectedGroupType) {
    return (
      <span className="text-accent-foreground/80">
        {placeholder || 'Select group type'}
      </span>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <p className={cn('font-medium text-sm', className)}>
        {selectedGroupType.label}
      </p>
    </div>
  );
};

const SelectGroupTypeCommandItem = ({
  groupType,
}: {
  groupType: IGroupType;
}) => {
  const { onValueChange, value } = useSelectGroupTypeContext();
  const { value: groupTypeValue, label } = groupType || {};

  return (
    <Command.Item
      value={groupTypeValue}
      onSelect={() => {
        onValueChange(groupTypeValue);
      }}
    >
      <span className="font-medium">{label}</span>
      <Combobox.Check checked={value === groupTypeValue} />
    </Command.Item>
  );
};

const SelectGroupTypeContent = () => {
  const { groupTypes } = useSelectGroupTypeContext();

  return (
    <Command>
      <Command.Input placeholder="Search group type" />
      <Command.Empty>
        <span className="text-muted-foreground">No group types found</span>
      </Command.Empty>
      <Command.List>
        {groupTypes?.map((groupType) => (
          <SelectGroupTypeCommandItem
            key={groupType.value}
            groupType={groupType}
          />
        ))}
      </Command.List>
    </Command>
  );
};

export const SelectGroupTypeFilterItem = () => {
  return (
    <Filter.Item value="groupType">
      <IconTag />
      Group Type
    </Filter.Item>
  );
};

export const SelectGroupTypeFilterView = ({
  onValueChange,
  queryKey,
  mode = 'single',
}: {
  onValueChange?: (value: string[] | string) => void;
  queryKey?: string;
  mode?: 'single' | 'multiple';
}) => {
  const [groupType, setGroupType] = useQueryState<string[] | string>(
    queryKey || 'groupType',
  );
  const { resetFilterState } = useFilterContext();

  return (
    <Filter.View filterKey={queryKey || 'groupType'}>
      <SelectGroupTypeProvider
        mode={mode}
        value={groupType || (mode === 'single' ? '' : [])}
        onValueChange={(value) => {
          setGroupType(value as string[] | string);
          resetFilterState();
          onValueChange?.(value);
        }}
      >
        <SelectGroupTypeContent />
      </SelectGroupTypeProvider>
    </Filter.View>
  );
};

export const SelectGroupTypeFilterBar = ({
  iconOnly,
  onValueChange,
  mode = 'single',
}: {
  iconOnly?: boolean;
  onValueChange?: (value: string[] | string) => void;
  mode?: 'single' | 'multiple';
}) => {
  const [groupType, setGroupType] = useQueryState<string[] | string>(
    'groupType',
  );
  const [open, setOpen] = useState(false);

  return (
    <Filter.BarItem queryKey={'groupType'}>
      <Filter.BarName>
        <IconTag />
        Group Type
      </Filter.BarName>
      <SelectGroupTypeProvider
        mode={mode}
        value={groupType || (mode === 'single' ? '' : [])}
        onValueChange={(value) => {
          if (value.length > 0) {
            setGroupType(value as string[] | string);
          } else {
            setGroupType(null);
          }
          setOpen(false);
          onValueChange?.(value);
        }}
      >
        <Popover open={open} onOpenChange={setOpen}>
          <Popover.Trigger asChild>
            <Filter.BarButton filterKey={'groupType'}>
              <SelectGroupTypeValue />
            </Filter.BarButton>
          </Popover.Trigger>
          <Combobox.Content>
            <SelectGroupTypeContent />
          </Combobox.Content>
        </Popover>
      </SelectGroupTypeProvider>
    </Filter.BarItem>
  );
};

export const SelectGroupTypeFormItem = ({
  onValueChange,
  className,
  placeholder,
  ...props
}: Omit<React.ComponentProps<typeof SelectGroupTypeProvider>, 'children'> & {
  className?: string;
  placeholder?: string;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <SelectGroupTypeProvider
      onValueChange={(value) => {
        onValueChange?.(value);
        setOpen(false);
      }}
      {...props}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <Form.Control>
          <Combobox.Trigger className={cn('w-full shadow-xs', className)}>
            <SelectGroupTypeValue placeholder={placeholder} />
          </Combobox.Trigger>
        </Form.Control>

        <Combobox.Content>
          <SelectGroupTypeContent />
        </Combobox.Content>
      </Popover>
    </SelectGroupTypeProvider>
  );
};

SelectGroupTypeFormItem.displayName = 'SelectGroupTypeFormItem';

const SelectGroupTypeRoot = ({
  value,
  variant = 'form',
  scope,
  onValueChange,
  disabled,
}: {
  value: string;
  variant?: SelectTriggerVariantType;
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
    <SelectGroupTypeProvider value={value} onValueChange={handleValueChange}>
      <PopoverScoped open={open} onOpenChange={setOpen} scope={scope}>
        <SelectTrigger variant={variant} disabled={disabled}>
          <SelectGroupTypeValue />
        </SelectTrigger>
        <SelectContent variant={variant}>
          <SelectGroupTypeContent />
        </SelectContent>
      </PopoverScoped>
    </SelectGroupTypeProvider>
  );
};

export const SelectGroupType = Object.assign(SelectGroupTypeRoot, {
  Provider: SelectGroupTypeProvider,
  Value: SelectGroupTypeValue,
  Content: SelectGroupTypeContent,
  FilterItem: SelectGroupTypeFilterItem,
  FilterView: SelectGroupTypeFilterView,
  FilterBar: SelectGroupTypeFilterBar,
  FormItem: SelectGroupTypeFormItem,
});
