import React, { useMemo } from 'react';

import {
  Avatar,
  Combobox,
  Command,
  Skeleton,
  TextOverflowTooltip,
  SelectTree,
} from 'erxes-ui';

import { useProductCategories } from '@/products/product-category/hooks/useProductCategories';
import { IProductCategory } from '@/products/types/productTypes';

export const SelectCategory = React.forwardRef<
  React.ElementRef<typeof Combobox.Trigger>,
  Omit<React.ComponentPropsWithoutRef<typeof Combobox.Trigger>, 'onSelect'> & {
    selected?: string;
    onSelect: (categoryId: string) => void;
    open?: boolean;
    setOpen?: (open: boolean) => void;
    id?: string;
    excludeCategoryId?: string;
  }
>(({ onSelect, selected, id, excludeCategoryId, ...props }, ref) => {
  const { productCategories, error, loading } = useProductCategories();

  const selectedCategory = useMemo(
    () =>
      (productCategories || []).find(
        (category: IProductCategory) => category._id === selected,
      ),
    [productCategories, selected],
  );

  const excludedCategory = excludeCategoryId
    ? (productCategories || []).find(
        (c: IProductCategory) => c._id === excludeCategoryId,
      )
    : undefined;

  const availableCategories: IProductCategory[] = (
    productCategories || []
  ).filter((category: IProductCategory) => {
    if (!excludeCategoryId) return true;
    if (category._id === excludeCategoryId) return false;
    return !(
      excludedCategory?.order &&
      category.order?.startsWith(excludedCategory.order)
    );
  });

  const handleSelect = (categoryId: string) => {
    onSelect(categoryId === selected ? '' : categoryId);
  };

  return (
    <SelectTree id={id || 'select-category'}>
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
            <Combobox.Empty error={error} loading={loading} />
            {availableCategories.map((category: IProductCategory) => (
              <SelectCategoryItem
                key={category._id}
                category={category}
                selected={selectedCategory?._id === category._id}
                onSelect={handleSelect}
                hasChildren={availableCategories.some(
                  (c: IProductCategory) => c.parentId === category._id,
                )}
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
      selected={selected}
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
  const { avatar, code, name, productCount } = category;
  const firstLetter = name.charAt(0);
  return (
    <>
      <div className="flex items-center gap-2 flex-auto overflow-hidden justify-start">
        <Avatar>
          <Avatar.Image src={avatar?.url} />
          <Avatar.Fallback>{firstLetter}</Avatar.Fallback>
        </Avatar>
        <div className="text-muted-foreground">{code}</div>
        <TextOverflowTooltip value={name} className="flex-auto" />
      </div>
      {!selected ? (
        productCount > 0 && (
          <div className="text-muted-foreground ml-auto">{productCount}</div>
        )
      ) : (
        <Combobox.Check checked={selected} />
      )}
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
        <>
          <Skeleton className="w-4 h-4" />
          <Skeleton className="w-8 h-4" />
          <Skeleton className="w-16 h-4" />
        </>
      )}
    </Combobox.Trigger>
  );
});
