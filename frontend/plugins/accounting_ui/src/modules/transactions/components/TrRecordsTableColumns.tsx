import { HeaderCell } from '@/check-synced/constants/HeaderCell';
import {
  IconCalendar,
  IconEdit,
  IconFile,
  IconMoneybag,
  IconTrash,
} from '@tabler/icons-react';
import { Cell, ColumnDef, Row } from '@tanstack/react-table';
import dayjs from 'dayjs';
import {
  Combobox,
  Command,
  CurrencyCode,
  CurrencyFormatedDisplay,
  fixNum,
  Popover,
  RecordTable,
  RecordTableInlineCell,
  useConfirm,
} from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router';
import { ProductsInline } from 'ui-modules';
import { SelectFixedAsset } from '@/settings/fixed-assets/components/SelectFixedAsset';
import { useTrRecordsRemove } from '../hooks/useTrRecordsRemove';
import {
  TR_JOURNAL_LABELS,
  TR_SIDES,
  TR_STATUS_LABELS,
  TrJournalEnum,
} from '../types/constants';
import { ITrRecord } from '../types/Transaction';
import {
  buildTransactionEditPath,
  getCurrentTransactionReturnPath,
} from '../utils/transactionNavigation';

const NumberCell = ({ row }: any) => {
  const { number } = row.original;

  return <RecordTableInlineCell>{number}</RecordTableInlineCell>;
};

const DescriptionCell = ({ row }: any) => {
  const { description } = row.original;

  return <RecordTableInlineCell>{description}</RecordTableInlineCell>;
};

const AmountCell = ({ value }: { value: number }) => {
  return (
    <RecordTableInlineCell>
      <CurrencyFormatedDisplay
        currencyValue={{
          currencyCode: CurrencyCode.MNT,
          amountMicros: value,
        }}
      />
    </RecordTableInlineCell>
  );
};

const DebitCell = ({ row }: { row: Row<ITrRecord> }) => {
  const { details, side } = row.original;
  const { amount } = details;

  return <AmountCell value={side === TR_SIDES.DEBIT ? fixNum(amount) : 0} />;
};

const CreditCell = ({ row }: { row: Row<ITrRecord> }) => {
  const { details, side } = row.original;
  const { amount } = details;

  return <AmountCell value={side === TR_SIDES.CREDIT ? fixNum(amount) : 0} />;
};

const AmountItemCell = ({ row, value }: { row: any; value: number }) => {
  const { details } = row.original;
  if (!details?.productId && !details?.fixedAssetId) {
    return undefined;
  }

  return (
    <RecordTableInlineCell>
      <CurrencyFormatedDisplay
        currencyValue={{
          currencyCode: CurrencyCode.MNT,
          amountMicros: value,
        }}
      />
    </RecordTableInlineCell>
  );
};

const BranchCell = ({ row }: any) => {
  const { branch } = row.original;

  return (
    <RecordTableInlineCell>
      {[branch?.code, branch?.title].filter(Boolean).join(' - ')}
    </RecordTableInlineCell>
  );
};

const DepartmentCell = ({ row }: any) => {
  const { department } = row.original;

  return (
    <RecordTableInlineCell>
      {[department?.code, department?.title].filter(Boolean).join(' - ')}
    </RecordTableInlineCell>
  );
};

const StatusCell = ({ row }: any) => {
  const { t } = useTranslation('accounting');

  const { status } = row.original;

  return (
    <RecordTableInlineCell>
      {t(TR_STATUS_LABELS[status]) || status}
    </RecordTableInlineCell>
  );
};

const JournalCell = ({ row }: any) => {
  const { t } = useTranslation('accounting');
  const { journal } = row.original;

  return (
    <RecordTableInlineCell>
      {t(TR_JOURNAL_LABELS[journal as TrJournalEnum]) || t('main')}
    </RecordTableInlineCell>
  );
};

const DateCell = ({ getValue }: any) => {
  return (
    <RecordTableInlineCell>
      {dayjs(new Date(getValue())).format('YYYY-MM-DD')}
    </RecordTableInlineCell>
  );
};

const AccountCell = ({ row }: any) => {
  const { details } = row.original;

  return (
    <RecordTableInlineCell>
      {`${details?.account?.code} - ${details?.account?.name}`}
    </RecordTableInlineCell>
  );
};

const ProductCell = ({ row }: any) => {
  const { details } = row.original;

  if (details?.fixedAssetId) {
    return (
      <RecordTableInlineCell>
        <SelectFixedAsset.Provider
          mode="single"
          value={details.fixedAssetId}
          placeholder="-"
        >
          <SelectFixedAsset.Value placeholder="-" />
        </SelectFixedAsset.Provider>
      </RecordTableInlineCell>
    );
  }

  if (!details?.productId) {
    return undefined;
  }

  return (
    <RecordTableInlineCell>
      <ProductsInline
        productIds={[details.productId]}
        products={details.product && [details.product]}
      />
    </RecordTableInlineCell>
  );
};

const TransactionMoreColumnCell = ({
  cell,
}: {
  cell: Cell<ITrRecord, unknown>;
}) => {
  const { t } = useTranslation('accounting');
  const { parentId, trId, originId } = cell.row.original;
  const navigate = useNavigate();
  const location = useLocation();
  const { confirm } = useConfirm();
  const { removeTrRecords } = useTrRecordsRemove();

  const handleEdit = () => {
    navigate(
      buildTransactionEditPath({
        parentId,
        trId: originId || trId,
        returnTo: getCurrentTransactionReturnPath(location),
      }),
    );
  };

  const handleDelete = () =>
    confirm({
      message: t('are-you-sure-delete-tr-record'),
      options: {
        okLabel: t('delete'),
        cancelLabel: t('cancel'),
      },
    }).then(() => {
      removeTrRecords(parentId);
    });

  return (
    <Popover>
      <Popover.Trigger asChild>
        <RecordTable.MoreButton className="w-full h-full" />
      </Popover.Trigger>
      <Combobox.Content>
        <Command shouldFilter={false}>
          <Command.List>
            <Command.Item value="edit" onSelect={handleEdit}>
              <IconEdit /> {t('edit')}
            </Command.Item>
            <Command.Item value="delete" onSelect={handleDelete}>
              <IconTrash /> {t('delete')}
            </Command.Item>
          </Command.List>
        </Command>
      </Combobox.Content>
    </Popover>
  );
};

const transactionMoreColumn = {
  id: 'more',
  header: () => <RecordTable.ColumnSelector />,
  cell: TransactionMoreColumnCell,
  size: 33,
};

export const trRecordColumns: ColumnDef<ITrRecord>[] = [
  transactionMoreColumn,
  RecordTable.checkboxColumn as ColumnDef<ITrRecord>,
  {
    id: 'account',
    header: () => <HeaderCell icon={IconMoneybag} labelKey="account" />,
    accessorKey: 'details',
    cell: ({ row }) => <AccountCell row={row} />,
    size: 300,
  },
  {
    id: 'number',
    header: () => <HeaderCell icon={IconFile} labelKey="number" />,
    accessorKey: 'number',
    cell: ({ getValue, row }) => <NumberCell getValue={getValue} row={row} />,
  },
  {
    id: 'date',
    header: () => <HeaderCell icon={IconCalendar} labelKey="date" />,
    accessorKey: 'date',
    cell: ({ getValue, row }) => <DateCell getValue={getValue} row={row} />,
    size: 100,
  },
  {
    id: 'status',
    header: () => <HeaderCell icon={IconFile} labelKey="status" />,
    accessorKey: 'status',
    cell: ({ row }) => <StatusCell row={row} />,
  },
  {
    id: 'journal',
    header: () => <HeaderCell icon={IconFile} labelKey="journal" />,
    accessorKey: 'journal',
    cell: ({ row }) => <JournalCell row={row} />,
  },
  {
    id: 'product-inv',
    header: () => <HeaderCell icon={IconMoneybag} labelKey="product-asset" />,
    accessorKey: 'product-inv',
    cell: ({ row }) => <ProductCell row={row} />,
  },
  {
    id: 'unitPrice-inv',
    header: () => <HeaderCell icon={IconMoneybag} labelKey="unit-price" />,
    accessorKey: 'unitPrice-inv',
    cell: ({ row }) => (
      <AmountItemCell row={row} value={row.original?.details?.unitPrice ?? 0} />
    ),
  },
  {
    id: 'count-inv',
    header: () => <HeaderCell icon={IconMoneybag} labelKey="quantity" />,
    accessorKey: 'count-inv',
    cell: ({ row }) => (
      <AmountItemCell row={row} value={row.original?.details?.count ?? 0} />
    ),
  },
  {
    id: 'Debit',
    header: () => <HeaderCell icon={IconMoneybag} labelKey="debit" />,
    accessorKey: 'Debit',
    cell: ({ getValue, row }) => <DebitCell getValue={getValue} row={row} />,
  },
  {
    id: 'Credit',
    header: () => <HeaderCell icon={IconMoneybag} labelKey="credit" />,
    accessorKey: 'Credit',
    cell: ({ getValue, row }) => <CreditCell getValue={getValue} row={row} />,
  },
  {
    id: 'description',
    header: () => <HeaderCell icon={IconFile} labelKey="description" />,
    accessorKey: 'description',
    cell: ({ getValue, row }) => (
      <DescriptionCell getValue={getValue} row={row} />
    ),
    size: 200,
  },
  {
    id: 'branch',
    header: () => <HeaderCell icon={IconFile} labelKey="branch" />,
    accessorKey: 'branch',
    cell: ({ row }) => <BranchCell row={row} />,
  },
  {
    id: 'department',
    header: () => <HeaderCell icon={IconFile} labelKey="department" />,
    accessorKey: 'department',
    cell: ({ row }) => <DepartmentCell row={row} />,
  },
];
