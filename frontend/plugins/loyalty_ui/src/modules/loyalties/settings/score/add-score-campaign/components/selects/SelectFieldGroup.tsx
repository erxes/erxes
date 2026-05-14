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

import { IconComponents } from '@tabler/icons-react';
import { useQuery } from '@apollo/client';
import {
  SelectContent,
  SelectTrigger,
  SelectTriggerVariantType,
} from './SelectShared';
import { LOYALTY_SCORE_FIELD_GROUPS_QUERY } from '../../../graphql/queries/loyaltyScoreFieldGroupsQuery';

interface IFieldGroup {
  _id: string;
  name: string;
  code?: string;
  description?: string;
  contentType: string;
  order?: number;
  logics?: any;
  configs?: any;
  createdAt?: string;
  updatedAt?: string;
}

interface SelectFieldGroupContextType {
  value: string;
  onValueChange: (fieldGroup: string) => void;
  fieldGroups?: IFieldGroup[];
  loading?: boolean;
}

const SelectFieldGroupContext =
  createContext<SelectFieldGroupContextType | null>(null);

const useSelectFieldGroupContext = () => {
  const context = useContext(SelectFieldGroupContext);
  if (!context) {
    throw new Error(
      'useSelectFieldGroupContext must be used within SelectFieldGroupProvider',
    );
  }
  return context;
};

export const SelectFieldGroupProvider = ({
  value,
  onValueChange,
  children,
  mode = 'multiple',
  contentTypes,
}: {
  value: string | string[];
  onValueChange: (fieldGroup: string) => void;
  children: React.ReactNode;
  mode?: 'single' | 'multiple';
  contentTypes?: string[];
}) => {
  const { data, loading } = useQuery(LOYALTY_SCORE_FIELD_GROUPS_QUERY, {
    variables: {
      params: {
        contentType: contentTypes?.[0] || 'core:customer',
      },
    },
  });

  const fieldGroups = useMemo(
    () => data?.fieldGroups?.list || [],
    [data?.fieldGroups?.list],
  );

  const handleValueChange = useCallback(
    (fieldGroup: string) => {
      if (!fieldGroup) return;
      onValueChange?.(fieldGroup);
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
      fieldGroups,
      loading,
    }),
    [value, handleValueChange, fieldGroups, loading, mode],
  );

  return (
    <SelectFieldGroupContext.Provider value={contextValue}>
      {children}
    </SelectFieldGroupContext.Provider>
  );
};

const SelectFieldGroupValue = ({
  placeholder,
  className,
}: {
  placeholder?: string;
  className?: string;
}) => {
  const { value, fieldGroups } = useSelectFieldGroupContext();

  // Ensure fieldGroups is an array to prevent runtime errors
  const fieldGroupsArray = Array.isArray(fieldGroups) ? fieldGroups : [];
  const selectedFieldGroup = fieldGroupsArray.find(
    (fieldGroup) => fieldGroup._id === value,
  );

  if (!selectedFieldGroup) {
    return (
      <span className="text-accent-foreground/80">
        {placeholder || 'Select field group'}
      </span>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <p className={cn('font-medium text-sm', className)}>
        {selectedFieldGroup.name}
      </p>
    </div>
  );
};

const SelectFieldGroupCommandItem = ({
  fieldGroup,
}: {
  fieldGroup: IFieldGroup;
}) => {
  const { onValueChange, value } = useSelectFieldGroupContext();
  const { _id, name } = fieldGroup || {};
  const isChecked = value.split(',').includes(_id);

  return (
    <Command.Item
      value={_id}
      onSelect={() => {
        onValueChange(_id);
      }}
    >
      <div className="flex items-center gap-2">
        <span className="font-medium">{name}</span>
      </div>
      <Combobox.Check checked={isChecked} />
    </Command.Item>
  );
};

const SelectFieldGroupContent = () => {
  const { fieldGroups, loading } = useSelectFieldGroupContext();

  // Ensure fieldGroups is an array to prevent runtime errors
  const fieldGroupsArray = Array.isArray(fieldGroups) ? fieldGroups : [];

  if (loading) {
    return (
      <Command>
        <Command.Input placeholder="Search field groups" />
        <Command.List>
          <div className="flex items-center justify-center py-4 h-32">
            <span className="text-muted-foreground">
              Loading field groups...
            </span>
          </div>
        </Command.List>
      </Command>
    );
  }

  return (
    <Command>
      <Command.Input placeholder="Search field groups" />
      <Command.Empty>
        <span className="text-muted-foreground">No field groups found</span>
      </Command.Empty>
      <Command.List>
        {fieldGroupsArray.map((fieldGroup) => (
          <SelectFieldGroupCommandItem
            key={fieldGroup._id}
            fieldGroup={fieldGroup}
          />
        ))}
      </Command.List>
    </Command>
  );
};

export const SelectFieldGroupFilterItem = () => {
  return (
    <Filter.Item value="fieldGroups">
      <IconComponents />
      Field Groups
    </Filter.Item>
  );
};

export const SelectFieldGroupFilterView = ({
  onValueChange,
  queryKey,
  mode = 'single',
  contentTypes,
}: {
  onValueChange?: (value: string[] | string) => void;
  queryKey?: string;
  mode?: 'single' | 'multiple';
  contentTypes?: string[];
}) => {
  const [fieldGroups, setFieldGroups] = useQueryState<string[] | string>(
    queryKey || 'fieldGroups',
  );
  const { resetFilterState } = useFilterContext();

  return (
    <Filter.View filterKey={queryKey || 'fieldGroups'}>
      <SelectFieldGroupProvider
        mode={mode}
        value={fieldGroups || (mode === 'single' ? '' : [])}
        contentTypes={contentTypes}
        onValueChange={(value) => {
          setFieldGroups(value as string[] | string);
          resetFilterState();
          onValueChange?.(value);
        }}
      >
        <SelectFieldGroupContent />
      </SelectFieldGroupProvider>
    </Filter.View>
  );
};

export const SelectFieldGroupFilterBar = ({
  iconOnly,
  onValueChange,
  mode = 'single',
  contentTypes,
}: {
  iconOnly?: boolean;
  onValueChange?: (value: string[] | string) => void;
  mode?: 'single' | 'multiple';
  contentTypes?: string[];
}) => {
  const [fieldGroups, setFieldGroups] = useQueryState<string[] | string>(
    'fieldGroups',
  );
  const [open, setOpen] = useState(false);

  return (
    <Filter.BarItem queryKey={'fieldGroups'}>
      <Filter.BarName>
        <IconComponents />
        Field Groups
      </Filter.BarName>
      <SelectFieldGroupProvider
        mode={mode}
        value={fieldGroups || (mode === 'single' ? '' : [])}
        contentTypes={contentTypes}
        onValueChange={(value) => {
          if (value.length > 0) {
            setFieldGroups(value as string[] | string);
          } else {
            setFieldGroups(null);
          }
          setOpen(false);
          onValueChange?.(value);
        }}
      >
        <Popover open={open} onOpenChange={setOpen}>
          <Popover.Trigger asChild>
            <Filter.BarButton filterKey={'fieldGroups'}>
              <SelectFieldGroupValue />
            </Filter.BarButton>
          </Popover.Trigger>
          <Combobox.Content>
            <SelectFieldGroupContent />
          </Combobox.Content>
        </Popover>
      </SelectFieldGroupProvider>
    </Filter.BarItem>
  );
};

export const SelectFieldGroupFormItem = ({
  onValueChange,
  className,
  placeholder,
  contentTypes,
  ...props
}: Omit<React.ComponentProps<typeof SelectFieldGroupProvider>, 'children'> & {
  className?: string;
  placeholder?: string;
  contentTypes?: string[];
}) => {
  const [open, setOpen] = useState(false);
  return (
    <SelectFieldGroupProvider
      contentTypes={contentTypes}
      onValueChange={(value: string) => {
        onValueChange?.(value);
        setOpen(false);
      }}
      {...props}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <Form.Control>
          <Combobox.Trigger className={cn('w-full shadow-xs', className)}>
            <SelectFieldGroupValue placeholder={placeholder} />
          </Combobox.Trigger>
        </Form.Control>

        <Combobox.Content>
          <SelectFieldGroupContent />
        </Combobox.Content>
      </Popover>
    </SelectFieldGroupProvider>
  );
};

SelectFieldGroupFormItem.displayName = 'SelectFieldGroupFormItem';

const SelectFieldGroupRoot = ({
  value,
  variant = 'form',
  scope,
  onValueChange,
  disabled,
  contentTypes,
}: {
  value: string;
  variant?: `${SelectTriggerVariantType}`;
  scope?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  contentTypes?: string[];
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
    <SelectFieldGroupProvider
      value={value}
      mode="single"
      contentTypes={contentTypes}
      onValueChange={handleValueChange}
    >
      <PopoverScoped open={open} onOpenChange={setOpen} scope={scope}>
        <SelectTrigger variant={variant} disabled={disabled}>
          <SelectFieldGroupValue />
        </SelectTrigger>
        <SelectContent variant={variant}>
          <SelectFieldGroupContent />
        </SelectContent>
      </PopoverScoped>
    </SelectFieldGroupProvider>
  );
};

export const SelectFieldGroup = Object.assign(SelectFieldGroupRoot, {
  Provider: SelectFieldGroupProvider,
  Value: SelectFieldGroupValue,
  Content: SelectFieldGroupContent,
  FilterItem: SelectFieldGroupFilterItem,
  FilterView: SelectFieldGroupFilterView,
  FilterBar: SelectFieldGroupFilterBar,
  FormItem: SelectFieldGroupFormItem,
});
