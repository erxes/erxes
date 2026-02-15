import {
  Button,
  RecordTable,
  CommandBar,
  Separator,
  toast,
  Popover,
  Input,
  RecordTableInlineCell,
  Spinner,
} from 'erxes-ui';
import {
  IconPlus,
  IconEdit,
  IconTrash,
  IconUser,
  IconArticle,
  IconCalendar,
  IconDots,
} from '@tabler/icons-react';
import { useState } from 'react';
import { CmsLayout } from '../shared/CmsLayout';
import { EmptyState } from '../shared/EmptyState';
import { useMutation, useQuery } from '@apollo/client';
import { useParams } from 'react-router-dom';
import { PAGE_LIST, PAGES_EDIT, PAGES_REMOVE } from '../graphql/queries';
import { PageDrawer } from './PageDrawer';
import { ColumnDef } from '@tanstack/react-table';
import { useConfirm } from 'erxes-ui/hooks/use-confirm';

const BadgeCell = ({ children }: { children: React.ReactNode }) => (
  <div className="mx-2 my-1 p-1 inline-flex items-center rounded-sm px-2 whitespace-nowrap font-medium w-fit h-6 text-xs border gap-1 bg-accent">
    <span className="text-sm text-gray-500">{children}</span>
  </div>
);

const formatDate = (dateString: string) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export function Page() {
  const { websiteId } = useParams();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedPage, setSelectedPage] = useState<any | undefined>(undefined);
  const [editingCell, setEditingCell] = useState<{
    rowId: string;
    value: string;
  } | null>(null);
  const { confirm } = useConfirm();

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
    checkboxColumn,
    {
      id: 'name',
      header: () => <RecordTable.InlineHead icon={IconUser} label="Name" />,
      accessorKey: 'name',
      cell: ({ cell }) => {
        const original = cell.row.original as any;
        const isOpen = editingCell?.rowId === original._id;
        const currentValue =
          editingCell?.rowId === original._id && editingCell
            ? editingCell.value
            : (cell.getValue() as string);

        const onSave = async () => {
          if (currentValue !== (original.name || '')) {
            await editPage({
              variables: { _id: original._id, input: { name: currentValue } },
            });
          }
          setEditingCell(null);
        };

        return (
          <Popover
            open={isOpen}
            onOpenChange={(v) => {
              if (v) {
                setEditingCell({
                  rowId: original._id,
                  value: cell.getValue() as string,
                });
              } else {
                onSave();
              }
            }}
          >
            <RecordTableInlineCell.Trigger>
              <span>{cell.getValue() as string}</span>
            </RecordTableInlineCell.Trigger>
            <RecordTableInlineCell.Content>
              <Input
                value={currentValue}
                onChange={(e) =>
                  setEditingCell({
                    rowId: original._id,
                    value: e.currentTarget.value,
                  })
                }
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
        <BadgeCell>{(cell.getValue() as string) || ''}</BadgeCell>
      ),
      size: 260,
    },

    {
      id: 'createdAt',
      header: () => (
        <RecordTable.InlineHead icon={IconCalendar} label="Created" />
      ),
      accessorKey: 'createdAt',
      cell: ({ cell }) => (
        <BadgeCell>{formatDate(cell.getValue() as string)}</BadgeCell>
      ),
      size: 180,
    },
    {
      id: 'updatedAt',
      header: () => (
        <RecordTable.InlineHead icon={IconCalendar} label="Updated" />
      ),
      accessorKey: 'updatedAt',
      cell: ({ cell }) => (
        <BadgeCell>{formatDate(cell.getValue() as string)}</BadgeCell>
      ),
      size: 180,
    },
    {
      id: 'actions',
      header: () => <RecordTable.InlineHead label="Actions" icon={IconDots} />,
      cell: ({ row }) => {
        const onEdit = () => {
          setSelectedPage(row.original);
          setIsDrawerOpen(true);
        };
        const onRemove = () => {
          confirm({
            message: 'Are you sure you want to delete this page?',
          }).then(async () => {
            await removePage({ variables: { id: row.original._id } });
          });
        };
        return (
          <div className="flex px-2 items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="inline-flex items-center justify-center gap-2 px-3 whitespace-nowrap rounded text-sm transition-colors outline-offset-2 focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-ring/70 disabled:pointer-events-none disabled:opacity-50 [&>svg]:pointer-events-none [&>svg]:size-4 [&>svg]:shrink-0 font-medium cursor-pointer shadow-sm bg-background shadow-button-outline hover:bg-accent h-7 w-7"
              onClick={onEdit}
            >
              <IconEdit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="inline-flex items-center justify-center gap-2 px-3 whitespace-nowrap rounded text-sm transition-colors outline-offset-2 focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-ring/70 disabled:pointer-events-none disabled:opacity-50 [&>svg]:pointer-events-none [&>svg]:size-4 [&>svg]:shrink-0 font-medium cursor-pointer h-7 w-7 text-destructive bg-destructive/10 hover:bg-destructive/20"
              onClick={onRemove}
            >
              <IconTrash className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  const headerActions = (
    <div>
      <Button onClick={() => setIsDrawerOpen(true)}>
        <IconPlus className="mr-2 h-4 w-4" />
        Add Page
      </Button>
    </div>
  );

  if (loading) {
    return (
      <CmsLayout headerActions={headerActions}>
        <div className="flex w-full h-screen justify-center items-center">
          <div className="text-gray-500">
            <Spinner />
          </div>
        </div>
      </CmsLayout>
    );
  }

  return (
    <CmsLayout headerActions={headerActions}>
      <div className="flex flex-col h-full">
        <div className="flex justify-between items-center mb-6">
          <div className="text-sm text-gray-600">Found {totalCount} pages</div>
        </div>
        {!pages || pages.length === 0 ? (
          <div className="rounded-lg overflow-hidden">
            <EmptyState
              icon={IconArticle}
              title="No pages yet"
              description="Get started by creating your first page."
              actionLabel="Add page"
              onAction={() => setIsDrawerOpen(true)}
            />
          </div>
        ) : (
          <div className="flex-1 rounded-lg shadow-sm border overflow-hidden">
            <RecordTable.Provider
              columns={columns}
              data={pages || []}
              className="h-full m-0"
              stickyColumns={['checkbox', 'name']}
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
      </div>

      <PageDrawer
        page={selectedPage}
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setSelectedPage(undefined);
        }}
        clientPortalId={websiteId || ''}
      />
    </CmsLayout>
  );
}

const PagesCommandBar = ({
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
              message: `Are you sure you want to delete the ${selectedIds.length} selected pages?`,
            }).then(async () => {
              try {
                await onBulkDelete(selectedIds);
                selectedRows.forEach((row: any) => row.toggleSelected(false));
                toast({ title: 'Success', variant: 'default' });
              } catch (e: any) {
                toast({
                  title: 'Error',
                  description: e?.message || 'Failed to delete pages',
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
