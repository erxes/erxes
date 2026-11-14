import type { TFunction } from 'i18next';
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
  Badge,
  Combobox,
  Command,
  CurrencyCode,
  CurrencyFormatedDisplay,
  Popover,
  RecordTable,
  RecordTableInlineCell,
  useConfirm,
} from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTransactionsRemove } from '../transaction-form/hooks/useTransactionsRemove';
import { TR_JOURNAL_LABELS, TR_STATUS_LABELS } from '../types/constants';
import { ITransaction } from '../types/Transaction';
import {
  buildTransactionEditPath,
  getCurrentTransactionReturnPath,
} from '../utils/transactionNavigation';

// Create named components for cell renderers to fix React Hook usage
const NumberCell = ({ row }: { row: Row<ITransaction> }) => {
  const { number } = row.original;

  return <RecordTableInlineCell>{number}</RecordTableInlineCell>;
};

const DescriptionCell = ({ row }: { row: Row<ITransaction> }) => {
  const { description } = row.original;

  return <RecordTableInlineCell>{description}</RecordTableInlineCell>;
};

const StatusCell = ({ row }: { row: Row<ITransaction> }) => {
  const { t } = useTranslation('accounting');
  const { status } = row.original;

  return (
    <RecordTableInlineCell>
      {status && (
        <Badge variant="secondary" className="font-medium">
          {t(TR_STATUS_LABELS[status] || '') || status}
        </Badge>
      )}
    </RecordTableInlineCell>
  );
};

const JournalCell = ({ row }: { row: Row<ITransaction> }) => {
  const { t } = useTranslation('accounting');
  const { journal } = row.original;
  const label = journal ? TR_JOURNAL_LABELS[journal] : undefined;

  return (
    <RecordTableInlineCell>
      {label ? t(label) : t('main')}
    </RecordTableInlineCell>
  );
};

const AmountCell = ({ value }: { value?: number }) => (
  <RecordTableInlineCell>
    <CurrencyFormatedDisplay
      currencyValue={{
        currencyCode: CurrencyCode.MNT,
        amountMicros: value ?? 0,
      }}
    />
  </RecordTableInlineCell>
);

const BranchCell = ({ row }: { row: Row<ITransaction> }) => {
  const { branch } = row.original;

  return (
    <RecordTableInlineCell>
      {[branch?.code, branch?.title].filter(Boolean).join(' - ')}
    </RecordTableInlineCell>
  );
};

const DepartmentCell = ({ row }: { row: Row<ITransaction> }) => {
  const { department } = row.original;

  return (
    <RecordTableInlineCell>
      {[department?.code, department?.title].filter(Boolean).join(' - ')}
    </RecordTableInlineCell>
  );
};

const DateCell = ({ row }: { row: Row<ITransaction> }) => {
  return (
    <RecordTableInlineCell>
      {dayjs(new Date(row.original.date ?? '')).format('YYYY-MM-DD')}
    </RecordTableInlineCell>
  );
};

const AccountCell = ({ row }: { row: Row<ITransaction> }) => {
  const { details, parentId, _id, originId } = row.original;
  const navigate = useNavigate();
  const location = useLocation();

  const name0 = details[0]?.account?.name;

  const infoByCode = details.reduce<Record<string, number>>((acc, d) => {
    const code = d.account?.code || '';
    acc[code] = (acc[code] || 0) + 1;
    return acc;
  }, {});

  const codes = Object.keys(infoByCode);

  const handleEditAccount = () => {
    navigate(
      buildTransactionEditPath({
        parentId,
        trId: originId || _id,
        returnTo: getCurrentTransactionReturnPath(location),
      }),
    );
  };

  return (
    <RecordTableInlineCell>
      <RecordTableInlineCell.Anchor onClick={handleEditAccount}>
        {codes.map((code, i) => {
          const count = infoByCode[code];
          const tot = count > 1 ? `(${count})` : '';

          if (i === 0) {
            return `${code} - ${name0}${tot}`;
          }

          return `, ${code}${tot}`;
        })}
      </RecordTableInlineCell.Anchor>
    </RecordTableInlineCell>
  );
};

const TransactionMoreColumnCell = ({
  cell,
}: {
  cell: Cell<ITransaction, unknown>;
}) => {
  const { t } = useTranslation('accounting');
  const { parentId, _id, originId } = cell.row.original;
  const navigate = useNavigate();
  const location = useLocation();
  const { confirm } = useConfirm();
  const { removeTransactions } = useTransactionsRemove();
  const handleEditAcc = () => {
    navigate(
      buildTransactionEditPath({
        parentId,
        trId: originId || _id,
        returnTo: getCurrentTransactionReturnPath(location),
      }),
    );
  };
  const handleDelete = () =>
    confirm({
      message: t('are-you-sure-delete-transactions'),
      options: {
        okLabel: t('delete'),
        cancelLabel: t('cancel'),
      },
    }).then(() => {
      removeTransactions(parentId);
    });

  return (
    <Popover>
      <Popover.Trigger asChild>
        <RecordTable.MoreButton className="w-full h-full" />
      </Popover.Trigger>
      <Combobox.Content>
        <Command shouldFilter={false}>
          <Command.List>
            <Command.Item value="edit" onSelect={handleEditAcc}>
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

export const transactionColumns = (
  t: TFunction<'accounting'>,
): ColumnDef<ITransaction>[] => [
  transactionMoreColumn,
  RecordTable.checkboxColumn as ColumnDef<ITransaction>,
  {
    id: 'account',
    header: () => (
      <RecordTable.InlineHead icon={IconMoneybag} label={t('account')} />
    ),
    accessorKey: 'details',
    cell: ({ row }) => <AccountCell row={row} />,
    size: 300,
  },
  {
    id: 'number',
    header: () => (
      <RecordTable.InlineHead icon={IconFile} label={t('number')} />
    ),
    accessorKey: 'number',
    cell: ({ row }) => <NumberCell row={row} />,
  },
  {
    id: 'date',
    header: () => (
      <RecordTable.InlineHead icon={IconCalendar} label={t('date')} />
    ),
    accessorKey: 'date',
    cell: ({ row }) => <DateCell row={row} />,
    size: 100,
  },
  {
    id: 'description',
    header: () => (
      <RecordTable.InlineHead icon={IconFile} label={t('description')} />
    ),
    accessorKey: 'description',
    cell: ({ row }) => <DescriptionCell row={row} />,
    size: 200,
  },
  {
    id: 'status',
    header: () => (
      <RecordTable.InlineHead icon={IconFile} label={t('status')} />
    ),
    accessorKey: 'status',
    cell: ({ row }) => <StatusCell row={row} />,
  },
  {
    id: 'journal',
    header: () => (
      <RecordTable.InlineHead icon={IconFile} label={t('journal')} />
    ),
    accessorKey: 'journal',
    cell: ({ row }) => <JournalCell row={row} />,
  },
  {
    id: 'sumDt',
    header: () => (
      <RecordTable.InlineHead icon={IconMoneybag} label={t('debit-amount')} />
    ),
    accessorKey: 'sumDt',
    cell: ({ row }) => <AmountCell value={row.original.sumDt} />,
  },
  {
    id: 'sumCt',
    header: () => (
      <RecordTable.InlineHead icon={IconMoneybag} label={t('credit-amount')} />
    ),
    accessorKey: 'sumCt',
    cell: ({ row }) => <AmountCell value={row.original.sumCt} />,
  },
  {
    id: 'branch',
    header: () => (
      <RecordTable.InlineHead icon={IconFile} label={t('branch')} />
    ),
    accessorKey: 'branch',
    cell: ({ row }) => <BranchCell row={row} />,
  },
  {
    id: 'department',
    header: () => (
      <RecordTable.InlineHead icon={IconFile} label={t('department')} />
    ),
    accessorKey: 'department',
    cell: ({ row }) => <DepartmentCell row={row} />,
  },
];
