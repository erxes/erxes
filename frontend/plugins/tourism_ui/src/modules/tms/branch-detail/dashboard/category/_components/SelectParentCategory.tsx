import React, { useState } from 'react';

import {
  Avatar,
  Combobox,
  Command,
  Skeleton,
  TextOverflowTooltip,
  SelectTree,
} from 'erxes-ui';

import { useParentCategories } from '../hooks/useParentCategories';

interface IAttachment {
  url?: string;
  name?: string;
  type?: string;
  size?: number;
  duration?: number;
}

type ParentCategory = {
  _id: string;
  name?: string;
  parentId?: string;
  attachment?: IAttachment;
};

export const SelectParentCategory = React.forwardRef<
  React.ElementRef<typeof Combobox.Trigger>,
  React.ComponentPropsWithoutRef<typeof Combobox.Trigger> & {
    selected?: string;
    onSelect: (categoryId: string) => void;
    open?: boolean;
    setOpen?: (open: boolean) => void;
    id?: string;
    branchId?: string;
    language?: string;
  }
>(({ onSelect, selected, id, branchId, language, ...props }, ref) => {
  const [selectedCategory, setSelectedCategory] = useState<ParentCategory>();
  const { categories, loading } = useParentCategories({
    variables: { branchId, language },
    onCompleted: ({
      bmsTourCategories,
    }: {
      bmsTourCategories: ParentCategory[];
    }) => {
      setSelectedCategory(
        bmsTourCategories?.find(
          (category: ParentCategory) => category._id === selected,
        ),
      );
    },
  });

  const handleSelect = (categoryId: string) => {
    const category = categories?.find(
      (category: ParentCategory) => category._id === categoryId,
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
            {categories?.map((category: ParentCategory) => (
              <SelectParentCategoryItem
                key={category._id}
                category={category}
                selected={selectedCategory?._id === category._id}
                onSelect={handleSelect}
                hasChildren={
                  categories.find(
                    (c: ParentCategory) => c.parentId === category._id,
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
  category: ParentCategory;
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
  category?: ParentCategory;
  selected?: boolean;
}) => {
  if (!category) return null;
  const { name, attachment } = category;
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
    selectedCategory: ParentCategory | undefined;
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
