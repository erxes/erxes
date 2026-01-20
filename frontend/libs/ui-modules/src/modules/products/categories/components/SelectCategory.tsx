import React, { useState, createContext, useContext, useEffect } from 'react';
import {
  Combobox,
  Command,
  Skeleton,
  TextOverflowTooltip,
  SelectTree,
  Button,
} from 'erxes-ui';
import { Link } from 'react-router-dom';
import { IProductCategory } from '../types/category';
import { useProductCategories } from '../hooks/useCategories';

interface SelectCategoryContextType {
  categoryIds: string[];
  onSelect: (category: IProductCategory) => void;
  categories: IProductCategory[];
  setCategories: React.Dispatch<React.SetStateAction<IProductCategory[]>>;
  loading: boolean;
  error: any;
  mode: 'single' | 'multiple';
}

const SelectCategoryContext = createContext<SelectCategoryContextType | null>(
  null,
);

export const useSelectCategoryContext = () => {
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
  const categoryIds = !value ? [] : Array.isArray(value) ? value : [value];

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
        mode,
      }}
    >
      {children}
    </SelectCategoryContext.Provider>
  );
};

export const SelectCategoryMain = React.forwardRef<
  React.ElementRef<typeof Combobox.Trigger>,
  React.ComponentPropsWithoutRef<typeof Combobox.Trigger> & {
    selected?: string;
    onSelect?: (categoryId: string) => void;
    open?: boolean;
    setOpen?: (open: boolean) => void;
    id?: string;
    value?: string[] | string;
    onValueChange?: (value: string[] | string) => void;
    mode?: 'single' | 'multiple';
  }
>(
  (
    {
      onSelect,
      selected,
      id,
      open,
      setOpen,
      value,
      onValueChange,
      mode = 'single',
      ...props
    },
    ref,
  ) => {
    const [_open, _setOpen] = useState(false);
    const { productCategories, error, loading } = useProductCategories({
      onCompleted: ({
        productCategories,
      }: {
        productCategories: IProductCategory[];
      }) => {
        if (selected && onSelect) {
          const category = productCategories?.find(
            (category: IProductCategory) => category._id === selected,
          );
          if (category) {
            onSelect(category._id);
          }
        }
      },
    });

    if (value !== undefined || onValueChange) {
      return (
        <SelectCategoryProvider
          value={value}
          onValueChange={onValueChange}
          mode={mode}
        >
          <SelectCategoryRoot
            ref={ref}
            id={id}
            open={open}
            setOpen={setOpen}
            {...props}
          />
        </SelectCategoryProvider>
      );
    }

    const [selectedCategory, setSelectedCategory] =
      useState<IProductCategory>();

    const handleSelect = (categoryId: string) => {
      const category = productCategories?.find(
        (category: IProductCategory) => category._id === categoryId,
      );
      setSelectedCategory(category);
      onSelect?.(categoryId);
      setOpen?.(false);
      _setOpen(false);
    };

    return (
      <SelectTree
        id={id || 'select-category'}
        open={open ?? _open}
        onOpenChange={setOpen ?? _setOpen}
      >
        <SelectCategoryTrigger
          ref={ref}
          {...props}
          selectedCategory={selectedCategory}
          loading={loading}
        />
        <Combobox.Content>
          <Command className="outline-hidden">
            <Command.Input />
            <Command.List>
              {loading ? (
                <Combobox.Empty error={error} loading={loading} />
              ) : (
                <Command.Empty>
                  <div className="text-center text-sm text-muted-foreground flex justify-center flex-col items-center gap-2">
                    No categories found
                    <Button variant="secondary" size="sm" asChild>
                      <Link to="/products/categories">Add Category</Link>
                    </Button>
                  </div>
                </Command.Empty>
              )}
              {productCategories?.map((category: IProductCategory) => (
                <SelectCategoryItem
                  key={category._id}
                  category={category}
                  selected={selectedCategory?._id === category._id}
                  onSelect={handleSelect}
                  hasChildren={
                    productCategories.find(
                      (c: IProductCategory) => c.parentId === category._id,
                    ) !== undefined
                  }
                />
              ))}
            </Command.List>
          </Command>
        </Combobox.Content>
      </SelectTree>
    );
  },
);

const SelectCategoryRoot = React.forwardRef<
  React.ElementRef<typeof Combobox.Trigger>,
  React.ComponentPropsWithoutRef<typeof Combobox.Trigger> & {
    open?: boolean;
    setOpen?: (open: boolean) => void;
    id?: string;
  }
>(({ open, setOpen, id, ...props }, ref) => {
  const [_open, _setOpen] = useState(false);
  const { categoryIds, categories, setCategories } = useSelectCategoryContext();
  const { productCategories, error, loading } = useProductCategories();

  useEffect(() => {
    if (
      !loading &&
      productCategories &&
      categoryIds.length > 0 &&
      categories.length === 0
    ) {
      const initialCategories = categoryIds
        .map((id) => productCategories.find((cat) => cat._id === id))
        .filter((cat): cat is IProductCategory => cat !== undefined);

      if (initialCategories.length > 0) {
        setCategories(initialCategories);
      }
    }
  }, [productCategories, categoryIds, categories, loading, setCategories]);

  return (
    <SelectTree
      id={id || 'select-category'}
      open={open ?? _open}
      onOpenChange={setOpen ?? _setOpen}
    >
      <SelectCategoryTriggerNew ref={ref} {...props} loading={loading} />
      <Combobox.Content>
        <Command className="outline-hidden">
          <Command.Input />
          <Command.List>
            {loading ? (
              <Combobox.Empty error={error} loading={loading} />
            ) : (
              <Command.Empty>
                <div className="text-center text-sm text-muted-foreground flex justify-center flex-col items-center gap-2">
                  No categories found
                  <Button variant="secondary" size="sm" asChild>
                    <Link to="/products/categories">Add Category</Link>
                  </Button>
                </div>
              </Command.Empty>
            )}
            {categories?.length > 0 && (
              <>
                {categories.map((category) => (
                  <SelectCategoryItemNew
                    key={category._id}
                    category={category}
                  />
                ))}
                <Command.Separator className="my-1" />
              </>
            )}
            {!loading &&
              productCategories
                ?.filter((category) => !categoryIds.includes(category._id))
                .map((category) => (
                  <SelectCategoryItemNew
                    key={category._id}
                    category={category}
                  />
                ))}
          </Command.List>
        </Command>
      </Combobox.Content>
    </SelectTree>
  );
});

const SelectCategoryItemNew = ({
  category,
}: {
  category: IProductCategory;
}) => {
  const { onSelect, categoryIds } = useSelectCategoryContext();
  const { productCategories } = useProductCategories();

  return (
    <SelectTree.Item
      _id={category._id}
      order={category.order}
      hasChildren={
        productCategories?.find(
          (c: IProductCategory) => c.parentId === category._id,
        ) !== undefined
      }
      name={category.name}
      value={category.code + category.name}
      onSelect={() => onSelect(category)}
    >
      <SelectCategoryBadge
        category={category}
        selected={categoryIds.includes(category._id)}
      />
    </SelectTree.Item>
  );
};

const SelectCategoryTriggerNew = React.forwardRef<
  React.ElementRef<typeof Combobox.Trigger>,
  React.ComponentPropsWithoutRef<typeof Combobox.Trigger> & {
    loading: boolean;
  }
>(({ loading, className, ...props }, ref) => {
  const { categories, categoryIds } = useSelectCategoryContext();

  return (
    <Combobox.Trigger ref={ref} className={className} {...props}>
      {categories?.length > 0 ? (
        <div className="flex items-center gap-2 flex-auto overflow-hidden justify-start">
          {categories.map((category) => (
            <SelectCategoryBadge
              key={category._id}
              category={category}
              selected={categoryIds.includes(category._id)}
            />
          ))}
        </div>
      ) : (
        <Combobox.Value placeholder="Select category" />
      )}
      {loading && (
        <div className="flex items-center gap-2">
          <Skeleton className="w-8 h-4" />
          <Skeleton className="w-16 h-4" />
        </div>
      )}
    </Combobox.Trigger>
  );
});

export const SelectCategoryItem = ({
  category,
  selected,
  onSelect,
  hasChildren,
}: {
  category: IProductCategory;
  selected: boolean;
  onSelect: (categoryId: string) => void;
  hasChildren: boolean;
}) => {
  const { _id, code, name, order } = category;

  return (
    <SelectTree.Item
      _id={_id}
      order={order}
      hasChildren={hasChildren}
      name={name}
      value={code + name}
      onSelect={() => onSelect(_id)}
    >
      <SelectCategoryBadge category={category} selected={selected} />
    </SelectTree.Item>
  );
};

export const SelectCategoryBadge = ({
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
      <div className="flex items-center gap-2 flex-auto overflow-hidden justify-start">
        <div className="text-muted-foreground">{code}</div>
        <TextOverflowTooltip value={name} className="flex-auto" />
      </div>
      <Combobox.Check checked={selected} />
    </>
  );
};

export const SelectCategoryTrigger = React.forwardRef<
  React.ElementRef<typeof Combobox.Trigger>,
  React.ComponentPropsWithoutRef<typeof Combobox.Trigger> & {
    selectedCategory: IProductCategory | undefined;
    loading: boolean;
  }
>(({ selectedCategory, loading, className, ...props }, ref) => {
  return (
    <Combobox.Trigger ref={ref} className={className} {...props}>
      <SelectCategoryBadge category={selectedCategory} />
      {!selectedCategory && <Combobox.Value placeholder="Select category" />}
      {loading && (
        <div className="flex items-center gap-2">
          <Skeleton className="w-8 h-4" />
          <Skeleton className="w-16 h-4" />
        </div>
      )}
    </Combobox.Trigger>
  );
});

export const SelectCategory = Object.assign(SelectCategoryMain, {
  Provider: SelectCategoryProvider,
  Root: SelectCategoryRoot,
  Item: SelectCategoryItem,
  Badge: SelectCategoryBadge,
  Trigger: SelectCategoryTrigger,
});
