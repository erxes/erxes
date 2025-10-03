import {
  Combobox,
  Command,
  RecordTableInlineCell,
  SelectTree,
  TextOverflowTooltip,
  PopoverScoped,
} from 'erxes-ui';
import React, { useEffect, useRef, useState } from 'react';
import { useAccountCategories } from '../hooks/useAccountCategories';
import { IAccountCategory } from '../types/AccountCategory';
import { Except } from 'type-fest';
import { useDebounce } from 'use-debounce';

export const SelectAccountCategory = React.forwardRef<
  React.ElementRef<typeof Combobox.Trigger>,
  Except<
    React.ComponentPropsWithoutRef<typeof Combobox.Trigger>,
    'onSelect'
  > & {
    selected?: string;
    onSelect: (categoryId: string | null) => void;
    recordId: string;
    nullable?: boolean;
    exclude?: string[];
  }
>(({ onSelect, selected, recordId, nullable, exclude, ...props }, ref) => {
  const [open, setOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<
    IAccountCategory | undefined
  >();

  const { accountCategories, loading } = useAccountCategories({
    onCompleted: ({
      accountCategories,
    }: {
      accountCategories: IAccountCategory[];
    }) => {
      setSelectedCategory(
        accountCategories?.find((category) => category._id === selected),
      );
    },
  });

  useEffect(() => {
    if (accountCategories && selected) {
      setSelectedCategory(
        accountCategories?.find((category) => category._id === selected),
      );
    }
  }, [selected, accountCategories]);

  return (
    <SelectTree.Provider id="select-account-category" ordered>
      <PopoverScoped
        open={open}
        onOpenChange={setOpen}
        scope={`select-account-category.${recordId}`}
      >
        <RecordTableInlineCell.Trigger>
          <SelectAccountCategoryTrigger
            ref={ref}
            {...props}
            selectedCategory={selectedCategory}
            loading={loading}
          />
        </RecordTableInlineCell.Trigger>
        <RecordTableInlineCell.Content>
          <SelectAccountCommand
            nullable={nullable}
            exclude={exclude}
            selected={selected}
            onSelect={(categoryId) => {
              onSelect(categoryId);
              setSelectedCategory(
                accountCategories?.find(
                  (category) => category._id === categoryId,
                ),
              );
              setOpen(false);
            }}
          />
        </RecordTableInlineCell.Content>
      </PopoverScoped>
    </SelectTree.Provider>
  );
});

export const SelectAccountCommand = ({
  selected,
  onSelect,
  focusOnMount,
  nullable,
  exclude,
}: {
  selected?: string;
  onSelect: (categoryId: string | null) => void;
  focusOnMount?: boolean;
  nullable?: boolean;
  exclude?: string[];
}) => {
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebounce(search, 500);
  const { accountCategories, loading, error } = useAccountCategories({
    variables: {
      searchValue: debouncedSearch ?? undefined,
    },
  });
  const selectedCategory = accountCategories?.find(
    (category) => category._id === selected,
  );
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current && focusOnMount) {
      inputRef.current.focus();
    }
  }, [focusOnMount]);

  return (
    <Command shouldFilter={false}>
      <Command.Input
        variant="secondary"
        placeholder="Filter by category"
        ref={inputRef}
        value={search}
        onValueChange={(value) => setSearch(value)}
      />
      <Command.List className="p-1">
        <Combobox.Empty error={error} loading={loading} />
        {nullable && (
          <Command.Item key="null" value="null" onSelect={() => onSelect(null)}>
            No category selected
          </Command.Item>
        )}
        {accountCategories?.map((category: IAccountCategory) => (
          <SelectAccountCategoryItem
            key={category._id}
            category={category}
            selected={selectedCategory?._id === category._id}
            onSelect={() => onSelect(category._id)}
            disabled={exclude?.includes(category._id)}
            hasChildren={
              accountCategories.find(
                (c: IAccountCategory) => c.parentId === category._id,
              ) !== undefined
            }
          />
        ))}
      </Command.List>
    </Command>
  );
};

const SelectAccountCategoryItem = ({
  category,
  selected,
  onSelect,
  hasChildren,
  disabled,
}: {
  category: IAccountCategory;
  selected: boolean;
  onSelect: () => void;
  hasChildren: boolean;
  disabled?: boolean;
}) => {
  const { name, code, order } = category;

  return (
    <SelectTree.Item
      _id={category._id}
      order={order ?? ''}
      hasChildren={hasChildren}
      name={name}
      value={code + name}
      onSelect={onSelect}
      selected={false}
      disabled={disabled}
    >
      <SelectAccountCategoryBadge category={category} selected={selected} />
    </SelectTree.Item>
  );
};

const SelectAccountCategoryBadge = ({
  category,
  selected,
}: {
  category?: IAccountCategory;
  selected?: boolean;
}) => {
  if (!category) return null;

  const { name, code, accountsCount } = category;

  return (
    <>
      <div className="flex items-center gap-2 flex-auto overflow-hidden justify-start">
        <div className="text-muted-foreground">{code}</div>
        <TextOverflowTooltip value={name} className="flex-auto" />
      </div>
      {!selected ? (
        (accountsCount ?? 0) > 0 && (
          <div className="text-muted-foreground ml-auto">{accountsCount}</div>
        )
      ) : (
        <Combobox.Check checked={selected} />
      )}
    </>
  );
};

const SelectAccountCategoryTrigger = React.forwardRef<
  React.ElementRef<typeof Combobox.Trigger>,
  React.ComponentPropsWithoutRef<typeof Combobox.Trigger> & {
    selectedCategory?: IAccountCategory;
    loading?: boolean;
  }
>(({ selectedCategory, loading, ...props }, ref) => {
  return (
    <Combobox.Trigger {...props} ref={ref}>
      {selectedCategory ? (
        <SelectAccountCategoryBadge category={selectedCategory} />
      ) : (
        <Combobox.Value placeholder="Select a category" />
      )}
    </Combobox.Trigger>
  );
});
