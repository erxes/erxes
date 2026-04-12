import { useTagDeleteConfirm } from '@/settings/tags/components/TagDeleteConfirmDialog';
import { SettingsHotKeyScope } from '@/types/SettingsHotKeyScope';
import {
  IconArrowMoveRight,
  IconCaretRightFilled,
  IconDots,
  IconPlus,
  IconTransform,
  IconTrash,
  IconX,
} from '@tabler/icons-react';
import {
  Button,
  cn,
  Combobox,
  Command,
  Popover,
  PopoverScoped,
  useConfirm,
} from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Can, ITag, useTagEdit } from 'ui-modules';
import { TAGS_QUERY } from 'ui-modules/modules/tags-new/graphql/tagQueries';

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
  const { confirm } = useConfirm();
  const { t } = useTranslation('settings', { keyPrefix: 'tags' });

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
                    {t('add-child-tag')}
                  </Command.Item>
                </Can>
              ) : (
                <>
                  {tag.parentId && (
                    <Can action="tagsUpdate">
                      <Command.Item
                        onSelect={() => {
                          editTag({
                            variables: { id: tag._id, parentId: null },
                          });
                          setMenuOpen(false);
                        }}
                      >
                        <IconX />
                        {t('remove-from-group')}
                      </Command.Item>
                    </Can>
                  )}
                  <Can action="tagsUpdate">
                    <Command.Item onSelect={() => setMenuContent('move')}>
                      <IconArrowMoveRight />
                      {t(tag.parentId ? 'change-group' : 'move-to-group')}
                      <IconCaretRightFilled className="size-5 absolute right-1 text-accent-foreground" />
                    </Command.Item>
                  </Can>
                </>
              )}
              <Can action="tagsUpdate">
                <Command.Item
                  onSelect={async () => {
                    if (tag.isGroup && childCount > 0) {
                      try {
                        await confirm({
                          message: t('convert-group-confirm', { name: tag.name }),
                          options: {
                            description: t('convert-group-confirm-description', { count: childCount }),
                            okLabel: t('convert'),
                          },
                        });
                      } catch {
                        return;
                      }
                    }
                    editTag({
                      variables: { id: tag._id, isGroup: !tag.isGroup },
                      refetchQueries: [
                        {
                          query: TAGS_QUERY,
                          variables: {
                            excludeWorkspaceTags: true,
                            type: tag.type,
                          },
                        },
                      ],
                    });
                    setMenuOpen(false);
                  }}
                >
                  <IconTransform />
                  {t(tag.isGroup ? 'convert-to-tag' : 'convert-to-group')}
                </Command.Item>
              </Can>
              <Can action="tagsDelete">
                <Command.Item
                  className="text-destructive"
                  onSelect={handleDelete}
                >
                  <IconTrash />
                  {t('delete')}
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
              placeholder={t('search-groups')}
            />
            <Command.Empty>{t('no-groups-found')}</Command.Empty>
            <Command.List className="[&>div>div]:cursor-pointer">
              <Can action="tagsUpdate">
                <>
                  {tag.parentId && (
                    <Command.Item
                      onSelect={() => {
                        editTag({
                          variables: { id: tag._id, parentId: null },
                        });
                        setMenuOpen(false);
                      }}
                    >
                      {t('remove-from-group')}
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
