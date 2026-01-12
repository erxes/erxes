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
  SelectTriggerVariant,
} from './SelectShared';
import { CONTENT_TYPE_DATA } from '../../constants/contentTypeData';

interface IContentType {
  value: string;
  label: string;
}

interface SelectContentTypeContextType {
  value: string;
  onValueChange: (contentType: string) => void;
  contentTypes?: IContentType[];
}

const SelectContentTypeContext =
  createContext<SelectContentTypeContextType | null>(null);

const useSelectContentTypeContext = () => {
  const context = useContext(SelectContentTypeContext);
  if (!context) {
    throw new Error(
      'useSelectContentTypeContext must be used within SelectContentTypeProvider',
    );
  }
  return context;
};

export const SelectContentTypeProvider = ({
  value,
  onValueChange,
  children,
  mode = 'single',
}: {
  value: string | string[];
  onValueChange: (contentType: string) => void;
  children: React.ReactNode;
  mode?: 'single' | 'multiple';
}) => {
  const contentTypes = CONTENT_TYPE_DATA;

  const handleValueChange = useCallback(
    (contentType: string) => {
      if (!contentType) return;
      onValueChange?.(contentType);
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
      contentTypes,
    }),
    [value, handleValueChange, contentTypes, mode],
  );

  return (
    <SelectContentTypeContext.Provider value={contextValue}>
      {children}
    </SelectContentTypeContext.Provider>
  );
};

const SelectContentTypeValue = ({
  placeholder,
  className,
}: {
  placeholder?: string;
  className?: string;
}) => {
  const { value, contentTypes } = useSelectContentTypeContext();
  const selectedContentType = contentTypes?.find(
    (type) => type.value === value,
  );

  if (!selectedContentType) {
    return (
      <span className="text-accent-foreground/80">
        {placeholder || 'Select content type'}
      </span>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <p className={cn('font-medium text-sm', className)}>
        {selectedContentType.label}
      </p>
    </div>
  );
};

const SelectContentTypeCommandItem = ({
  contentType,
}: {
  contentType: IContentType;
}) => {
  const { onValueChange, value } = useSelectContentTypeContext();
  const { value: typeValue, label } = contentType || {};

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

const SelectContentTypeContent = () => {
  const { contentTypes } = useSelectContentTypeContext();

  return (
    <Command>
      <Command.Input placeholder="Search content type" />
      <Command.Empty>
        <span className="text-muted-foreground">No content types found</span>
      </Command.Empty>
      <Command.List>
        {contentTypes?.map((contentType) => (
          <SelectContentTypeCommandItem
            key={contentType.value}
            contentType={contentType}
          />
        ))}
      </Command.List>
    </Command>
  );
};

export const SelectContentTypeFilterItem = () => {
  return (
    <Filter.Item
      value="contentType"
      onClick={(e) => {
        e.preventDefault();
      }}
    >
      <IconTag />
      Content Type
    </Filter.Item>
  );
};

export const SelectContentTypeFilterView = ({
  onValueChange,
  queryKey,
  mode = 'single',
}: {
  onValueChange?: (value: string[] | string) => void;
  queryKey?: string;
  mode?: 'single' | 'multiple';
}) => {
  const [contentType, setContentType] = useQueryState<string[] | string>(
    queryKey || 'contentType',
  );
  const { setView } = useFilterContext();
  return (
    <Filter.View filterKey={queryKey || 'contentType'}>
      <SelectContentTypeProvider
        mode={mode}
        value={contentType || (mode === 'single' ? '' : [])}
        onValueChange={(value) => {
          setContentType(value as string[] | string);
          setView('root');
          onValueChange?.(value);
        }}
      >
        <SelectContentTypeContent />
      </SelectContentTypeProvider>
    </Filter.View>
  );
};

export const SelectContentTypeFilterBar = ({
  iconOnly,
  onValueChange,
  mode = 'single',
}: {
  iconOnly?: boolean;
  onValueChange?: (value: string[] | string) => void;
  mode?: 'single' | 'multiple';
}) => {
  const [contentType, setContentType] = useQueryState<string[] | string>(
    'contentType',
  );
  const [open, setOpen] = useState(false);

  return (
    <Filter.BarItem queryKey={'contentType'}>
      <Filter.BarName>
        <IconTag />
        Content Type
      </Filter.BarName>
      <SelectContentTypeProvider
        mode={mode}
        value={contentType || (mode === 'single' ? '' : [])}
        onValueChange={(value) => {
          if (value.length > 0) {
            setContentType(value as string[] | string);
          } else {
            setContentType(null);
          }
          setOpen(false);
          onValueChange?.(value);
        }}
      >
        <Popover open={open} onOpenChange={setOpen}>
          <Popover.Trigger asChild>
            <Filter.BarButton filterKey={'contentType'}>
              <SelectContentTypeValue />
            </Filter.BarButton>
          </Popover.Trigger>
          <Combobox.Content>
            <SelectContentTypeContent />
          </Combobox.Content>
        </Popover>
      </SelectContentTypeProvider>
    </Filter.BarItem>
  );
};

export const SelectContentTypeFormItem = ({
  onValueChange,
  className,
  placeholder,
  ...props
}: Omit<React.ComponentProps<typeof SelectContentTypeProvider>, 'children'> & {
  className?: string;
  placeholder?: string;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <SelectContentTypeProvider
      onValueChange={(value) => {
        onValueChange?.(value);
        setOpen(false);
      }}
      {...props}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <Form.Control>
          <Combobox.Trigger className={cn('w-full shadow-xs', className)}>
            <SelectContentTypeValue placeholder={placeholder} />
          </Combobox.Trigger>
        </Form.Control>

        <Combobox.Content>
          <SelectContentTypeContent />
        </Combobox.Content>
      </Popover>
    </SelectContentTypeProvider>
  );
};

SelectContentTypeFormItem.displayName = 'SelectContentTypeFormItem';

const SelectContentTypeRoot = ({
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
    <SelectContentTypeProvider value={value} onValueChange={handleValueChange}>
      <PopoverScoped open={open} onOpenChange={setOpen} scope={scope}>
        <SelectTrigger variant={variant} disabled={disabled}>
          <SelectContentTypeValue />
        </SelectTrigger>
        <SelectContent variant={variant}>
          <SelectContentTypeContent />
        </SelectContent>
      </PopoverScoped>
    </SelectContentTypeProvider>
  );
};

export const SelectContentType = Object.assign(SelectContentTypeRoot, {
  Provider: SelectContentTypeProvider,
  Value: SelectContentTypeValue,
  Content: SelectContentTypeContent,
  FilterItem: SelectContentTypeFilterItem,
  FilterView: SelectContentTypeFilterView,
  FilterBar: SelectContentTypeFilterBar,
  FormItem: SelectContentTypeFormItem,
});
