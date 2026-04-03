import React, { useState } from 'react';

import {
  Avatar,
  Combobox,
  Command,
  Skeleton,
  TextOverflowTooltip,
  SelectTree,
} from 'erxes-ui';

import { useCategories } from '../hooks/useCategories';
import { ICategory } from '../types/category';

export const SelectParentCategory = React.forwardRef<
  React.ElementRef<typeof Combobox.Trigger>,
  React.ComponentPropsWithoutRef<typeof Combobox.Trigger> & {
    selected?: string;
    onSelect: (categoryId: string) => void;
    open?: boolean;
    setOpen?: (open: boolean) => void;
    id?: string;
    branchId?: string;
  }
>(({ onSelect, selected, id, branchId, ...props }, ref) => {
  const [selectedCategory, setSelectedCategory] = useState<ICategory>();
  const { categories, loading } = useCategories({
    variables: { branchId },
    onCompleted: ({
      bmsTourCategories,
    }: {
      bmsTourCategories: ICategory[];
    }) => {
      setSelectedCategory(
        bmsTourCategories?.find(
          (category: ICategory) => category._id === selected,
        ),
      );
    },
  });

  const handleSelect = (categoryId: string) => {
    const category = categories?.find(
      (category: ICategory) => category._id === categoryId,
    );
    setSelectedCategory(category);
    onSelect(categoryId);
  };

  return (
    <SelectTree id={id || 'select-parent-category'}>
      <SelectParentCategoryTrigger
        ref={ref}
        {...props}
        selectedCategory={selectedCategory}
        loading={loading}
      />
      <Combobox.Content>
        <Command className="outline-hidden">
          <Command.Input />
          <Command.List>
            <Combobox.Empty loading={loading} />
            {categories?.map((category: ICategory) => (
              <SelectParentCategoryItem
                key={category._id}
                category={category}
                selected={selectedCategory?._id === category._id}
                onSelect={handleSelect}
                hasChildren={
                  categories.find(
                    (c: ICategory) => c.parentId === category._id,
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

export const SelectParentCategoryItem = ({
  category,
  selected,
  onSelect,
  hasChildren,
}: {
  category: ICategory;
  selected: boolean;
  onSelect: (categoryId: string) => void;
  hasChildren: boolean;
}) => {
  const { _id, name } = category;

  return (
    <SelectTree.Item
      _id={_id}
      order=""
      hasChildren={hasChildren}
      name={name || ''}
      value={name || ''}
      onSelect={() => onSelect(_id)}
      selected={selected}
    >
      <SelectParentCategoryBadge category={category} selected={selected} />
    </SelectTree.Item>
  );
};

export const SelectParentCategoryBadge = ({
  category,
  selected,
}: {
  category?: ICategory;
  selected?: boolean;
}) => {
  if (!category) return null;
  const { attachment, name } = category;
  const firstLetter = name?.charAt(0) || '';
  return (
    <>
      <div className="flex overflow-hidden flex-auto gap-2 justify-start items-center">
        <Avatar>
          <Avatar.Image src={attachment?.url} />
          <Avatar.Fallback>{firstLetter}</Avatar.Fallback>
        </Avatar>
        <TextOverflowTooltip value={name || ''} className="flex-auto" />
      </div>
      {selected && <Combobox.Check checked={selected} />}
    </>
  );
};

export const SelectParentCategoryTrigger = React.forwardRef<
  React.ElementRef<typeof Combobox.Trigger>,
  React.ComponentPropsWithoutRef<typeof Combobox.Trigger> & {
    selectedCategory: ICategory | undefined;
    loading: boolean;
  }
>(({ selectedCategory, loading, className, ...props }, ref) => {
  return (
    <Combobox.Trigger ref={ref} className={className} {...props}>
      <SelectParentCategoryBadge category={selectedCategory} />
      {!selectedCategory && <Combobox.Value placeholder="Select category" />}
      {loading && (
        <>
          <Skeleton className="w-4 h-4" />
          <Skeleton className="w-16 h-4" />
        </>
      )}
    </Combobox.Trigger>
  );
});
