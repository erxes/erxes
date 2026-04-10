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
  Form,
  Popover,
  PopoverScoped,
  useFilterContext,
  useQueryState,
} from 'erxes-ui';
import { IconTag } from '@tabler/icons-react';
import { useQuery } from '@apollo/client';
import { QUERY_DONATE_CAMPAIGNS } from '../../graphql/queries/queries';

interface DonateCampaignOption {
  value: string;
  label: string;
}

interface SelectDonateCampaignContextType {
  value: string;
  onValueChange: (campaignId: string) => void;
  options: DonateCampaignOption[];
  loading?: boolean;
}

const SelectDonateCampaignContext =
  createContext<SelectDonateCampaignContextType | null>(null);

const useSelectDonateCampaignContext = () => {
  const context = useContext(SelectDonateCampaignContext);
  if (!context) {
    throw new Error(
      'useSelectDonateCampaignContext must be used within SelectDonateCampaignProvider',
    );
  }
  return context;
};

const useDonateCampaignOptions = (): {
  options: DonateCampaignOption[];
  loading: boolean;
} => {
  const { data, loading } = useQuery(QUERY_DONATE_CAMPAIGNS, {
    variables: { perPage: 50 },
  });

  const options = useMemo<DonateCampaignOption[]>(
    () =>
      (data?.donateCampaigns?.list || []).map((c: { _id: string; title: string }) => ({
        value: c._id,
        label: c.title,
      })),
    [data?.donateCampaigns?.list],
  );

  return { options, loading };
};

export const SelectDonateCampaignProvider = ({
  value,
  onValueChange,
  children,
  mode = 'single',
}: {
  value: string | string[];
  onValueChange: (campaignId: string) => void;
  children: React.ReactNode;
  mode?: 'single' | 'multiple';
}) => {
  const { options, loading } = useDonateCampaignOptions();

  const handleValueChange = useCallback(
    (campaignId: string) => {
      if (!campaignId) return;
      onValueChange?.(campaignId);
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
      options,
      loading,
    }),
    [value, handleValueChange, mode, options, loading],
  );

  return (
    <SelectDonateCampaignContext.Provider value={contextValue}>
      {children}
    </SelectDonateCampaignContext.Provider>
  );
};

const SelectDonateCampaignValue = ({
  placeholder,
  className,
}: {
  placeholder?: string;
  className?: string;
}) => {
  const { value, options } = useSelectDonateCampaignContext();
  const selectedOption = options.find((o) => o.value === value);

  if (!selectedOption) {
    return (
      <span className="text-accent-foreground/80">
        {placeholder || 'Select campaign'}
      </span>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <p className={cn('font-medium text-sm', className)}>
        {selectedOption.label}
      </p>
    </div>
  );
};

const SelectDonateCampaignCommandItem = ({
  option,
}: {
  option: DonateCampaignOption;
}) => {
  const { onValueChange, value } = useSelectDonateCampaignContext();
  const { value: optionValue, label } = option;
  const isChecked = value.split(',').includes(optionValue);

  return (
    <Command.Item
      value={optionValue}
      onSelect={() => onValueChange(optionValue)}
    >
      <div className="flex items-center gap-2">
        <span className="font-medium">{label}</span>
      </div>
      <Combobox.Check checked={isChecked} />
    </Command.Item>
  );
};

const SelectDonateCampaignContent = () => {
  const { options } = useSelectDonateCampaignContext();

  return (
    <Command>
      <Command.Input placeholder="Search campaigns..." />
      <Command.Empty>
        <span className="text-muted-foreground">No campaigns found</span>
      </Command.Empty>
      <Command.List>
        {options.map((option) => (
          <SelectDonateCampaignCommandItem key={option.value} option={option} />
        ))}
      </Command.List>
    </Command>
  );
};

export const SelectDonateCampaignFilterItem = () => {
  return (
    <Filter.Item value="donateCampaign">
      <IconTag />
      Campaign
    </Filter.Item>
  );
};

export const SelectDonateCampaignFilterView = ({
  onValueChange,
  queryKey,
  mode = 'single',
}: {
  onValueChange?: (value: string[] | string) => void;
  queryKey?: string;
  mode?: 'single' | 'multiple';
}) => {
  const [campaign, setCampaign] = useQueryState<string[] | string>(
    queryKey || 'donateCampaign',
  );
  const { resetFilterState } = useFilterContext();

  return (
    <Filter.View filterKey={queryKey || 'donateCampaign'}>
      <SelectDonateCampaignProvider
        mode={mode}
        value={campaign || (mode === 'single' ? '' : [])}
        onValueChange={(value) => {
          setCampaign(value as string[] | string);
          resetFilterState();
          onValueChange?.(value);
        }}
      >
        <SelectDonateCampaignContent />
      </SelectDonateCampaignProvider>
    </Filter.View>
  );
};

export const SelectDonateCampaignFilterBar = ({
  iconOnly,
  onValueChange,
  mode = 'single',
}: {
  iconOnly?: boolean;
  onValueChange?: (value: string[] | string) => void;
  mode?: 'single' | 'multiple';
}) => {
  const [campaign, setCampaign] = useQueryState<string[] | string>(
    'donateCampaign',
  );
  const [open, setOpen] = useState(false);

  return (
    <Filter.BarItem queryKey="donateCampaign">
      <Filter.BarName>
        <IconTag />
        {!iconOnly && 'Campaign'}
      </Filter.BarName>
      <SelectDonateCampaignProvider
        mode={mode}
        value={campaign || (mode === 'single' ? '' : [])}
        onValueChange={(value) => {
          if (value.length > 0) {
            setCampaign(value as string[] | string);
          } else {
            setCampaign(null);
          }
          setOpen(false);
          onValueChange?.(value);
        }}
      >
        <Popover open={open} onOpenChange={setOpen}>
          <Popover.Trigger asChild>
            <Filter.BarButton filterKey="donateCampaign">
              <SelectDonateCampaignValue />
            </Filter.BarButton>
          </Popover.Trigger>
          <Combobox.Content>
            <SelectDonateCampaignContent />
          </Combobox.Content>
        </Popover>
      </SelectDonateCampaignProvider>
    </Filter.BarItem>
  );
};

export const SelectDonateCampaignFormItem = ({
  onValueChange,
  className,
  placeholder,
  ...props
}: Omit<
  React.ComponentProps<typeof SelectDonateCampaignProvider>,
  'children'
> & {
  className?: string;
  placeholder?: string;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <SelectDonateCampaignProvider
      onValueChange={(value) => {
        onValueChange?.(value);
        setOpen(false);
      }}
      {...props}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <Form.Control>
          <Combobox.Trigger className={cn('w-full shadow-xs', className)}>
            <SelectDonateCampaignValue placeholder={placeholder} />
          </Combobox.Trigger>
        </Form.Control>
        <Combobox.Content>
          <SelectDonateCampaignContent />
        </Combobox.Content>
      </Popover>
    </SelectDonateCampaignProvider>
  );
};

SelectDonateCampaignFormItem.displayName = 'SelectDonateCampaignFormItem';

const SelectDonateCampaignRoot = ({
  value,
  variant = 'outline',
  scope,
  onValueChange,
  disabled,
}: {
  value: string;
  variant?: 'outline' | 'ghost';
  scope?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
}) => {
  const [open, setOpen] = useState(false);

  const handleValueChange = useCallback(
    (val: string) => {
      onValueChange?.(val);
      setOpen(false);
    },
    [onValueChange],
  );

  return (
    <SelectDonateCampaignProvider
      value={value}
      onValueChange={handleValueChange}
    >
      <PopoverScoped open={open} onOpenChange={setOpen} scope={scope}>
        <Combobox.Trigger variant={variant} disabled={disabled}>
          <SelectDonateCampaignValue />
        </Combobox.Trigger>
        <Combobox.Content>
          <SelectDonateCampaignContent />
        </Combobox.Content>
      </PopoverScoped>
    </SelectDonateCampaignProvider>
  );
};

export const SelectDonateCampaign = Object.assign(SelectDonateCampaignRoot, {
  Provider: SelectDonateCampaignProvider,
  Value: SelectDonateCampaignValue,
  Content: SelectDonateCampaignContent,
  FilterItem: SelectDonateCampaignFilterItem,
  FilterView: SelectDonateCampaignFilterView,
  FilterBar: SelectDonateCampaignFilterBar,
  FormItem: SelectDonateCampaignFormItem,
});
