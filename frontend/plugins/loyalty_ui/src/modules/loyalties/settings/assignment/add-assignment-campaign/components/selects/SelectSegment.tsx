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
import { useQuery } from '@apollo/client';
import { GET_SEGMENT } from '../../../graphql/queries/getSegmentQuery';
import {
  SelectContent,
  SelectTrigger,
  SelectTriggerVariantType,
} from './SelectShared';

interface ISegment {
  _id: string;
  name: string;
  description?: string;
  contentType: string;
  color?: string;
  conditions?: any;
  conditionsConjunction?: string;
  shouldWriteActivityLog?: boolean;
  subSegmentConditions?: any[];
  config?: any;
  count?: number;
}

interface SelectSegmentContextType {
  value: string;
  onValueChange: (segment: string) => void;
  segments?: ISegment[];
  loading?: boolean;
}

const SelectSegmentContext = createContext<SelectSegmentContextType | null>(
  null,
);

const useSelectSegmentContext = () => {
  const context = useContext(SelectSegmentContext);
  if (!context) {
    throw new Error(
      'useSelectSegmentContext must be used within SelectSegmentProvider',
    );
  }
  return context;
};

export const SelectSegmentProvider = ({
  value,
  onValueChange,
  children,
  mode = 'multiple',
  contentTypes,
}: {
  value: string | string[];
  onValueChange: (segment: string) => void;
  children: React.ReactNode;
  mode?: 'single' | 'multiple';
  contentTypes?: string[];
}) => {
  const { data, loading } = useQuery(GET_SEGMENT, {
    variables: {
      contentTypes: contentTypes || ['loyalty'],
      limit: 100,
    },
  });

  const segments = useMemo(() => data?.segments || [], [data?.segments]);

  const handleValueChange = useCallback(
    (segment: string) => {
      if (!segment) return;
      onValueChange?.(segment);
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
      segments,
      loading,
    }),
    [value, handleValueChange, segments, loading, mode],
  );

  return (
    <SelectSegmentContext.Provider value={contextValue}>
      {children}
    </SelectSegmentContext.Provider>
  );
};

const SelectSegmentValue = ({
  placeholder,
  className,
}: {
  placeholder?: string;
  className?: string;
}) => {
  const { value, segments } = useSelectSegmentContext();

  // Ensure segments is an array to prevent runtime errors
  const segmentsArray = Array.isArray(segments) ? segments : [];
  const selectedSegment = segmentsArray.find(
    (segment) => segment._id === value,
  );

  if (!selectedSegment) {
    return (
      <span className="text-accent-foreground/80">
        {placeholder || 'Select segment'}
      </span>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {selectedSegment.color && (
        <div
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: selectedSegment.color }}
        />
      )}
      <p className={cn('font-medium text-sm', className)}>
        {selectedSegment.name}
      </p>
    </div>
  );
};

const SelectSegmentCommandItem = ({ segment }: { segment: ISegment }) => {
  const { onValueChange, value } = useSelectSegmentContext();
  const { _id, name, color } = segment || {};
  const isChecked = value.split(',').includes(_id);

  return (
    <Command.Item
      value={_id}
      onSelect={() => {
        onValueChange(_id);
      }}
    >
      <div className="flex items-center gap-2">
        {color && (
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: color }}
          />
        )}
        <span className="font-medium">{name}</span>
      </div>
      <Combobox.Check checked={isChecked} />
    </Command.Item>
  );
};

const SelectSegmentContent = () => {
  const { segments, loading } = useSelectSegmentContext();

  // Ensure segments is an array to prevent runtime errors
  const segmentsArray = Array.isArray(segments) ? segments : [];

  if (loading) {
    return (
      <Command>
        <Command.Input placeholder="Search segments" />
        <Command.List>
          <div className="flex items-center justify-center py-4 h-32">
            <span className="text-muted-foreground">Loading segments...</span>
          </div>
        </Command.List>
      </Command>
    );
  }

  return (
    <Command>
      <Command.Input placeholder="Search segments" />
      <Command.Empty>
        <span className="text-muted-foreground">No segments found</span>
      </Command.Empty>
      <Command.List>
        {segmentsArray.map((segment) => (
          <SelectSegmentCommandItem key={segment._id} segment={segment} />
        ))}
      </Command.List>
    </Command>
  );
};

export const SelectSegmentFilterItem = () => {
  return (
    <Filter.Item value="segments">
      <IconTag />
      Segments
    </Filter.Item>
  );
};

export const SelectSegmentFilterView = ({
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
  const [segments, setSegments] = useQueryState<string[] | string>(
    queryKey || 'segments',
  );
  const { resetFilterState } = useFilterContext();

  return (
    <Filter.View filterKey={queryKey || 'segments'}>
      <SelectSegmentProvider
        mode={mode}
        value={segments || (mode === 'single' ? '' : [])}
        contentTypes={contentTypes}
        onValueChange={(value) => {
          setSegments(value as string[] | string);
          resetFilterState();
          onValueChange?.(value);
        }}
      >
        <SelectSegmentContent />
      </SelectSegmentProvider>
    </Filter.View>
  );
};

export const SelectSegmentFilterBar = ({
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
  const [segments, setSegments] = useQueryState<string[] | string>('segments');
  const [open, setOpen] = useState(false);

  return (
    <Filter.BarItem queryKey={'segments'}>
      <Filter.BarName>
        <IconTag />
        Segments
      </Filter.BarName>
      <SelectSegmentProvider
        mode={mode}
        value={segments || (mode === 'single' ? '' : [])}
        contentTypes={contentTypes}
        onValueChange={(value) => {
          if (value.length > 0) {
            setSegments(value as string[] | string);
          } else {
            setSegments(null);
          }
          setOpen(false);
          onValueChange?.(value);
        }}
      >
        <Popover open={open} onOpenChange={setOpen}>
          <Popover.Trigger asChild>
            <Filter.BarButton filterKey={'segments'}>
              <SelectSegmentValue />
            </Filter.BarButton>
          </Popover.Trigger>
          <Combobox.Content>
            <SelectSegmentContent />
          </Combobox.Content>
        </Popover>
      </SelectSegmentProvider>
    </Filter.BarItem>
  );
};

export const SelectSegmentFormItem = ({
  onValueChange,
  className,
  placeholder,
  contentTypes,
  ...props
}: Omit<React.ComponentProps<typeof SelectSegmentProvider>, 'children'> & {
  className?: string;
  placeholder?: string;
  contentTypes?: string[];
}) => {
  const [open, setOpen] = useState(false);
  return (
    <SelectSegmentProvider
      contentTypes={contentTypes}
      onValueChange={(value) => {
        onValueChange?.(value);
        setOpen(false);
      }}
      {...props}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <Form.Control>
          <Combobox.Trigger className={cn('w-full shadow-xs', className)}>
            <SelectSegmentValue placeholder={placeholder} />
          </Combobox.Trigger>
        </Form.Control>

        <Combobox.Content>
          <SelectSegmentContent />
        </Combobox.Content>
      </Popover>
    </SelectSegmentProvider>
  );
};

SelectSegmentFormItem.displayName = 'SelectSegmentFormItem';

const SelectSegmentRoot = ({
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
    <SelectSegmentProvider
      value={value}
      mode="single"
      contentTypes={contentTypes}
      onValueChange={handleValueChange}
    >
      <PopoverScoped open={open} onOpenChange={setOpen} scope={scope}>
        <SelectTrigger variant={variant} disabled={disabled}>
          <SelectSegmentValue />
        </SelectTrigger>
        <SelectContent variant={variant}>
          <SelectSegmentContent />
        </SelectContent>
      </PopoverScoped>
    </SelectSegmentProvider>
  );
};

export const SelectSegment = Object.assign(SelectSegmentRoot, {
  Provider: SelectSegmentProvider,
  Value: SelectSegmentValue,
  Content: SelectSegmentContent,
  FilterItem: SelectSegmentFilterItem,
  FilterView: SelectSegmentFilterView,
  FilterBar: SelectSegmentFilterBar,
  FormItem: SelectSegmentFormItem,
});
