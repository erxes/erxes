import { TagMoveToGroupPopover } from '@/settings/tags/components/TagMoveToGroupPopover';
import { SelectionCapability } from '@/settings/tags/types/tagTree';
import { IconArrowMoveRight, IconTrash } from '@tabler/icons-react';
import { Button, CommandBar, useConfirm } from 'erxes-ui';
import { useState } from 'react';
import { Can, ITag, useTagRemove } from 'ui-modules';

interface TagsCommandBarProps {
  selectedIds: Set<string>;
  tags: ITag[];
  tagGroups: ITag[];
  capability: SelectionCapability;
  onClearSelection: () => void;
}

export const TagsCommandBar = ({
  selectedIds,
  tags,
  tagGroups,
  capability,
  onClearSelection,
}: TagsCommandBarProps) => {
  const [moveOpen, setMoveOpen] = useState(false);
  const { confirm } = useConfirm();
  const { removeTag } = useTagRemove();

  const selectedTags = tags.filter((t) => selectedIds.has(t._id));
  const hasChildTags = selectedTags.some((t) => !!t.parentId);

  const handleBulkDelete = async () => {
    const groupCount = selectedTags.filter((t) => t.isGroup).length;
    const tagCount = selectedTags.filter((t) => !t.isGroup).length;

    let message = '';
    if (groupCount > 0 && tagCount > 0) {
      message = `Delete ${groupCount} group(s) and ${tagCount} tag(s)?`;
    } else if (groupCount > 0) {
      message = `Delete ${groupCount} group(s)?`;
    } else {
      message = `Delete ${tagCount} tag(s)?`;
    }

    await confirm({ message, options: { okLabel: 'Delete' } });

    for (const tag of selectedTags) {
      removeTag(tag._id);
    }
    onClearSelection();
  };

  return (
    <CommandBar open={selectedIds.size > 0}>
      <CommandBar.Bar>
        <CommandBar.Value onClose={onClearSelection}>
          {selectedIds.size} selected
        </CommandBar.Value>
        <Can action="tagsDelete">
          <Button
            variant="outline"
            size="sm"
            className="shadow-none border-dashed gap-1"
            onClick={handleBulkDelete}
            disabled={!capability.canDelete}
          >
            <IconTrash className="size-4" />
            Delete
          </Button>
        </Can>
        <Can action="tagsUpdate">
          <TagMoveToGroupPopover
            open={moveOpen}
            onOpenChange={setMoveOpen}
            tagGroups={tagGroups}
            targetTags={selectedTags}
            showNoGroup={hasChildTags}
            onDone={onClearSelection}
          >
            <Button
              variant="outline"
              size="sm"
              className="shadow-none border-dashed gap-1"
              disabled={!capability.canMove}
              title={capability.moveDisabledReason}
            >
              <IconArrowMoveRight className="size-4" />
              Move to Group
            </Button>
          </TagMoveToGroupPopover>
        </Can>
      </CommandBar.Bar>
    </CommandBar>
  );
};
