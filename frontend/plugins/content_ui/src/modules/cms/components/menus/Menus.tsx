import { useQuery } from '@apollo/client';
import { ColumnDef } from '@tanstack/react-table';
import {
  Button,
  RecordTable,
  Popover,
  Combobox,
  Command,
  Input,
  RecordTableInlineCell,
  toast,
  CommandBar,
  Separator,
} from 'erxes-ui';
import {
  IconPlus,
  IconSettings,
  IconArticle,
  IconLink,
  IconList,
  IconSortAscending,
  IconExternalLink,
} from '@tabler/icons-react';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { CmsLayout } from '../shared/CmsLayout';
import { EmptyState } from '../shared/EmptyState';
import {
  CMS_MENU_LIST,
  CMS_MENU_REMOVE,
  CMS_MENU_EDIT,
} from '../../graphql/queries';
import { MenuDrawer } from './MenuDrawer';
import { useMutation } from '@apollo/client';
import { useConfirm } from 'erxes-ui/hooks/use-confirm';

export function Menus() {
  const { websiteId } = useParams();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const { data, loading, error } = useQuery(CMS_MENU_LIST, {
    variables: { clientPortalId: websiteId || '', limit: 50 },
    skip: !websiteId,
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'cache-first',
  });

  const menus = data?.cmsMenuList || [];
  const totalCount = menus.length;

  const [removeMenu] = useMutation(CMS_MENU_REMOVE, {
    refetchQueries: [
      {
        query: CMS_MENU_LIST,
        variables: { clientPortalId: websiteId || '', limit: 50 },
      },
    ],
  });
  const [editMenu] = useMutation(CMS_MENU_EDIT, {
    refetchQueries: [
      {
        query: CMS_MENU_LIST,
        variables: { clientPortalId: websiteId || '', limit: 50 },
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
        const onRemove = () => {
          confirm({
            message: 'Are you sure you want to delete this menu?',
          }).then(async () => {
            await removeMenu({ variables: { _id: row.original._id } });
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
                  {/* Placeholder for opening edit drawer later */}
                  <Command.Item value="remove" onSelect={onRemove}>
                    Remove
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
      id: 'label',
      header: () => <RecordTable.InlineHead icon={IconList} label="Label" />,
      accessorKey: 'label',
      cell: ({ cell }) => {
        const original = cell.row.original as any;
        const [open, setOpen] = useState(false);
        const [_label, setLabel] = useState<string>(cell.getValue() as string);

        const onSave = async () => {
          if ((_label || '') !== (original.label || '')) {
            await editMenu({
              variables: { _id: original._id, input: { label: _label } },
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
                value={_label}
                onChange={(e) => setLabel(e.currentTarget.value)}
              />
            </RecordTableInlineCell.Content>
          </Popover>
        );
      },
      size: 280,
    },
    {
      id: 'url',
      header: () => <RecordTable.InlineHead icon={IconLink} label="URL" />,
      accessorKey: 'url',
      cell: ({ cell }) => (
        <div className="mx-2 my-1 p-1 inline-flex items-center rounded-sm px-2 whitespace-nowrap font-medium w-fit h-6 text-xs border gap-1 bg-accent">
          <span className="text-sm text-gray-500">
            {(cell.getValue() as string) || ''}
          </span>
        </div>
      ),
      size: 260,
    },
    {
      id: 'kind',
      header: () => <RecordTable.InlineHead icon={IconArticle} label="Kind" />,
      accessorKey: 'kind',
      cell: ({ cell }) => (
        <span className="text-sm text-gray-700">
          {(cell.getValue() as string) || ''}
        </span>
      ),
      size: 140,
    },
  ];

  const headerActions = (
    <>
      <Button onClick={() => setIsDrawerOpen(true)}>
        <IconPlus className="mr-2 h-4 w-4" />
        Add Menu
      </Button>
    </>
  );

  if (loading) {
    return (
      <CmsLayout headerActions={headerActions}>
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">Loading menus...</div>
        </div>
      </CmsLayout>
    );
  }

  if (error) {
    return (
      <CmsLayout headerActions={headerActions}>
        <div className="flex justify-center items-center h-64">
          <div className="text-red-500">
            Error loading menus: {error.message}
          </div>
        </div>
      </CmsLayout>
    );
  }

  return (
    <CmsLayout headerActions={headerActions}>
      <div className="flex justify-between items-center mb-6">
        <div className="text-sm text-gray-600">Found {totalCount} menus</div>
      </div>

      {!menus || menus.length === 0 ? (
        <div className="bg-white rounded-lg overflow-hidden">
          <EmptyState
            icon={IconArticle}
            title="No menus yet"
            description="Get started by creating your first menu."
            actionLabel="Add menu"
            onAction={() => setIsDrawerOpen(true)}
          />
        </div>
      ) : (
        <div className="h-full rounded-lg shadow-sm border overflow-hidden">
          <RecordTable.Provider
            columns={columns}
            data={menus || []}
            className="h-full m-0"
            stickyColumns={['more', 'checkbox', 'label']}
          >
            <RecordTable>
              <RecordTable.Header />
              <RecordTable.Body>
                <RecordTable.RowList />
              </RecordTable.Body>
            </RecordTable>

            <MenusCommandBar
              onBulkDelete={async (ids: string[]) => {
                for (const id of ids) {
                  await removeMenu({ variables: { _id: id } });
                }
              }}
            />
          </RecordTable.Provider>
        </div>
      )}

      <MenuDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        clientPortalId={websiteId || ''}
      />
    </CmsLayout>
  );
}

const MenusCommandBar = ({
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
              message: `Are you sure you want to delete the ${selectedIds.length} selected menus?`,
            }).then(async () => {
              try {
                await onBulkDelete(selectedIds);
                selectedRows.forEach((row: any) => row.toggleSelected(false));
                toast({ title: 'Success', variant: 'default' });
              } catch (e: any) {
                toast({
                  title: 'Error',
                  description: e?.message || 'Failed to delete menus',
                  variant: 'destructive',
                });
              }
            })
          }
        >
          Delete
        </Button>
      </CommandBar.Bar>
    </CommandBar>
  );
};
