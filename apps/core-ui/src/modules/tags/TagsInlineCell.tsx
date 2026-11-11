import type { ContentType } from '@erxes/core-contract';
import { PopoverScoped, RecordTableInlineCell } from 'erxes-ui';
import { TagBadges } from './TagBadges';
import { TagsCommand } from './TagsCommand';

/** A record's tags, editable in place (table cell or detail row). */
export const TagsInlineCell = ({
  type,
  value,
  scope,
  onChange,
  placeholder,
}: {
  type: ContentType;
  value: string[];
  scope: string;
  onChange: (tagIds: string[]) => void;
  placeholder?: string;
}) => (
  <PopoverScoped scope={scope}>
    <RecordTableInlineCell.Trigger>
      <TagBadges type={type} ids={value} max={3} placeholder={placeholder} />
    </RecordTableInlineCell.Trigger>
    <RecordTableInlineCell.Content className="w-64 p-0">
      <TagsCommand
        type={type}
        state={(id) => (value.includes(id) ? 'all' : 'none')}
        onToggle={(id, on) => onChange(on ? [...value, id] : value.filter((tagId) => tagId !== id))}
      />
    </RecordTableInlineCell.Content>
  </PopoverScoped>
);
