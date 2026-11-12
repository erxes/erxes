import type { ContentType, Tag } from '@erxes/core-contract';
import { IconCheck, IconCircleFilled, IconPlus, IconTag, IconTags } from '@tabler/icons-react';
import {
  Badge,
  Button,
  Combobox,
  Command,
  Filter,
  Popover,
  PopoverScoped,
  RecordTableInlineCell,
  Skeleton,
  TextOverflowTooltip,
  cn,
  useFilterContext,
  useQueryState,
} from 'erxes-ui';
import {
  type ComponentProps,
  createContext,
  forwardRef,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { TAG_COLORS, useTagCreate, useTags } from './useTags';

/*
 * Old ui-modules TagsSelect (tags-new) on core's tags: a provider holding the
 * selection, the searchable list with "create", the selected badges, and the
 * inline cell / trigger / filter shapes built from them. The caller saves.
 */

interface ITagsSelectContext {
  type: ContentType;
  mode: 'single' | 'multiple';
  selectedIds: string[];
  tags: Tag[];
  loading: boolean;
  toggle: (tag: Tag) => void;
  remove: (tagId: string) => void;
}

const TagsSelectContext = createContext<ITagsSelectContext | null>(null);

const useTagsSelectContext = () => {
  const context = useContext(TagsSelectContext);

  if (!context) throw new Error('TagsSelect parts must be inside TagsSelect.Provider');

  return context;
};

export interface TagsSelectProviderProps {
  type: ContentType;
  mode?: 'single' | 'multiple';
  value?: string[] | string | null;
  onValueChange?: (tagIds: string[]) => void;
  scope?: string;
  children: ReactNode;
}

const toTagIds = (value: TagsSelectProviderProps['value']) =>
  Array.isArray(value) ? value : value ? [value] : [];

const TagsSelectProvider = ({
  type,
  mode = 'multiple',
  value,
  onValueChange,
  scope,
  children,
}: TagsSelectProviderProps) => {
  const { tags, loading } = useTags(type);
  const [open, setOpen] = useState(false);
  const valueKey = JSON.stringify(value ?? null);
  const previousValueKey = useRef(valueKey);
  // Consecutive toggles use the local selection until the saved value arrives.
  const [selectedIds, setSelectedIds] = useState(() => toTagIds(value));

  useEffect(() => {
    if (previousValueKey.current === valueKey) return;
    previousValueKey.current = valueKey;
    setSelectedIds(toTagIds(value));
  }, [value, valueKey]);

  const change = (ids: string[]) => {
    setSelectedIds(ids);
    onValueChange?.(ids);
  };

  const toggle = (tag: Tag) => {
    if (mode === 'single') {
      setOpen(false);
      change([tag.id]);

      return;
    }

    change(
      selectedIds.includes(tag.id)
        ? selectedIds.filter((id) => id !== tag.id)
        : [...selectedIds, tag.id],
    );
  };

  return (
    <TagsSelectContext.Provider
      value={{
        type,
        mode,
        selectedIds,
        tags,
        loading,
        toggle,
        remove: (tagId) => change(selectedIds.filter((id) => id !== tagId)),
      }}
    >
      <PopoverScoped open={open} onOpenChange={setOpen} scope={scope}>
        {children}
      </PopoverScoped>
    </TagsSelectContext.Provider>
  );
};

/** A tag's colour dot and name. */
export const TagInline = ({ tag }: { tag: Pick<Tag, 'name' | 'colorCode'> }) => (
  <div className="flex max-w-full items-center gap-3">
    <span>
      <IconCircleFilled className="size-3!" style={{ color: tag.colorCode ?? undefined }} />
    </span>
    <TextOverflowTooltip value={tag.name} />
  </div>
);

const UNKNOWN_TAG_LABEL = 'Unknown tag';

export const TagBadge = forwardRef<
  React.ElementRef<typeof Badge>,
  ComponentProps<typeof Badge> & { tag?: Tag }
>(({ tag, ...props }, ref) =>
  tag ? (
    <Badge ref={ref} {...props}>
      <TagInline tag={tag} />
    </Badge>
  ) : (
    <Badge ref={ref} title={UNKNOWN_TAG_LABEL} {...props}>
      <span className="max-w-24 truncate">{UNKNOWN_TAG_LABEL}</span>
    </Badge>
  ),
);

TagBadge.displayName = 'TagBadge';

/** The selected tags as badges; `maxVisible` folds the rest into "+N". */
const TagsSelectedList = ({
  maxVisible,
  placeholder,
  className,
}: {
  maxVisible?: number;
  placeholder?: string;
  className?: string;
}) => {
  const { selectedIds, tags, loading, remove } = useTagsSelectContext();

  if (loading && selectedIds.length > 0) {
    return <Skeleton className="h-5 w-20" />;
  }

  if (selectedIds.length === 0) {
    return placeholder ? <span className="text-muted-foreground">{placeholder}</span> : null;
  }

  const visible = maxVisible === undefined ? selectedIds : selectedIds.slice(0, maxVisible);
  const remaining = selectedIds.length - visible.length;

  return (
    <>
      {visible.map((id) => (
        <TagBadge
          key={id}
          tag={tags.find((tag) => tag.id === id)}
          variant="secondary"
          className={className}
          onClose={maxVisible === undefined ? () => remove(id) : undefined}
        />
      ))}
      {remaining > 0 && (
        <Badge variant="secondary" className="shrink-0 text-muted-foreground">
          +{remaining}
        </Badge>
      )}
    </>
  );
};

/** A new tag's color, picked once when the list opens. */
const randomColor = () => TAG_COLORS[Math.floor(Math.random() * TAG_COLORS.length)];

/** Search, the selected tags, every tag with a check, and "create". */
const TagsSelectContent = () => {
  const { type, tags, selectedIds, loading, toggle } = useTagsSelectContext();
  const create = useTagCreate();
  const [search, setSearch] = useState('');
  const [color] = useState(randomColor);
  const trimmed = search.trim();
  const hasExactMatch = tags.some((tag) => tag.name.toLowerCase() === trimmed.toLowerCase());
  const showCreate = !loading && trimmed.length > 0 && !hasExactMatch;

  return (
    <Command>
      <Command.Input
        placeholder="Search tag..."
        value={search}
        onValueChange={setSearch}
        focusOnMount
      />
      <div className="flex w-full flex-wrap gap-x-2 gap-y-1 p-1">
        <TagsSelectedList />
      </div>
      {selectedIds.length > 0 && <Command.Separator />}
      <Command.List>
        {loading ? (
          <Command.Empty>
            <div className="flex flex-col items-start gap-2 p-4">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-32" />
            </div>
          </Command.Empty>
        ) : (
          <>
            {showCreate && (
              <Command.Group heading="Create tag">
                <Command.Item
                  value={`Add ${type} tag ${trimmed}`}
                  keywords={[trimmed]}
                  disabled={create.isPending}
                  onSelect={() =>
                    create.mutate(
                      { type, name: trimmed, colorCode: color },
                      {
                        onSuccess: (tag) => {
                          toggle(tag);
                          setSearch('');
                        },
                      },
                    )
                  }
                  className="justify-start gap-2"
                >
                  <IconPlus className="size-4 shrink-0" />
                  <span className="shrink-0">Add {type} tag:</span>
                  <span className="min-w-0 flex-1 truncate text-muted-foreground">
                    &quot;{trimmed}&quot;
                  </span>
                </Command.Item>
              </Command.Group>
            )}
            {tags.length === 0 && !showCreate ? (
              <Command.Empty>
                <div className="flex flex-col gap-1 p-4 text-center">
                  <div>No results found.</div>
                  <div className="text-xs text-muted-foreground">
                    Type a name above to create the first tag.
                  </div>
                </div>
              </Command.Empty>
            ) : (
              <Command.Empty>
                <div>No results found.</div>
              </Command.Empty>
            )}
          </>
        )}
        {tags.map((tag) => (
          <Command.Item
            key={tag.id}
            value={tag.name}
            onSelect={() => toggle(tag)}
            className="justify-between"
          >
            <TagInline tag={tag} />
            <IconCheck
              className={cn(
                'h-4 w-4 text-primary',
                selectedIds.includes(tag.id) ? 'opacity-100' : 'opacity-0',
              )}
            />
          </Command.Item>
        ))}
      </Command.List>
    </Command>
  );
};

/** "Tag" (or "Tag +N") for a trigger button. */
const TagsSelectValue = ({
  showValue,
  placeholder,
}: {
  showValue?: boolean;
  placeholder?: string;
}) => {
  const { selectedIds } = useTagsSelectContext();

  if (showValue && selectedIds.length > 0) {
    return (
      <span className="flex items-center gap-1 text-muted-foreground">
        <IconTag className="h-4 w-4 text-gray-400" /> Tag +{selectedIds.length}
      </span>
    );
  }

  return (
    <span className="flex items-center gap-1">
      <IconTags className="size-4" />
      {placeholder || 'Select Tag'}
    </span>
  );
};

/** A tag picker on a button (command bar). */
const TagsSelectRoot = ({
  variant = 'ghost',
  className,
  placeholder = 'Tag',
  ...props
}: Omit<TagsSelectProviderProps, 'children'> & {
  variant?: ComponentProps<typeof Button>['variant'];
  className?: string;
  placeholder?: string;
}) => (
  <TagsSelectProvider {...props}>
    <Popover.Trigger asChild>
      <Button variant={variant} className={cn('w-min text-sm font-medium shadow-xs', className)}>
        <TagsSelectValue placeholder={placeholder} />
      </Button>
    </Popover.Trigger>
    <Combobox.Content className="w-[200px] p-0" align="start">
      <TagsSelectContent />
    </Combobox.Content>
  </TagsSelectProvider>
);

/** The tags as a record table cell; click to change them. */
const TagsSelectInlineCell = ({
  maxVisible,
  className,
  ...props
}: Omit<TagsSelectProviderProps, 'children'> & { maxVisible?: number; className?: string }) => (
  <TagsSelectProvider {...props}>
    <RecordTableInlineCell.Trigger className={className}>
      <div className="flex min-w-0 max-w-full items-center gap-1">
        <TagsSelectedList
          maxVisible={maxVisible}
          className={maxVisible === undefined ? undefined : 'min-w-0 max-w-full overflow-hidden'}
        />
      </div>
    </RecordTableInlineCell.Trigger>
    <RecordTableInlineCell.Content>
      <TagsSelectContent />
    </RecordTableInlineCell.Content>
  </TagsSelectProvider>
);

/** Filter by tags: the menu item, its list and the bar chip (query key `tags`). */
const TagsFilterItem = () => (
  <Filter.Item value="tags">
    <IconTags />
    Tags
  </Filter.Item>
);

const TagsFilterView = ({ type }: { type: ContentType }) => {
  const [tags, setTags] = useQueryState<string[]>('tags');
  const { resetFilterState } = useFilterContext();

  return (
    <Filter.View filterKey="tags">
      <TagsSelectProvider
        type={type}
        value={tags ?? []}
        onValueChange={(next) => {
          setTags(next.length ? next : null);
          resetFilterState();
        }}
      >
        <TagsSelectContent />
      </TagsSelectProvider>
    </Filter.View>
  );
};

const TagsFilterBar = ({ type }: { type: ContentType }) => {
  const [tags, setTags] = useQueryState<string[]>('tags');
  const [open, setOpen] = useState(false);

  if (!tags?.length) return null;

  return (
    <Filter.BarItem queryKey="tags">
      <Filter.BarName>
        <IconTags />
        Tags
      </Filter.BarName>
      <TagsSelectProvider
        type={type}
        value={tags}
        onValueChange={(next) => setTags(next.length ? next : null)}
      >
        <Popover open={open} onOpenChange={setOpen}>
          <Popover.Trigger asChild>
            <Filter.BarButton filterKey="tags" className="max-w-72 justify-start overflow-hidden">
              <TagsSelectedList maxVisible={3} />
            </Filter.BarButton>
          </Popover.Trigger>
          <Combobox.Content className="w-72">
            <TagsSelectContent />
          </Combobox.Content>
        </Popover>
      </TagsSelectProvider>
    </Filter.BarItem>
  );
};

export const TagsSelect = Object.assign(TagsSelectRoot, {
  Provider: TagsSelectProvider,
  Content: TagsSelectContent,
  Value: TagsSelectValue,
  SelectedList: TagsSelectedList,
  InlineCell: TagsSelectInlineCell,
});

export const TagsFilter = Object.assign(TagsFilterItem, {
  View: TagsFilterView,
  Bar: TagsFilterBar,
});
