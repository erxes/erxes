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
  useFilterContext,
  useQueryState,
} from 'erxes-ui';
import { IconTag } from '@tabler/icons-react';
import { useQuery } from '@apollo/client';
import { SCORE_CAMPAIGNS_SIMPLE_QUERY } from '../../graphql/queries';

interface CampaignOption {
  value: string;
  label: string;
}

const useScoreCampaignOptions = (searchValue?: string) => {
  const { data, loading } = useQuery(SCORE_CAMPAIGNS_SIMPLE_QUERY, {
    variables: { limit: 50, searchValue },
  });

  const options = useMemo<CampaignOption[]>(
    () =>
      (data?.scoreCampaigns?.list || []).map(
        (c: { _id: string; title: string }) => ({
          value: c._id,
          label: c.title,
        }),
      ),
    [data?.scoreCampaigns?.list],
  );

  return { options, loading };
};

interface SelectScoreCampaignContextType {
  value: string;
  onValueChange: (val: string) => void;
  options: CampaignOption[];
  loading: boolean;
  search: string;
  setSearch: (s: string) => void;
}

const SelectScoreCampaignContext =
  createContext<SelectScoreCampaignContextType | null>(null);

const useSelectScoreCampaignContext = () => {
  const ctx = useContext(SelectScoreCampaignContext);
  if (!ctx)
    throw new Error(
      'useSelectScoreCampaignContext must be used within SelectScoreCampaignProvider',
    );
  return ctx;
};

export const SelectScoreCampaignProvider = ({
  value,
  onValueChange,
  children,
}: {
  value: string;
  onValueChange: (val: string) => void;
  children: React.ReactNode;
}) => {
  const [search, setSearch] = useState('');
  const { options, loading } = useScoreCampaignOptions(search);

  const handleChange = useCallback(
    (val: string) => {
      if (!val) return;
      onValueChange(val);
    },
    [onValueChange],
  );

  const ctx = useMemo(
    () => ({
      value: value || '',
      onValueChange: handleChange,
      options,
      loading,
      search,
      setSearch,
    }),
    [value, handleChange, options, loading, search],
  );

  return (
    <SelectScoreCampaignContext.Provider value={ctx}>
      {children}
    </SelectScoreCampaignContext.Provider>
  );
};

const SelectScoreCampaignValue = ({
  placeholder,
  className,
}: {
  placeholder?: string;
  className?: string;
}) => {
  const { value, options } = useSelectScoreCampaignContext();
  const selected = options.find((o) => o.value === value);

  if (!selected) {
    return (
      <span className="text-accent-foreground/80">
        {placeholder || 'Select campaign'}
      </span>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <p className={cn('font-medium text-sm', className)}>{selected.label}</p>
    </div>
  );
};

const SelectScoreCampaignContent = () => {
  const { value, onValueChange, options, loading, search, setSearch } =
    useSelectScoreCampaignContext();

  return (
    <Command shouldFilter={false}>
      <Command.Input
        value={search}
        onValueChange={setSearch}
        placeholder="Search campaigns..."
      />
      <Command.Empty>
        {loading ? 'Loading...' : 'No campaigns found'}
      </Command.Empty>
      <Command.List>
        {options.map((opt) => (
          <Command.Item
            key={opt.value}
            value={opt.value}
            onSelect={() => onValueChange(opt.value)}
          >
            <span className="font-medium">{opt.label}</span>
            <Combobox.Check checked={value === opt.value} />
          </Command.Item>
        ))}
      </Command.List>
    </Command>
  );
};

export const SelectScoreCampaignFilterItem = () => (
  <Filter.Item value="scoreCampaignId">
    <IconTag />
    Campaign
  </Filter.Item>
);

export const SelectScoreCampaignFilterView = ({
  queryKey = 'scoreCampaignId',
}: {
  queryKey?: string;
}) => {
  const [value, setValue] = useQueryState<string>(queryKey);
  const { resetFilterState } = useFilterContext();

  return (
    <Filter.View filterKey={queryKey}>
      <SelectScoreCampaignProvider
        value={value || ''}
        onValueChange={(val) => {
          setValue(val);
          resetFilterState();
        }}
      >
        <SelectScoreCampaignContent />
      </SelectScoreCampaignProvider>
    </Filter.View>
  );
};

export const SelectScoreCampaignFilterBar = () => {
  const [value, setValue] = useQueryState<string>('scoreCampaignId');
  const [open, setOpen] = useState(false);

  return (
    <Filter.BarItem queryKey="scoreCampaignId">
      <Filter.BarName>
        <IconTag />
        Campaign
      </Filter.BarName>
      <SelectScoreCampaignProvider
        value={value || ''}
        onValueChange={(val) => {
          setValue(val || null);
          setOpen(false);
        }}
      >
        <Popover open={open} onOpenChange={setOpen}>
          <Popover.Trigger asChild>
            <Filter.BarButton filterKey="scoreCampaignId">
              <SelectScoreCampaignValue />
            </Filter.BarButton>
          </Popover.Trigger>
          <Combobox.Content>
            <SelectScoreCampaignContent />
          </Combobox.Content>
        </Popover>
      </SelectScoreCampaignProvider>
    </Filter.BarItem>
  );
};

export const SelectScoreCampaignFormItem = ({
  value,
  onValueChange,
  placeholder,
  className,
}: {
  value: string;
  onValueChange: (val: string) => void;
  placeholder?: string;
  className?: string;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <SelectScoreCampaignProvider
      value={value}
      onValueChange={(val) => {
        onValueChange(val);
        setOpen(false);
      }}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <Form.Control>
          <Combobox.Trigger className={cn('w-full shadow-xs', className)}>
            <SelectScoreCampaignValue placeholder={placeholder} />
          </Combobox.Trigger>
        </Form.Control>
        <Combobox.Content>
          <SelectScoreCampaignContent />
        </Combobox.Content>
      </Popover>
    </SelectScoreCampaignProvider>
  );
};

const SelectScoreCampaignRoot = ({
  value,
  onValueChange,
  placeholder,
  className,
}: {
  value: string;
  onValueChange?: (val: string) => void;
  placeholder?: string;
  className?: string;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <SelectScoreCampaignProvider
      value={value}
      onValueChange={(val) => {
        onValueChange?.(val);
        setOpen(false);
      }}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <Combobox.Trigger className={cn('shadow-xs', className)}>
          <SelectScoreCampaignValue placeholder={placeholder} />
        </Combobox.Trigger>
        <Combobox.Content>
          <SelectScoreCampaignContent />
        </Combobox.Content>
      </Popover>
    </SelectScoreCampaignProvider>
  );
};

export const SelectScoreCampaign = Object.assign(SelectScoreCampaignRoot, {
  Provider: SelectScoreCampaignProvider,
  Value: SelectScoreCampaignValue,
  Content: SelectScoreCampaignContent,
  FilterItem: SelectScoreCampaignFilterItem,
  FilterView: SelectScoreCampaignFilterView,
  FilterBar: SelectScoreCampaignFilterBar,
  FormItem: SelectScoreCampaignFormItem,
});
