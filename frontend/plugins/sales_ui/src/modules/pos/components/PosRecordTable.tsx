import {
  IconAlignLeft,
  IconBuilding,
  IconCalendarPlus,
  IconEdit,
  IconHierarchy,
  IconLabelFilled,
  IconPhoto,
  IconTrash,
  IconUser,
  IconUserCheck,
  IconUserShield,
  IconWifi,
  type Icon,
} from '@tabler/icons-react';
import { CellContext, ColumnDef } from '@tanstack/react-table';
import {
  Avatar,
  Badge,
  Combobox,
  Command,
  Popover,
  readImage,
  RecordTable,
  RecordTableInlineCell,
  RelativeDateDisplay,
  TextOverflowTooltip,
  useConfirm,
  useToast,
} from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PosEmptyState } from '@/pos/components/PosEmptyState';
import { useOpenPosSettings } from '@/pos/hooks/useOpenPosSettings';
import { usePosList } from '@/pos/hooks/usePosList';
import { usePosRemove } from '@/pos/hooks/usePosRemove';

type PosListItem = ReturnType<typeof usePosList>['posList'][number];
type PosCellProps = CellContext<PosListItem, unknown>;

const PosHead = ({ icon, label }: { icon: Icon; label?: string }) => {
  const { t } = useTranslation('sales');

  return <RecordTable.InlineHead icon={icon} label={label ? t(label) : ''} />;
};

const PosMoreCell = ({ row }: PosCellProps) => {
  const { t } = useTranslation('sales');
  const openPos = useOpenPosSettings();
  const { confirm } = useConfirm();
  const { toast } = useToast();
  const { posRemove, loading } = usePosRemove();
  const [open, setOpen] = useState(false);
  const { _id } = row.original;

  const onRemove = () => {
    setOpen(false);
    confirm({
      message: t('confirm-remove-selected'),
      options: { confirmationValue: 'delete' },
    }).then(async () => {
      try {
        await posRemove({ variables: { _id } });
        toast({
          title: t('success'),
          description: t('pos-delete-success'),
          variant: 'success',
        });
      } catch (e) {
        toast({
          title: t('error'),
          description: e instanceof Error ? e.message : t('pos-delete-failed'),
          variant: 'destructive',
        });
      }
    });
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <RecordTable.MoreButton className="w-full h-full" />
      </Popover.Trigger>
      <Combobox.Content>
        <Command shouldFilter={false}>
          <Command.List>
            <Command.Item
              value="edit"
              onSelect={() => {
                setOpen(false);
                openPos(_id);
              }}
            >
              <IconEdit /> {t('edit')}
            </Command.Item>
            <Command.Item
              value="remove"
              className="text-destructive"
              disabled={loading}
              onSelect={onRemove}
            >
              <IconTrash /> {t('delete')}
            </Command.Item>
          </Command.List>
        </Command>
      </Combobox.Content>
    </Popover>
  );
};

const PosLogoCell = ({ row }: PosCellProps) => {
  const { logo, name } = row.original;

  return (
    <div className="flex items-center justify-center h-8">
      <Avatar size="lg">
        {logo && <Avatar.Image src={readImage(logo)} alt={name ?? ''} />}
        <Avatar.Fallback>{name?.charAt(0)}</Avatar.Fallback>
      </Avatar>
    </div>
  );
};

const PosNameCell = ({ row }: PosCellProps) => {
  const { t } = useTranslation('sales');
  const openPos = useOpenPosSettings();

  return (
    <RecordTableInlineCell>
      <RecordTableInlineCell.Anchor onClick={() => openPos(row.original._id)}>
        {row.original.name || t('no-name')}
      </RecordTableInlineCell.Anchor>
    </RecordTableInlineCell>
  );
};

const PosStatusCell = ({ row }: PosCellProps) => {
  const { t } = useTranslation('sales');
  const { isOnline } = row.original;

  return (
    <RecordTableInlineCell>
      <Badge variant={isOnline ? 'success' : 'secondary'}>
        {isOnline ? t('online') : t('offline')}
      </Badge>
    </RecordTableInlineCell>
  );
};

const PosTextCell = ({ value }: { value?: string | null }) => (
  <RecordTableInlineCell>
    {value && <TextOverflowTooltip value={value} />}
  </RecordTableInlineCell>
);

const PosCountCell = ({ value }: { value?: (string | null)[] | null }) => (
  <RecordTableInlineCell>{value?.length ?? 0}</RecordTableInlineCell>
);

const PosCreatedAtCell = ({ row }: PosCellProps) => {
  const { createdAt } = row.original;

  if (!createdAt) {
    return <RecordTableInlineCell />;
  }

  return (
    <RelativeDateDisplay value={createdAt} asChild>
      <RecordTableInlineCell className="text-xs font-medium text-muted-foreground">
        <RelativeDateDisplay.Value value={createdAt} />
      </RecordTableInlineCell>
    </RelativeDateDisplay>
  );
};

const POS_COLUMNS: ColumnDef<PosListItem>[] = [
  {
    id: 'more',
    cell: PosMoreCell,
    size: 33,
  },
  {
    id: 'logo',
    header: () => <PosHead icon={IconPhoto} />,
    cell: PosLogoCell,
    size: 34,
  },
  {
    id: 'name',
    accessorKey: 'name',
    header: () => <PosHead icon={IconLabelFilled} label="name" />,
    cell: PosNameCell,
    size: 240,
  },
  {
    id: 'status',
    accessorKey: 'isOnline',
    header: () => <PosHead icon={IconWifi} label="status" />,
    cell: PosStatusCell,
    size: 120,
  },
  {
    id: 'description',
    accessorKey: 'description',
    header: () => <PosHead icon={IconAlignLeft} label="description" />,
    cell: ({ row }) => <PosTextCell value={row.original.description} />,
    size: 260,
  },
  {
    id: 'branch',
    accessorKey: 'branchTitle',
    header: () => <PosHead icon={IconBuilding} label="branch" />,
    cell: ({ row }) => <PosTextCell value={row.original.branchTitle} />,
    size: 180,
  },
  {
    id: 'department',
    accessorKey: 'departmentTitle',
    header: () => <PosHead icon={IconHierarchy} label="department" />,
    cell: ({ row }) => <PosTextCell value={row.original.departmentTitle} />,
    size: 180,
  },
  {
    id: 'admins',
    accessorKey: 'adminIds',
    header: () => <PosHead icon={IconUserShield} label="admins" />,
    cell: ({ row }) => <PosCountCell value={row.original.adminIds} />,
    size: 110,
  },
  {
    id: 'cashiers',
    accessorKey: 'cashierIds',
    header: () => <PosHead icon={IconUserCheck} label="cashiers" />,
    cell: ({ row }) => <PosCountCell value={row.original.cashierIds} />,
    size: 110,
  },
  {
    id: 'createdBy',
    accessorKey: 'createdBy',
    header: () => <PosHead icon={IconUser} label="created-by" />,
    cell: ({ row }) => <PosTextCell value={row.original.createdBy} />,
    size: 160,
  },
  {
    id: 'createdAt',
    accessorKey: 'createdAt',
    header: () => <PosHead icon={IconCalendarPlus} label="created-at" />,
    cell: PosCreatedAtCell,
    size: 140,
  },
];

interface PosRecordTableProps {
  onCreatePos?: () => void;
}

export const PosRecordTable = ({ onCreatePos }: PosRecordTableProps) => {
  const { posList, loading } = usePosList();

  if (!loading && posList.length === 0) {
    return <PosEmptyState isCreate={true} onCreatePos={onCreatePos} />;
  }

  return (
    <RecordTable.Provider
      columns={POS_COLUMNS}
      data={posList}
      className="m-3"
      stickyColumns={['more', 'logo', 'name']}
      tableId="sales_pos_settings_table"
    >
      <RecordTable.Scroll>
        <RecordTable>
          <RecordTable.Header />
          <RecordTable.Body>
            <RecordTable.RowList />
            {loading && <RecordTable.RowSkeleton rows={10} />}
          </RecordTable.Body>
        </RecordTable>
      </RecordTable.Scroll>
    </RecordTable.Provider>
  );
};
