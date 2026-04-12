import { SettingsHotKeyScope } from '@/types/SettingsHotKeyScope';
import { IconCirclesFilled, IconMinus } from '@tabler/icons-react';
import {
  Combobox,
  Command,
  Popover,
  PopoverScoped,
} from 'erxes-ui';
import { ReactNode } from 'react';
import { Can, ITag, useTagEdit } from 'ui-modules';

interface TagMoveToGroupPopoverProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tagGroups: ITag[];
  targetTags: ITag[];
  showNoGroup?: boolean;
  onDone?: () => void;
  children: ReactNode;
}

export const TagMoveToGroupPopover = ({
  open,
  onOpenChange,
  tagGroups,
  targetTags,
  showNoGroup,
  onDone,
  children,
}: TagMoveToGroupPopoverProps) => {
  const { editTag } = useTagEdit();

  const handleMove = (groupId: string | null) => {
    for (const tag of targetTags) {
      editTag({
        variables: {
          id: tag._id,
          parentId: groupId ?? undefined,
        },
        optimisticResponse: {
          tagsEdit: { ...tag, parentId: groupId ?? undefined },
        },
      });
    }
    onOpenChange(false);
    onDone?.();
  };

  const targetIds = new Set(targetTags.map((t) => t._id));
  const availableGroups = tagGroups.filter((g) => !targetIds.has(g._id));

  return (
    <PopoverScoped
      scope={SettingsHotKeyScope.TagsInput}
      open={open}
      onOpenChange={onOpenChange}
    >
      <Popover.Trigger asChild onClick={(e) => e.stopPropagation()}>
        {children as React.ReactElement}
      </Popover.Trigger>
      <Combobox.Content
        sideOffset={6}
        onClick={(e) => e.stopPropagation()}
        className="min-w-50 w-min"
      >
        <Command>
          <Command.Input
            variant="secondary"
            focusOnMount
            placeholder="Search groups..."
          />
          <Command.Empty>No groups found</Command.Empty>
          <Command.List className="[&>div>div]:cursor-pointer">
            <Can action="tagsUpdate">
              <>
                {showNoGroup && (
                  <Command.Item onSelect={() => handleMove(null)}>
                    <IconMinus className="size-3" />
                    No group (standalone)
                  </Command.Item>
                )}
                {availableGroups.map((group) => (
                  <Command.Item
                    key={group._id}
                    onSelect={() => handleMove(group._id)}
                  >
                    <IconCirclesFilled
                      className="size-3"
                      style={{ color: group.colorCode }}
                    />
                    {group.name}
                  </Command.Item>
                ))}
              </>
            </Can>
          </Command.List>
        </Command>
      </Combobox.Content>
    </PopoverScoped>
  );
};
