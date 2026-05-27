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
import { ILotteryCampaign } from '../../types/lotteryCampaignType';
import {
  SelectLotteryCampaignContext,
  useSelectLotteryCampaignContext,
} from '../../context/SelectLotteryCampaignContext';
import { useLotteryCampaign } from '../../hooks/useSelectLotteryCampaign';
import LotteryCampaignInline from '../LotteryCampaignInline';

export const SelectLotteryCampaignProvider = ({
  children,
  mode = 'single',
  value,
  onValueChange,
  lotteryCampaigns,
}: {
  children: React.ReactNode;
  mode?: 'single' | 'multiple';
  value?: string | string[];
  onValueChange: (value: string | string[]) => void;
  lotteryCampaigns?: ILotteryCampaign[];
}) => {
  const [selectedLotteryCampaigns, setSelectedLotteryCampaigns] = useState<
    ILotteryCampaign[]
  >(lotteryCampaigns || []);
  const isSingleMode = mode === 'single';

  const onSelect = useCallback(
    (lotteryCampaign: ILotteryCampaign) => {
      if (!lotteryCampaign) return;

      if (isSingleMode) {
        setSelectedLotteryCampaigns([lotteryCampaign]);
        return onValueChange(lotteryCampaign._id);
      }

      const arrayValue = Array.isArray(value)
        ? value
        : (value && [value]) || [];
      const isSelected = arrayValue.includes(lotteryCampaign._id);
      const newSelectedIds = isSelected
        ? arrayValue.filter((id) => id !== lotteryCampaign._id)
        : [...arrayValue, lotteryCampaign._id];

      setSelectedLotteryCampaigns((prev) =>
        [...prev, lotteryCampaign].filter((b) =>
          newSelectedIds.includes(b._id),
        ),
      );

      onValueChange(newSelectedIds);
    },
    [isSingleMode, onValueChange, value],
  );

  const lotteryCampaignId = useMemo(() => {
    return Array.isArray(value) ? value : (value && [value]) || [];
  }, [value]);

  const contextValue = useMemo(
    () => ({
      lotteryCampaigns: selectedLotteryCampaigns,
      lotteryCampaignId,
      onSelect,
      setLotteryCampaigns: setSelectedLotteryCampaigns,
      loading: false,
      error: null,
    }),
    [
      selectedLotteryCampaigns,
      lotteryCampaignId,
      onSelect,
      setSelectedLotteryCampaigns,
    ],
  );

  return (
    <SelectLotteryCampaignContext.Provider value={contextValue}>
      {children}
    </SelectLotteryCampaignContext.Provider>
  );
};

const SelectLotteryCampaignValue = ({
  placeholder,
}: {
  placeholder?: string;
}) => {
  const { lotteryCampaignId, lotteryCampaigns, setLotteryCampaigns } =
    useSelectLotteryCampaignContext();

  return (
    <LotteryCampaignInline
      lotteryCampaignId={lotteryCampaignId}
      lotteryCampaigns={lotteryCampaigns}
      updateLotteryCampaigns={setLotteryCampaigns}
      placeholder={placeholder}
    />
  );
};

const SelectLotteryCampaignCommandItem = ({
  lotteryCampaign,
}: {
  lotteryCampaign: ILotteryCampaign;
}) => {
  const { onSelect, lotteryCampaignId } = useSelectLotteryCampaignContext();

  return (
    <Command.Item
      value={lotteryCampaign._id}
      onSelect={() => onSelect(lotteryCampaign)}
    >
      <LotteryCampaignInline
        lotteryCampaigns={[lotteryCampaign]}
        lotteryCampaignId={lotteryCampaign._id}
        placeholder="Unnamed campaign"
      />
      <Combobox.Check
        checked={lotteryCampaignId.includes(lotteryCampaign._id)}
      />
    </Command.Item>
  );
};

const SelectLotteryCampaignContent = () => {
  const [search, setSearch] = React.useState('');
  const [debouncedSearch] = useDebounce(search, 500);
  const { lotteryCampaigns: selectedLotteryCampaigns } =
    useSelectLotteryCampaignContext();

  const {
    campaignList = [],
    loading,
    handleFetchMore,
    totalCount = 0,
  } = useLotteryCampaign({
    variables: { searchValue: debouncedSearch },
  });

  return (
    <Command shouldFilter={false} id="lottery-campaign-command-menu">
      <Command.Input
        value={search}
        onValueChange={setSearch}
        variant="secondary"
        wrapperClassName="flex-auto"
        placeholder="Search lottery campaigns..."
        className="h-9"
      />
      <Command.List>
        <Combobox.Empty loading={loading} />
        {selectedLotteryCampaigns.length > 0 && (
          <>
            {selectedLotteryCampaigns.map((lotteryCampaign) => (
              <SelectLotteryCampaignCommandItem
                key={lotteryCampaign._id}
                lotteryCampaign={lotteryCampaign}
              />
            ))}
            <Command.Separator className="my-1" />
          </>
        )}
        {campaignList
          .filter((lotteryCampaign) =>
            selectedLotteryCampaigns.every(
              (b) => b._id !== lotteryCampaign._id,
            ),
          )
          .map((lotteryCampaign) => (
            <SelectLotteryCampaignCommandItem
              key={lotteryCampaign._id}
              lotteryCampaign={lotteryCampaign}
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

export const SelectLotteryCampaignFilterItem = () => (
  <Filter.Item value="lotteryCampaign">
    <IconTicket />
    Lottery Campaign
  </Filter.Item>
);

export const SelectLotteryCampaignFilterView = ({
  onValueChange,
  queryKey,
  mode = 'single',
}: {
  onValueChange?: (value: string | string[]) => void;
  queryKey?: string;
  mode?: 'single' | 'multiple';
}) => {
  const [lotteryCampaign, setLotteryCampaign] = useQueryState<
    string | string[]
  >(queryKey || 'lotteryCampaign');
  const { resetFilterState } = useFilterContext();

  return (
    <Filter.View filterKey={queryKey || 'lotteryCampaign'}>
      <SelectLotteryCampaignProvider
        mode={mode}
        value={lotteryCampaign ?? (mode === 'single' ? '' : [])}
        onValueChange={(value) => {
          setLotteryCampaign(value);
          resetFilterState();
          onValueChange?.(value);
        }}
      >
        <SelectLotteryCampaignContent />
      </SelectLotteryCampaignProvider>
    </Filter.View>
  );
};

export const SelectLotteryCampaignFilterBar = ({
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
  const [lotteryCampaign, setLotteryCampaign] = useQueryState<
    string | string[]
  >(queryKey || 'lotteryCampaign');
  const [open, setOpen] = useState(false);

  return (
    <Filter.BarItem queryKey={queryKey || 'lotteryCampaign'}>
      <Filter.BarName>
        <IconTicket />
        {!iconOnly && 'Lottery Campaign'}
      </Filter.BarName>

      <SelectLotteryCampaignProvider
        mode={mode}
        value={lotteryCampaign ?? (mode === 'single' ? '' : [])}
        onValueChange={(value) => {
          setLotteryCampaign(value || null);
          setOpen(false);
          onValueChange?.(value);
        }}
      >
        <Popover open={open} onOpenChange={setOpen}>
          <Popover.Trigger asChild>
            <Filter.BarButton filterKey={queryKey || 'lotteryCampaign'}>
              <SelectLotteryCampaignValue />
            </Filter.BarButton>
          </Popover.Trigger>

          <Combobox.Content>
            <SelectLotteryCampaignContent />
          </Combobox.Content>
        </Popover>
      </SelectLotteryCampaignProvider>
    </Filter.BarItem>
  );
};

export const SelectLotteryCampaignInlineCell = ({
  onValueChange,
  ...props
}: Omit<
  React.ComponentProps<typeof SelectLotteryCampaignProvider>,
  'children'
>) => {
  const [open, setOpen] = useState(false);

  return (
    <SelectLotteryCampaignProvider
      onValueChange={(value) => {
        onValueChange?.(value);
        setOpen(false);
      }}
      {...props}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <RecordTableInlineCell.Trigger>
          <SelectLotteryCampaignValue placeholder="" />
        </RecordTableInlineCell.Trigger>
        <RecordTableInlineCell.Content>
          <SelectLotteryCampaignContent />
        </RecordTableInlineCell.Content>
      </Popover>
    </SelectLotteryCampaignProvider>
  );
};

export const SelectLotteryCampaignFormItem = ({
  onValueChange,
  className,
  placeholder,
  ...props
}: Omit<
  React.ComponentProps<typeof SelectLotteryCampaignProvider>,
  'children'
> & {
  className?: string;
  placeholder?: string;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <SelectLotteryCampaignProvider
      onValueChange={(value) => {
        onValueChange?.(value);
        setOpen(false);
      }}
      {...props}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <Form.Control>
          <Combobox.Trigger className={cn('w-full shadow-xs', className)}>
            <SelectLotteryCampaignValue placeholder={placeholder} />
          </Combobox.Trigger>
        </Form.Control>

        <Combobox.Content>
          <SelectLotteryCampaignContent />
        </Combobox.Content>
      </Popover>
    </SelectLotteryCampaignProvider>
  );
};

SelectLotteryCampaignFormItem.displayName = 'SelectLotteryCampaignFormItem';

const SelectLotteryCampaignRoot = React.forwardRef<
  React.ElementRef<typeof Combobox.Trigger>,
  Omit<React.ComponentProps<typeof SelectLotteryCampaignProvider>, 'children'> &
    React.ComponentProps<typeof Combobox.Trigger> & {
      placeholder?: string;
    }
>(({ onValueChange, className, mode, value, placeholder, ...props }, ref) => {
  const [open, setOpen] = useState(false);

  return (
    <SelectLotteryCampaignProvider
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
          <SelectLotteryCampaignValue placeholder={placeholder} />
        </Combobox.Trigger>

        <Combobox.Content>
          <SelectLotteryCampaignContent />
        </Combobox.Content>
      </Popover>
    </SelectLotteryCampaignProvider>
  );
});

SelectLotteryCampaignRoot.displayName = 'SelectLotteryCampaignRoot';

export const SelectLotteryCampaign = Object.assign(SelectLotteryCampaignRoot, {
  Provider: SelectLotteryCampaignProvider,
  Value: SelectLotteryCampaignValue,
  Content: SelectLotteryCampaignContent,
  FilterItem: SelectLotteryCampaignFilterItem,
  FilterView: SelectLotteryCampaignFilterView,
  FilterBar: SelectLotteryCampaignFilterBar,
  InlineCell: SelectLotteryCampaignInlineCell,
  FormItem: SelectLotteryCampaignFormItem,
});
