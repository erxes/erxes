import {
  Button,
  Combobox,
  Command,
  Filter,
  Popover,
  PopoverScoped,
  RecordTableInlineCell,
  ScrollArea,
  SelectOperationContent,
  SelectTree,
  SelectTriggerOperation,
  SelectTriggerVariant,
  TextOverflowTooltip,
  useFilterContext,
  useQueryState,
} from 'erxes-ui';
import { CreateTagForm, SelectTagCreateContainer } from './CreateTagForm';
import {
  ISelectTagsProviderProps,
  ITag,
  useGiveTags,
} from 'ui-modules/modules';
import { IconPlus, IconTag } from '@tabler/icons-react';
import React, { useEffect, useState } from 'react';

import { SelectTagsContext } from '../contexts/SelectTagsContext';
import { TagBadge } from './TagBadge';
import { useDebounce } from 'use-debounce';
import { useSelectTagsContext } from '../hooks/useSelectTagsContext';
import { IconTagPlus } from '@tabler/icons-react';
import { useTags } from '../hooks/useTags';
import { useTranslation } from 'react-i18next';

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
        tagType: tagType || '',
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

export const SelectTagGroupsCommand = ({
  disableCreateOption = true,
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
      isGroup: true,
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
        <div className="flex flex-wrap gap-2 p-2">
          <TagList />
        </div>
      )}
      <Command.List>
        <SelectTree.Provider id={targetIds.join(',')} ordered={!search}>
          <SelectTagsCreate
            search={search}
            show={!disableCreateOption && !loading && !tags?.length}
          />
          <Combobox.Empty loading={loading} error={error} />
          {tags?.map((tag) => (
            <SelectTagsItem key={tag._id} tag={tag} />
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

export const SelectTagsCommand = ({
  disableCreateOption = true,
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
      includeWorkspaceTags: true,
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
          <div className="flex flex-wrap gap-2 p-2">
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
          {search ? (
            <>
              {tags
                ?.filter((tag) => !tag.parentId && !tag.isGroup)
                ?.map((tag) => (
                  <SelectTagsItem
                    key={tag._id}
                    tag={{
                      ...tag,
                      hasChildren: false,
                    }}
                  />
                ))}

              {tags
                ?.filter(
                  (tag) =>
                    tag.isGroup && tags.some((t) => t.parentId === tag._id),
                )
                ?.map((tag) => (
                  <Command.Group key={tag._id} heading={tag.name}>
                    {tags
                      .filter((t) => t.parentId === tag._id)
                      .map((childTag) => (
                        <SelectTagsItem
                          key={childTag._id}
                          tag={{
                            ...childTag,
                            hasChildren: tags.some(
                              (t) => t.parentId === childTag._id,
                            ),
                          }}
                        />
                      ))}
                  </Command.Group>
                ))}
              {tags
                ?.filter(
                  (tag) =>
                    tag.parentId &&
                    !tags.some((t) => t._id === tag.parentId) &&
                    !tag.isGroup,
                )
                .map((tag) => (
                  <SelectTagsItem
                    key={tag._id}
                    tag={{
                      ...tag,
                      hasChildren: false,
                    }}
                  />
                ))}
            </>
          ) : (
            <>
              {tags
                ?.filter((tag) => !tag.parentId && !tag.isGroup)
                ?.map((tag) => (
                  <SelectTagsItem
                    key={tag._id}
                    tag={{
                      ...tag,
                      hasChildren: false,
                    }}
                  />
                ))}

              {tags
                ?.filter(
                  (tag) =>
                    tag.isGroup && tags.some((t) => t.parentId === tag._id),
                )
                ?.map((tag) => (
                  <Command.Group key={tag._id} heading={tag.name}>
                    {tags
                      .filter((t) => t.parentId === tag._id)
                      .map((childTag) => (
                        <SelectTagsItem
                          key={childTag._id}
                          tag={{
                            ...childTag,
                            hasChildren: tags.some(
                              (t) => t.parentId === childTag._id,
                            ),
                          }}
                        />
                      ))}
                  </Command.Group>
                ))}
            </>
          )}
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
    <Command.Item onSelect={() => onSelect(tag)}>
      <TextOverflowTooltip
        value={tag.name}
        className="flex-auto w-auto font-medium"
      />
      <Combobox.Check checked={isSelected} />
    </Command.Item>
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
    return (
      <div className="flex items-center justify-center gap-2">
        <IconTagPlus className="size-4 text-muted-foreground" />
        <Combobox.Value placeholder={placeholder || ''} />
      </div>
    );
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

  if ((selectedTags || []).length !== 0) {
    return (
      <span className="flex gap-1 items-center -ml-1 text-muted-foreground">
        <IconTag className="w-4 h-4 text-gray-400" /> Tag +
        {(selectedTags || []).length}
      </span>
    );
  }

  return (
    <TagList
      placeholder={placeholder === undefined ? 'Select Tags' : placeholder}
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
    const { t } = useTranslation('contact', {
      keyPrefix: 'customer.detail',
    });
    return (
      <SelectTagsProvider
        onValueChange={(value) => {
          onValueChange?.(value);
          setOpen(false);
        }}
        {...{ targetIds, tagType, value, mode, options }}
      >
        <div className="flex gap-2 items-center">
          <PopoverScoped open={open} onOpenChange={setOpen} scope={scope}>
            <Popover.Trigger asChild>
              <Button
                ref={ref}
                {...props}
                className="w-min text-sm font-medium shadow-xs"
                variant="outline"
              >
                {t('add-tags')}
                <IconPlus className="text-lg" />
              </Button>
            </Popover.Trigger>
            <Combobox.Content>
              <SelectTagsContent />
            </Combobox.Content>
          </PopoverScoped>
          <TagList />
        </div>
      </SelectTagsProvider>
    );
  },
);

SelectTagsDetail.displayName = 'SelectTagsDetail';


export const ConversationTagList = ({
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
    return (
      <div className="flex items-center justify-center gap-2">
        <IconTagPlus className="size-4 text-muted-foreground" />
        <Combobox.Value placeholder={placeholder || ''} />
      </div>
    );
  }

  return (
    <ScrollArea className='flex-1'>
      <div className="flex flex-nowrap gap-2">
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
      <ScrollArea.Bar orientation="horizontal" />
    </ScrollArea>
  );
};

export const SelectTagsConversationDetail = React.forwardRef<
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
    const { t } = useTranslation('contact', {
      keyPrefix: 'customer.detail',
    });
    return (
      <SelectTagsProvider
        onValueChange={(value) => {
          onValueChange?.(value);
          setOpen(false);
        }}
        {...{ targetIds, tagType, value, mode, options }}
      >
        <div className="flex gap-2 items-center overflow-x-hidden p-0.5">
          <PopoverScoped open={open} onOpenChange={setOpen} scope={scope}>
            <Popover.Trigger asChild>
              <Button
                ref={ref}
                {...props}
                className="w-min text-sm font-medium shadow-xs"
                variant="outline"
              >
                {t('add-tags')}
                <IconPlus className="text-lg" />
              </Button>
            </Popover.Trigger>
            <Combobox.Content>
              <SelectTagsContent />
            </Combobox.Content>
          </PopoverScoped>
          <ConversationTagList />
        </div>
      </SelectTagsProvider>
    );
  },
);

SelectTagsConversationDetail.displayName = 'SelectTagsConversationDetail';

export const SelectTagsFormItem = ({
  onValueChange,
  scope,
  tagType,
  value,
  mode = 'multiple',
}: {
  tagType?: string;
  scope?: string;
  onValueChange: (value: string | string[]) => void;
  value?: string | string[];
  mode?: 'single' | 'multiple';
}) => {
  const [open, setOpen] = useState(false);

  return (
    <SelectTagsProvider
      value={value}
      onValueChange={(value) => {
        onValueChange(value);
        setOpen(false);
      }}
      tagType={tagType || ''}
      mode={mode}
    >
      <PopoverScoped open={open} onOpenChange={setOpen} scope={scope}>
        <SelectTriggerOperation variant="form">
          <SelectTagsValue />
        </SelectTriggerOperation>
        <SelectOperationContent variant="form">
          <SelectTagsContent />
        </SelectOperationContent>
      </PopoverScoped>
    </SelectTagsProvider>
  );
};

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

export const SelectTagsFilterItem = ({
  value,
  label,
}: {
  value: string;
  label: string;
}) => {
  return (
    <Filter.Item value={value}>
      <IconTag />
      {label}
    </Filter.Item>
  );
};

export const SelectTagsFilterView = ({
  mode,
  filterKey,
}: {
  mode: 'single' | 'multiple';
  filterKey: string;
}) => {
  const [query, setQuery] = useQueryState<string[] | string | undefined>(
    filterKey,
  );
  const { resetFilterState } = useFilterContext();

  return (
    <Filter.View filterKey={filterKey}>
      <SelectTagsProvider
        mode={mode}
        value={query || []}
        onValueChange={(value) => {
          setQuery(value as any);
          resetFilterState();
        }}
      >
        <SelectTagsContent />
      </SelectTagsProvider>
    </Filter.View>
  );
};

export const SelectTagsFilterBar = ({
  mode = 'multiple',
  filterKey,
  label,
  variant,
  scope,
  targetId,
  initialValue,
  onValueChange,
  tagType,
}: {
  mode: 'single' | 'multiple';
  filterKey: string;
  label: string;
  variant?: `${SelectTriggerVariant}`;
  scope?: string;
  targetId?: string;
  initialValue?: string[];
  tagType?: string;
  onValueChange?: (value: string[] | string) => void;
}) => {
  const isCardVariant = variant === 'card';

  const [localQuery, setLocalQuery] = useState<string[]>(initialValue || []);
  const [urlQuery, setUrlQuery] = useQueryState<string[]>(filterKey);
  const [open, setOpen] = useState<boolean>(false);

  useEffect(() => {
    if (isCardVariant && initialValue) {
      setLocalQuery(initialValue);
    }
  }, [initialValue, isCardVariant]);

  const query = isCardVariant ? localQuery : urlQuery;

  if (!query && variant !== 'card') {
    return null;
  }

  const handleValueChange = (value: string[] | string) => {
    if (onValueChange) {
      onValueChange(value);
    }

    if (value && value.length > 0) {
      if (isCardVariant) {
        setLocalQuery(value as string[]);
      } else {
        setUrlQuery(value as string[]);
      }
    } else {
      if (isCardVariant) {
        setLocalQuery([]);
      } else {
        setUrlQuery(null);
      }
    }
  };

  return (
    <SelectTagsProvider
      mode={mode}
      value={query || []}
      onValueChange={handleValueChange}
      tagType={tagType}
    >
      <PopoverScoped scope={scope} open={open} onOpenChange={setOpen}>
        <SelectTriggerOperation variant={variant || 'filter'}>
          <SelectTagsValue />
        </SelectTriggerOperation>
        <SelectOperationContent variant={variant || 'filter'}>
          <SelectTagsContent />
        </SelectOperationContent>
      </PopoverScoped>
    </SelectTagsProvider>
  );
};

export const SelectTags = Object.assign(SelectTagsRoot, {
  Provider: SelectTagsProvider,
  CommandbarItem: SelectTagsCommandbarItem,
  Content: SelectTagsContent,
  Command: SelectTagsCommand,
  GroupsCommand: SelectTagGroupsCommand,
  Item: SelectTagsItem,
  Value: SelectTagsValue,
  List: TagList,
  InlineCell: SelectTagsInlineCell,
  Detail: SelectTagsDetail,
  ConversationDetail: SelectTagsConversationDetail,
  FormItem: SelectTagsFormItem,
  FilterItem: SelectTagsFilterItem,
  FilterView: SelectTagsFilterView,
  FilterBar: SelectTagsFilterBar,
});
