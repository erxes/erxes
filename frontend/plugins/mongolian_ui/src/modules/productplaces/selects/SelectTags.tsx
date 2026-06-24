import React, { createContext, useContext, useMemo, useCallback } from 'react';
import { gql, useQuery } from '@apollo/client';
import { cn, Combobox, Command, PopoverScoped } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

const TAGS_QUERY = gql`
  query tagsQuery(
    $type: String
    $parentId: String
    $searchValue: String
    $ids: [String]
    $excludeIds: Boolean
  ) {
    tags(
      type: $type
      parentId: $parentId
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

type Tag = { _id: string; name: string };

interface SelectTagsContextType {
  value: string[];
  onValueChange: (ids: string[]) => void;
  loading?: boolean;
  error?: any;
  tags?: Tag[];
}

const SelectTagsContext = createContext<SelectTagsContextType | null>(null);

const useSelectTagsContext = () => {
  const context = useContext(SelectTagsContext);
  if (!context) {
    throw new Error(
      'useSelectTagsContext must be used within SelectTagsProvider',
    );
  }
  return context;
};

export const SelectTagsProvider = ({
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
  const { data, loading, error } = useQuery(TAGS_QUERY, {
    variables: { type, ids: [] },
  });

  const tags: Tag[] = useMemo(() => data?.tags?.list || [], [data]);

  const contextValue = useMemo(
    () => ({
      value: value || [],
      onValueChange,
      tags,
      loading,
      error,
    }),
    [value, onValueChange, tags, loading, error],
  );

  return (
    <SelectTagsContext.Provider value={contextValue}>
      {children}
    </SelectTagsContext.Provider>
  );
};

const SelectTagsValue = ({ placeholder }: { placeholder?: string }) => {
  const { t } = useTranslation('mongolian');
  const { value, tags } = useSelectTagsContext();
  const selectedNames = useMemo(
    () =>
      value
        .map((id) => tags?.find((tag) => tag._id === id)?.name)
        .filter(Boolean)
        .join(', '),
    [value, tags],
  );

  if (!selectedNames) {
    return (
      <span className="text-accent-foreground/80">
        {placeholder || t('choose-product-tag')}
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

const SelectTagsItem = ({ tag }: { tag: Tag }) => {
  const { onValueChange, value } = useSelectTagsContext();
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

const SelectTagsContent = () => {
  const { t } = useTranslation('mongolian');
  const { tags, loading, error } = useSelectTagsContext();

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-24">
          <span className="text-muted-foreground">{t('loading')}</span>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center h-24 text-destructive">
          {t('error-colon', { message: error.message })}
        </div>
      );
    }

    return tags?.map((tag) => <SelectTagsItem key={tag._id} tag={tag} />);
  };

  return (
    <Command>
      <Command.Input placeholder={t('search-tag')} />
      <Command.Empty>
        <span className="text-muted-foreground">{t('no-tags-found')}</span>
      </Command.Empty>
      <Command.List>{renderContent()}</Command.List>
    </Command>
  );
};

const SelectTagsRoot = ({
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
    <SelectTagsProvider value={value} onValueChange={handleValueChange} type={type}>
      <PopoverScoped open={open} onOpenChange={setOpen}>
        <Combobox.Trigger disabled={disabled}>
          <SelectTagsValue />
        </Combobox.Trigger>
        <Combobox.Content>
          <SelectTagsContent />
        </Combobox.Content>
      </PopoverScoped>
    </SelectTagsProvider>
  );
};

export default SelectTagsRoot;
