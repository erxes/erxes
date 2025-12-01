import { Button, RecordTable, CommandBar, Separator, toast, Popover, Combobox, Command, Input, RecordTableInlineCell } from 'erxes-ui';
import {
  IconPlus,
  IconSettings,
  IconEdit,
  IconTrash,
  IconEye,
  IconUser,
  IconArticle,
  IconCalendar,
} from '@tabler/icons-react';
import { useState } from 'react';
import { CmsLayout } from '../shared/CmsLayout';
import { EmptyState } from '../shared/EmptyState';
import { useMutation, useQuery } from '@apollo/client';
import { useParams } from 'react-router-dom';
import { PAGE_LIST, PAGES_EDIT, PAGES_REMOVE } from '../../graphql/queries';
import { PageDrawer } from './PageDrawer';
import { ColumnDef } from '@tanstack/react-table';
import { useConfirm } from 'erxes-ui/hooks/use-confirm';

export function Page() {
  const { websiteId } = useParams();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedPage, setSelectedPage] = useState<any | undefined>(undefined);
  const { data, loading } = useQuery(PAGE_LIST, {
    variables: { clientPortalId: websiteId || '', limit: 20 },
    skip: !websiteId,
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'cache-first',
  });
  const pages = data?.cmsPageList?.pages || [];
  const totalCount = data?.cmsPageList?.totalCount || 0;

  const [removePage] = useMutation(PAGES_REMOVE, {
    refetchQueries: [
      {
        query: PAGE_LIST,
        variables: { clientPortalId: websiteId || '', limit: 20 },
      },
    ],
  });
  const [editPage] = useMutation(PAGES_EDIT, {
    refetchQueries: [
      {
        query: PAGE_LIST,
        variables: { clientPortalId: websiteId || '', limit: 20 },
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
          setSelectedPage(row.original);
          setIsDrawerOpen(true);
        };
        const onRemove = () => {
          confirm({ message: 'Are you sure you want to delete this page?' }).then(async () => {
            await removePage({ variables: { id: row.original._id } });
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
      header: () => <RecordTable.InlineHead icon={IconUser} label="Name" />,
      accessorKey: 'name',
      cell: ({ cell }) => {
        const original = cell.row.original as any;
        const [open, setOpen] = useState(false);
        const [_name, setName] = useState<string>(cell.getValue() as string);

        const onSave = async () => {
          if ((_name || '') !== (original.name || '')) {
            await editPage({ variables: { _id: original._id, input: { name: _name } } });
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
              <Input value={_name} onChange={(e) => setName(e.currentTarget.value)} />
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
        <div className="mx-2 my-1 p-1 inline-flex items-center rounded-sm px-2 whitespace-nowrap font-medium w-fit h-6 text-xs border gap-1 bg-accent">
          <span className="text-sm text-gray-500">{(cell.getValue() as string) || ''}</span>
        </div>
      ),
      size: 260,
    },
    {
      id: 'author',
      header: () => <RecordTable.InlineHead icon={IconUser} label="Author" />,
      accessorKey: 'createdUser',
      cell: ({ cell }) => {
        const createdUser = cell.getValue() as any;
        const name = createdUser?.details?.fullName || createdUser?.email || '—';
        return (
          <div className="mx-2 my-1 p-1 inline-flex items-center rounded-sm px-2 whitespace-nowrap font-medium w-fit h-6 text-xs border gap-1 bg-accent">
            <span className="text-sm text-gray-700">{name}</span>
          </div>
        );
      },
      size: 240,
    },
    {
      id: 'createdAt',
      header: () => <RecordTable.InlineHead icon={IconCalendar} label="Created" />,
      accessorKey: 'createdAt',
      cell: ({ cell }) => {
        const createdAt = cell.getValue() as string;
        return (
          <div className="mx-2 my-1 p-1 inline-flex items-center rounded-sm px-2 whitespace-nowrap font-medium w-fit h-6 text-xs border gap-1 bg-accent">
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
    {
      id: 'updatedAt',
      header: () => <RecordTable.InlineHead icon={IconCalendar} label="Updated" />,
      accessorKey: 'updatedAt',
      cell: ({ cell }) => {
        const updatedAt = cell.getValue() as string;
        return (
          <div className="mx-2 my-1 p-1 inline-flex items-center rounded-sm px-2 whitespace-nowrap font-medium w-fit h-6 text-xs border gap-1 bg-accent">
            <span className="text-sm text-gray-500">
              {updatedAt
                ? new Date(updatedAt).toLocaleDateString('en-US', {
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
      <Button onClick={() => setIsDrawerOpen(true)}>
        <IconPlus className="mr-2 h-4 w-4" />
        Add Page
      </Button>
    </>
  );

  if (loading) {
    return (
      <CmsLayout headerActions={headerActions}>
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">Loading pages...</div>
        </div>
      </CmsLayout>
    );
  }

  return (
    <>
      <CmsLayout headerActions={headerActions}>
        <div className="flex justify-between items-center mb-6">
          <div className="text-sm text-gray-600">Found {totalCount} pages</div>
        </div>
        {(!pages || pages.length === 0) ? (
          <div className="bg-white rounded-lg overflow-hidden">
            <EmptyState
              icon={IconArticle}
              title="No pages yet"
              description="Get started by creating your first page."
              actionLabel="Add page"
              onAction={() => setIsDrawerOpen(true)}
            />
          </div>
        ) : (
          <div className="bg-white h-full rounded-lg shadow-sm border overflow-hidden">
            <RecordTable.Provider
              columns={columns}
              data={pages || []}
              className="h-full m-0"
              stickyColumns={[ 'more', 'checkbox', 'name' ]}
            >
              <RecordTable>
                <RecordTable.Header />
                <RecordTable.Body>
                  <RecordTable.RowList />
                </RecordTable.Body>
              </RecordTable>

              <PagesCommandBar
                onBulkDelete={async (ids: string[]) => {
                  for (const id of ids) {
                    await removePage({ variables: { id } });
                  }
                }}
              />
            </RecordTable.Provider>
          </div>
        )}
      </CmsLayout>

      <PageDrawer
        page={selectedPage}
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setSelectedPage(undefined);
        }}
        clientPortalId={websiteId || ''}
      />
    </>
  );
}

const PagesCommandBar = ({ onBulkDelete }: { onBulkDelete: (ids: string[]) => Promise<void> | void }) => {
  const { table } = RecordTable.useRecordTable();
  const { confirm } = useConfirm();
  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const selectedIds = selectedRows.map((row: any) => row.original._id as string);

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
              message: `Are you sure you want to delete the ${selectedIds.length} selected pages?`,
            }).then(async () => {
              try {
                await onBulkDelete(selectedIds);
                selectedRows.forEach((row: any) => row.toggleSelected(false));
                toast({ title: 'Success', variant: 'default' });
              } catch (e: any) {
                toast({ title: 'Error', description: e?.message || 'Failed to delete pages', variant: 'destructive' });
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
