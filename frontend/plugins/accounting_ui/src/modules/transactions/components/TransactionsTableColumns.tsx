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
  Combobox,
  Command,
  CurrencyCode,
  CurrencyFormatedDisplay,
  Popover,
  PopoverScoped,
  RecordTable,
  RecordTableInlineCell,
  TextField,
  useConfirm,
} from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTransactionInlineEdit } from '@/transactions/hooks/useTransactionInlineEdit';
import { useTransactionsRemove } from '@/transactions/transaction-form/hooks/useTransactionsRemove';
import {
  TR_JOURNAL_LABELS,
  TR_STATUS_LABELS,
} from '@/transactions/types/constants';
import { ITransaction } from '@/transactions/types/Transaction';
import {
  buildTransactionEditPath,
  getCurrentTransactionReturnPath,
} from '@/transactions/utils/transactionNavigation';

const useOpenTransactionEdit = ({
  parentId,
  _id,
  originId,
}: ITransaction) => {
  const navigate = useNavigate();
  const location = useLocation();

  return () => {
    void navigate(
      buildTransactionEditPath({
        parentId,
        trId: originId || _id,
        returnTo: getCurrentTransactionReturnPath(location),
      }),
    );
  };
};

const TransactionTextCell = ({
  row,
  field,
}: {
  row: Row<ITransaction>;
  field: 'number' | 'description';
}) => {
  const { editTransaction } = useTransactionInlineEdit();
  const { _id } = row.original;
  const value = row.original[field] || '';

  return (
    <TextField
      value={value}
      scope={`accounting-${_id}-${field}`}
      onSave={(nextValue) => {
        if (field === 'number' && !nextValue.trim()) {
          return;
        }
        void editTransaction(row.original, { [field]: nextValue });
      }}
      className="shadow-none rounded-none px-2"
    />
  );
};

const StatusCell = ({ row }: { row: Row<ITransaction> }) => {
  const { t } = useTranslation('accounting');
  const { status } = row.original;

  return (
    <RecordTableInlineCell>
      {t(TR_STATUS_LABELS[status || ''] || '') || status}
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

const SumDebitCell = ({ getValue, row }: any) => {
  const sumDt = getValue() as number;
  const { _id } = row.original;

  return (
    <PopoverScoped scope={`accounting-${_id}-sumDt`}>
      <RecordTableInlineCell.Trigger>
        <CurrencyFormatedDisplay
          currencyValue={{
            currencyCode: CurrencyCode.MNT,
            amountMicros: sumDt,
          }}
        />
      </RecordTableInlineCell.Trigger>
    </PopoverScoped>
  );
};

const SumCreditCell = ({ getValue, row }: any) => {
  const sumCt = getValue() as number;
  const { _id } = row.original;

  return (
    <PopoverScoped scope={`accounting-${_id}-sumCt`}>
      <RecordTableInlineCell.Trigger>
        <CurrencyFormatedDisplay
          currencyValue={{
            currencyCode: CurrencyCode.MNT,
            amountMicros: sumCt,
          }}
        />
      </RecordTableInlineCell.Trigger>
    </PopoverScoped>
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

const DateCell = ({ getValue }: any) => {
  return (
    <RecordTableInlineCell>
      {dayjs(new Date(getValue())).format('YYYY-MM-DD')}
    </RecordTableInlineCell>
  );
};

const AccountCell = ({ row }: any) => {
  const { details } = row.original;
  const handleEditAccount = useOpenTransactionEdit(row.original);

  const name0 = details[0].account?.name;

  const infoByCode = details.reduce(
    (acc: { [code: string]: number }, d: any) => {
      const code = d.account?.code || '';
      acc[code] = (acc[code] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const codes = Object.keys(infoByCode);

  return (
    <RecordTableInlineCell
      onClick={handleEditAccount}
      className="cursor-pointer"
    >
      {codes.map((code, i) => {
        const count = infoByCode[code];
        const tot = count > 1 ? `(${count})` : '';

        if (i === 0) {
          return `${code} - ${name0}${tot}`;
        }

        return `, ${code}${tot}`;
      })}
    </RecordTableInlineCell>
  );
};

const TransactionMoreColumnCell = ({
  cell,
}: {
  cell: Cell<ITransaction, unknown>;
}) => {
  const { t } = useTranslation('accounting');
  const { parentId } = cell.row.original;
  const { confirm } = useConfirm();
  const { removeTransactions } = useTransactionsRemove();
  const handleEditAcc = useOpenTransactionEdit(cell.row.original);
  const handleDelete = () =>
    confirm({
      message: t('are-you-sure-delete-transactions'),
      options: {
        okLabel: t('delete'),
        cancelLabel: t('cancel'),
      },
    }).then(() => {
      void removeTransactions(parentId);
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
    cell: ({ row }) => <TransactionTextCell row={row} field="number" />,
  },
  {
    id: 'date',
    header: () => (
      <RecordTable.InlineHead icon={IconCalendar} label={t('date')} />
    ),
    accessorKey: 'date',
    cell: ({ getValue, row }) => <DateCell getValue={getValue} row={row} />,
    size: 100,
  },
  {
    id: 'description',
    header: () => (
      <RecordTable.InlineHead icon={IconFile} label={t('description')} />
    ),
    accessorKey: 'description',
    cell: ({ row }) => <TransactionTextCell row={row} field="description" />,
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
    cell: ({ getValue, row }) => <SumDebitCell getValue={getValue} row={row} />,
  },
  {
    id: 'sumCt',
    header: () => (
      <RecordTable.InlineHead icon={IconMoneybag} label={t('credit-amount')} />
    ),
    accessorKey: 'sumCt',
    cell: ({ getValue, row }) => (
      <SumCreditCell getValue={getValue} row={row} />
    ),
  },
  {
    id: 'branch',
    header: () => (
      <RecordTable.InlineHead icon={IconFile} label={t('branch')} />
    ),
    accessorKey: 'branch',
    cell: ({ getValue, row }) => <BranchCell getValue={getValue} row={row} />,
  },
  {
    id: 'department',
    header: () => (
      <RecordTable.InlineHead icon={IconFile} label={t('department')} />
    ),
    accessorKey: 'department',
    cell: ({ getValue, row }) => (
      <DepartmentCell getValue={getValue} row={row} />
    ),
  },
];
