import {
  Button,
  RecordTable,
  Popover,
  Combobox,
  Command,
  CommandBar,
  Separator,
  toast,
  Spinner,
} from 'erxes-ui';
import { ColumnDef } from '@tanstack/react-table';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useApolloClient } from '@apollo/client';
import {
  CMS_CATEGORIES,
  CMS_CATEGORIES_EDIT,
  CMS_CATEGORIES_REMOVE,
  CMS_CATEGORIES_ADD,
} from '../../graphql/queries';
import { CmsLayout } from '../shared/CmsLayout';
import { EmptyState } from '../shared/EmptyState';
import {
  IconPlus,
  IconSettings,
  IconEdit,
  IconTrash,
  IconEye,
} from '@tabler/icons-react';
import { useState } from 'react';
import { CmsCategoryDrawer } from './CmsCategoryDrawer';
import { useConfirm } from 'erxes-ui/hooks/use-confirm';

export function Category() {
  const { websiteId } = useParams();
  const client = useApolloClient();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<any | undefined>(
    undefined,
  );
  const { confirm } = useConfirm();

  const [addCategory] = useMutation(CMS_CATEGORIES_ADD);

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
          setSelectedCategory(undefined);
          setDrawerOpen(true);
        }}
      >
        <IconPlus className="mr-2 h-4 w-4" />
        Add Category
      </Button>
    </>
  );

  const { data, loading, error, refetch } = useQuery(CMS_CATEGORIES, {
    variables: {
      clientPortalId: websiteId || '',
      limit: 50,
      cursor: undefined,
      direction: undefined,
    },
    fetchPolicy: 'cache-and-network',
  });

  const [editCategory] = useMutation(CMS_CATEGORIES_EDIT, {
    onCompleted: () => refetch(),
  });

  const [removeCategory] = useMutation(CMS_CATEGORIES_REMOVE, {
    onCompleted: (data, clientOptions) => {
      const existingCategories = client.readQuery({
        query: CMS_CATEGORIES,
        variables: { clientPortalId: websiteId || '', limit: 100 },
      });

      if (existingCategories && clientOptions?.variables?.id) {
        const updatedList = existingCategories.cmsCategories.list.filter(
          (cat: any) => cat._id !== (clientOptions.variables as any).id,
        );

        client.writeQuery({
          query: CMS_CATEGORIES,
          variables: { clientPortalId: websiteId || '', limit: 100 },
          data: {
            ...existingCategories,
            cmsCategories: {
              ...existingCategories.cmsCategories,
              list: updatedList,
            },
          },
        });
      }

      refetch();
    },
  });

  const categories = data?.cmsCategories?.list || [];

  const checkboxColumn = RecordTable.checkboxColumn as ColumnDef<any>;

  const columns: ColumnDef<any>[] = [
    {
      id: 'more',
      header: () => <span className="sr-only">More</span>,
      cell: ({ row }) => {
        const onEdit = () => {
          setSelectedCategory(row.original);
          setDrawerOpen(true);
        };
        const onRemove = async () => {
          await confirm({ message: 'Delete this category?' });
          await removeCategory({ variables: { id: row.original._id } });
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
      header: () => <RecordTable.InlineHead label="Name" icon={IconEdit} />,
      accessorKey: 'name',
      cell: ({ cell }) => {
        const name = cell.getValue() as string;
        return (
          <div className="mx-2 my-1 p-1 inline-flex items-center rounded-sm px-2 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 whitespace-nowrap font-medium w-fit h-6 text-xs border gap-1 bg-accent">
            <span className="text-sm">{name}</span>
          </div>
        );
      },
      size: 280,
    },
    {
      id: 'description',
      header: () => (
        <RecordTable.InlineHead label="Description" icon={IconEye} />
      ),
      accessorKey: 'description',
      cell: ({ cell }) => (
        <div className="mx-2 my-1 p-1 inline-flex items-center rounded-sm px-2 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 whitespace-nowrap font-medium w-fit h-6 text-xs border gap-1 bg-accent">
          <span className="text-sm ">{(cell.getValue() as string) || ''}</span>
        </div>
      ),
      size: 320,
    },
    {
      id: 'parent',
      header: () => <RecordTable.InlineHead label="Parent" icon={IconEdit} />,
      accessorKey: 'parent',
      cell: ({ row }) => {
        const getParentName = (parent: any): string => {
          if (!parent) return '—';
          // If there's a parent with a name, return it
          if (parent.name) return parent.name;
          // If there's a nested parent, recursively get its name
          if (parent.parent) return getParentName(parent.parent);
          return '—';
        };

        const parentName = getParentName(row.original.parent);

        return <span className="text-sm text-gray-500">{parentName}</span>;
      },
      size: 220,
    },
    {
      id: 'createdAt',
      header: () => <RecordTable.InlineHead label="Created" icon={IconEye} />,
      accessorKey: 'createdAt',
      cell: ({ cell }) => {
        const value = cell.getValue() as string;
        return (
          <div className="mx-2 my-1 p-1 inline-flex items-center rounded-sm px-2 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 whitespace-nowrap font-medium w-fit h-6 text-xs border gap-1 bg-accent">
            <span className="text-sm">
              {value
                ? new Date(value).toLocaleDateString('en-US', {
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

  return (
    <CmsLayout headerActions={headerActions}>
      {loading && (
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500 text-center items-center flex gap-2">
            <Spinner size="md" className="ml-2" />
            Loading categories...
          </div>
        </div>
      )}
      {error && (
        <div className="flex justify-center items-center h-64">
          <div className="text-red-500">
            Error loading categories: {error.message}
          </div>
        </div>
      )}
      {!loading && !error && (
        <>
          <div className="flex justify-between items-center mb-6">
            <div className="text-sm text-gray-600">
              Found {categories.length} categories
            </div>
          </div>

          {categories.length === 0 ? (
            <div className="bg-white rounded-lg overflow-hidden">
              <EmptyState
                icon={IconEdit}
                title="No categories yet"
                description="Get started by creating your first category."
                actionLabel="Add category"
                onAction={() => {
                  setSelectedCategory(undefined);
                  setDrawerOpen(true);
                }}
              />
            </div>
          ) : (
            <div className="h-full rounded-lg shadow-sm border overflow-hidden">
              <RecordTable.Provider
                columns={columns}
                data={categories}
                className="h-full"
                stickyColumns={['more', 'checkbox', 'name']}
              >
                <RecordTable>
                  <RecordTable.Header />
                  <RecordTable.Body>
                    <RecordTable.RowList />
                  </RecordTable.Body>
                </RecordTable>
                <CategoriesCommandBar
                  onBulkDelete={async (ids: string[]) => {
                    for (const id of ids) {
                      await removeCategory({ variables: { id } });
                    }
                  }}
                />
              </RecordTable.Provider>
            </div>
          )}
        </>
      )}
      <CmsCategoryDrawer
        category={selectedCategory}
        isOpen={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setSelectedCategory(undefined);
        }}
        clientPortalId={websiteId || ''}
        onRefetch={() => {
          refetch();
        }}
      />
    </CmsLayout>
  );
}

const CategoriesCommandBar = ({
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
              message: `Are you sure you want to delete the ${selectedIds.length} selected categories?`,
            }).then(async () => {
              try {
                await onBulkDelete(selectedIds);
                selectedRows.forEach((row: any) => row.toggleSelected(false));
                toast({ title: 'Success', variant: 'default' });
              } catch (e: any) {
                toast({
                  title: 'Error',
                  description: e?.message || 'Failed to delete categories',
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
