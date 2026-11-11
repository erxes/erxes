import type { ContentType } from '@erxes/core-contract';
import { IconCheck, IconMinus, IconPlus } from '@tabler/icons-react';
import { Command } from 'erxes-ui';
import { useState } from 'react';
import { TagDot } from './TagBadges';
import { TAG_COLORS, useTagCreate, useTags } from './useTags';

/**
 * The tag list inside a picker: search, check marks, and "Create" for a new
 * name. `state` says whether a tag is on all, some or none of the records.
 */
export const TagsCommand = ({
  type,
  state,
  onToggle,
}: {
  type: ContentType;
  state: (tagId: string) => 'all' | 'some' | 'none';
  onToggle: (tagId: string, on: boolean) => void;
}) => {
  const { tags } = useTags(type);
  const create = useTagCreate();
  const [search, setSearch] = useState('');
  const name = search.trim();
  const exists = tags.some((tag) => tag.name.toLowerCase() === name.toLowerCase());

  return (
    <Command>
      <Command.Input value={search} onValueChange={setSearch} placeholder="Search or create tag" />
      <Command.List className="max-h-72 p-1">
        <Command.Empty>No tags yet</Command.Empty>
        {tags.map((tag) => {
          const current = state(tag.id);

          return (
            <Command.Item key={tag.id} value={tag.name} onSelect={() => onToggle(tag.id, current !== 'all')}>
              <TagDot color={tag.colorCode} />
              <span className="flex-1 truncate">{tag.name}</span>
              {current === 'all' && <IconCheck className="size-4 text-primary" />}
              {current === 'some' && <IconMinus className="size-4 text-muted-foreground" />}
            </Command.Item>
          );
        })}
        {name && !exists && (
          <Command.Item
            value={`create ${name}`}
            disabled={create.isPending}
            onSelect={() =>
              create.mutate(
                { type, name, colorCode: TAG_COLORS[tags.length % TAG_COLORS.length] },
                {
                  onSuccess: (tag) => {
                    setSearch('');
                    onToggle(tag.id, true);
                  },
                },
              )
            }
          >
            <IconPlus className="size-4" />
            Create “{name}”
          </Command.Item>
        )}
      </Command.List>
    </Command>
  );
};
