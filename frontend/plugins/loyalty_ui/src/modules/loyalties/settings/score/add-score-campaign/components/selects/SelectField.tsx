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

import { IconTextSize } from '@tabler/icons-react';
import { useQuery } from '@apollo/client';
import {
  SelectContent,
  SelectTrigger,
  SelectTriggerVariantType,
} from './SelectShared';
import { FIELDS_QUERY } from '../../../graphql/queries/fieldsQuery';

interface IField {
  _id: string;
  name: string;
  code?: string;
  type?: string;
  order?: number;
  groupId?: string;
  options?: { label: string; value: string; coordinates?: any }[];
  validations?: any;
  logics?: any;
  configs?: any;
  icon?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface SelectFieldContextType {
  value: string;
  onValueChange: (field: string) => void;
  fields?: IField[];
  loading?: boolean;
}

const SelectFieldContext = createContext<SelectFieldContextType | null>(null);

const useSelectFieldContext = () => {
  const context = useContext(SelectFieldContext);
  if (!context) {
    throw new Error(
      'useSelectFieldContext must be used within SelectFieldProvider',
    );
  }
  return context;
};

export const SelectFieldProvider = ({
  value,
  onValueChange,
  children,
  mode = 'single',
  contentTypes,
  groupId,
}: {
  value: string | string[];
  onValueChange: (field: string) => void;
  children: React.ReactNode;
  mode?: 'single' | 'multiple';
  contentTypes?: string[];
  groupId?: string;
}) => {
  const { data, loading } = useQuery(FIELDS_QUERY, {
    variables: {
      params: {
        contentType: contentTypes?.[0] || 'core:customer',
        ...(groupId ? { groupId } : {}),
      },
    },
  });

  const fields = useMemo(() => data?.fields?.list || [], [data?.fields?.list]);

  const handleValueChange = useCallback(
    (field: string) => {
      if (!field) return;
      onValueChange?.(field);
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
      fields,
      loading,
    }),
    [value, handleValueChange, fields, loading, mode],
  );

  return (
    <SelectFieldContext.Provider value={contextValue}>
      {children}
    </SelectFieldContext.Provider>
  );
};

const SelectFieldValue = ({
  placeholder,
  className,
}: {
  placeholder?: string;
  className?: string;
}) => {
  const { value, fields } = useSelectFieldContext();

  const fieldsArray = Array.isArray(fields) ? fields : [];
  const selectedField = fieldsArray.find((field) => field._id === value);

  if (!selectedField) {
    return (
      <span className="text-accent-foreground/80">
        {placeholder || 'Select field'}
      </span>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <p className={cn('font-medium text-sm', className)}>
        {selectedField.name}
      </p>
    </div>
  );
};

const SelectFieldCommandItem = ({ field }: { field: IField }) => {
  const { onValueChange, value } = useSelectFieldContext();
  const { _id, name } = field || {};
  const isChecked = value.split(',').includes(_id);

  return (
    <Command.Item
      value={_id}
      keywords={[name]}
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

const SelectFieldContent = () => {
  const { fields, loading } = useSelectFieldContext();

  const fieldsArray = Array.isArray(fields) ? fields : [];

  if (loading) {
    return (
      <Command>
        <Command.Input placeholder="Search fields" />
        <Command.List>
          <div className="flex items-center justify-center py-4 h-32">
            <span className="text-muted-foreground">Loading fields...</span>
          </div>
        </Command.List>
      </Command>
    );
  }

  return (
    <Command>
      <Command.Input placeholder="Search fields" />
      <Command.Empty>
        <span className="text-muted-foreground">No fields found</span>
      </Command.Empty>
      <Command.List>
        {fieldsArray.map((field) => (
          <SelectFieldCommandItem key={field._id} field={field} />
        ))}
      </Command.List>
    </Command>
  );
};

export const SelectFieldFilterItem = () => {
  return (
    <Filter.Item value="fields">
      <IconTextSize />
      Fields
    </Filter.Item>
  );
};

export const SelectFieldFilterView = ({
  onValueChange,
  queryKey,
  mode = 'single',
  contentTypes,
  groupId,
}: {
  onValueChange?: (value: string[] | string) => void;
  queryKey?: string;
  mode?: 'single' | 'multiple';
  contentTypes?: string[];
  groupId?: string;
}) => {
  const [fields, setFields] = useQueryState<string[] | string>(
    queryKey || 'fields',
  );
  const { resetFilterState } = useFilterContext();

  return (
    <Filter.View filterKey={queryKey || 'fields'}>
      <SelectFieldProvider
        mode={mode}
        value={fields || (mode === 'single' ? '' : [])}
        contentTypes={contentTypes}
        groupId={groupId}
        onValueChange={(value) => {
          setFields(value as string[] | string);
          resetFilterState();
          onValueChange?.(value);
        }}
      >
        <SelectFieldContent />
      </SelectFieldProvider>
    </Filter.View>
  );
};

export const SelectFieldFilterBar = ({
  onValueChange,
  mode = 'single',
  contentTypes,
  groupId,
}: {
  iconOnly?: boolean;
  onValueChange?: (value: string[] | string) => void;
  mode?: 'single' | 'multiple';
  contentTypes?: string[];
  groupId?: string;
}) => {
  const [fields, setFields] = useQueryState<string[] | string>('fields');
  const [open, setOpen] = useState(false);

  return (
    <Filter.BarItem queryKey={'fields'}>
      <Filter.BarName>
        <IconTextSize />
        Fields
      </Filter.BarName>
      <SelectFieldProvider
        mode={mode}
        value={fields || (mode === 'single' ? '' : [])}
        contentTypes={contentTypes}
        groupId={groupId}
        onValueChange={(value) => {
          if (value.length > 0) {
            setFields(value as string[] | string);
          } else {
            setFields(null);
          }
          setOpen(false);
          onValueChange?.(value);
        }}
      >
        <Popover open={open} onOpenChange={setOpen}>
          <Popover.Trigger asChild>
            <Filter.BarButton filterKey={'fields'}>
              <SelectFieldValue />
            </Filter.BarButton>
          </Popover.Trigger>
          <Combobox.Content>
            <SelectFieldContent />
          </Combobox.Content>
        </Popover>
      </SelectFieldProvider>
    </Filter.BarItem>
  );
};

export const SelectFieldFormItem = ({
  onValueChange,
  className,
  placeholder,
  contentTypes,
  groupId,
  ...props
}: Omit<React.ComponentProps<typeof SelectFieldProvider>, 'children'> & {
  className?: string;
  placeholder?: string;
  contentTypes?: string[];
  groupId?: string;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <SelectFieldProvider
      contentTypes={contentTypes}
      groupId={groupId}
      onValueChange={(value: string) => {
        onValueChange?.(value);
        setOpen(false);
      }}
      {...props}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <Form.Control>
          <Combobox.Trigger className={cn('w-full shadow-xs', className)}>
            <SelectFieldValue placeholder={placeholder} />
          </Combobox.Trigger>
        </Form.Control>

        <Combobox.Content>
          <SelectFieldContent />
        </Combobox.Content>
      </Popover>
    </SelectFieldProvider>
  );
};

SelectFieldFormItem.displayName = 'SelectFieldFormItem';

const SelectFieldRoot = ({
  value,
  variant = 'form',
  scope,
  onValueChange,
  disabled,
  contentTypes,
  groupId,
}: {
  value: string;
  variant?: `${SelectTriggerVariantType}`;
  scope?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  contentTypes?: string[];
  groupId?: string;
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
    <SelectFieldProvider
      value={value}
      mode="single"
      contentTypes={contentTypes}
      groupId={groupId}
      onValueChange={handleValueChange}
    >
      <PopoverScoped open={open} onOpenChange={setOpen} scope={scope}>
        <SelectTrigger variant={variant} disabled={disabled}>
          <SelectFieldValue />
        </SelectTrigger>
        <SelectContent variant={variant}>
          <SelectFieldContent />
        </SelectContent>
      </PopoverScoped>
    </SelectFieldProvider>
  );
};

export const SelectField = Object.assign(SelectFieldRoot, {
  Provider: SelectFieldProvider,
  Value: SelectFieldValue,
  Content: SelectFieldContent,
  FilterItem: SelectFieldFilterItem,
  FilterView: SelectFieldFilterView,
  FilterBar: SelectFieldFilterBar,
  FormItem: SelectFieldFormItem,
});
