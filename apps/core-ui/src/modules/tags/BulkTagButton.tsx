import type { ContentType } from '@erxes/core-contract';
import { IconTags } from '@tabler/icons-react';
import { Button, Popover } from 'erxes-ui';
import { TagsCommand } from './TagsCommand';

/**
 * Tags for selected records (command bar): a tag on all of them is taken off,
 * otherwise it is added to all.
 */
export const BulkTagButton = ({
  type,
  records,
  onChange,
}: {
  type: ContentType;
  records: { tagIds: string[] }[];
  onChange: (change: { add: string[]; remove: string[] }) => void;
}) => (
  <Popover>
    <Popover.Trigger asChild>
      <Button variant="secondary">
        <IconTags />
        Tag
      </Button>
    </Popover.Trigger>
    <Popover.Content side="top" className="w-64 p-0">
      <TagsCommand
        type={type}
        state={(id) => {
          const count = records.filter((record) => record.tagIds.includes(id)).length;

          return count === 0 ? 'none' : count === records.length ? 'all' : 'some';
        }}
        onToggle={(id, on) => onChange(on ? { add: [id], remove: [] } : { add: [], remove: [id] })}
      />
    </Popover.Content>
  </Popover>
);
