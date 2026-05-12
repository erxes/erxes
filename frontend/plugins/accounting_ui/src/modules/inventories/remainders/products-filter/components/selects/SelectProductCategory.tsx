import {
  Combobox,
  Command,
  Filter,
  Popover,
  TextOverflowTooltip,
  useFilterContext,
  useQueryState,
} from 'erxes-ui';
import { IProductCategory } from 'ui-modules';
import { IconCheck, IconFolders } from '@tabler/icons-react';
import { useCallback, useEffect, useState } from 'react';
import { useProductCategories } from '../../../hooks/useProductCategories';

function CategoryBadge({ category }: Readonly<{ category?: IProductCategory }>) {
  if (!category) return null;
  return (
    <div className="flex overflow-hidden flex-auto gap-2 justify-start items-center">
      <div className="text-muted-foreground">{category.code}</div>
      <TextOverflowTooltip value={category.name} className="flex-auto" />
    </div>
  );
}

function CategoryCommandItem({
  category,
  selectedCategory,
  onSelect,
}: Readonly<{
  category: IProductCategory;
  selectedCategory?: IProductCategory;
  onSelect: (id: string) => void;
}>) {
  const handleSelect = useCallback(() => onSelect(category._id), [category._id, onSelect]);
  return (
    <Command.Item key={category._id} value={category._id} onSelect={handleSelect}>
      <div className="flex flex-auto gap-2 items-center">
        <span className="text-muted-foreground">{category.code}</span>
        <TextOverflowTooltip
          value={category.name}
          className="flex-auto w-auto font-medium"
        />
      </div>
      {selectedCategory?._id === category._id && <IconCheck />}
    </Command.Item>
  );
}

export function SelectProductCategoryFilterItem({
  value,
  label,
}: Readonly<{
  value: string;
  label: string;
}>) {
  return (
    <Filter.Item value={value}>
      <IconFolders />
      {label}
    </Filter.Item>
  );
}

export function SelectProductCategoryFilterView({ filterKey }: Readonly<{ filterKey: string }>) {
  const [query, setQuery] = useQueryState<string[] | undefined>(filterKey);
  const { resetFilterState } = useFilterContext();
  const [selectedCategory, setSelectedCategory] = useState<IProductCategory>();
  const { productCategories, loading } = useProductCategories({
    onCompleted: ({ productCategories }: { productCategories: IProductCategory[] }) => {
      if (query?.length) {
        setSelectedCategory(productCategories?.find((c) => c._id === query[0]));
      }
    },
  });

  useEffect(() => {
    if (!productCategories) return;
    if (query?.length) {
      setSelectedCategory(productCategories.find((c) => c._id === query[0]));
    } else {
      setSelectedCategory(undefined);
    }
  }, [query, productCategories]);

  const handleSelect = (categoryId: string) => {
    setSelectedCategory(productCategories?.find((c) => c._id === categoryId));
    setQuery([categoryId]);
    resetFilterState();
  };

  const hasCategories = (productCategories?.length ?? 0) > 0;

  const renderEmptyState = () => {
    if (loading) return <Combobox.Empty loading />;
    if (hasCategories) return null;
    return (
      <Command.Empty>
        <div className="flex flex-col gap-2 justify-center items-center text-sm text-center text-muted-foreground">
          No categories found
        </div>
      </Command.Empty>
    );
  };

  return (
    <Filter.View filterKey={filterKey}>
      <Command className="outline-hidden">
        <Command.Input placeholder="Search categories" />
        <Command.List>
          {renderEmptyState()}
          {productCategories?.map((category) => (
            <CategoryCommandItem
              key={category._id}
              category={category}
              selectedCategory={selectedCategory}
              onSelect={handleSelect}
            />
          ))}
        </Command.List>
      </Command>
    </Filter.View>
  );
}

export function SelectProductCategoryFilterBar({
  filterKey,
  label,
}: Readonly<{
  filterKey: string;
  label: string;
}>) {
  const [query, setQuery] = useQueryState<string[]>(filterKey);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<IProductCategory>();
  const { productCategories } = useProductCategories();

  useEffect(() => {
    if (query?.length && productCategories) {
      setSelectedCategory(productCategories.find((c) => c._id === query[0]));
    }
  }, [query, productCategories]);

  if (!query?.length) return null;

  const handleSelect = (categoryId: string) => {
    const category = productCategories?.find((c) => c._id === categoryId);
    setSelectedCategory(category);
    setQuery(categoryId ? [categoryId] : null);
    setIsOpen(false);
  };

  return (
    <Filter.BarItem queryKey={filterKey}>
      <Filter.BarName>
        <IconFolders />
        {label}
      </Filter.BarName>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <Popover.Trigger asChild>
          <Filter.BarButton filterKey={filterKey}>
            <CategoryBadge category={selectedCategory} />
            {!selectedCategory && <Combobox.Value placeholder="Select category" />}
          </Filter.BarButton>
        </Popover.Trigger>
        <Combobox.Content>
          <Command className="outline-hidden">
            <Command.Input placeholder="Search categories" />
            <Command.List>
              {productCategories?.map((category) => (
                <CategoryCommandItem
                  key={category._id}
                  category={category}
                  selectedCategory={selectedCategory}
                  onSelect={handleSelect}
                />
              ))}
            </Command.List>
          </Command>
        </Combobox.Content>
      </Popover>
    </Filter.BarItem>
  );
}
