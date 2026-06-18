import { useProductCategories } from '@/products/product-category/hooks/useProductCategories';
import {
  IconCheck,
  IconCircleDot,
  IconFolders,
  IconSearch,
} from '@tabler/icons-react';
import {
  Combobox,
  Command,
  Filter,
  Popover,
  Select,
  TextOverflowTooltip,
  useFilterContext,
  useQueryState,
} from 'erxes-ui';
import { useEffect, useState } from 'react';
import { IProductCategory } from 'ui-modules';
import { CategoryHotKeyScope } from '../types/CategoryHotKeyScope';
import { CategoryTotalCount } from './CategoryTotalCount';

const STATUS_OPTIONS = [
  { label: 'Active', value: 'active' },
  { label: 'Disabled', value: 'disabled' },
  { label: 'Archived', value: 'archived' },
];

const SelectParentCategoryBadge = ({
  category,
}: {
  category?: IProductCategory;
}) => {
  if (!category) return null;
  const { code, name } = category;
  return (
    <div className="flex overflow-hidden flex-auto gap-2 justify-start items-center">
      <div className="text-muted-foreground">{code}</div>
      <TextOverflowTooltip value={name} className="flex-auto" />
    </div>
  );
};

const ParentCategoryOptionItem = ({
  category,
  selected,
  onSelect,
}: {
  category: IProductCategory;
  selected?: IProductCategory;
  onSelect: (categoryId: string) => void;
}) => {
  return (
    <Command.Item
      key={category._id}
      value={category._id}
      onSelect={() => onSelect(category._id)}
    >
      <div className="flex flex-auto gap-2 items-center">
        <span className="text-muted-foreground">{category.code}</span>
        <TextOverflowTooltip
          value={category.name}
          className="flex-auto w-auto font-medium"
        />
      </div>
      {selected?._id === category._id && <IconCheck />}
    </Command.Item>
  );
};

const ParentCategoryFilterBar = () => {
  const [query, setQuery] = useQueryState<string>('parentId');
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selected, setSelected] = useState<IProductCategory>();
  const { productCategories } = useProductCategories();

  useEffect(() => {
    if (query && productCategories) {
      setSelected(
        productCategories.find((c: IProductCategory) => c._id === query),
      );
    } else if (!query) {
      setSelected(undefined);
    }
  }, [query, productCategories]);

  if (!query) {
    return null;
  }

  const handleSelect = (categoryId: string) => {
    const category = productCategories?.find(
      (c: IProductCategory) => c._id === categoryId,
    );
    setSelected(category);
    setQuery(categoryId || null);
    setIsOpen(false);
  };

  return (
    <Filter.BarItem queryKey="parentId">
      <Filter.BarName>
        <IconFolders />
        Parent
      </Filter.BarName>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <Popover.Trigger asChild>
          <Filter.BarButton filterKey="parentId">
            <SelectParentCategoryBadge category={selected} />
            {!selected && <Combobox.Value placeholder="Select parent" />}
          </Filter.BarButton>
        </Popover.Trigger>
        <Combobox.Content>
          <Command className="outline-hidden">
            <Command.Input placeholder="Search categories" />
            <Command.List>
              {productCategories?.map((category: IProductCategory) => (
                <ParentCategoryOptionItem
                  key={category._id}
                  category={category}
                  selected={selected}
                  onSelect={handleSelect}
                />
              ))}
            </Command.List>
          </Command>
        </Combobox.Content>
      </Popover>
    </Filter.BarItem>
  );
};

const ParentCategoryFilterView = () => {
  const [query, setQuery] = useQueryState<string>('parentId');
  const { resetFilterState } = useFilterContext();
  const [selected, setSelected] = useState<IProductCategory>();
  const { productCategories, loading } = useProductCategories();

  useEffect(() => {
    if (!productCategories) return;
    if (!query) {
      setSelected(undefined);
      return;
    }
    setSelected(
      productCategories.find((c: IProductCategory) => c._id === query),
    );
  }, [query, productCategories]);

  const handleSelect = (categoryId: string) => {
    const category = productCategories?.find(
      (c: IProductCategory) => c._id === categoryId,
    );
    setSelected(category);
    setQuery(categoryId);
    resetFilterState();
  };

  const hasCategories = (productCategories?.length ?? 0) > 0;

  const renderPlaceholder = () => {
    if (loading) {
      return <Combobox.Empty loading={loading} />;
    }
    if (hasCategories) {
      return null;
    }
    return (
      <Command.Empty>
        <div className="flex flex-col gap-2 justify-center items-center text-sm text-center text-muted-foreground">
          No categories found
        </div>
      </Command.Empty>
    );
  };

  return (
    <Filter.View filterKey="parentId">
      <Command className="outline-hidden">
        <Command.Input placeholder="Search categories" />
        <Command.List>
          {renderPlaceholder()}
          {productCategories?.map((category: IProductCategory) => (
            <ParentCategoryOptionItem
              key={category._id}
              category={category}
              selected={selected}
              onSelect={handleSelect}
            />
          ))}
        </Command.List>
      </Command>
    </Filter.View>
  );
};

const StatusFilterItem = () => {
  return (
    <Filter.Item value="status">
      <IconCircleDot />
      Status
    </Filter.Item>
  );
};

const StatusFilterView = () => {
  const [status, setStatus] = useQueryState<string>('status');
  const { resetFilterState } = useFilterContext();

  return (
    <Filter.View filterKey="status">
      <Command className="outline-hidden">
        <Command.List className="p-1">
          {STATUS_OPTIONS.map((option) => (
            <Command.Item
              key={option.value}
              value={option.value}
              onSelect={() => {
                setStatus(option.value);
                resetFilterState();
              }}
            >
              <IconCircleDot />
              {option.label}
              {status === option.value && <IconCheck className="ml-auto" />}
            </Command.Item>
          ))}
        </Command.List>
      </Command>
    </Filter.View>
  );
};

const StatusFilterBar = () => {
  const [status, setStatus] = useQueryState<string>('status');

  if (!status) {
    return null;
  }

  return (
    <Filter.BarItem queryKey="status">
      <Filter.BarName>
        <IconCircleDot />
        Status
      </Filter.BarName>
      <Select
        value={status || ''}
        onValueChange={(value) => setStatus(value || null)}
      >
        <Filter.BarButton filterKey="status">
          <Select.Value placeholder="Select status" />
        </Filter.BarButton>
        <Select.Content>
          {STATUS_OPTIONS.map((option) => (
            <Select.Item key={option.value} value={option.value}>
              {option.label}
            </Select.Item>
          ))}
        </Select.Content>
      </Select>
    </Filter.BarItem>
  );
};

export const CategoryFilter = () => {
  return (
    <Filter id="products-filter">
      <Filter.Bar>
        <CategoriesFilterPopover />
        <Filter.SearchValueBarItem />
        <ParentCategoryFilterBar />
        <StatusFilterBar />
        <CategoryTotalCount />
      </Filter.Bar>
    </Filter>
  );
};

export const CategoriesFilterPopover = () => {
  return (
    <>
      <Filter.Popover scope={CategoryHotKeyScope.CategoriesPage}>
        <Filter.Trigger />
        <Combobox.Content>
          <Filter.View>
            <Command>
              <Filter.CommandInput placeholder="Filter" variant="secondary" />

              <Command.List className="p-1">
                <Filter.Item value="searchValue" inDialog>
                  <IconSearch />
                  Search
                </Filter.Item>
                <Filter.Item value="parentId">
                  <IconFolders />
                  Parent
                </Filter.Item>
                <StatusFilterItem />
              </Command.List>
            </Command>
          </Filter.View>
          <ParentCategoryFilterView />
          <StatusFilterView />
        </Combobox.Content>
      </Filter.Popover>
      <Filter.Dialog>
        <Filter.View filterKey="searchValue" inDialog>
          <Filter.DialogStringView filterKey="searchValue" />
        </Filter.View>
      </Filter.Dialog>
    </>
  );
};
