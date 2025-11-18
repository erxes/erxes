import { Button } from 'erxes-ui';
import {
  IconPlus,
  IconSettings,
  IconLayout,
  IconEdit,
  IconTrash,
  IconEye,
} from '@tabler/icons-react';
import { useState } from 'react';
import { CmsLayout } from './CmsLayout';
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

const fakeCustomTypes = [
  {
    _id: '1',
    name: 'Product',
    description: 'Product information and details',
    fields: 8,
    postsCount: 45,
    createdAt: '2024-01-15T10:30:00Z',
    status: 'active',
  },
  {
    _id: '2',
    name: 'Event',
    description: 'Event information and scheduling',
    fields: 12,
    postsCount: 23,
    createdAt: '2024-01-14T14:20:00Z',
    status: 'active',
  },
  {
    _id: '3',
    name: 'Portfolio',
    description: 'Portfolio and project showcase',
    fields: 6,
    postsCount: 18,
    createdAt: '2024-01-13T09:15:00Z',
    status: 'active',
  },
  {
    _id: '4',
    name: 'Testimonial',
    description: 'Customer testimonials and reviews',
    fields: 5,
    postsCount: 32,
    createdAt: '2024-01-12T11:30:00Z',
    status: 'active',
  },
  {
    _id: '5',
    name: 'FAQ',
    description: 'Frequently asked questions',
    fields: 3,
    postsCount: 15,
    createdAt: '2024-01-11T16:00:00Z',
    status: 'draft',
  },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800';
    case 'draft':
      return 'bg-yellow-100 text-yellow-800';
    case 'archived':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export function CustomTypes() {
  const [types, setTypes] = useState(fakeCustomTypes);
  const { confirm } = useConfirm();
  const { websiteId } = useParams();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const checkboxColumn = RecordTable.checkboxColumn as ColumnDef<any>;

  const columns: ColumnDef<any>[] = [
    {
      id: 'more',
      header: () => <span className="sr-only">More</span>,
      cell: ({ row }) => {
        const onRemove = () => {
          confirm({
            message: 'Are you sure you want to delete this type?',
          }).then(async () => {
            setTypes((prev) => prev.filter((t) => t._id !== row.original._id));
          });
        };
        const onView = () => {};
        const onEdit = () => {};
        return (
          <Popover>
            <Popover.Trigger asChild>
              <RecordTable.MoreButton className="w-full h-full" />
            </Popover.Trigger>
            <Combobox.Content>
              <Command shouldFilter={false}>
                <Command.List>
                  <Command.Item value="view" onSelect={onView}>
                    <IconEye /> View
                  </Command.Item>
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
      header: () => (
        <RecordTable.InlineHead icon={IconLayout} label="Type Name" />
      ),
      accessorKey: 'name',
      cell: ({ cell }) => {
        const original = cell.row.original as any;
        const [open, setOpen] = useState(false);
        const [_name, setName] = useState<string>(cell.getValue() as string);

        const onSave = async () => {
          if ((_name || '') !== (original.name || '')) {
            setTypes((prev) =>
              prev.map((t) =>
                t._id === original._id ? { ...t, name: _name } : t,
              ),
            );
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
        <div className="text-sm text-gray-500">
          {(cell.getValue() as string) || ''}
        </div>
      ),
      size: 360,
    },
    {
      id: 'fields',
      header: () => <RecordTable.InlineHead icon={IconLayout} label="Fields" />,
      accessorKey: 'fields',
      cell: ({ cell }) => (
        <div className="mx-2 my-1 p-1 inline-flex items-center rounded-sm px-2 whitespace-nowrap font-medium w-fit h-6 text-xs border gap-1 bg-accent">
          <span className="text-sm text-gray-700">
            {cell.getValue() as number}
          </span>
        </div>
      ),
      size: 120,
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
          Found {types.length} custom types
          <span className="ml-2 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
            Sample Data
          </span>
        </div>
      </div>

      <div className="bg-white h-full rounded-lg shadow-sm border overflow-hidden">
        <RecordTable.Provider
          columns={columns}
          data={types || []}
          className="h-full m-0"
          stickyColumns={['more', 'checkbox', 'name']}
        >
          <RecordTable>
            <RecordTable.Header />
            <RecordTable.Body>
              <RecordTable.RowList />
            </RecordTable.Body>
          </RecordTable>

          <TypesCommandBar
            onBulkDelete={async (ids: string[]) => {
              setTypes((prev) => prev.filter((t) => !ids.includes(t._id)));
            }}
          />
        </RecordTable.Provider>
      </div>
    </CmsLayout>

    <CustomTypeDrawer
      isOpen={isDrawerOpen}
      onClose={() => setIsDrawerOpen(false)}
      clientPortalId={websiteId || ''}
      onCreate={(data) => {
        const now = new Date().toISOString();
        setTypes((prev) => [
          {
            _id: `${Date.now()}`,
            name: data.label,
            description: data.description || '',
            fields: 0,
            postsCount: 0,
            createdAt: now,
            status: 'active',
          },
          ...prev,
        ]);
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
