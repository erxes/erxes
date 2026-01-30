import { Cell, ColumnDef } from '@tanstack/table-core';
import {
  ITextFieldContainerProps,
  RecordTable,
  TextField,
  useQueryState,
} from 'erxes-ui';
import { useAccountingConfigs } from '../hooks/useAccountingConfigs';
import { IConfig } from '../types/Config';
import { ACCOUNTING_SETTINGS_CODES } from '../constants/settingsRoutes';

export const SettingSyncOrderTable = () => {
  const { configs } = useAccountingConfigs({ variables: { code: ACCOUNTING_SETTINGS_CODES.SYNC_ORDER } });
  return (
    <RecordTable.Provider
      columns={columns}
      data={
        configs || []
      }
      stickyColumns={['more', 'checkbox', 'code']}
    >
      <RecordTable>
        <RecordTable.Header />
        <RecordTable.Body>
          <RecordTable.RowList />
        </RecordTable.Body>
      </RecordTable>
    </RecordTable.Provider>
  );
};

const AccountTextField = ({
  value,
  field,
  _id,
  children,
}: ITextFieldContainerProps & {
  children?: React.ReactNode;
}) => {
  return (
    <TextField
      value={value}
      scope={`account-category-${_id}-${field}`}
      className={'shadow-none rounded-none px-2'}
    >
      {children}
    </TextField>
  );
};

const AccountCategoryMoreColumnCell = ({
  cell,
}: {
  cell: Cell<{ hasChildren: boolean }, unknown>;
}) => {
  const [, setOpen] = useQueryState('accountCategoryId');
  // const setAccountCategoryDetail = useSetAtom(accountCategoryDetailAtom);
  return (
    <RecordTable.MoreButton
      className="w-full h-full"
      onClick={() => {
        // setAccountCategoryDetail(cell.row.original);
        // setOpen(cell.row.original._id);
      }}
    />
  );
};

// const accountCategoryMoreColumn = {
//   id: 'more',
//   cell: AccountCategoryMoreColumnCell,
//   size: 33,
// };

export const columns: ColumnDef<IConfig & { hasChildren: boolean }>[] = [
  // accountCategoryMoreColumn,
  RecordTable.checkboxColumn as ColumnDef<
    IConfig & { hasChildren: boolean }
  >,
  {
    id: 'code',
    accessorKey: 'code',
    header: () => <RecordTable.InlineHead label="Code" />,
    cell: ({ cell }) => {
      return (
        <AccountTextField
          value={cell.getValue() as string}
          field="code"
          _id={cell.row.original._id}
        />
      );
    },
    size: 250,
  },
  {
    id: 'title',
    accessorKey: 'title',
    header: () => <RecordTable.InlineHead label="Title" />,
    cell: ({ cell }) => {
      return (
        <AccountTextField
          value={cell.row.original.value?.title ?? ''}
          field="title"
          _id={cell.row.original._id}
        />
      );
    },
    size: 250,
  },
  {
    id: 'description',
    accessorKey: 'description',
    header: () => <RecordTable.InlineHead label="Description" />,
    cell: ({ cell }) => {
      return (
        <AccountTextField
          value={cell.getValue() as string}
          field="description"
          _id={cell.row.original._id}
        />
      );
    },
    size: 300,
  },
];

