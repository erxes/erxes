import { TagsListColorField } from '@/settings/tags/components/fields/TagsListColorField';
import { TagsListNameField } from '@/settings/tags/components/fields/TagsListNameField';
import { IconCaretRightFilled } from '@tabler/icons-react';
import { cn } from 'erxes-ui';
import { ITag } from 'ui-modules';

interface TagNameCellProps {
  tag: ITag;
  depth: number;
  isExpanded?: boolean;
  onToggleExpand?: (groupId: string) => void;
  hasChildren?: boolean;
}

const BASE_LEFT = 8;
const INDENT_PER_LEVEL = 24;

export const TagNameCell = ({
  tag,
  depth,
  isExpanded,
  onToggleExpand,
  hasChildren,
}: TagNameCellProps) => {
  const paddingLeft = BASE_LEFT + depth * INDENT_PER_LEVEL;

  if (tag.isGroup) {
    return (
      <div
        className="flex-1 min-w-0 flex items-center gap-1 h-full"
        style={{ paddingLeft }}
      >
        <IconCaretRightFilled
          className={cn(
            'size-3 shrink-0 transition-transform duration-100 text-muted-foreground cursor-pointer select-none',
            isExpanded && 'rotate-90',
            !hasChildren && 'opacity-0',
          )}
          onClick={() => onToggleExpand?.(tag._id)}
        />
        <div data-no-select onClick={(e) => e.stopPropagation()}>
          <TagsListColorField tag={tag} />
        </div>
        <div
          className="flex-1 min-w-0 cursor-pointer select-none h-full flex items-center"
          onClick={() => onToggleExpand?.(tag._id)}
        >
          <TagsListNameField name={tag.name} id={tag._id} />
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex-1 min-w-0 flex items-center gap-1 h-full"
      style={{ paddingLeft }}
    >
      <div className="w-3 shrink-0" />
      <div data-no-select onClick={(e) => e.stopPropagation()}>
        <TagsListColorField tag={tag} />
      </div>
      <TagsListNameField name={tag.name} id={tag._id} />
    </div>
  );
};
