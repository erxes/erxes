import {
  cn,
  Combobox,
  Command,
  Filter,
  Form,
  RecordTableInlineCell,
  Popover,
  useFilterContext,
  useQueryState,
} from 'erxes-ui';
import { useDebounce } from 'use-debounce';
import React, { useState, useCallback, useMemo } from 'react';
import { IconTicket } from '@tabler/icons-react';
import { ISpinCampaign } from '../../types/spinCampaignType';
import {
  SelectSpinCampaignContext,
  useSelectSpinCampaignContext,
} from '../../context/SelectSpinCampaignContext';
import { useSpinCampaign } from '../../hooks/useSelectSpinCampaign';
import SpinCampaignInline from '../SpinCampaignInline';

export const SelectSpinCampaignProvider = ({
  children,
  mode = 'single',
  value,
  onValueChange,
  spinCampaigns,
}: {
  children: React.ReactNode;
  mode?: 'single' | 'multiple';
  value?: string | string[];
  onValueChange: (value: string | string[]) => void;
  spinCampaigns?: ISpinCampaign[];
}) => {
  const [selectedSpinCampaigns, setSelectedSpinCampaigns] = useState<
    ISpinCampaign[]
  >(spinCampaigns || []);
  const isSingleMode = mode === 'single';

  const onSelect = useCallback(
    (spinCampaign: ISpinCampaign) => {
      if (!spinCampaign) return;

      if (isSingleMode) {
        setSelectedSpinCampaigns([spinCampaign]);
        return onValueChange(spinCampaign._id);
      }

      const arrayValue = Array.isArray(value)
        ? value
        : (value && [value]) || [];
      const isSelected = arrayValue.includes(spinCampaign._id);
      const newSelectedIds = isSelected
        ? arrayValue.filter((id) => id !== spinCampaign._id)
        : [...arrayValue, spinCampaign._id];

      setSelectedSpinCampaigns((prev) =>
        [...prev, spinCampaign].filter((b) => newSelectedIds.includes(b._id)),
      );

      onValueChange(newSelectedIds);
    },
    [isSingleMode, onValueChange, value],
  );

  const spinCampaignId = useMemo(() => {
    return Array.isArray(value) ? value : (value && [value]) || [];
  }, [value]);

  const contextValue = useMemo(
    () => ({
      spinCampaigns: selectedSpinCampaigns,
      spinCampaignId,
      onSelect,
      setSpinCampaigns: setSelectedSpinCampaigns,
      loading: false,
      error: null,
    }),
    [selectedSpinCampaigns, spinCampaignId, onSelect, setSelectedSpinCampaigns],
  );

  return (
    <SelectSpinCampaignContext.Provider value={contextValue}>
      {children}
    </SelectSpinCampaignContext.Provider>
  );
};

const SelectSpinCampaignValue = ({ placeholder }: { placeholder?: string }) => {
  const { spinCampaignId, spinCampaigns, setSpinCampaigns } =
    useSelectSpinCampaignContext();

  return (
    <SpinCampaignInline
      spinCampaignId={spinCampaignId}
      spinCampaigns={spinCampaigns}
      updateSpinCampaigns={setSpinCampaigns}
      placeholder={placeholder}
    />
  );
};

const SelectSpinCampaignCommandItem = ({
  spinCampaign,
}: {
  spinCampaign: ISpinCampaign;
}) => {
  const { onSelect, spinCampaignId } = useSelectSpinCampaignContext();

  return (
    <Command.Item
      value={spinCampaign._id}
      onSelect={() => onSelect(spinCampaign)}
    >
      <SpinCampaignInline
        spinCampaigns={[spinCampaign]}
        spinCampaignId={spinCampaign._id}
        placeholder="Unnamed campaign"
      />
      <Combobox.Check checked={spinCampaignId.includes(spinCampaign._id)} />
    </Command.Item>
  );
};

const SelectSpinCampaignContent = () => {
  const [search, setSearch] = React.useState('');
  const [debouncedSearch] = useDebounce(search, 500);
  const { spinCampaigns: selectedSpinCampaigns } =
    useSelectSpinCampaignContext();

  const {
    campaignList = [],
    loading,
    handleFetchMore,
    totalCount = 0,
  } = useSpinCampaign({
    variables: { searchValue: debouncedSearch },
  });

  return (
    <Command shouldFilter={false} id="spin-campaign-command-menu">
      <Command.Input
        value={search}
        onValueChange={setSearch}
        variant="secondary"
        wrapperClassName="flex-auto"
        placeholder="Search spin campaigns..."
        className="h-9"
      />
      <Command.List>
        <Combobox.Empty loading={loading} />
        {selectedSpinCampaigns.length > 0 && (
          <>
            {selectedSpinCampaigns.map((spinCampaign) => (
              <SelectSpinCampaignCommandItem
                key={spinCampaign._id}
                spinCampaign={spinCampaign}
              />
            ))}
            <Command.Separator className="my-1" />
          </>
        )}
        {campaignList
          .filter((spinCampaign) =>
            selectedSpinCampaigns.every((b) => b._id !== spinCampaign._id),
          )
          .map((spinCampaign) => (
            <SelectSpinCampaignCommandItem
              key={spinCampaign._id}
              spinCampaign={spinCampaign}
            />
          ))}
        <Combobox.FetchMore
          fetchMore={handleFetchMore}
          totalCount={totalCount}
          currentLength={campaignList.length}
        />
      </Command.List>
    </Command>
  );
};

export const SelectSpinCampaignFilterItem = () => (
  <Filter.Item value="spinCampaign">
    <IconTicket />
    Spin Campaign
  </Filter.Item>
);

export const SelectSpinCampaignFilterView = ({
  onValueChange,
  queryKey,
  mode = 'single',
}: {
  onValueChange?: (value: string | string[]) => void;
  queryKey?: string;
  mode?: 'single' | 'multiple';
}) => {
  const [spinCampaign, setSpinCampaign] = useQueryState<string | string[]>(
    queryKey || 'spinCampaign',
  );
  const { resetFilterState } = useFilterContext();

  return (
    <Filter.View filterKey={queryKey || 'spinCampaign'}>
      <SelectSpinCampaignProvider
        mode={mode}
        value={spinCampaign ?? (mode === 'single' ? '' : [])}
        onValueChange={(value) => {
          setSpinCampaign(value);
          resetFilterState();
          onValueChange?.(value);
        }}
      >
        <SelectSpinCampaignContent />
      </SelectSpinCampaignProvider>
    </Filter.View>
  );
};

export const SelectSpinCampaignFilterBar = ({
  iconOnly,
  onValueChange,
  queryKey,
  mode = 'single',
}: {
  iconOnly?: boolean;
  onValueChange?: (value: string | string[]) => void;
  queryKey?: string;
  mode?: 'single' | 'multiple';
}) => {
  const [spinCampaign, setSpinCampaign] = useQueryState<string | string[]>(
    queryKey || 'spinCampaign',
  );
  const [open, setOpen] = useState(false);

  return (
    <Filter.BarItem queryKey={queryKey || 'spinCampaign'}>
      <Filter.BarName>
        <IconTicket />
        {!iconOnly && 'Spin Campaign'}
      </Filter.BarName>

      <SelectSpinCampaignProvider
        mode={mode}
        value={spinCampaign ?? (mode === 'single' ? '' : [])}
        onValueChange={(value) => {
          setSpinCampaign(value || null);
          setOpen(false);
          onValueChange?.(value);
        }}
      >
        <Popover open={open} onOpenChange={setOpen}>
          <Popover.Trigger asChild>
            <Filter.BarButton filterKey={queryKey || 'spinCampaign'}>
              <SelectSpinCampaignValue />
            </Filter.BarButton>
          </Popover.Trigger>

          <Combobox.Content>
            <SelectSpinCampaignContent />
          </Combobox.Content>
        </Popover>
      </SelectSpinCampaignProvider>
    </Filter.BarItem>
  );
};

export const SelectSpinCampaignInlineCell = ({
  onValueChange,
  ...props
}: Omit<
  React.ComponentProps<typeof SelectSpinCampaignProvider>,
  'children'
>) => {
  const [open, setOpen] = useState(false);

  return (
    <SelectSpinCampaignProvider
      onValueChange={(value) => {
        onValueChange?.(value);
        setOpen(false);
      }}
      {...props}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <RecordTableInlineCell.Trigger>
          <SelectSpinCampaignValue placeholder="" />
        </RecordTableInlineCell.Trigger>
        <RecordTableInlineCell.Content>
          <SelectSpinCampaignContent />
        </RecordTableInlineCell.Content>
      </Popover>
    </SelectSpinCampaignProvider>
  );
};

export const SelectSpinCampaignFormItem = ({
  onValueChange,
  className,
  placeholder,
  ...props
}: Omit<React.ComponentProps<typeof SelectSpinCampaignProvider>, 'children'> & {
  className?: string;
  placeholder?: string;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <SelectSpinCampaignProvider
      onValueChange={(value) => {
        onValueChange?.(value);
        setOpen(false);
      }}
      {...props}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <Form.Control>
          <Combobox.Trigger className={cn('w-full shadow-xs', className)}>
            <SelectSpinCampaignValue placeholder={placeholder} />
          </Combobox.Trigger>
        </Form.Control>

        <Combobox.Content>
          <SelectSpinCampaignContent />
        </Combobox.Content>
      </Popover>
    </SelectSpinCampaignProvider>
  );
};

SelectSpinCampaignFormItem.displayName = 'SelectSpinCampaignFormItem';

const SelectSpinCampaignRoot = React.forwardRef<
  React.ElementRef<typeof Combobox.Trigger>,
  Omit<React.ComponentProps<typeof SelectSpinCampaignProvider>, 'children'> &
    React.ComponentProps<typeof Combobox.Trigger> & {
      placeholder?: string;
    }
>(({ onValueChange, className, mode, value, placeholder, ...props }, ref) => {
  const [open, setOpen] = useState(false);

  return (
    <SelectSpinCampaignProvider
      onValueChange={(v) => {
        onValueChange?.(v);
        setOpen(false);
      }}
      mode={mode}
      value={value}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <Combobox.Trigger
          ref={ref}
          className={cn('w-full inline-flex', className)}
          variant="outline"
          {...props}
        >
          <SelectSpinCampaignValue placeholder={placeholder} />
        </Combobox.Trigger>

        <Combobox.Content>
          <SelectSpinCampaignContent />
        </Combobox.Content>
      </Popover>
    </SelectSpinCampaignProvider>
  );
});

SelectSpinCampaignRoot.displayName = 'SelectSpinCampaignRoot';

export const SelectSpinCampaign = Object.assign(SelectSpinCampaignRoot, {
  Provider: SelectSpinCampaignProvider,
  Value: SelectSpinCampaignValue,
  Content: SelectSpinCampaignContent,
  FilterItem: SelectSpinCampaignFilterItem,
  FilterView: SelectSpinCampaignFilterView,
  FilterBar: SelectSpinCampaignFilterBar,
  InlineCell: SelectSpinCampaignInlineCell,
  FormItem: SelectSpinCampaignFormItem,
});
