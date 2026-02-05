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
import { IconReceipt } from '@tabler/icons-react';
import { IVoucherCampaign } from '../../types/voucherCampaignType';
import {
  SelectVoucherCampaignContext,
  useSelectVoucherCampaignContext,
} from '../../context/SelectVoucherCampaignContext';
import { useVoucherCampaign } from '../../hooks/useSelectVoucherCampaign';
import { VoucherCampaignInline } from '../VoucherCampaignInline';
import { ValueChangeValueType } from '../../../general-config/types/loyaltyConfigTypes';

export const SelectVoucherCampaignProvider = ({
  children,
  mode = 'single',
  value,
  onValueChange,
  voucherCampaigns,
}: {
  children: React.ReactNode;
  mode?: 'single' | 'multiple';
  value?: ValueChangeValueType;
  onValueChange: (value: ValueChangeValueType) => void;
  voucherCampaigns?: IVoucherCampaign[];
}) => {
  const [selectedVoucherCampaigns, setSelectedVoucherCampaigns] = useState<
    IVoucherCampaign[]
  >(voucherCampaigns || []);
  const isSingleMode = mode === 'single';

  const onSelect = useCallback(
    (voucherCampaign: IVoucherCampaign) => {
      if (!voucherCampaign) return;

      if (isSingleMode) {
        setSelectedVoucherCampaigns([voucherCampaign]);
        return onValueChange(voucherCampaign._id);
      }

      let arrayValue: string[] = [];

      if (Array.isArray(value)) {
        arrayValue = value;
      } else if (value) {
        arrayValue = [value];
      }
      const isVoucherCampaignSelected = arrayValue.includes(
        voucherCampaign._id,
      );
      const newSelectedVoucherCampaignId = isVoucherCampaignSelected
        ? arrayValue.filter((id) => id !== voucherCampaign._id)
        : [...arrayValue, voucherCampaign._id];

      setSelectedVoucherCampaigns((prev) =>
        [...prev, voucherCampaign].filter((b) =>
          newSelectedVoucherCampaignId.includes(b._id),
        ),
      );

      onValueChange(newSelectedVoucherCampaignId);
    },
    [isSingleMode, onValueChange, value],
  );

  const voucherCampaignId = useMemo(() => {
    return Array.isArray(value) ? value : value && [value] || [];
  }, [value]);

  const contextValue = useMemo(
    () => ({
      voucherCampaigns: selectedVoucherCampaigns,
      voucherCampaignId,
      onSelect,
      setVoucherCampaigns: setSelectedVoucherCampaigns,
      loading: false,
      error: null,
    }),
    [
      selectedVoucherCampaigns,
      voucherCampaignId,
      onSelect,
      setSelectedVoucherCampaigns,
    ],
  );

  return (
    <SelectVoucherCampaignContext.Provider value={contextValue}>
      {children}
    </SelectVoucherCampaignContext.Provider>
  );
};

const SelectVoucherCampaignValue = ({
  placeholder,
}: {
  placeholder?: string;
}) => {
  const { voucherCampaignId, voucherCampaigns, setVoucherCampaigns } =
    useSelectVoucherCampaignContext();

  return (
    <VoucherCampaignInline
      voucherCampaignId={voucherCampaignId}
      voucherCampaigns={voucherCampaigns}
      updateVoucherCampaigns={setVoucherCampaigns}
      placeholder={placeholder}
    />
  );
};

const SelectVoucherCampaignCommandItem = ({
  voucherCampaign,
}: {
  voucherCampaign: IVoucherCampaign;
}) => {
  const { onSelect, voucherCampaignId } = useSelectVoucherCampaignContext();

  return (
    <Command.Item
      value={voucherCampaign._id}
      onSelect={() => onSelect(voucherCampaign)}
    >
      <VoucherCampaignInline
        voucherCampaigns={[voucherCampaign]}
        placeholder="Unnamed campaign"
      />
      <Combobox.Check
        checked={voucherCampaignId.includes(voucherCampaign._id)}
      />
    </Command.Item>
  );
};

const SelectVoucherCampaignContent = () => {
  const [search, setSearch] = React.useState('');
  const [debouncedSearch] = useDebounce(search, 500);
  const { voucherCampaigns: selectedVoucherCampaigns } =
    useSelectVoucherCampaignContext();

  const {
    campaignList = [],
    loading,
    handleFetchMore,
    totalCount = 0,
  } = useVoucherCampaign({
    variables: { searchValue: debouncedSearch },
  });

  return (
    <Command shouldFilter={false} id="voucher-campaign-command-menu">
      <Command.Input
        value={search}
        onValueChange={setSearch}
        variant="secondary"
        wrapperClassName="flex-auto"
        placeholder="Search voucher campaigns..."
        className="h-9"
      />
      <Command.List>
        <Combobox.Empty loading={loading} />
        {selectedVoucherCampaigns.length > 0 && (
          <>
            {selectedVoucherCampaigns.map((voucherCampaign) => (
              <SelectVoucherCampaignCommandItem
                key={voucherCampaign._id}
                voucherCampaign={voucherCampaign}
              />
            ))}
            <Command.Separator className="my-1" />
          </>
        )}
        {campaignList
          .filter((voucherCampaign) =>
            selectedVoucherCampaigns.every(
              (b) => b._id !== voucherCampaign._id,
            ),
          )
          .map((voucherCampaign) => (
            <SelectVoucherCampaignCommandItem
              key={voucherCampaign._id}
              voucherCampaign={voucherCampaign}
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

export const SelectVoucherCampaignFilterItem = () => (
  <Filter.Item value="voucherCampaign">
    <IconReceipt />
    Voucher Campaign
  </Filter.Item>
);

export const SelectVoucherCampaignFilterView = ({
  onValueChange,
  queryKey,
  mode = 'single',
}: {
  onValueChange?: (value: ValueChangeValueType) => void;
  queryKey?: string;
  mode?: 'single' | 'multiple';
}) => {
  const [voucherCampaign, setVoucherCampaign] =
    useQueryState<ValueChangeValueType>(queryKey || 'voucherCampaign');
  const { resetFilterState } = useFilterContext();

  return (
    <Filter.View filterKey={queryKey || 'voucherCampaign'}>
      <SelectVoucherCampaignProvider
        mode={mode}
        value={voucherCampaign ?? (mode === 'single' ? '' : [])}
        onValueChange={(value) => {
          setVoucherCampaign(value);
          resetFilterState();
          onValueChange?.(value);
        }}
      >
        <SelectVoucherCampaignContent />
      </SelectVoucherCampaignProvider>
    </Filter.View>
  );
};

export const SelectVoucherCampaignFilterBar = ({
  iconOnly,
  onValueChange,
  queryKey,
  mode = 'single',
}: {
  iconOnly?: boolean;
  onValueChange?: (value: ValueChangeValueType) => void;
  queryKey?: string;
  mode?: 'single' | 'multiple';
}) => {
  const [voucherCampaign, setVoucherCampaign] =
    useQueryState<ValueChangeValueType>(queryKey || 'voucherCampaign');
  const [open, setOpen] = useState(false);

  return (
    <Filter.BarItem queryKey={queryKey || 'voucherCampaign'}>
      <Filter.BarName>
        <IconReceipt />
        {!iconOnly && 'Voucher Campaign'}
      </Filter.BarName>

      <SelectVoucherCampaignProvider
        mode={mode}
        value={voucherCampaign ?? (mode === 'single' ? '' : [])}
        onValueChange={(value) => {
          setVoucherCampaign(value || null);
          setOpen(false);
          onValueChange?.(value);
        }}
      >
        <Popover open={open} onOpenChange={setOpen}>
          <Popover.Trigger asChild>
            <Filter.BarButton filterKey={queryKey || 'voucherCampaign'}>
              <SelectVoucherCampaignValue />
            </Filter.BarButton>
          </Popover.Trigger>

          <Combobox.Content>
            <SelectVoucherCampaignContent />
          </Combobox.Content>
        </Popover>
      </SelectVoucherCampaignProvider>
    </Filter.BarItem>
  );
};

export const SelectVoucherCampaignInlineCell = ({
  onValueChange,
  scope,
  ...props
}: Omit<
  React.ComponentProps<typeof SelectVoucherCampaignProvider>,
  'children'
> & {
  scope?: string;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <SelectVoucherCampaignProvider
      onValueChange={(value) => {
        onValueChange?.(value);
        setOpen(false);
      }}
      {...props}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <RecordTableInlineCell.Trigger>
          <SelectVoucherCampaignValue placeholder="" />
        </RecordTableInlineCell.Trigger>
        <RecordTableInlineCell.Content>
          <SelectVoucherCampaignContent />
        </RecordTableInlineCell.Content>
      </Popover>
    </SelectVoucherCampaignProvider>
  );
};

export const SelectVoucherCampaignFormItem = ({
  onValueChange,
  className,
  placeholder,
  ...props
}: Omit<
  React.ComponentProps<typeof SelectVoucherCampaignProvider>,
  'children'
> & {
  className?: string;
  placeholder?: string;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <SelectVoucherCampaignProvider
      onValueChange={(value) => {
        onValueChange?.(value);
        setOpen(false);
      }}
      {...props}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <Form.Control>
          <Combobox.Trigger className={cn('w-full shadow-xs', className)}>
            <SelectVoucherCampaignValue placeholder={placeholder} />
          </Combobox.Trigger>
        </Form.Control>

        <Combobox.Content>
          <SelectVoucherCampaignContent />
        </Combobox.Content>
      </Popover>
    </SelectVoucherCampaignProvider>
  );
};

SelectVoucherCampaignFormItem.displayName = 'SelectVoucherCampaignFormItem';

const SelectVoucherCampaignRoot = React.forwardRef<
  React.ElementRef<typeof Combobox.Trigger>,
  Omit<React.ComponentProps<typeof SelectVoucherCampaignProvider>, 'children'> &
    React.ComponentProps<typeof Combobox.Trigger> & {
      placeholder?: string;
    }
>(({ onValueChange, className, mode, value, placeholder, ...props }, ref) => {
  const [open, setOpen] = useState(false);

  return (
    <SelectVoucherCampaignProvider
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
          <SelectVoucherCampaignValue placeholder={placeholder} />
        </Combobox.Trigger>

        <Combobox.Content>
          <SelectVoucherCampaignContent />
        </Combobox.Content>
      </Popover>
    </SelectVoucherCampaignProvider>
  );
});

SelectVoucherCampaignRoot.displayName = 'SelectVoucherCampaignRoot';

export const SelectVoucherCampaign = Object.assign(SelectVoucherCampaignRoot, {
  Provider: SelectVoucherCampaignProvider,
  Value: SelectVoucherCampaignValue,
  Content: SelectVoucherCampaignContent,
  FilterItem: SelectVoucherCampaignFilterItem,
  FilterView: SelectVoucherCampaignFilterView,
  FilterBar: SelectVoucherCampaignFilterBar,
  InlineCell: SelectVoucherCampaignInlineCell,
  FormItem: SelectVoucherCampaignFormItem,
});
