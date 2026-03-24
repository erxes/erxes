import { useRemoveTag } from 'ui-modules/modules/tags/hooks/useRemoveTag';
import { useTagsEdit } from 'ui-modules/modules/tags/hooks/useTagsEdit';
import { useTagsAdd } from 'ui-modules/modules/tags/hooks/useTagsAdd';
import { useTagContext } from 'ui-modules/modules/tags/components/TagProvider';
import {
  IconEdit,
  IconTrash,
  IconArrowRight,
  IconX,
  IconDropletsFilled,
  IconPlus,
  IconTransform,
} from '@tabler/icons-react';
import { Cell, ColumnDef } from '@tanstack/table-core';
import {
  Input,
  Command,
  RecordTableInlineCell,
  RecordTableTree,
  TextOverflowTooltip,
  Textarea,
  useConfirm,
  useQueryState,
  RecordTable,
  Combobox,
  Popover,
} from 'erxes-ui';
import React, { useState } from 'react';
import { useTags } from 'ui-modules/modules/tags/hooks/useTags';
import { ITag, ITagQueryResponse } from 'ui-modules/modules/tags/types/Tag';
import { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';

const MoveTagPopover: React.FC<{
  tagId: string;
  currentParentId?: string;
  tagType: string;
  onMove: (tagId: string, newParentId: string | null) => void;
  trigger: React.ReactNode;
}> = ({ tagId, currentParentId, tagType, onMove, trigger }) => {
  const [open, setOpen] = React.useState(false);

  const { tags: tagsGroup } = useTags({
    variables: {
      type: tagType,
      isGroup: true,
    },
    skip: !open,
  });

  const handleMove = (newParentId: string | null) => {
    onMove(tagId, newParentId);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>{trigger}</Popover.Trigger>
      <Popover.Content side="right" className="w-64 p-0" align="start">
        <Command>
          <Command.Input placeholder="Search groups..." className="h-9" />
          <Command.List>
            <Command.Empty>No groups found.</Command.Empty>

            {currentParentId && (
              <>
                <Command.Item onSelect={() => handleMove(null)}>
                  <div className="flex items-center gap-1">
                    <IconX size={16} />
                    <span>Remove from group</span>
                  </div>
                </Command.Item>
                <Command.Separator />
              </>
            )}

            <Command.Group heading="Move to group">
              {tagsGroup
                ?.filter((group) => group._id !== currentParentId)
                .map((group) => (
                  <Command.Item
                    key={group._id}
                    onSelect={() => handleMove(group._id)}
                  >
                    <div className="flex items-center gap-2">
                      {group.colorCode ? (
                        <div
                          className="w-3 h-3 rounded"
                          style={{ backgroundColor: group.colorCode }}
                        ></div>
                      ) : (
                        <IconDropletsFilled
                          size={12}
                          className="text-blue-600"
                        />
                      )}

                      <span>{group.name}</span>
                    </div>
                  </Command.Item>
                ))}
            </Command.Group>
          </Command.List>
        </Command>
      </Popover.Content>
    </Popover>
  );
};

interface NewItemCellProps {
  tagType: string;
}

const NewItemCell: React.FC<NewItemCellProps> = ({ tagType }) => {
  const { mode, targetGroupId, cancel } = useTagContext();
  const [value, setValue] = React.useState('');
  const { addTag } = useTagsAdd();

  React.useEffect(() => {
    if (
      mode === 'adding-tag' ||
      mode === 'adding-group' ||
      mode === 'adding-tag-to-group'
    ) {
      setValue('');
    }
  }, [mode]);

  const handleSave = () => {
    if (value.trim()) {
      const newTag: ITagQueryResponse = {
        name: value,
        type: tagType,
        isGroup: mode === 'adding-group',
        parentId: mode === 'adding-tag-to-group' ? targetGroupId : undefined,
      };

      addTag({
        variables: newTag,
      });

      cancel();
      setValue('');
    }
  };

  const handleCancel = () => {
    cancel();
    setValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  };

  if (mode === 'idle') {
    return null;
  }

  return (
    <Input
      autoFocus
      placeholder={
        mode === 'adding-group'
          ? 'Enter group name...'
          : mode === 'adding-tag-to-group'
          ? 'Enter tag name for this group...'
          : 'Enter tag name...'
      }
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onKeyDown={handleKeyDown}
      onBlur={handleCancel}
      className="p-2 focus:ring-0"
    />
  );
};

interface TagMoreColumnCellProps {
  cell: Cell<ITag, unknown>;
  tagType: string;
}

export const TagMoreColumnCell: React.FC<TagMoreColumnCellProps> = ({
  cell,
  tagType,
}) => {
  const confirmOptions = { confirmationValue: 'delete' };
  const { confirm } = useConfirm();
  const [, setEditingTagId] = useQueryState('editingTagId');
  const { removeTag, loading } = useRemoveTag();
  const { tagsEdit } = useTagsEdit();
  const { startAddingTagToGroup } = useTagContext();

  const { _id, name, isGroup, parentId, hasChildren } = cell.row.original;

  const handleMoveTag = (tagId: string, newParentId: string | null) => {
    tagsEdit({
      variables: { id: tagId, name: name, parentId: newParentId },
    });
  };

  const onRemove = () => {
    confirm({
      message: 'Are you sure you want to remove the selected?',
      options: confirmOptions,
    }).then(async () => {
      try {
        removeTag(_id);
      } catch (e: any) {
        console.error(e.message);
      }
    });
  };

  return (
    <Popover>
      <Popover.Trigger asChild>
        <RecordTable.MoreButton className="w-full h-full" />
      </Popover.Trigger>
      <Combobox.Content>
        <Command shouldFilter={false}>
          <Command.List>
            <Command.Item
              value="edit"
              onSelect={() => {
                setEditingTagId(_id);
              }}
            >
              <IconEdit /> Edit
            </Command.Item>
            {!isGroup && (
              <MoveTagPopover
                tagId={_id}
                tagType={tagType}
                currentParentId={parentId}
                onMove={handleMoveTag}
                trigger={
                  <div className="flex items-center gap-2 p-2 text-sm">
                    <IconArrowRight className="h-4 w-4" />
                    Move
                  </div>
                }
              />
            )}
            {isGroup && (
              <Command.Item
                onSelect={() => {
                  startAddingTagToGroup(_id);
                }}
              >
                <IconPlus /> Add tag to group
              </Command.Item>
            )}
            {isGroup && !hasChildren && (
              <Command.Item
                onSelect={() => {
                  tagsEdit({
                    variables: {
                      id: _id,
                      name: name,
                      parentId: null,
                      isGroup: false,
                    },
                  });
                }}
              >
                <IconTransform /> Convert to tag
              </Command.Item>
            )}
            {!isGroup && (!parentId || parentId === '') && (
              <Command.Item
                onSelect={() => {
                  tagsEdit({
                    variables: {
                      id: _id,
                      name: name,
                      isGroup: true,
                    },
                  });
                }}
              >
                <IconTransform /> Convert to tag group
              </Command.Item>
            )}
            <Command.Item disabled={loading} value="remove" onSelect={onRemove}>
              <IconTrash /> Delete
            </Command.Item>
          </Command.List>
        </Command>
      </Combobox.Content>
    </Popover>
  );
};

const NameCell: React.FC<{ cell: Cell<ITag, unknown>; tagType: string }> = ({
  cell,
  tagType,
}) => {
  const { mode } = useTagContext();
  const row = cell.row.original;
  const { tagsEdit, loading } = useTagsEdit();
  const { _id, name, isGroup, order } = row;
  const [editingTagId, setEditingTagId] = useQueryState('editingTagId');
  const [open, setOpen] = React.useState<boolean>(false);
  const [_name, setName] = React.useState<string>(name);

  React.useEffect(() => {
    setName(name);
  }, [name]);

  React.useEffect(() => {
    if (editingTagId === _id) {
      setName(name);
      setOpen(true);
      setEditingTagId(null);
    }
  }, [editingTagId, _id, name, setEditingTagId]);

  if (
    (mode === 'adding-tag' ||
      mode === 'adding-group' ||
      mode === 'adding-tag-to-group') &&
    row._id === 'new-item-temp'
  ) {
    return <NewItemCell tagType={tagType} />;
  }

  const onSave = () => {
    if (name !== _name) {
      tagsEdit({
        variables: {
          id: _id,
          name: _name,
          isGroup: isGroup,
        },
      });
    }
  };

  const onChange = (el: React.ChangeEvent<HTMLInputElement>) => {
    setName(el.currentTarget.value);
  };

  return (
    <Popover
      open={open}
      onOpenChange={(open) => {
        setOpen(open);
        if (!open) {
          onSave();
        }
      }}
    >
      <RecordTableInlineCell.Trigger>
        <RecordTableTree.Trigger
          order={order || ''}
          name={cell.getValue() as string}
          hasChildren={isGroup ?? false}
          className="[&_svg]:text-muted-foreground"
        >
          <div className="flex items-center gap-2 min-w-0">
            <span
              className={`truncate ${
                isGroup
                  ? 'text-muted-foreground'
                  : 'font-semibold text-foreground'
              }`}
            >
              {cell.getValue() as string}
            </span>
          </div>
        </RecordTableTree.Trigger>
      </RecordTableInlineCell.Trigger>
      <RecordTableInlineCell.Content>
        <Input value={_name} onChange={onChange} disabled={loading} />
      </RecordTableInlineCell.Content>
    </Popover>
  );
};

const DescriptionCell: React.FC<{ cell: Cell<ITag, unknown> }> = ({ cell }) => {
  const { _id, description, name, isGroup } = cell.row.original;
  const [open, setOpen] = useState<boolean>(false);
  const [_description, setDescription] = useState<string>(description ?? '');
  const { tagsEdit, loading } = useTagsEdit();

  React.useEffect(() => {
    setDescription(description ?? '');
  }, [description]);

  const onSave = () => {
    if (_description !== description) {
      tagsEdit({
        variables: {
          id: _id,
          name: name,
          description: _description,
          isGroup: isGroup,
        },
      });
    }
  };
  const onChange = (el: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(el.currentTarget.value);
  };
  return (
    <Popover
      open={open}
      onOpenChange={(open) => {
        setOpen(open);
        if (!open) {
          onSave();
        }
      }}
    >
      <RecordTableInlineCell.Trigger>
        <TextOverflowTooltip value={cell.getValue() as string} />
      </RecordTableInlineCell.Trigger>
      <RecordTableInlineCell.Content>
        <Textarea value={_description} onChange={onChange} disabled={loading} />
      </RecordTableInlineCell.Content>
    </Popover>
  );
};

export const createTagsColumns = (
  tagType: string,
  t: TFunction,
): ColumnDef<ITag>[] => [
  {
    id: 'name',
    header: t('name'),
    accessorKey: 'name',
    cell: ({ cell }) => <NameCell cell={cell} tagType={tagType} />,
    minSize: 200,
    size: 300,
  },
  {
    id: 'description',
    header: t('description'),
    accessorKey: 'description',
    cell: ({ cell }) => <DescriptionCell cell={cell} />,
    minSize: 200,
    size: 400,
    maxSize: 600,
  },
  {
    header: t('created'),
    accessorKey: 'createdAt',
    cell: ({ cell }) => {
      const formatDate = (dateString: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });
      };
      return (
        <RecordTableInlineCell className="text-muted-foreground">
          {formatDate(cell.getValue() as string)}
        </RecordTableInlineCell>
      );
    },
    minSize: 120,
    size: 150,
  },
  {
    id: 'more',
    cell: ({ cell }) => (
      <div className="hover:opacity-100 duration-200 ease-in-out h-8">
        <TagMoreColumnCell cell={cell} tagType={tagType} />
      </div>
    ),
    size: 33,
  },
];
