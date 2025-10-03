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
import { useBrands } from '../hooks/useBrands';
import { IBrand } from '../types/brand';
import { useDebounce } from 'use-debounce';
import React, { useState } from 'react';
import {
  SelectBrandContext,
  useSelectBrandContext,
} from '../contexts/SelectBrandContext';
import { BrandsInline } from '../components/BrandsInline';
import { IconLabel } from '@tabler/icons-react';

export const SelectBrandProvider = ({
  children,
  mode = 'single',
  value,
  onValueChange,
  brands,
}: {
  children: React.ReactNode;
  mode?: 'single' | 'multiple';
  value?: string[] | string;
  onValueChange: (value: string[] | string) => void;
  brands?: IBrand[];
}) => {
  const [_brands, setBrands] = useState<IBrand[]>(brands || []);
  const isSingleMode = mode === 'single';

  const onSelect = (brand: IBrand) => {
    if (!brand) return;
    if (isSingleMode) {
      setBrands([brand]);
      return onValueChange?.(brand._id);
    }

    const arrayValue = Array.isArray(value) ? value : [];

    const isBrandSelected = arrayValue.includes(brand._id);
    const newSelectedBrandIds = isBrandSelected
      ? arrayValue.filter((id) => id !== brand._id)
      : [...arrayValue, brand._id];

    setBrands((prev) =>
      [...prev, brand].filter((b) => newSelectedBrandIds.includes(b._id)),
    );
    onValueChange?.(newSelectedBrandIds);
  };

  return (
    <SelectBrandContext.Provider
      value={{
        brands: _brands,
        brandIds: !value ? [] : Array.isArray(value) ? value : [value],
        onSelect,
        setBrands,
        loading: false,
        error: null,
      }}
    >
      {children}
    </SelectBrandContext.Provider>
  );
};

const SelectBrandValue = ({ placeholder }: { placeholder?: string }) => {
  const { brandIds, brands, setBrands } = useSelectBrandContext();

  return (
    <BrandsInline
      brandIds={brandIds}
      brands={brands}
      updateBrands={setBrands}
      placeholder={placeholder}
    />
  );
};

const SelectBrandCommandItem = ({ brand }: { brand: IBrand }) => {
  const { onSelect, brandIds } = useSelectBrandContext();

  return (
    <Command.Item
      value={brand._id}
      onSelect={() => {
        onSelect(brand);
      }}
    >
      <BrandsInline brands={[brand]} placeholder="Unnamed user" />
      <Combobox.Check checked={brandIds.includes(brand._id)} />
    </Command.Item>
  );
};

const SelectBrandContent = () => {
  const [search, setSearch] = React.useState('');
  const [debouncedSearch] = useDebounce(search, 500);
  const { brands: selectedBrands } = useSelectBrandContext();

  const {
    brands = [],
    loading,
    handleFetchMore,
    totalCount = 0,
  } = useBrands({
    variables: {
      searchValue: debouncedSearch,
    },
  });

  return (
    <Command shouldFilter={false} id="brand-command-menu">
      <Command.Input
        value={search}
        onValueChange={setSearch}
        variant="secondary"
        wrapperClassName="flex-auto"
        placeholder="Search brand..."
        className="h-9"
      />
      <Command.List>
        <Combobox.Empty loading={loading} />
        {selectedBrands.length > 0 && (
          <>
            {selectedBrands?.map((brand) => (
              <SelectBrandCommandItem key={brand._id} brand={brand} />
            ))}
            <Command.Separator className="my-1" />
          </>
        )}
        {brands
          .filter((brand) => !selectedBrands.some((b) => b._id === brand._id))
          .map((brand) => (
            <SelectBrandCommandItem key={brand._id} brand={brand} />
          ))}
        <Combobox.FetchMore
          fetchMore={handleFetchMore}
          totalCount={totalCount}
          currentLength={brands.length}
        />
      </Command.List>
    </Command>
  );
};

export const SelectBrandFilterItem = () => {
  return (
    <Filter.Item value="brand">
      <IconLabel />
      Brand
    </Filter.Item>
  );
};

export const SelectBrandFilterView = ({
  onValueChange,
  queryKey,
  mode = 'single',
}: {
  onValueChange?: (value: string[] | string) => void;
  queryKey?: string;
  mode?: 'single' | 'multiple';
}) => {
  const [brand, setBrand] = useQueryState<string[] | string>(
    queryKey || 'brand',
  );
  const { resetFilterState } = useFilterContext();

  return (
    <Filter.View filterKey={queryKey || 'brand'}>
      <SelectBrandProvider
        mode={mode}
        value={brand || (mode === 'single' ? '' : [])}
        onValueChange={(value) => {
          setBrand(value as string[] | string);
          resetFilterState();
          onValueChange?.(value);
        }}
      >
        <SelectBrandContent />
      </SelectBrandProvider>
    </Filter.View>
  );
};

export const SelectBrandFilterBar = ({
  iconOnly,
  onValueChange,
  queryKey,
  mode = 'single',
}: {
  iconOnly?: boolean;
  onValueChange?: (value: string[] | string) => void;
  queryKey?: string;
  mode?: 'single' | 'multiple';
}) => {
  const [brand, setBrand] = useQueryState<string[] | string>(
    queryKey || 'brand',
  );
  const [open, setOpen] = useState(false);

  return (
    <Filter.BarItem queryKey={queryKey || 'brand'}>
      <Filter.BarName>
        <IconLabel />
        {!iconOnly && 'Brand'}
      </Filter.BarName>
      <SelectBrandProvider
        mode={mode}
        value={brand || (mode === 'single' ? '' : [])}
        onValueChange={(value) => {
          if (value.length > 0) {
            setBrand(value as string[] | string);
          } else {
            setBrand(null);
          }
          setOpen(false);
          onValueChange?.(value);
        }}
      >
        <Popover open={open} onOpenChange={setOpen}>
          <Popover.Trigger asChild>
            <Filter.BarButton filterKey={queryKey || 'brand'}>
              <SelectBrandValue />
            </Filter.BarButton>
          </Popover.Trigger>
          <Combobox.Content>
            <SelectBrandContent />
          </Combobox.Content>
        </Popover>
      </SelectBrandProvider>
    </Filter.BarItem>
  );
};

export const SelectBrandInlineCell = ({
  onValueChange,
  scope,
  ...props
}: Omit<React.ComponentProps<typeof SelectBrandProvider>, 'children'> & {
  scope?: string;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <SelectBrandProvider
      onValueChange={(value) => {
        onValueChange?.(value);
        setOpen(false);
      }}
      {...props}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <RecordTableInlineCell.Trigger>
          <SelectBrandValue placeholder={''} />
        </RecordTableInlineCell.Trigger>
        <RecordTableInlineCell.Content>
          <SelectBrandContent />
        </RecordTableInlineCell.Content>
      </Popover>
    </SelectBrandProvider>
  );
};

export const SelectBrandFormItem = ({
  onValueChange,
  className,
  placeholder,
  ...props
}: Omit<React.ComponentProps<typeof SelectBrandProvider>, 'children'> & {
  className?: string;
  placeholder?: string;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <SelectBrandProvider
      onValueChange={(value) => {
        onValueChange?.(value);
        setOpen(false);
      }}
      {...props}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <Form.Control>
          <Combobox.Trigger className={cn('w-full shadow-xs', className)}>
            <SelectBrandValue placeholder={placeholder} />
          </Combobox.Trigger>
        </Form.Control>

        <Combobox.Content>
          <SelectBrandContent />
        </Combobox.Content>
      </Popover>
    </SelectBrandProvider>
  );
};

SelectBrandFormItem.displayName = 'SelectBrandFormItem';

const SelectBrandRoot = React.forwardRef<
  React.ElementRef<typeof Combobox.Trigger>,
  Omit<React.ComponentProps<typeof SelectBrandProvider>, 'children'> &
    React.ComponentProps<typeof Combobox.Trigger> & {
      placeholder?: string;
    }
>(({ onValueChange, className, mode, value, placeholder, ...props }, ref) => {
  const [open, setOpen] = useState(false);
  return (
    <SelectBrandProvider
      onValueChange={(value) => {
        onValueChange?.(value);
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
          <SelectBrandValue placeholder={placeholder} />
        </Combobox.Trigger>
        <Combobox.Content>
          <SelectBrandContent />
        </Combobox.Content>
      </Popover>
    </SelectBrandProvider>
  );
});

SelectBrandRoot.displayName = 'SelectBrandRoot';

export const SelectBrand = Object.assign(SelectBrandRoot, {
  Provider: SelectBrandProvider,
  Value: SelectBrandValue,
  Content: SelectBrandContent,
  FilterItem: SelectBrandFilterItem,
  FilterView: SelectBrandFilterView,
  FilterBar: SelectBrandFilterBar,
  InlineCell: SelectBrandInlineCell,
  FormItem: SelectBrandFormItem,
});
