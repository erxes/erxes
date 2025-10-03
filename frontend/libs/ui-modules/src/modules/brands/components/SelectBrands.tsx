import { useState } from 'react';
import { IBrand, ISelectBrandsProviderProps } from '../types/brand';
import { SelectBrandsContext } from '../contexts/SelectBrandsContext';
import {
  Button,
  cn,
  Combobox,
  Command,
  Filter,
  Form,
  PopoverScoped,
  RecordTableInlineCell,
  Popover,
  TextOverflowTooltip,
  useFilterContext,
  useQueryState,
} from 'erxes-ui';
import { useBrands } from '../hooks/useBrands';
import { useSelectBrandsContext } from '../hooks/useSelectBrandsContext';
import { useDebounce } from 'use-debounce';
import { IconCheck, IconChessKnight, IconPlus } from '@tabler/icons-react';
import { BrandBadge } from './BrandBadge';
import React from 'react';
import {
  CreateBrandForm,
  SelectBrandCreateContainer,
} from './CreateBrandsForm';

export const SelectBrandsProvider = ({
  children,
  value,
  onValueChange,
  mode = 'single',
  disableCreateOption,
}: ISelectBrandsProviderProps) => {
  const [newBrandName, setNewBrandName] = useState<string>('');
  const [selectedBrands, setSelectedBrands] = useState<IBrand[]>([]);

  const handleSelectCallback = (brand: IBrand) => {
    if (!brand) return;

    const isSingleMode = mode === 'single';
    const multipleValue = (value as string[]) || [];
    const isSelected = !isSingleMode && multipleValue.includes(brand._id);

    const newSelectedBrandIds = isSingleMode
      ? [brand._id]
      : isSelected
      ? multipleValue.filter((b) => b !== brand._id)
      : [...multipleValue, brand._id];

    const newSelectedBrands = isSingleMode
      ? [brand]
      : isSelected
      ? selectedBrands.filter((b) => b._id !== brand._id)
      : [...selectedBrands, brand];

    setSelectedBrands(newSelectedBrands);
    onValueChange?.(isSingleMode ? brand._id : newSelectedBrandIds);
  };

  return (
    <SelectBrandsContext.Provider
      value={{
        onSelect: handleSelectCallback,
        value,
        selectedBrands,
        setSelectedBrands,
        newBrandName,
        setNewBrandName,
        mode,
        disableCreateOption,
      }}
    >
      {children}
    </SelectBrandsContext.Provider>
  );
};

export const SelectBrandsCommand = () => {
  const [search, setSearch] = useState<string>('');
  const [debouncedSearch] = useDebounce(search, 500);
  const { selectedBrands, disableCreateOption } = useSelectBrandsContext();
  const [noBrandsSearchValue, setNoBrandsSearchValue] = useState<string>('');

  const { brands, loading, error, handleFetchMore, totalCount } = useBrands({
    variables: {
      searchValue: debouncedSearch,
    },
    skip: !!noBrandsSearchValue && noBrandsSearchValue === debouncedSearch,
    onCompleted(data) {
      const { totalCount } = data?.brands || {};
      setNoBrandsSearchValue(totalCount === 0 ? debouncedSearch : '');
    },
  });

  return (
    <Command shouldFilter={false}>
      <Command.Input
        value={search}
        onValueChange={setSearch}
        placeholder="Search brands"
        focusOnMount
      />
      {selectedBrands?.length > 0 && (
        <>
          <div className="flex flex-wrap justify-start p-2 gap-2">
            <BrandsList />
          </div>
          <Command.Separator />
        </>
      )}

      <Command.List>
        <SelectBrandsCreate
          search={search}
          show={!disableCreateOption && !loading && !brands?.length}
        />
        <Combobox.Empty loading={loading} error={error} />
        {brands?.map((brand) => (
          <SelectBrandsItem
            key={brand._id}
            brand={{
              ...brand,
            }}
          />
        ))}
        <Combobox.FetchMore
          fetchMore={handleFetchMore}
          currentLength={brands?.length || 0}
          totalCount={totalCount as number}
        />
      </Command.List>
    </Command>
  );
};

export const SelectBrandsCreate = ({
  search,
  show,
}: {
  search: string;
  show: boolean;
}) => {
  const { setNewBrandName } = useSelectBrandsContext();

  if (!search || !show) return null;

  return (
    <Command.Item
      onSelect={() => setNewBrandName(search)}
      className="font-medium"
    >
      <IconPlus />
      Create new brand: "{search}"
    </Command.Item>
  );
};

export const SelectBrandsItem = ({ brand }: { brand: IBrand }) => {
  const { onSelect, selectedBrands } = useSelectBrandsContext();
  const isSelected = selectedBrands.some((p) => p._id === brand._id);
  return (
    <Command.Item
      key={brand._id}
      id={brand._id}
      onSelect={() => onSelect(brand)}
    >
      <TextOverflowTooltip
        value={brand.name}
        className="flex-auto w-auto font-medium"
      />
      {isSelected && <IconCheck />}
    </Command.Item>
  );
};

export const BrandsList = ({
  placeholder,
  renderAsPlainText,
  ...props
}: Omit<React.ComponentProps<typeof BrandBadge>, 'onClose'> & {
  placeholder?: string;
  renderAsPlainText?: boolean;
}) => {
  const { value, selectedBrands, setSelectedBrands, onSelect } =
    useSelectBrandsContext();

  const selectedBrandIds = Array.isArray(value) ? value : [value];

  if (!value || !value.length) {
    return <Combobox.Value placeholder={placeholder || ''} />;
  }

  return (
    <>
      {selectedBrandIds.map((brandId) => (
        <BrandBadge
          key={brandId}
          brandId={brandId}
          brand={selectedBrands.find((p) => p._id === brandId)}
          renderAsPlainText={renderAsPlainText}
          variant={'secondary'}
          onCompleted={(brand) => {
            if (!brand) return;
            if (selectedBrandIds.includes(brand._id)) {
              setSelectedBrands(
                selectedBrands.map((b) => (b._id === brand._id ? brand : b)),
              );
            }
          }}
          onClose={() =>
            onSelect?.(selectedBrands.find((p) => p._id === brandId) as IBrand)
          }
          {...props}
        />
      ))}
    </>
  );
};

export const SelectBrandsValue = () => {
  const { selectedBrands, mode } = useSelectBrandsContext();

  if (selectedBrands?.length > 1)
    return (
      <span className="text-muted-foreground">
        {selectedBrands.length} Brands selected
      </span>
    );

  return (
    <BrandsList
      placeholder="Select Brands"
      renderAsPlainText={mode === 'single'}
    />
  );
};

export const SelectBrandsContent = () => {
  const { newBrandName } = useSelectBrandsContext();

  if (newBrandName) {
    return (
      <SelectBrandCreateContainer>
        <CreateBrandForm />
      </SelectBrandCreateContainer>
    );
  }
  return <SelectBrandsCommand />;
};

export const SelectBrandsInlineCell = ({
  onValueChange,
  scope,
  ...props
}: Omit<React.ComponentProps<typeof SelectBrandsProvider>, 'children'> & {
  scope?: string;
}) => {
  const [open, setOpen] = useState<boolean>(false);

  return (
    <SelectBrandsProvider
      onValueChange={(value) => {
        onValueChange?.(value);
        setOpen(false);
      }}
      {...props}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <RecordTableInlineCell.Trigger>
          <SelectBrandsValue />
        </RecordTableInlineCell.Trigger>
        <RecordTableInlineCell.Content className="min-w-72">
          <SelectBrandsContent />
        </RecordTableInlineCell.Content>
      </Popover>
    </SelectBrandsProvider>
  );
};

export const SelectBrandsDetail = React.forwardRef<
  React.ElementRef<typeof Combobox.Trigger>,
  Omit<React.ComponentProps<typeof SelectBrandsProvider>, 'children'> &
    Omit<
      React.ComponentPropsWithoutRef<typeof Combobox.Trigger>,
      'children'
    > & {
      scope?: string;
    }
>(({ onValueChange, scope, value, mode, options, ...props }, ref) => {
  const [open, setOpen] = useState(false);
  return (
    <SelectBrandsProvider
      onValueChange={(value) => {
        onValueChange?.(value);
        setOpen(false);
      }}
      {...{ value, mode, options }}
    >
      <PopoverScoped open={open} onOpenChange={setOpen} scope={scope}>
        <Combobox.Trigger ref={ref} {...props}>
          <SelectBrandsValue />
        </Combobox.Trigger>
        <Combobox.Content>
          <SelectBrandsContent />
        </Combobox.Content>
      </PopoverScoped>
    </SelectBrandsProvider>
  );
});

SelectBrandsDetail.displayName = 'SelectBrandsDetail';

export const SelectBrandsCommandbarItem = ({
  onValueChange,
  ...props
}: Omit<React.ComponentProps<typeof SelectBrandsProvider>, 'children'>) => {
  const [open, setOpen] = useState(false);

  return (
    <SelectBrandsProvider
      onValueChange={(value) => {
        onValueChange?.(value);
        setOpen(false);
      }}
      {...props}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <Button variant={'secondary'} asChild>
          <RecordTableInlineCell.Trigger>
            <IconChessKnight />
            Brand
          </RecordTableInlineCell.Trigger>
        </Button>
        <RecordTableInlineCell.Content className="w-96">
          <SelectBrandsContent />
        </RecordTableInlineCell.Content>
      </Popover>
    </SelectBrandsProvider>
  );
};

export const SelectBrandsFormItem = ({
  onValueChange,
  className,
  ...props
}: Omit<React.ComponentProps<typeof SelectBrandsProvider>, 'children'> & {
  className?: string;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <SelectBrandsProvider
      onValueChange={(value) => {
        onValueChange?.(value);
        setOpen(false);
      }}
      {...props}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <Form.Control>
          <Combobox.Trigger className={cn('w-full shadow-xs', className)}>
            <SelectBrandsValue />
          </Combobox.Trigger>
        </Form.Control>

        <Combobox.Content>
          <SelectBrandsContent />
        </Combobox.Content>
      </Popover>
    </SelectBrandsProvider>
  );
};

export const SelectBrandsFilterItem = ({
  value,
  label,
}: {
  value: string;
  label: string;
}) => {
  return (
    <Filter.Item value={value}>
      <IconChessKnight />
      {label}
    </Filter.Item>
  );
};

export const SelectBrandsFilterView = ({
  mode,
  filterKey,
}: {
  mode: 'single' | 'multiple';
  filterKey: string;
}) => {
  const [query, setQuery] = useQueryState<string[] | string | undefined>(
    filterKey,
  );
  const { resetFilterState } = useFilterContext();

  return (
    <Filter.View filterKey={filterKey}>
      <SelectBrandsProvider
        mode={mode}
        value={query || []}
        onValueChange={(value) => {
          setQuery(value);
          resetFilterState();
        }}
      >
        <SelectBrandsContent />
      </SelectBrandsProvider>
    </Filter.View>
  );
};

export const SelectBrandsFilterBar = ({
  mode = 'multiple',
  filterKey,
  label,
}: {
  mode: 'single' | 'multiple';
  filterKey: string;
  label: string;
}) => {
  const [query, setQuery] = useQueryState<string[]>(filterKey);
  const [open, setOpen] = useState<boolean>(false);

  if (!query) {
    return null;
  }

  return (
    <Filter.BarItem queryKey={filterKey}>
      <Filter.BarName>
        <IconChessKnight />
        {label}
      </Filter.BarName>
      <SelectBrandsProvider
        mode={mode}
        value={query || []}
        onValueChange={(value) => {
          if (value && value.length > 0) {
            setQuery(value as string[]);
          } else {
            setQuery(null);
          }
          setOpen(false);
        }}
      >
        <Popover open={open} onOpenChange={setOpen}>
          <Popover.Trigger asChild>
            <Filter.BarButton filterKey={filterKey}>
              <SelectBrandsValue />
            </Filter.BarButton>
          </Popover.Trigger>
          <Combobox.Content>
            <SelectBrandsContent />
          </Combobox.Content>
        </Popover>
      </SelectBrandsProvider>
    </Filter.BarItem>
  );
};

export const SelectBrands = Object.assign(SelectBrandsProvider, {
  CommandBarItem: SelectBrandsCommandbarItem,
  Content: SelectBrandsContent,
  Command: SelectBrandsCommand,
  Item: SelectBrandsItem,
  Value: SelectBrandsValue,
  List: BrandsList,
  InlineCell: SelectBrandsInlineCell,
  FormItem: SelectBrandsFormItem,
  FilterItem: SelectBrandsFilterItem,
  FilterView: SelectBrandsFilterView,
  FilterBar: SelectBrandsFilterBar,
  Detail: SelectBrandsDetail,
});
