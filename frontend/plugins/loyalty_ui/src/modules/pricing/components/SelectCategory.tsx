import React, { useState, createContext, useContext } from 'react';
import {
  Combobox,
  Command,
  TextOverflowTooltip,
  Button,
  Popover,
  cn,
} from 'erxes-ui';
import { Link } from 'react-router-dom';
import { IProductCategory } from '@/pricing/types';
import { useProductCategories } from '@/pricing/hooks/useCategories';

interface SelectCategoryContextValue {
  categoryIds: string[];
  onSelect: (category: IProductCategory) => void;
  categories: IProductCategory[];
  setCategories: React.Dispatch<React.SetStateAction<IProductCategory[]>>;
  loading: boolean;
  error: any;
}

const SelectCategoryContext = createContext<
  SelectCategoryContextValue | undefined
>(undefined);

const useSelectCategoryContext = () => {
  const context = useContext(SelectCategoryContext);
  if (!context) {
    throw new Error(
      'useSelectCategoryContext must be used within SelectCategoryProvider',
    );
  }
  return context;
};

interface SelectCategoryProviderProps {
  children: React.ReactNode;
  value?: string[] | string;
  onValueChange?: (value: string[] | string) => void;
  mode?: 'single' | 'multiple';
}

const SelectCategoryProvider = ({
  children,
  value,
  onValueChange,
  mode = 'single',
}: SelectCategoryProviderProps) => {
  const [categories, setCategories] = useState<IProductCategory[]>([]);
  const categoryIds = Array.isArray(value) ? value : (value && [value]) || [];

  const onSelect = (category: IProductCategory) => {
    if (!category) return;
    if (mode === 'single') {
      setCategories([category]);
      onValueChange?.(category._id);
      return;
    }
    const arrayValue = Array.isArray(value) ? value : [];
    const isCategorySelected = arrayValue.includes(category._id);
    const newSelectedCategoryIds = isCategorySelected
      ? arrayValue.filter((id) => id !== category._id)
      : [...arrayValue, category._id];

    setCategories((prevCategories) => {
      const categoryMap = new Map(prevCategories.map((c) => [c._id, c]));
      categoryMap.set(category._id, category);
      return newSelectedCategoryIds
        .map((id) => categoryMap.get(id))
        .filter((c): c is IProductCategory => c !== undefined);
    });
    onValueChange?.(newSelectedCategoryIds);
  };

  return (
    <SelectCategoryContext.Provider
      value={{
        categoryIds,
        onSelect,
        categories,
        setCategories,
        loading: false,
        error: null,
      }}
    >
      {children}
    </SelectCategoryContext.Provider>
  );
};

const SelectCategoryContent = () => {
  const { categoryIds, categories } = useSelectCategoryContext();
  const { productCategories, loading, error } = useProductCategories();

  return (
    <Command shouldFilter={true}>
      <Command.Input />
      <Command.List className="max-h-[300px] overflow-y-auto">
        {categories?.length > 0 && (
          <>
            {categories.map((category) => (
              <SelectCategoryCommandItem
                key={category._id}
                category={category}
              />
            ))}
            <Command.Separator className="my-1" />
          </>
        )}
        {loading ? (
          <Combobox.Empty error={error} loading={loading} />
        ) : (
          <Command.Empty>
            <div className="flex flex-col gap-2 justify-center items-center text-sm text-center text-muted-foreground">
              No categories found
              <Button variant="secondary" size="sm" asChild>
                <Link to="/settings/products/categories">Add Category</Link>
              </Button>
            </div>
          </Command.Empty>
        )}
        {!loading &&
          productCategories
            ?.filter((category) => !categoryIds.includes(category._id))
            .map((category) => (
              <SelectCategoryCommandItem
                key={category._id}
                category={category}
              />
            ))}
      </Command.List>
    </Command>
  );
};

const SelectCategoryCommandItem = ({
  category,
}: {
  category: IProductCategory;
}) => {
  const { onSelect, categoryIds } = useSelectCategoryContext();
  return (
    <Command.Item
      value={category._id}
      onSelect={() => {
        onSelect(category);
      }}
    >
      <SelectCategoryBadge
        category={category}
        selected={categoryIds.includes(category._id)}
      />
    </Command.Item>
  );
};

const SelectCategoryRoot = React.forwardRef<
  React.ElementRef<typeof Combobox.Trigger>,
  Omit<React.ComponentProps<typeof SelectCategoryProvider>, 'children'> &
    React.ComponentProps<typeof Combobox.Trigger> & {
      placeholder?: string;
    }
>(({ onValueChange, className, mode, value, placeholder, ...props }, ref) => {
  const [open, setOpen] = useState(false);

  return (
    <SelectCategoryProvider
      mode={mode}
      value={value}
      onValueChange={(value) => {
        if (mode === 'single') {
          setOpen(false);
        }
        onValueChange?.(value);
      }}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <Combobox.Trigger
          className={cn('inline-flex w-full', className)}
          variant="outline"
          ref={ref}
          {...props}
        >
          <SelectCategoryValue placeholder={placeholder} />
        </Combobox.Trigger>
        <Combobox.Content>
          <SelectCategoryContent />
        </Combobox.Content>
      </Popover>
    </SelectCategoryProvider>
  );
});

const SelectCategoryValue = ({ placeholder }: { placeholder?: string }) => {
  const { categoryIds, categories, setCategories } = useSelectCategoryContext();
  const { productCategories } = useProductCategories();

  React.useEffect(() => {
    if (categoryIds.length > 0 && productCategories) {
      const selectedCategories = productCategories.filter((cat) =>
        categoryIds.includes(cat._id),
      );
      setCategories(selectedCategories);
    }
  }, [categoryIds, productCategories, setCategories]);

  if (categories.length === 0) {
    return <Combobox.Value placeholder={placeholder || 'Select category'} />;
  }

  const displayText =
    categories.length === 1
      ? `${categories[0].code} ${categories[0].name}`
      : `${categories[0].code}...${categories.length} categories`;

  return <div className="overflow-hidden flex-1 text-sm">{displayText}</div>;
};

const SelectCategoryBadge = ({
  category,
  selected,
}: {
  category?: IProductCategory;
  selected?: boolean;
}) => {
  if (!category) return null;
  const { code, name } = category;
  return (
    <>
      <div className="flex overflow-hidden flex-auto gap-2 justify-start items-center">
        <div className="text-muted-foreground">{code}</div>
        <TextOverflowTooltip value={name} className="flex-auto" />
      </div>
      <Combobox.Check checked={selected} />
    </>
  );
};

export const SelectCategory = Object.assign(SelectCategoryRoot, {
  Provider: SelectCategoryProvider,
  Content: SelectCategoryContent,
  Item: SelectCategoryCommandItem,
  Value: SelectCategoryValue,
});
