import { Cell, ColumnDef } from '@tanstack/react-table';
import { IAccount, JournalEnum } from '../types/Account';
import {
  CurrencyCode,
  ITextFieldContainerProps,
  RecordTable,
  CurrencyField,
  TextField,
  useQueryState,
  RecordTableInlineCell,
} from 'erxes-ui';
import { SelectAccountCategory } from '../account-categories/components/SelectAccountCategory';
import { useAccountEdit } from '../hooks/useAccountEdit';
import { useSetAtom } from 'jotai';
import { accountDetailAtom } from '../states/accountStates';
import { JOURNAL_LABELS } from '../constants/journalLabel';

const AccountCategoryCell = ({ cell }: { cell: Cell<IAccount, unknown> }) => {
  const { editAccount } = useAccountEdit();
  return (
    <SelectAccountCategory
      recordId={cell.row.original._id}
      selected={cell.row.original.categoryId}
      className="w-full font-normal"
      onSelect={(categoryId) => {
        editAccount(
          {
            variables: {
              ...cell.row.original,
              categoryId,
            },
          },
          ['categoryId'],
        );
      }}
      variant="ghost"
      hideChevron
    />
  );
};

const AccountTextField = ({
  value,
  field,
  _id,
  account,
}: ITextFieldContainerProps & { account: IAccount }) => {
  const { editAccount } = useAccountEdit();
  return (
    <TextField
      value={value}
      scope={`account-${_id}-${field}`}
      onSave={(value) => {
        editAccount(
          {
            variables: { ...account, [field]: value },
          },
          [field],
        );
      }}
    />
  );
};

const AccountCurrencyCell = ({ cell }: { cell: Cell<IAccount, unknown> }) => {
  const { editAccount } = useAccountEdit();
  return (
    <CurrencyField.SelectCurrency
      value={cell.getValue() as CurrencyCode}
      variant="ghost"
      className="w-full focus-visible:relative focus-visible:z-10 font-normal"
      hideChevron
      onChange={(value) => {
        editAccount({ variables: { ...cell.row.original, currency: value } }, [
          'currency',
        ]);
      }}
    />
  );
};

export const AccountMoreColumnCell = ({
  cell,
}: {
  cell: Cell<IAccount, unknown>;
}) => {
  const [, setOpen] = useQueryState('accountId');
  const setAccountDetail = useSetAtom(accountDetailAtom);
  return (
    <RecordTable.MoreButton
      className="w-full h-full"
      onClick={() => {
        setAccountDetail(cell.row.original);
        setOpen(cell.row.original._id);
      }}
    />
  );
};

export const accountMoreColumn = {
  id: 'more',
  cell: AccountMoreColumnCell,
  size: 33,
};

export const accountsColumns: ColumnDef<IAccount>[] = [
  accountMoreColumn,
  RecordTable.checkboxColumn as ColumnDef<IAccount>,
  {
    id: 'code',
    accessorKey: 'code',
    header: () => <RecordTable.InlineHead label="Code" />,
    cell: ({ cell }) => {
      return (
        <>
          <span></span>
          <AccountTextField
            value={cell.getValue() as string}
            field="code"
            _id={cell.row.original._id}
            account={cell.row.original}
          />
        </>
      );
    },
  },
  {
    id: 'name',
    accessorKey: 'name',
    header: () => <RecordTable.InlineHead label="Name" />,
    cell: ({ cell }) => {
      return (
        <AccountTextField
          value={cell.getValue() as string}
          field="name"
          _id={cell.row.original._id}
          account={cell.row.original}
        />
      );
    },
    size: 300,
  },
  {
    id: 'category',
    accessorKey: 'categoryId',
    header: () => <RecordTable.InlineHead label="Category" />,
    cell: AccountCategoryCell,
    size: 240,
  },
  {
    id: 'currency',
    accessorKey: 'currency',
    header: () => <RecordTable.InlineHead label="Currency" />,
    cell: AccountCurrencyCell,
    size: 240,
  },
  {
    id: 'kind',
    accessorKey: 'kind',
    header: () => <RecordTable.InlineHead label="Kind" />,
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          {cell.getValue() as string}
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'journal',
    accessorKey: 'journal',
    header: () => <RecordTable.InlineHead label="Journal" />,
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          {JOURNAL_LABELS[cell.getValue() as JournalEnum]}
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'isTemp',
    accessorKey: 'isTemp',
    header: () => <RecordTable.InlineHead label="Temp" />,
    size: 80,
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          {cell.getValue() ? 'temp' : '-'}
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'isOutBalance',
    accessorKey: 'isOutBalance',
    header: () => <RecordTable.InlineHead label="Out balance" />,
    size: 80,
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          {cell.getValue() ? 'Out' : '-'}
        </RecordTableInlineCell>
      );
    },
  },
];
