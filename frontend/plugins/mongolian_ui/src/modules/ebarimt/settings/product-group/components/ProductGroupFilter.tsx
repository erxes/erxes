import { IconToggleLeft } from '@tabler/icons-react';
import {
  Combobox,
  Command,
  Filter,
  Popover,
  useFilterContext,
  useFilterQueryState,
  useMultiQueryState,
  useRecordTableCursor,
} from 'erxes-ui';
import { useState } from 'react';
import { SelectProduct } from 'ui-modules';
import { useTranslation } from 'react-i18next';
import { PRODUCT_GROUP_CURSOR_SESSION_KEY } from '@/ebarimt/settings/product-group/constants/productGroupRowDefaultVariables';
import { ProductGroupTotalCount } from '@/ebarimt/settings/product-group/components/ProductGroupTotalCount';

const PRODUCT_GROUP_FILTER_ID = 'product-group-filter';

const STATUS_OPTIONS = [
  { value: 'active', label: 'active' },
  { value: 'inactive', label: 'inactive' },
];

const useResetProductGroupCursor = () => {
  const { setCursor } = useRecordTableCursor({
    sessionKey: PRODUCT_GROUP_CURSOR_SESSION_KEY,
  });
  return () => setCursor('');
};

const StatusFilterContent = ({
  value,
  onSelect,
}: {
  value?: string | null;
  onSelect: (value: string) => void;
}) => {
  const { t } = useTranslation('mongolian');
  return (
  <Command>
    <Command.List>
      {STATUS_OPTIONS.map((option) => (
        <Command.Item
          key={option.value}
          value={option.value}
          onSelect={() => onSelect(option.value)}
        >
          <span className="font-medium">{t(option.label)}</span>
          <Combobox.Check checked={value === option.value} />
        </Command.Item>
      ))}
    </Command.List>
  </Command>
  );
};

const StatusFilterView = () => {
  const { sessionKey, resetFilterState } = useFilterContext();
  const [status, setStatus] = useFilterQueryState<string>(
    'status',
    sessionKey ?? '',
  );

  return (
    <Filter.View filterKey="status">
      <StatusFilterContent
        value={status}
        onSelect={(value) => {
          setStatus(value);
          resetFilterState();
        }}
      />
    </Filter.View>
  );
};

const StatusFilterBar = () => {
  const { t } = useTranslation('mongolian');
  const { sessionKey } = useFilterContext();
  const [status, setStatus] = useFilterQueryState<string>(
    'status',
    sessionKey ?? '',
  );
  const [open, setOpen] = useState(false);

  if (!status) {
    return null;
  }

  const label =
    STATUS_OPTIONS.find((option) => option.value === status)?.label ?? status;

  return (
    <Filter.BarItem queryKey="status">
      <Filter.BarName>
        <IconToggleLeft />
        {t('status')}
      </Filter.BarName>
      <Popover open={open} onOpenChange={setOpen}>
        <Popover.Trigger asChild>
          <Filter.BarButton filterKey="status">{t(label)}</Filter.BarButton>
        </Popover.Trigger>
        <Combobox.Content>
          <StatusFilterContent
            value={status}
            onSelect={(value) => {
              setStatus(value);
              setOpen(false);
            }}
          />
        </Combobox.Content>
      </Popover>
    </Filter.BarItem>
  );
};

const ProductGroupFilterPopover = () => {
  const { t } = useTranslation('mongolian');
  const resetCursor = useResetProductGroupCursor();
  const [queries] = useMultiQueryState<{
    searchValue: string;
    productId: string;
    status: string;
  }>(['searchValue', 'productId', 'status']);

  const hasFilters = Object.values(queries || {}).some(
    (value) => value !== null,
  );

  return (
    <Filter.Popover scope={PRODUCT_GROUP_FILTER_ID}>
      <Filter.Trigger isFiltered={hasFilters} />
      <Combobox.Content>
        <Filter.View>
          <Command>
            <Filter.CommandInput
              placeholder={t('filter')}
              variant="secondary"
              className="bg-background"
            />
            <Command.List className="p-1">
              <Filter.SearchValueTrigger />
              <SelectProduct.FilterItem value="productId" label={t('product')} />
              <Filter.Item value="status">
                <IconToggleLeft />
                {t('status')}
              </Filter.Item>
            </Command.List>
          </Command>
        </Filter.View>
        <SelectProduct.FilterView
          filterKey="productId"
          onValueChange={resetCursor}
        />
        <StatusFilterView />
      </Combobox.Content>
    </Filter.Popover>
  );
};

export const ProductGroupFilter = () => {
  const { t } = useTranslation('mongolian');
  const resetCursor = useResetProductGroupCursor();

  return (
    <Filter
      id={PRODUCT_GROUP_FILTER_ID}
      sessionKey={PRODUCT_GROUP_CURSOR_SESSION_KEY}
    >
      <Filter.Bar>
        <ProductGroupFilterPopover />
        <Filter.SearchValueBarItem />
        <SelectProduct.FilterBar
          filterKey="productId"
          label={t('product')}
          onValueChange={resetCursor}
        />
        <StatusFilterBar />
        <ProductGroupTotalCount />
      </Filter.Bar>
      <Filter.Dialog>
        <Filter.View filterKey="searchValue" inDialog>
          <Filter.DialogStringView filterKey="searchValue" label={t('search')} />
        </Filter.View>
      </Filter.Dialog>
    </Filter>
  );
};
