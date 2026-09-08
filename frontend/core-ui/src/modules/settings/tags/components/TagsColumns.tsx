import { useTagsContext } from '@/settings/tags/context/TagsContext';
import { useTagsCrud } from '@/settings/tags/hooks/useTagsCrud';
import { TagTableRow, useTagsView } from '@/settings/tags/hooks/useTagsView';
import { TAG_DEFAULT_COLORS } from '@/settings/tags/constants/Colors';
import { SettingsHotKeyScope } from '@/types/SettingsHotKeyScope';
import {
  Badge,
  Button,
  ColorPicker,
  Input,
  Popover,
  RecordTable,
  RecordTableInlineCell,
  RecordTableTree,
  RelativeDateDisplay,
  TextOverflowTooltip,
  Textarea,
  cn,
  useToast,
} from 'erxes-ui';
import { ColumnDef } from '@tanstack/react-table';
import {
  IconCircleFilled,
  IconCirclesFilled,
  IconTag,
  IconTrash,
  IconWriting,
} from '@tabler/icons-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { TagsListRowOptionMenu } from './TagsListRowOptionMenu';

const tagsCheckboxColumn: ColumnDef<TagTableRow> = {
  ...(RecordTable.checkboxColumn as ColumnDef<TagTableRow>),
  header: ({ table }) => {
    const selectableRows = table
      .getRowModel()
      .rows.filter(
        (row) =>
          row.original.rowType !== 'draft' &&
          row.original.rowType !== 'context-group',
      );

    const selectedCount = selectableRows.filter((row) =>
      row.getIsSelected(),
    ).length;
    const allSelected =
      selectableRows.length > 0 && selectedCount === selectableRows.length;
    const someSelected = selectedCount > 0 && !allSelected;

    return (
      <div className="flex h-8 items-center justify-center">
        <input
          type="checkbox"
          className="size-4 rounded border border-input"
          checked={allSelected}
          ref={(element) => {
            if (element) {
              element.indeterminate = someSelected;
            }
          }}
          onChange={(event) => {
            selectableRows.forEach((row) =>
              row.toggleSelected(event.target.checked),
            );
          }}
          aria-label="Select all rows"
        />
      </div>
    );
  },
  cell: ({ row }) => {
    if (
      row.original.rowType === 'draft' ||
      row.original.rowType === 'context-group'
    ) {
      return <div className="h-8" />;
    }

    const CellComponent = RecordTable.checkboxColumn.cell;
    return CellComponent ? <CellComponent row={row} /> : null;
  },
};

const formatDate = (value?: string) => {
  if (!value) return '';
  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const TagColorCell = ({ row }: { row: TagTableRow }) => {
  const { type } = useTagsView();
  const { draft, updateDraft } = useTagsContext();
  const { editTag } = useTagsCrud(type);
  const [open, setOpen] = useState(false);

  const colorCode = row.rowType === 'draft' ? draft?.colorCode : row.colorCode;
  const isGroup =
    row.rowType === 'draft' ? draft?.kind === 'group' : row.isGroup;

  const onValueChange = (nextColor: string) => {
    if (row.rowType === 'draft') {
      updateDraft({ colorCode: nextColor });
      setOpen(false);
      return;
    }

    editTag({
      id: row._id,
      colorCode: nextColor,
    });
    setOpen(false);
  };

  return (
    <ColorPicker.Provider
      open={open}
      onOpenChange={setOpen}
      colors={TAG_DEFAULT_COLORS}
      value={colorCode}
      scope={SettingsHotKeyScope.TagsInput}
      onValueChange={onValueChange}
    >
      <ColorPicker.Trigger asChild>
        <Button
          className="size-7 shrink-0 p-0 shadow-none justify-center"
          variant="ghost"
          onClick={(event) => event.stopPropagation()}
        >
          {isGroup ? (
            <IconCirclesFilled
              className="size-3!"
              style={{ color: colorCode }}
            />
          ) : (
            <IconCircleFilled
              className="size-3!"
              style={{ color: colorCode }}
            />
          )}
        </Button>
      </ColorPicker.Trigger>
      <ColorPicker.Content setOpen={setOpen} />
    </ColorPicker.Provider>
  );
};

const DraftNameCell = ({ row }: { row: TagTableRow }) => {
  const { draft, updateDraft, closeDraft } = useTagsContext();
  const { type } = useTagsView();
  const { addTag, editTag } = useTagsCrud(type);
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  if (!draft) return null;

  const saveDraft = async () => {
    if (draft.savedId) return draft.savedId;

    if (!draft.name.trim()) {
      toast({
        title: 'Error',
        description: 'Tag name is required',
        variant: 'destructive',
      });
      return null;
    }

    const created = await addTag({
      name: draft.name.trim(),
      description: draft.description.trim() || undefined,
      colorCode: draft.colorCode,
      parentId: draft.parentId,
      isGroup: draft.kind === 'group',
      type,
    });

    if (created?._id) {
      updateDraft({ savedId: created._id });
      return created._id;
    }

    return null;
  };

  const finalizeDraft = async (persistedId?: string | null) => {
    const resolvedId = persistedId || draft.savedId;
    if (!resolvedId) return false;

    if (draft.description.trim()) {
      const updated = await editTag({
        id: resolvedId,
        description: draft.description.trim(),
      });

      if (!updated) {
        return false;
      }
    }

    closeDraft();
    return true;
  };

  return (
    <RecordTableInlineCell>
      <div className="flex w-full items-center gap-2">
        <TagColorCell row={row} />
        <Input
          ref={inputRef}
          value={draft.name}
          placeholder={
            draft.kind === 'group' ? 'Add group name' : 'Add tag name'
          }
          className="h-8 w-full border-transparent bg-transparent px-0 shadow-none focus-visible:ring-0"
          onChange={(event) => updateDraft({ name: event.currentTarget.value })}
          onBlur={(event) => {
            const nextTarget = event.relatedTarget as HTMLElement | null;
            const movingToDescription =
              nextTarget?.dataset.tagsDraftField === 'description';

            if (!draft.name.trim()) {
              closeDraft();
              return;
            }

            if (movingToDescription) {
              return;
            }

            saveDraft().then((createdId) => {
              if (!createdId) return;
              updateDraft({ savedId: createdId });
              void finalizeDraft(createdId);
            });
          }}
          onKeyDown={(event) => {
            if (event.key === 'Escape' && !draft.name && !draft.description) {
              closeDraft();
              return;
            }

            if (event.key === 'Enter') {
              event.preventDefault();

              if (!draft.name.trim()) {
                toast({
                  title: 'Error',
                  description: 'Tag name is required',
                  variant: 'destructive',
                });
                return;
              }

              saveDraft().then((createdId) => {
                if (!createdId) return;
                updateDraft({ savedId: createdId });
                void finalizeDraft(createdId);
              });
            }
          }}
        />
      </div>
    </RecordTableInlineCell>
  );
};

const DraftDescriptionCell = ({ row }: { row: TagTableRow }) => {
  const { draft, updateDraft, closeDraft } = useTagsContext();
  const { type } = useTagsView();
  const { addTag, editTag } = useTagsCrud(type);

  if (!draft) return null;

  const ensureSaved = async () => {
    if (draft.savedId) return draft.savedId;
    if (!draft.name.trim()) return null;

    const created = await addTag({
      name: draft.name.trim(),
      description: draft.description.trim() || undefined,
      colorCode: draft.colorCode,
      parentId: draft.parentId,
      isGroup: draft.kind === 'group',
      type,
    });

    if (created?._id) {
      updateDraft({ savedId: created._id });
      return created._id;
    }

    return null;
  };

  return (
    <RecordTableInlineCell>
      <Textarea
        data-tags-draft-field="description"
        value={draft.description}
        placeholder="Add tag description..."
        disabled={!draft.name.trim() && !draft.savedId}
        className="min-h-0 w-full resize-none border-transparent bg-transparent px-0 py-2 text-sm shadow-none focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-50"
        onFocus={() => {
          if (draft.name.trim()) {
            void ensureSaved();
          }
        }}
        onChange={(event) =>
          updateDraft({ description: event.currentTarget.value })
        }
        onBlur={async () => {
          const createdId = await ensureSaved();

          if (!createdId) {
            if (!draft.name.trim() && !draft.description.trim()) {
              closeDraft();
            }
            return;
          }

          if (draft.description.trim()) {
            const updated = await editTag({
              id: createdId,
              description: draft.description.trim(),
            });

            if (!updated) {
              return;
            }
          }

          closeDraft();
        }}
      />
    </RecordTableInlineCell>
  );
};

const EditableNameCell = ({ row }: { row: TagTableRow }) => {
  const { type } = useTagsView();
  const { editTag } = useTagsCrud(type);
  const [value, setValue] = useState(row.name || '');
  const [open, setOpen] = useState(false);

  if (row.rowType === 'draft') {
    return <DraftNameCell row={row} />;
  }

  return (
    <Popover
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen && value.trim() && value !== row.name) {
          editTag({ id: row._id, name: value.trim() });
        }
      }}
    >
      <RecordTableInlineCell.Trigger>
        <div className="flex w-full items-center gap-2">
          <RecordTableTree.Trigger
            order={row.order}
            name={row.name || ''}
            hasChildren={row.hasChildren}
            className={cn(
              'min-w-0',
              row.rowType === 'context-group' && 'opacity-60',
            )}
          >
            {/* <div className="flex min-w-0 items-center gap-2">
              <TextOverflowTooltip value={row.name || ''} />
              {(row.rowType === 'group' || row.rowType === 'context-group') && (
                <Badge className="shrink-0 text-[10px]">Group</Badge>
              )}
            </div> */}
            <div className="flex min-w-0 items-center gap-2">
              {row.parentId && (
                <div className="relative mr-1 h-4 w-4 shrink-0">
                  <div className="absolute left-1/2 top-0 h-1/2 w-px -translate-x-1/2 bg-border" />
                  <div className="absolute left-1/2 top-1/2 h-px w-3 bg-border" />
                </div>
              )}
              <TagColorCell row={row} />

              <TextOverflowTooltip value={row.name || ''} />

              {(row.rowType === 'group' || row.rowType === 'context-group') && (
                <Badge className="shrink-0 text-[10px]">Group</Badge>
              )}
            </div>
          </RecordTableTree.Trigger>
        </div>
      </RecordTableInlineCell.Trigger>
      <RecordTableInlineCell.Content>
        <Input
          value={value}
          onChange={(event) => setValue(event.currentTarget.value)}
          className="h-8"
        />
      </RecordTableInlineCell.Content>
    </Popover>
  );
};

const EditableDescriptionCell = ({ row }: { row: TagTableRow }) => {
  const { type } = useTagsView();
  const { editTag } = useTagsCrud(type);
  const [value, setValue] = useState(row.description || '');
  const [open, setOpen] = useState(false);

  if (row.rowType === 'draft') {
    return <DraftDescriptionCell row={row} />;
  }

  return (
    <Popover
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen && value !== (row.description || '')) {
          editTag({ id: row._id, description: value });
        }
      }}
    >
      <RecordTableInlineCell.Trigger>
        <div className={cn('min-w-0', row.isContext && 'opacity-60')}>
          {value ? (
            <TextOverflowTooltip value={value} />
          ) : (
            <span className="text-muted-foreground">
              Add tag description...
            </span>
          )}
        </div>
      </RecordTableInlineCell.Trigger>
      <RecordTableInlineCell.Content>
        <Textarea
          value={value}
          onChange={(event) => setValue(event.currentTarget.value)}
          className="min-h-0 resize-none"
        />
      </RecordTableInlineCell.Content>
    </Popover>
  );
};

export const useTagsColumns = () => {
  const { draft, openDraft } = useTagsContext();
  const { type, tagGroups } = useTagsView();
  const { removeTag } = useTagsCrud(type);

  return useMemo<ColumnDef<TagTableRow>[]>(
    () => [
      {
        id: 'more',
        size: 44,
        cell: ({ cell }) => {
          const row = cell.row.original;

          // if (row.rowType === 'draft') {
          //   return <RecordTableInlineCell className="justify-center" />;
          // }

          // if (row.rowType === 'context-group') {
          //   return <RecordTableInlineCell />;
          // }

          return (
            <TagsListRowOptionMenu
              tag={row}
              tagGroups={tagGroups}
              onAddChild={(parentId) =>
                openDraft({
                  kind: 'child',
                  parentId,
                  colorCode: Object.values(TAG_DEFAULT_COLORS)[0],
                })
              }
            />
          );
        },
      },
      tagsCheckboxColumn,
      {
        id: 'name',
        accessorKey: 'name',
        header: () => <RecordTable.InlineHead icon={IconTag} label="Name" />,
        cell: ({ cell }) => <EditableNameCell row={cell.row.original} />,
        size: 460,
      },
      {
        id: 'description',
        accessorKey: 'description',
        header: () => (
          <RecordTable.InlineHead icon={IconWriting} label="Description" />
        ),
        cell: ({ cell }) => <EditableDescriptionCell row={cell.row.original} />,
        size: 420,
      },
      {
        id: 'createdAt',
        accessorKey: 'createdAt',
        header: () => <RecordTable.InlineHead label="Created At" />,
        cell: ({ cell }) => {
          const row = cell.row.original;

          if (row.rowType === 'draft') {
            return (
              <RecordTableInlineCell className="text-muted-foreground">
                —
              </RecordTableInlineCell>
            );
          }

          return (
            <RelativeDateDisplay value={row.createdAt || ''} asChild>
              <RecordTableInlineCell className="text-sm text-muted-foreground">
                {formatDate(row.createdAt)}
              </RecordTableInlineCell>
            </RelativeDateDisplay>
          );
        },
        size: 140,
      },
    ],
    [openDraft, tagGroups],
  );
};
