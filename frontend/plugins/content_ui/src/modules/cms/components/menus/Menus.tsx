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
  Spinner,
} from 'erxes-ui';
import {
  IconPlus,
  IconSettings,
  IconArticle,
  IconLink,
  IconList,
  IconSortAscending,
  IconExternalLink,
  IconEdit,
  IconTrash,
  IconCheck,
  IconLayoutGrid,
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
import { buildFlatTree, getDepthPrefix } from './menuUtils';
import { useMutation } from '@apollo/client';
import { useConfirm } from 'erxes-ui/hooks/use-confirm';

export function Menus() {
  const { websiteId } = useParams();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState<any>(null);
  const [kindFilter, setKindFilter] = useState<string>('header');

  const { data, loading, error, refetch } = useQuery(CMS_MENU_LIST, {
    variables: { clientPortalId: websiteId || '', limit: 50, kind: kindFilter },
    skip: !websiteId,
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'cache-first',
  });

  const menus = buildFlatTree(data?.cmsMenuList || []);
  const totalCount = menus.length;

  const [removeMenu] = useMutation(CMS_MENU_REMOVE);
  const [editMenu] = useMutation(CMS_MENU_EDIT);

  const checkboxColumn = RecordTable.checkboxColumn as ColumnDef<any>;

  const columns: ColumnDef<any>[] = [
    {
      id: 'more',
      header: () => <span className="sr-only">More</span>,
      cell: ({ row }) => {
        const { confirm } = useConfirm();
        const onEdit = () => {
          setEditingMenu(row.original);
          setIsDrawerOpen(true);
        };
        const onRemove = () => {
          confirm({
            message: 'Are you sure you want to delete this menu?',
          }).then(async () => {
            await removeMenu({ variables: { _id: row.original._id } });
            refetch();
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
                    <IconTrash /> Remove
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
            refetch();
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
              <span>
                {getDepthPrefix(original.depth) + (cell.getValue() as string)}
              </span>
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
        <div className="mx-2 my-1 p-1 inline-flex items-center rounded-sm px-2 whitespace-nowrap font-medium w-fit h-6 text-xs border gap-1 bg-accent">
          <span className="text-sm text-gray-500">
            {(cell.getValue() as string) || ''}
          </span>
        </div>
      ),
      size: 140,
    },
  ];

  const headerActions = (
    <>
      <Button
        onClick={() => {
          setEditingMenu(null);
          setIsDrawerOpen(true);
        }}
      >
        <IconPlus className="mr-2 h-4 w-4" />
        Add Menu
      </Button>
    </>
  );

  if (loading) {
    return (
      <CmsLayout headerActions={headerActions}>
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500 text-center items-center flex gap-2">
            <Spinner size="md" className="ml-2" />
            Loading menus...
          </div>
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
      <div className="border rounded-lg mb-4">
        <div className="p-2 flex items-center gap-3 flex-wrap">
          <Popover>
            <Popover.Trigger asChild>
              <Button variant="outline" size="sm">
                <IconLayoutGrid className="mr-2 h-4 w-4" />
                Kind: {kindFilter.charAt(0).toUpperCase() + kindFilter.slice(1)}
              </Button>
            </Popover.Trigger>
            <Popover.Content className="w-44 p-2">
              <Command shouldFilter={false}>
                <Command.List>
                  <Command.Item
                    value="header"
                    onSelect={() => setKindFilter('header')}
                  >
                    Header
                    {kindFilter === 'header' && (
                      <IconCheck className="ml-auto h-4 w-4" />
                    )}
                  </Command.Item>
                  <Command.Item
                    value="footer"
                    onSelect={() => setKindFilter('footer')}
                  >
                    Footer
                    {kindFilter === 'footer' && (
                      <IconCheck className="ml-auto h-4 w-4" />
                    )}
                  </Command.Item>
                </Command.List>
              </Command>
            </Popover.Content>
          </Popover>

          <div className="text-sm text-gray-600 ml-auto">
            Found {totalCount} menus
          </div>
        </div>
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
                refetch();
              }}
            />
          </RecordTable.Provider>
        </div>
      )}

      <MenuDrawer
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setEditingMenu(null);
        }}
        onSuccess={refetch}
        clientPortalId={websiteId || ''}
        menu={editingMenu}
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
