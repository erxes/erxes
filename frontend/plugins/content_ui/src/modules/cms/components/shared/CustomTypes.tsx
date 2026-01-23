import { Button } from 'erxes-ui';
import {
  IconPlus,
  IconSettings,
  IconLayout,
  IconEdit,
  IconTrash,
  IconEye,
  IconDots,
} from '@tabler/icons-react';
import { useState } from 'react';
import { CmsLayout } from './CmsLayout';
import { EmptyState } from './EmptyState';
import {
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
import { useConfirm } from 'erxes-ui/hooks/use-confirm';
import { useParams } from 'react-router-dom';
import { CustomTypeDrawer } from '../customTypes/CustomTypeDrawer';
import { useQuery, useMutation } from '@apollo/client';
import {
  CMS_CUSTOM_POST_TYPES,
  CMS_CUSTOM_POST_TYPE_EDIT,
  CMS_CUSTOM_POST_TYPE_REMOVE,
} from '../../graphql/queries';

export function CustomTypes() {
  const { confirm } = useConfirm();
  const { websiteId } = useParams();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingType, setEditingType] = useState<any>(null);

  const { data, loading, refetch } = useQuery(CMS_CUSTOM_POST_TYPES, {
    variables: { clientPortalId: websiteId },
    skip: !websiteId,
  });

  const [editType] = useMutation(CMS_CUSTOM_POST_TYPE_EDIT, {
    onCompleted: () => {
      toast({ title: 'Success', description: 'Custom type updated!' });
      refetch();
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const [removeType] = useMutation(CMS_CUSTOM_POST_TYPE_REMOVE, {
    onCompleted: () => {
      toast({ title: 'Success', description: 'Custom type deleted!' });
      refetch();
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const types = data?.cmsCustomPostTypes || [];

  const checkboxColumn = RecordTable.checkboxColumn as ColumnDef<any>;

  const columns: ColumnDef<any>[] = [
    checkboxColumn,
    {
      id: 'name',
      header: () => (
        <RecordTable.InlineHead icon={IconLayout} label="Type Name" />
      ),
      accessorKey: 'label',
      cell: ({ cell }) => {
        const original = cell.row.original as any;
        const [open, setOpen] = useState(false);
        const [_name, setName] = useState<string>(cell.getValue() as string);

        const onSave = async () => {
          if ((_name || '') !== (original.label || '')) {
            editType({
              variables: {
                _id: original._id,
                input: {
                  label: _name,
                  pluralLabel: original.pluralLabel,
                  code: original.code,
                  description: original.description,
                  clientPortalId: websiteId,
                },
              },
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
      id: 'description',
      header: () => (
        <RecordTable.InlineHead icon={IconLayout} label="Description" />
      ),
      accessorKey: 'description',
      cell: ({ cell }) => (
        <div className="text-sm text-gray-500 pl-2">
          {(cell.getValue() as string) || ''}
        </div>
      ),
      size: 360,
    },

    {
      id: 'createdAt',
      header: () => (
        <RecordTable.InlineHead icon={IconLayout} label="Created Date" />
      ),
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
      size: 200,
    },
    {
      id: 'actions',
      header: () => <RecordTable.InlineHead label="Actions" icon={IconDots} />,
      cell: ({ row }) => {
        const onRemove = () => {
          confirm({
            message: 'Are you sure you want to delete this type?',
          }).then(async () => {
            removeType({ variables: { _id: row.original._id } });
          });
        };
        const onEdit = () => {
          setEditingType(row.original);
          setIsDrawerOpen(true);
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
      size: 120,
    },
  ];

  const headerActions = (
    <>
      <Button
        onClick={() => {
          setIsDrawerOpen(true);
        }}
      >
        <IconPlus className="mr-2 h-4 w-4" />
        Add Custom Type
      </Button>
    </>
  );

  return (
    <>
      <CmsLayout headerActions={headerActions}>
        <div className="flex justify-between items-center mb-6">
          <div className="text-sm text-gray-600">
            {loading ? 'Loading...' : `Found ${types.length} custom types`}
          </div>
        </div>

        {!loading && types.length === 0 ? (
          <div className="bg-white rounded-lg  overflow-hidden">
            <div className="p-12">
              <EmptyState
                icon={IconLayout}
                title="No custom types yet"
                description="Create custom post types to organize your content. Custom types help you structure different kinds of content like products, events, or portfolios."
                actionLabel="Add Custom Type"
                onAction={() => setIsDrawerOpen(true)}
              />
            </div>
          </div>
        ) : (
          <div className="h-full rounded-lg shadow-sm border overflow-hidden">
            <RecordTable.Provider
              columns={columns}
              data={types || []}
              className="h-full m-0"
              stickyColumns={['checkbox', 'name']}
            >
              <RecordTable>
                <RecordTable.Header />
                <RecordTable.Body>
                  <RecordTable.RowList />
                </RecordTable.Body>
              </RecordTable>

              <TypesCommandBar
                onBulkDelete={async (ids: string[]) => {
                  for (const id of ids) {
                    await removeType({ variables: { _id: id } });
                  }
                }}
              />
            </RecordTable.Provider>
          </div>
        )}
      </CmsLayout>

      <CustomTypeDrawer
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setEditingType(null);
        }}
        clientPortalId={websiteId || ''}
        customType={editingType}
        onCreate={() => {
          refetch();
        }}
        onUpdate={() => {
          refetch();
          setEditingType(null);
        }}
      />
    </>
  );
}

const TypesCommandBar = ({
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
              message: `Are you sure you want to delete the ${selectedIds.length} selected types?`,
            }).then(async () => {
              try {
                await onBulkDelete(selectedIds);
                selectedRows.forEach((row: any) => row.toggleSelected(false));
                toast({ title: 'Success', variant: 'default' });
              } catch (e: any) {
                toast({
                  title: 'Error',
                  description: e?.message || 'Failed to delete types',
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
