import React, { useState } from 'react';
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

export const SelectCategory = React.forwardRef<
  React.ElementRef<typeof Combobox.Trigger>,
  React.ComponentPropsWithoutRef<typeof Combobox.Trigger> & {
    selected?: string;
    onSelect: (categoryId: string) => void;
    open?: boolean;
    setOpen?: (open: boolean) => void;
    id?: string;
  }
>(({ onSelect, selected, id, open, setOpen, ...props }, ref) => {
  const [_open, _setOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<IProductCategory>();
  const { productCategories, error, loading } = useProductCategories({
    onCompleted: ({
      productCategories,
    }: {
      productCategories: IProductCategory[];
    }) => {
      setSelectedCategory(
        productCategories?.find(
          (category: IProductCategory) => category._id === selected,
        ),
      );
    },
  });
  const handleSelect = (categoryId: string) => {
    const category = productCategories?.find(
      (category: IProductCategory) => category._id === categoryId,
    );
    setSelectedCategory(category);
    onSelect(categoryId);
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
                <div className="flex flex-col gap-2 justify-center items-center text-sm text-center text-muted-foreground">
                  No categories found
                  <Button variant="secondary" size="sm" asChild>
                    <Link to="/settings/products/categories">Add Category</Link>
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
      <div className="flex overflow-hidden flex-auto gap-2 justify-start items-center">
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
        <div className="flex gap-2 items-center">
          <Skeleton className="w-8 h-4" />
          <Skeleton className="w-16 h-4" />
        </div>
      )}
    </Combobox.Trigger>
  );
});
