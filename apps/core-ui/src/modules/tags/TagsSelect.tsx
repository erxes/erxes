import { IconCheck, IconPlus, IconTag, IconTags } from '@tabler/icons-react';
import { Button, Combobox, Command, Popover, RecordTableInlineCell, Skeleton, cn } from 'erxes-ui';
import { type ComponentProps, useState } from 'react';
import {
  TagInline,
  TagsSelectedList,
  TagsSelectProvider,
  type TagsSelectProviderProps,
  useTagsSelectContext,
} from './tagsSelectContext';
import { TAG_COLORS, useTagCreate } from './useTags';

/** A new tag's color, picked once when the list opens. */
const randomColor = () => TAG_COLORS[Math.floor(Math.random() * TAG_COLORS.length)];

/** "Add customer tag: "VIP"" when nothing is named so; it creates the tag and selects it. */
const CreateTagItem = ({
  name,
  color,
  onCreated,
}: {
  name: string;
  color: string | undefined;
  onCreated: () => void;
}) => {
  const { type, toggle } = useTagsSelectContext();
  const create = useTagCreate();

  return (
    <Command.Group heading="Create tag">
      <Command.Item
        value={`Add ${type} tag ${name}`}
        keywords={[name]}
        disabled={create.isPending}
        onSelect={() =>
          create.mutate(
            { type, name, colorCode: color },
            {
              onSuccess: (tag) => {
                toggle(tag);
                onCreated();
              },
            },
          )
        }
        className="justify-start gap-2"
      >
        <IconPlus className="size-4 shrink-0" />
        <span className="shrink-0">Add {type} tag:</span>
        <span className="min-w-0 flex-1 truncate text-muted-foreground">&quot;{name}&quot;</span>
      </Command.Item>
    </Command.Group>
  );
};

const TagsLoading = () => (
  <Command.Empty>
    <div className="flex flex-col items-start gap-2 p-4">
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-32" />
    </div>
  </Command.Empty>
);

/** Search, the selected tags, every tag with a check, and "create". */
const TagsSelectContent = () => {
  const { tags, selectedIds, loading, toggle } = useTagsSelectContext();
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
        {loading && <TagsLoading />}
        {showCreate && (
          <CreateTagItem name={trimmed} color={color} onCreated={() => setSearch('')} />
        )}
        {!loading && (
          <Command.Empty>
            {tags.length === 0 && !showCreate ? (
              <div className="flex flex-col gap-1 p-4 text-center">
                <div>No results found.</div>
                <div className="text-xs text-muted-foreground">
                  Type a name above to create the first tag.
                </div>
              </div>
            ) : (
              <div>No results found.</div>
            )}
          </Command.Empty>
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
                'h-4 w-4 text-primary-text',
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
    <Popover.Trigger render={<Button variant={variant} className={cn('w-min', className)} />}>
      <TagsSelectValue placeholder={placeholder} />
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

export const TagsSelect = Object.assign(TagsSelectRoot, {
  Provider: TagsSelectProvider,
  Content: TagsSelectContent,
  Value: TagsSelectValue,
  SelectedList: TagsSelectedList,
  InlineCell: TagsSelectInlineCell,
});
