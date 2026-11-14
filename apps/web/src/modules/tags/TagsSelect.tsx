import type { ContentType, Tag } from '@erxes/core-contract';
import { IconPlus, IconTags } from '@tabler/icons-react';
import {
  Badge,
  Button,
  Combobox,
  Command,
  EntityPicker,
  Popover,
  PopoverScoped,
  RecordTableInlineCell,
  Skeleton,
  TextOverflowTooltip,
  cn,
} from 'erxes-ui';
import { type ComponentProps, Fragment, type ReactNode, useState } from 'react';
import { TagDot } from './TagDot';
import { TAG_COLORS, useTagCreate, useTags } from './useTags';

/*
 * The tag picker on core's tags, as a command bar button and as a table or panel cell.
 * The caller saves the picked ids.
 */

interface TagsSelectProps {
  type: ContentType;
  value: string[];
  onValueChange: (tagIds: string[]) => void;
}

/** The picked ids, kept here so quick toggles build on each other until the saved value returns. */
const useSelection = (value: string[], onValueChange: (tagIds: string[]) => void) => {
  const [saved, setSaved] = useState(value);
  const [picked, setPicked] = useState(value);

  if (saved.join() !== value.join()) {
    setSaved(value);
    setPicked(value);
  }

  const change = (ids: string[]) => {
    setPicked(ids);
    onValueChange(ids);
  };

  return [picked, change] as const;
};

/** A tag's color dot and name. */
const TagInline = ({ tag }: { tag: Pick<Tag, 'name' | 'colorCode'> }) => (
  <span className="flex max-w-full items-center gap-2">
    <TagDot color={tag.colorCode} />
    <TextOverflowTooltip value={tag.name} />
  </span>
);

/** The picked tags as badges; `maxVisible` folds the rest into "+N", `onRemove` adds an x to each. */
const TagBadges = ({
  type,
  ids,
  maxVisible,
  onRemove,
  className,
}: {
  type: ContentType;
  ids: string[];
  maxVisible?: number;
  onRemove?: (id: string) => void;
  className?: string;
}) => {
  const { byId, loading } = useTags(type);

  if (loading && ids.length > 0) return <Skeleton className="h-5 w-20" />;

  const visible = ids.slice(0, maxVisible);
  const remaining = ids.length - visible.length;

  // A space between the badges: without one, "VIP" and "Example" read as the one word "VIPExample",
  // which the button's spoken name ("Tags VIP Example") does not contain.
  return (
    <>
      {visible.map((id) => (
        <Fragment key={id}>
          <Badge
            variant="secondary"
            className={className}
            onClose={onRemove && (() => onRemove(id))}
          >
            <TagInline tag={byId.get(id) ?? { name: 'Unknown tag', colorCode: null }} />
          </Badge>{' '}
        </Fragment>
      ))}
      {remaining > 0 && (
        <Badge variant="muted" className="shrink-0">
          +{remaining}
        </Badge>
      )}
    </>
  );
};

/** "Add customer tag: "VIP"": creates the tag and picks it. */
const CreateTagItem = ({
  type,
  name,
  onCreated,
}: {
  type: ContentType;
  name: string;
  onCreated: (tag: Tag) => void;
}) => {
  const create = useTagCreate();
  // A new tag's color, picked once when the list opens.
  const [color] = useState(() => TAG_COLORS[Math.floor(Math.random() * TAG_COLORS.length)]);

  return (
    <Command.Group heading="Create tag">
      <Command.Item
        value={`create:${name}`}
        disabled={create.isPending}
        onSelect={() => create.mutate({ type, name, colorCode: color }, { onSuccess: onCreated })}
        className="justify-start"
      >
        <IconPlus className="size-4 shrink-0" />
        <span className="shrink-0">Add {type} tag:</span>
        <span className="min-w-0 flex-1 truncate text-muted-foreground">&quot;{name}&quot;</span>
      </Command.Item>
    </Command.Group>
  );
};

/** Search, the picked tags as removable badges, every tag with a check, and "create". */
const TagList = ({ type, value, onValueChange }: TagsSelectProps) => {
  const { tags, loading, error } = useTags(type);

  return (
    <EntityPicker
      multiple
      items={tags}
      itemKey={(tag) => ({ id: tag.id, label: tag.name })}
      renderItem={(tag) => <TagInline tag={tag} />}
      value={value}
      onValueChange={onValueChange}
      loading={loading}
      error={error}
      searchPlaceholder="Search tag..."
      header={
        value.length > 0 && (
          <div className="flex w-full flex-wrap gap-x-2 gap-y-1 border-b p-1">
            <TagBadges
              type={type}
              ids={value}
              onRemove={(id) => onValueChange(value.filter((item) => item !== id))}
            />
          </div>
        )
      }
      renderCreate={(name, clear) =>
        !loading &&
        name &&
        !tags.some((tag) => tag.name.toLowerCase() === name.toLowerCase()) && (
          <CreateTagItem
            type={type}
            name={name}
            onCreated={(tag) => {
              onValueChange([...value, tag.id]);
              clear();
            }}
          />
        )
      }
    />
  );
};

/** A "Tag" button that picks tags (command bar). */
const TagsSelectButton = ({
  type,
  value,
  onValueChange,
  variant = 'ghost',
  className,
}: TagsSelectProps & {
  variant?: ComponentProps<typeof Button>['variant'];
  className?: string;
}) => {
  const [picked, change] = useSelection(value, onValueChange);

  return (
    <Popover>
      <Popover.Trigger render={<Button variant={variant} className={cn('w-min', className)} />}>
        <IconTags className="size-4" />
        Tag
      </Popover.Trigger>
      <Combobox.Content aria-label="Tags" className="w-50" align="start">
        <TagList type={type} value={picked} onValueChange={change} />
      </Combobox.Content>
    </Popover>
  );
};

/**
 * The tags as a table or panel cell; click to change them. `placeholder` shows while there are
 * none, `label` is spoken after the tags.
 */
const TagsSelectInlineCell = ({
  type,
  value,
  onValueChange,
  scope,
  maxVisible,
  placeholder,
  label,
  className,
}: TagsSelectProps & {
  scope?: string;
  maxVisible?: number;
  placeholder?: ReactNode;
  label?: string;
  className?: string;
}) => {
  const [picked, change] = useSelection(value, onValueChange);

  return (
    <PopoverScoped scope={scope}>
      <RecordTableInlineCell.Trigger className={className}>
        <span className="flex min-w-0 max-w-full items-center gap-1">
          <TagBadges
            type={type}
            ids={picked}
            maxVisible={maxVisible}
            className={maxVisible === undefined ? undefined : 'min-w-0 overflow-hidden'}
          />
          {picked.length === 0 && placeholder}
          {picked.length > 0 && label && <span className="sr-only">{label}</span>}
        </span>
      </RecordTableInlineCell.Trigger>
      <RecordTableInlineCell.Content aria-label="Tags">
        <TagList type={type} value={picked} onValueChange={change} />
      </RecordTableInlineCell.Content>
    </PopoverScoped>
  );
};

export const TagsSelect = Object.assign(TagsSelectButton, {
  InlineCell: TagsSelectInlineCell,
});
