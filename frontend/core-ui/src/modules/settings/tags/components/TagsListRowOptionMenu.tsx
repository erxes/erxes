import { Button, cn, Combobox, Command, Popover } from 'erxes-ui';
import {
  IconDots,
  IconTransform,
  IconTrash,
  IconPlus,
  IconArrowMoveRight,
  IconCaretRightFilled,
  IconCirclesFilled,
} from '@tabler/icons-react';
import { useState } from 'react';
import { useTagEdit, ITag, useTagRemove } from 'ui-modules';
import { addingTagAtom } from '@/settings/tags/states/addingTagAtom';
import { useSetAtom, useAtomValue } from 'jotai';
import { tagGroupsAtomFamily } from '@/settings/tags/states/tagGroupsAtom';
import { useQueryState } from 'erxes-ui';

export const TagsListRowOptionMenu = ({ tag }: { tag: ITag }) => {
  const [menuContent, setMenuContent] = useState<'main' | 'groupSelect'>(
    'main',
  );
  const [open, setOpen] = useState(false);
  const { editTag } = useTagEdit();
  const { removeTag } = useTagRemove();
  const setAddingTag = useSetAtom(addingTagAtom);
  const [type] = useQueryState<string>('tagType');
  const tagGroupsFiltered = useAtomValue(tagGroupsAtomFamily(type)).filter(
    (group) => group._id !== tag._id,
  );

  return (
    <Popover
      open={open}
      onOpenChange={(open) => {
        setOpen(open);
        setMenuContent('main');
      }}
    >
      <Popover.Trigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => e.stopPropagation()}
          className={cn(
            'absolute left-3 opacity-0 group-hover:opacity-100  ',
            open && 'opacity-100 bg-accent-foreground/10',
          )}
        >
          <IconDots />
        </Button>
      </Popover.Trigger>
      <Combobox.Content
        sideOffset={6}
        onClick={(e) => e.stopPropagation()}
        className="min-w-50 w-min"
      >
        {menuContent === 'main' && (
          <Command shouldFilter={false}>
            <Command.List className="[&>div>div]:cursor-pointer">
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
                }}
              >
                <IconTransform />
                Convert to {tag.isGroup ? 'tag' : 'group'}
              </Command.Item>
              {tag.isGroup ? (
                <Command.Item
                  onSelect={() =>
                    setAddingTag({ parentId: tag._id, isGroup: false })
                  }
                >
                  <IconPlus />
                  Add tag to group
                </Command.Item>
              ) : (
                <Command.Item onSelect={() => setMenuContent('groupSelect')}>
                  <IconArrowMoveRight />
                  {!tag.parentId ? 'Move to group' : 'Change group'}
                  <IconCaretRightFilled className="size-5 absolute right-1 text-accent-foreground" />
                </Command.Item>
              )}
              <Command.Item
                className="text-destructive"
                onSelect={() => removeTag(tag._id)}
              >
                <IconTrash />
                Delete
              </Command.Item>
            </Command.List>
          </Command>
        )}
        {menuContent === 'groupSelect' && (
          <Command>
            <Command.Input
              variant="secondary"
              focusOnMount
              placeholder="Search tag groups"
            />
            <Command.List className="[&>div>div]:cursor-pointer">
              {tagGroupsFiltered.map((group) => (
                <Command.Item
                  key={group._id}
                  onSelect={() => {
                    editTag({
                      variables: {
                        id: tag._id,
                        parentId: group._id,
                      },
                      optimisticResponse: {
                        tagsEdit: { ...tag, parentId: group._id },
                      },
                    });
                  }}
                >
                  <IconCirclesFilled
                    className="size-3"
                    style={{ color: group.colorCode }}
                  ></IconCirclesFilled>
                  {group.name}
                </Command.Item>
              ))}
            </Command.List>
          </Command>
        )}
      </Combobox.Content>
    </Popover>
  );
};
