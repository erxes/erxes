import {
  Combobox,
  Command,
  Button,
  PopoverScoped,
  RecordTableInlineCell,
  Popover,
  SelectTree,
  TextOverflowTooltip,
} from 'erxes-ui';
import { useTags } from '../hooks/useTags';
import { useDebounce } from 'use-debounce';
import React, { useState } from 'react';
import {
  ISelectTagsProviderProps,
  ITag,
  useGiveTags,
} from 'ui-modules/modules';
import { SelectTagsContext } from '../contexts/SelectTagsContext';
import { useSelectTagsContext } from '../hooks/useSelectTagsContext';
import { IconPlus, IconTag } from '@tabler/icons-react';
import { CreateTagForm, SelectTagCreateContainer } from './CreateTagForm';
import { TagBadge } from './TagBadge';

export const SelectTagsProvider = ({
  children,
  tagType,
  value,
  onValueChange,
  targetIds,
  options,
  mode = 'single',
}: ISelectTagsProviderProps) => {
  const [newTagName, setNewTagName] = useState('');
  const { giveTags } = useGiveTags();
  const [selectedTags, setSelectedTags] = useState<ITag[]>([]);
  const handleSelectCallback = (tag: ITag) => {
    if (!tag) return;

    const isSingleMode = mode === 'single';
    const multipleValue = (value as string[]) || [];
    const isSelected = !isSingleMode && multipleValue.includes(tag._id);

    const newSelectedTagIds = isSingleMode
      ? [tag._id]
      : isSelected
      ? multipleValue.filter((t) => t !== tag._id)
      : [...multipleValue, tag._id];

    const newSelectedTags = isSingleMode
      ? [tag]
      : isSelected
      ? selectedTags.filter((t) => t._id !== tag._id)
      : [...selectedTags, tag];

    setSelectedTags(newSelectedTags);
    onValueChange?.(isSingleMode ? tag._id : newSelectedTagIds);
    if (targetIds) {
      giveTags({
        variables: {
          tagIds: newSelectedTagIds,
          targetIds,
          type: tagType,
        },
        ...options?.(newSelectedTagIds),
      });
    }
  };
  return (
    <SelectTagsContext.Provider
      value={{
        tagType,
        onSelect: handleSelectCallback,
        value,
        selectedTags,
        setSelectedTags,
        targetIds: targetIds || [],
        newTagName,
        setNewTagName,
        mode,
      }}
    >
      {children}
    </SelectTagsContext.Provider>
  );
};

export const SelectTagsCommand = ({
  disableCreateOption,
}: {
  disableCreateOption?: boolean;
}) => {
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebounce(search, 500);
  const { tagType, targetIds, selectedTags } = useSelectTagsContext();
  const [noTagsSearchValue, setNoTagsSearchValue] = useState('');

  const { tags, loading, error, handleFetchMore, totalCount } = useTags({
    variables: {
      type: tagType,
      searchValue: debouncedSearch,
    },
    skip: !!noTagsSearchValue && debouncedSearch.includes(noTagsSearchValue),
    onCompleted(data) {
      const { totalCount } = data?.tags || {};
      setNoTagsSearchValue(totalCount === 0 ? debouncedSearch : '');
    },
  });

  return (
    <Command shouldFilter={false}>
      <Command.Input
        value={search}
        onValueChange={setSearch}
        placeholder="Search tags"
        focusOnMount
      />
      {selectedTags?.length > 0 && (
        <>
          <div className="flex flex-wrap p-2 gap-2">
            <TagList />
          </div>
          <Command.Separator />
        </>
      )}

      <Command.List>
        <SelectTree.Provider id={targetIds.join(',')} ordered={!search}>
          <SelectTagsCreate
            search={search}
            show={!disableCreateOption && !loading && !tags?.length}
          />
          <Combobox.Empty loading={loading} error={error} />
          {tags?.map((tag) => (
            <SelectTagsItem
              key={tag._id}
              tag={{
                ...tag,
                hasChildren: tags.some((t) => t.parentId === tag._id),
              }}
            />
          ))}
          <Combobox.FetchMore
            fetchMore={handleFetchMore}
            currentLength={tags?.length || 0}
            totalCount={totalCount}
          />
        </SelectTree.Provider>
      </Command.List>
    </Command>
  );
};

export const SelectTagsCreate = ({
  search,
  show,
}: {
  search: string;
  show: boolean;
}) => {
  const { setNewTagName } = useSelectTagsContext();

  if (!search || !show) return null;

  return (
    <Command.Item
      onSelect={() => setNewTagName(search)}
      className="font-medium"
    >
      <IconPlus />
      Create new tag: "{search}"
    </Command.Item>
  );
};

export const SelectTagsItem = ({
  tag,
}: {
  tag: ITag & { hasChildren: boolean };
}) => {
  const { onSelect, selectedTags } = useSelectTagsContext();
  const isSelected = selectedTags.some((t) => t._id === tag._id);
  return (
    <SelectTree.Item
      key={tag._id}
      _id={tag._id}
      name={tag.name}
      order={tag.order || ''}
      hasChildren={tag.hasChildren}
      selected={isSelected}
      onSelect={() => onSelect(tag)}
    >
      <TextOverflowTooltip
        value={tag.name}
        className="flex-auto w-auto font-medium"
      />
    </SelectTree.Item>
  );
};

export const TagList = ({
  placeholder,
  renderAsPlainText,
  ...props
}: Omit<React.ComponentProps<typeof TagBadge>, 'onClose'> & {
  placeholder?: string;
  renderAsPlainText?: boolean;
}) => {
  const { value, selectedTags, setSelectedTags, onSelect } =
    useSelectTagsContext();

  const selectedTagIds = Array.isArray(value) ? value : [value];

  if (!value || !value.length) {
    return <Combobox.Value placeholder={placeholder || ''} />;
  }

  return (
    <div className="flex flex-wrap gap-2 w-full">
      {selectedTagIds.map((tagId) => (
        <TagBadge
          key={tagId}
          tagId={tagId}
          tag={selectedTags.find((t) => t._id === tagId)}
          renderAsPlainText={renderAsPlainText}
          variant="secondary"
          onCompleted={(tag) => {
            if (!tag) return;
            if (selectedTagIds.includes(tag._id)) {
              setSelectedTags(selectedTags.filter((t) => t._id !== tag._id));
            }
            if (!selectedTags.includes(tag)) {
              setSelectedTags([...selectedTags, tag]);
            }
          }}
          onClose={() =>
            onSelect?.(selectedTags.find((t) => t._id === tagId) as ITag)
          }
          {...props}
        />
      ))}
    </div>
  );
};

export const SelectTagsValue = ({ placeholder }: { placeholder?: string }) => {
  const { selectedTags, mode } = useSelectTagsContext();

  if (selectedTags?.length > 1) return <>{selectedTags.length} tags selected</>;

  return (
    <TagList
      placeholder={placeholder === undefined ? 'Select tags' : placeholder}
      renderAsPlainText={mode === 'single'}
    />
  );
};

export const SelectTagsContent = () => {
  const { newTagName } = useSelectTagsContext();

  if (newTagName) {
    return (
      <SelectTagCreateContainer>
        <CreateTagForm />
      </SelectTagCreateContainer>
    );
  }

  return <SelectTagsCommand />;
};

export const SelectTagsInlineCell = ({
  onValueChange,
  scope,
  ...props
}: Omit<React.ComponentProps<typeof SelectTagsProvider>, 'children'> & {
  scope?: string;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <SelectTagsProvider
      onValueChange={(value) => {
        onValueChange?.(value);
        setOpen(false);
      }}
      {...props}
    >
      <PopoverScoped open={open} onOpenChange={setOpen} scope={scope}>
        <RecordTableInlineCell.Trigger>
          <SelectTagsValue placeholder="" />
        </RecordTableInlineCell.Trigger>
        <RecordTableInlineCell.Content className="min-w-72">
          <SelectTagsContent />
        </RecordTableInlineCell.Content>
      </PopoverScoped>
    </SelectTagsProvider>
  );
};

export const SelectTagsDetail = React.forwardRef<
  React.ElementRef<typeof Combobox.Trigger>,
  Omit<React.ComponentProps<typeof SelectTagsProvider>, 'children'> &
    Omit<
      React.ComponentPropsWithoutRef<typeof Combobox.Trigger>,
      'children'
    > & {
      scope?: string;
    }
>(
  (
    {
      onValueChange,
      scope,
      targetIds,
      tagType,
      value,
      mode = 'multiple',
      options,
      ...props
    },
    ref,
  ) => {
    const [open, setOpen] = useState(false);
    return (
      <SelectTagsProvider
        onValueChange={(value) => {
          onValueChange?.(value);
          setOpen(false);
        }}
        {...{ targetIds, tagType, value, mode, options }}
      >
        <PopoverScoped open={open} onOpenChange={setOpen} scope={scope}>
          <Popover.Trigger asChild>
            <Button
              ref={ref}
              {...props}
              className="w-min text-sm font-medium shadow-xs"
              variant="outline"
            >
              Add Tags
              <IconPlus className="text-lg" />
            </Button>
          </Popover.Trigger>
          <Combobox.Content>
            <SelectTagsContent />
          </Combobox.Content>
        </PopoverScoped>
        <TagList />
      </SelectTagsProvider>
    );
  },
);

SelectTagsDetail.displayName = 'SelectTagsDetail';

export const SelectTagsCommandbarItem = ({
  onValueChange,
  ...props
}: Omit<React.ComponentProps<typeof SelectTagsProvider>, 'children'>) => {
  const [open, setOpen] = useState(false);

  return (
    <SelectTagsProvider
      onValueChange={(value) => {
        onValueChange?.(value);
        setOpen(false);
      }}
      {...props}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <Button variant={'secondary'} asChild>
          <RecordTableInlineCell.Trigger>
            <IconTag />
            Tag
          </RecordTableInlineCell.Trigger>
        </Button>
        <RecordTableInlineCell.Content className="w-96">
          <SelectTagsContent />
        </RecordTableInlineCell.Content>
      </Popover>
    </SelectTagsProvider>
  );
};

export const SelectTagsRoot = React.forwardRef<
  React.ElementRef<typeof Combobox.Trigger>,
  Omit<React.ComponentProps<typeof SelectTagsProvider>, 'children'> &
    Omit<
      React.ComponentPropsWithoutRef<typeof Combobox.Trigger>,
      'children'
    > & {
      scope?: string;
    }
>(
  (
    {
      onValueChange,
      scope,
      targetIds,
      tagType,
      value,
      mode,
      options,
      ...props
    },
    ref,
  ) => {
    const [open, setOpen] = useState(false);
    return (
      <SelectTagsProvider
        onValueChange={(value) => {
          onValueChange?.(value);
          setOpen(false);
        }}
        {...{ targetIds, tagType, value, mode, options }}
      >
        <PopoverScoped open={open} onOpenChange={setOpen} scope={scope}>
          <Combobox.Trigger ref={ref} {...props}>
            <SelectTagsValue />
          </Combobox.Trigger>
          <Combobox.Content>
            <SelectTagsContent />
          </Combobox.Content>
        </PopoverScoped>
      </SelectTagsProvider>
    );
  },
);
SelectTagsRoot.displayName = 'SelectTagsRoot';

export const SelectTags = Object.assign(SelectTagsRoot, {
  Provider: SelectTagsProvider,
  CommandbarItem: SelectTagsCommandbarItem,
  Content: SelectTagsContent,
  Command: SelectTagsCommand,
  Item: SelectTagsItem,
  Value: SelectTagsValue,
  List: TagList,
  InlineCell: SelectTagsInlineCell,
  Detail: SelectTagsDetail,
});
