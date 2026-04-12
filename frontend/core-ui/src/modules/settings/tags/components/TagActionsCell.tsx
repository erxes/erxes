import { useTagDeleteConfirm } from '@/settings/tags/components/TagDeleteConfirmDialog';
import { SettingsHotKeyScope } from '@/types/SettingsHotKeyScope';
import {
  IconArrowMoveRight,
  IconCaretRightFilled,
  IconDots,
  IconPlus,
  IconTransform,
  IconTrash,
} from '@tabler/icons-react';
import {
  Button,
  cn,
  Combobox,
  Command,
  Popover,
  PopoverScoped,
} from 'erxes-ui';
import { useState } from 'react';
import { Can, ITag, useTagEdit } from 'ui-modules';

interface TagActionsCellProps {
  tag: ITag;
  tagGroups: ITag[];
  childCount?: number;
  onAddChild: (parentId: string) => void;
}

export const TagActionsCell = ({
  tag,
  tagGroups,
  childCount = 0,
  onAddChild,
}: TagActionsCellProps) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuContent, setMenuContent] = useState<'main' | 'move'>('main');
  const { editTag } = useTagEdit();
  const { confirmDelete } = useTagDeleteConfirm();

  const triggerActions = tag.isGroup
    ? ['tagsCreate', 'tagsUpdate', 'tagsDelete']
    : ['tagsUpdate', 'tagsDelete'];

  const handleDelete = async () => {
    setMenuOpen(false);
    await confirmDelete(tag, childCount);
  };

  return (
    <PopoverScoped
        scope={SettingsHotKeyScope.TagsInput}
        open={menuOpen}
        onOpenChange={(open) => {
          setMenuOpen(open);
          if (!open) setMenuContent('main');
        }}
      >
        <Can actions={triggerActions}>
          <Popover.Trigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => e.stopPropagation()}
              className={cn(
                'shrink-0 w-8 opacity-0 group-hover:opacity-100',
                menuOpen && 'opacity-100 bg-accent-foreground/10',
              )}
            >
              <IconDots />
            </Button>
          </Popover.Trigger>
        </Can>
        <Combobox.Content
          sideOffset={6}
          onClick={(e) => e.stopPropagation()}
          className="min-w-50 w-min"
        >
          {menuContent === 'main' && (
            <Command>
              <Command.Input />
              <Combobox.Empty />
              <Command.List className="[&>div>div]:cursor-pointer">
                {tag.isGroup ? (
                  <Can action="tagsCreate">
                    <Command.Item
                      onSelect={() => {
                        setMenuOpen(false);
                        onAddChild(tag._id);
                      }}
                    >
                      <IconPlus />
                      Add child tag
                    </Command.Item>
                  </Can>
                ) : (
                  <Can action="tagsUpdate">
                    <Command.Item
                      onSelect={() => setMenuContent('move')}
                    >
                      <IconArrowMoveRight />
                      {tag.parentId ? 'Change group' : 'Move to group'}
                      <IconCaretRightFilled className="size-5 absolute right-1 text-accent-foreground" />
                    </Command.Item>
                  </Can>
                )}
                <Can action="tagsUpdate">
                  <Command.Item
                    onSelect={() => {
                      editTag({
                        variables: {
                          id: tag._id,
                          isGroup: !tag.isGroup,
                        },
                        optimisticResponse: {
                          tagsEdit: { ...tag, isGroup: !tag.isGroup },
                        },
                      });
                      setMenuOpen(false);
                    }}
                  >
                    <IconTransform />
                    Convert to {tag.isGroup ? 'tag' : 'group'}
                  </Command.Item>
                </Can>
                <Can action="tagsDelete">
                  <Command.Item
                    className="text-destructive"
                    onSelect={handleDelete}
                  >
                    <IconTrash />
                    Delete
                  </Command.Item>
                </Can>
              </Command.List>
            </Command>
          )}
          {menuContent === 'move' && (
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
                    {tag.parentId && (
                      <Command.Item
                        onSelect={() => {
                          editTag({
                            variables: { id: tag._id, parentId: undefined },
                            optimisticResponse: {
                              tagsEdit: { ...tag, parentId: undefined },
                            },
                          });
                          setMenuOpen(false);
                        }}
                      >
                        No group (standalone)
                      </Command.Item>
                    )}
                    {tagGroups
                      .filter((g) => g._id !== tag._id)
                      .map((group) => (
                        <Command.Item
                          key={group._id}
                          onSelect={() => {
                            editTag({
                              variables: { id: tag._id, parentId: group._id },
                              optimisticResponse: {
                                tagsEdit: { ...tag, parentId: group._id },
                              },
                            });
                            setMenuOpen(false);
                          }}
                        >
                          {group.name}
                        </Command.Item>
                      ))}
                  </>
                </Can>
              </Command.List>
            </Command>
          )}
        </Combobox.Content>
      </PopoverScoped>
  );
};
