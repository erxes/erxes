import {
  Button,
  RecordTable,
  CommandBar,
  Separator,
  toast,
  Popover,
  Combobox,
  Command,
  Input,
  RecordTableInlineCell,
} from 'erxes-ui';
import { ColumnDef } from '@tanstack/react-table';
import { useMutation } from '@apollo/client';
import {
  IconPlus,
  IconSettings,
  IconEdit,
  IconTrash,
  IconEye,
  IconTag,
  IconArticle,
  IconCalendar,
} from '@tabler/icons-react';
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { CmsLayout } from './CmsLayout';
import { EmptyState } from './EmptyState';
import { useTags } from '../../hooks/useTags';
import { TagDrawer } from '../tags/TagDrawer';
import {
  CMS_TAGS,
  CMS_TAGS_EDIT,
  CMS_TAGS_REMOVE,
} from '../../graphql/queries';
import { useConfirm } from 'erxes-ui/hooks/use-confirm';

export function Tag() {
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [isTagDrawerOpen, setIsTagDrawerOpen] = useState(false);
  const [selectedTag, setSelectedTag] = useState<any | undefined>(undefined);
  const { websiteId } = useParams();
  const { confirm } = useConfirm();

  console.log('Tag component rendered, isTagDrawerOpen:', isTagDrawerOpen);

  useEffect(() => {
    console.log('isTagDrawerOpen changed to:', isTagDrawerOpen);
  }, [isTagDrawerOpen]);

  const { tags, loading, error } = useTags({
    clientPortalId: websiteId || '',
    limit: 20,
  });

  const [removeTag] = useMutation(CMS_TAGS_REMOVE, {
    refetchQueries: [
      {
        query: CMS_TAGS,
        variables: {
          clientPortalId: websiteId || '',
          limit: 20,
        },
      },
    ],
  });
  const [editTag] = useMutation(CMS_TAGS_EDIT, {
    refetchQueries: [
      {
        query: CMS_TAGS,
        variables: {
          clientPortalId: websiteId || '',
          limit: 20,
        },
      },
    ],
  });

  const checkboxColumn = RecordTable.checkboxColumn as ColumnDef<any>;

  const columns: ColumnDef<any>[] = [
    {
      id: 'more',
      header: () => <span className="sr-only">More</span>,
      cell: ({ row }) => {
        const { confirm } = useConfirm();
        const onEdit = () => {
          setSelectedTag(row.original);
          setIsTagDrawerOpen(true);
        };
        const onRemove = () => {
          confirm({
            message: 'Are you sure you want to delete this tag?',
          }).then(async () => {
            await removeTag({ variables: { id: row.original._id } });
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
                  <Command.Item value="edit" onSelect={onEdit}>
                    <IconEdit /> Edit
                  </Command.Item>
                  <Command.Item value="remove" onSelect={onRemove}>
                    <IconTrash /> Delete
                  </Command.Item>
                </Command.List>
              </Command>
            </Combobox.Content>
          </Popover>
        );
      },
      size: 40,
    },
    checkboxColumn,
    {
      id: 'name',
      header: () => <RecordTable.InlineHead icon={IconTag} label="Name" />,
      accessorKey: 'name',
      cell: ({ cell }) => {
        const original = cell.row.original as any;
        const [open, setOpen] = useState(false);
        const [_name, setName] = useState<string>(cell.getValue() as string);

        const onSave = async () => {
          if ((_name || '') !== (original.name || '')) {
            await editTag({
              variables: { _id: original._id, input: { name: _name } },
            });
          }
        };

        return (
          <Popover
            open={open}
            onOpenChange={(v) => {
              setOpen(v);
              if (!v) onSave();
            }}
          >
            <RecordTableInlineCell.Trigger>
              <span>{cell.getValue() as string}</span>
            </RecordTableInlineCell.Trigger>
            <RecordTableInlineCell.Content>
              <Input
                value={_name}
                onChange={(e) => setName(e.currentTarget.value)}
              />
            </RecordTableInlineCell.Content>
          </Popover>
        );
      },
      size: 280,
    },
    {
      id: 'slug',
      header: () => <RecordTable.InlineHead icon={IconArticle} label="Slug" />,
      accessorKey: 'slug',
      cell: ({ cell }) => (
        <div className="mx-2 my-1 p-1 inline-flex items-center rounded-sm px-2 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 whitespace-nowrap font-medium w-fit h-6 text-xs border gap-1 bg-accent">
          <span className="text-sm text-gray-500">
            {(cell.getValue() as string) || ''}
          </span>
        </div>
      ),
      size: 260,
    },
    {
      id: 'createdAt',
      header: () => (
        <RecordTable.InlineHead icon={IconCalendar} label="Created" />
      ),
      accessorKey: 'createdAt',
      cell: ({ cell }) => {
        const createdAt = cell.getValue() as string;
        return (
          <div className="mx-2 my-1 p-1 inline-flex items-center rounded-sm px-2 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 whitespace-nowrap font-medium w-fit h-6 text-xs border gap-1 bg-accent">
            <span className="text-sm text-gray-500">
              {createdAt
                ? new Date(createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })
                : ''}
            </span>
          </div>
        );
      },
      size: 180,
    },
  ];

  const headerActions = (
    <>
      <Button variant="outline" asChild>
        <a href="/settings/content">
          <IconSettings />
          Go to settings
        </a>
      </Button>
      <Button
        onClick={() => {
          setIsTagDrawerOpen(true);
          console.log(1);
          console.log('TagDrawer isOpen:', isTagDrawerOpen);
        }}
      >
        <IconPlus className="mr-2 h-4 w-4" />
        Add Tag
      </Button>
    </>
  );

  if (loading) {
    return (
      <CmsLayout headerActions={headerActions}>
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">Loading tags...</div>
        </div>
      </CmsLayout>
    );
  }

  if (error) {
    return (
      <CmsLayout headerActions={headerActions}>
        <div className="flex justify-center items-center h-64">
          <div className="text-red-500">
            Error loading tags: {error.message}
          </div>
        </div>
      </CmsLayout>
    );
  }

  return (
    <>
      <CmsLayout headerActions={headerActions}>
        <div className="flex justify-between items-center mb-6">
          <div className="text-sm text-gray-600">Found {tags.length} tags</div>
        </div>
        {tags.length === 0 ? (
          <div className="bg-white rounded-lg overflow-hidden">
            <EmptyState
              icon={IconTag}
              title="No tags yet"
              description="Get started by creating your first tag."
              actionLabel="Add tag"
              onAction={() => setIsTagDrawerOpen(true)}
            />
          </div>
        ) : (
          <div className="bg-white h-full rounded-lg shadow-sm border overflow-hidden">
            <RecordTable.Provider
              columns={columns}
              data={tags || []}
              className="h-full m-0"
              stickyColumns={['more', 'checkbox', 'name']}
            >
              <RecordTable>
                <RecordTable.Header />
                <RecordTable.Body>
                  <RecordTable.RowList />
                </RecordTable.Body>
              </RecordTable>

              <TagsCommandBar
                onBulkDelete={async (ids: string[]) => {
                  for (const id of ids) {
                    await removeTag({ variables: { id } });
                  }
                }}
              />
            </RecordTable.Provider>
          </div>
        )}
      </CmsLayout>

      <TagDrawer
        tag={selectedTag}
        isOpen={isTagDrawerOpen}
        onClose={() => {
          setIsTagDrawerOpen(false);
          setSelectedTag(undefined);
        }}
        clientPortalId={websiteId || ''}
      />
    </>
  );
}

const TagsCommandBar = ({
  onBulkDelete,
}: {
  onBulkDelete: (ids: string[]) => Promise<void> | void;
}) => {
  const { table } = RecordTable.useRecordTable();
  const { confirm } = useConfirm();
  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const selectedIds = selectedRows.map(
    (row: any) => row.original._id as string,
  );

  return (
    <CommandBar open={selectedRows.length > 0}>
      <CommandBar.Bar>
        <CommandBar.Value>{selectedRows.length} selected</CommandBar.Value>
        <Separator.Inline />
        <Button
          variant="secondary"
          className="text-destructive"
          size="sm"
          onClick={() =>
            confirm({
              message: `Are you sure you want to delete the ${selectedIds.length} selected tags?`,
            }).then(async () => {
              try {
                await onBulkDelete(selectedIds);
                selectedRows.forEach((row: any) => row.toggleSelected(false));
                toast({ title: 'Success', variant: 'default' });
              } catch (e: any) {
                toast({
                  title: 'Error',
                  description: e?.message || 'Failed to delete tags',
                  variant: 'destructive',
                });
              }
            })
          }
        >
          <IconTrash className="mr-2 h-4 w-4" /> Delete
        </Button>
      </CommandBar.Bar>
    </CommandBar>
  );
};
