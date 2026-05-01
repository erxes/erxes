import React, { createContext, useContext, useMemo, useCallback } from 'react';
import { gql, useQuery } from '@apollo/client';
import { cn, Combobox, Command, PopoverScoped } from 'erxes-ui';

const PRODUCT_TAGS_QUERY = gql`
  query tagsQuery(
    $type: String
    $searchValue: String
    $ids: [String]
    $excludeIds: Boolean
  ) {
    tags(
      type: $type
      searchValue: $searchValue
      ids: $ids
      excludeIds: $excludeIds
    ) {
      list {
        _id
        name
      }
    }
  }
`;

type ProductTag = { _id: string; name: string };

interface SelectProductTagsContextType {
  value: string[];
  onValueChange: (ids: string[]) => void;
  loading?: boolean;
  error?: any;
  productTags?: ProductTag[];
}

const SelectProductTagsContext = createContext<SelectProductTagsContextType | null>(null);

const useSelectProductTagsContext = () => {
  const context = useContext(SelectProductTagsContext);
  if (!context) {
    throw new Error(
      'useSelectProductTagsContext must be used within SelectProductTagsProvider',
    );
  }
  return context;
};

export const SelectProductTagsProvider = ({
  value,
  onValueChange,
  type = 'core:product',
  children,
}: {
  value: string[];
  onValueChange: (ids: string[]) => void;
  type?: string;
  children: React.ReactNode;
}) => {
  const { data, loading, error } = useQuery(PRODUCT_TAGS_QUERY, {
    variables: { type, ids: [] },
  });

  const productTags: ProductTag[] = useMemo(() => data?.tags?.list || [], [data]);

  const contextValue = useMemo(
    () => ({
      value: value || [],
      onValueChange,
      productTags,
      loading,
      error,
    }),
    [value, onValueChange, productTags, loading, error],
  );

  return (
    <SelectProductTagsContext.Provider value={contextValue}>
      {children}
    </SelectProductTagsContext.Provider>
  );
};

const SelectProductTagsValue = ({ placeholder }: { placeholder?: string }) => {
  const { value, productTags } = useSelectProductTagsContext();
  const selectedNames = useMemo(
    () =>
      value
        .map((id) => productTags?.find((t) => t._id === id)?.name)
        .filter(Boolean)
        .join(', '),
    [value, productTags],
  );

  if (!selectedNames) {
    return (
      <span className="text-accent-foreground/80">
        {placeholder || 'Choose product tags'}
      </span>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <p className={cn('font-medium text-sm line-clamp-1')}>
        {selectedNames}
      </p>
    </div>
  );
};

const SelectProductTagsItem = ({ tag }: { tag: ProductTag }) => {
  const { onValueChange, value } = useSelectProductTagsContext();
  const selectedSet = new Set(value);

  return (
    <Command.Item
      value={tag._id}
      onSelect={() => {
        const newValue = selectedSet.has(tag._id)
          ? value.filter((x) => x !== tag._id)
          : [...value, tag._id];
        onValueChange(newValue);
      }}
    >
      <span className="font-medium">
        {selectedSet.has(tag._id) && '✓ '}
        {tag.name}
      </span>
      <Combobox.Check checked={selectedSet.has(tag._id)} />
    </Command.Item>
  );
};

const SelectProductTagsContent = () => {
  const { productTags, loading, error } = useSelectProductTagsContext();

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-24">
          <span className="text-muted-foreground">Loading...</span>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center h-24 text-destructive">
          Error: {error.message}
        </div>
      );
    }

    return productTags?.map((t) => (
      <SelectProductTagsItem key={t._id} tag={t} />
    ));
  };

  return (
    <Command>
      <Command.Input placeholder="Search product tag" />
      <Command.Empty>
        <span className="text-muted-foreground">No product tags found</span>
      </Command.Empty>
      <Command.List>{renderContent()}</Command.List>
    </Command>
  );
};

const SelectProductTagsRoot = ({
  value,
  onValueChange,
  type = 'core:product',
  disabled,
}: {
  value: string[];
  onValueChange: (ids: string[]) => void;
  type?: string;
  disabled?: boolean;
}) => {
  const [open, setOpen] = React.useState(false);

  const handleValueChange = useCallback(
    (ids: string[]) => {
      onValueChange(ids);
    },
    [onValueChange],
  );

  return (
    <SelectProductTagsProvider value={value} onValueChange={handleValueChange} type={type}>
      <PopoverScoped open={open} onOpenChange={setOpen}>
        <Combobox.Trigger disabled={disabled}>
          <SelectProductTagsValue />
        </Combobox.Trigger>
        <Combobox.Content>
          <SelectProductTagsContent />
        </Combobox.Content>
      </PopoverScoped>
    </SelectProductTagsProvider>
  );
};

export default SelectProductTagsRoot;
