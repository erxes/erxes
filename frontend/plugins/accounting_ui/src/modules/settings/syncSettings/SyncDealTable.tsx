import { ColumnDef } from '@tanstack/table-core';
import {
  ITextFieldContainerProps,
  RecordTable,
  RecordTableInlineCell,
  TextField,
  useQueryState,
} from 'erxes-ui';
import { useSetAtom } from 'jotai';
import { ACCOUNTING_SETTINGS_CODES } from '../constants/settingsRoutes';
import { useAccountingConfigs } from '../hooks/useAccountingConfigs';
import { accountingConfigDetailAtom } from '../states/accountingConfigState';
import { IConfig } from '../types/Config';
import { EditAccountingConfig } from './EditAccountingConfig';

export const SettingSyncDealTable = () => {
  const { configs } = useAccountingConfigs({ variables: { code: ACCOUNTING_SETTINGS_CODES.SYNC_DEAL } });
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
      <EditAccountingConfig code={ACCOUNTING_SETTINGS_CODES.SYNC_DEAL} />
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

export const columns: ColumnDef<IConfig>[] = [
  RecordTable.checkboxColumn as ColumnDef<
    IConfig
  >,
  {
    id: 'code',
    accessorKey: 'code',
    header: () => <RecordTable.InlineHead label="Code" />,
    cell: ({ cell }) => {
      const [, setOpen] = useQueryState('configId');
      const setAccountDetail = useSetAtom(accountingConfigDetailAtom);
      return (
        <RecordTableInlineCell
          onClick={() => {
            setAccountDetail(cell.row.original.value);
            setOpen(cell.row.original._id);
          }}
        >
          {cell.getValue() as string}
        </RecordTableInlineCell>
      );
    },
    size: 250,
  },
  {
    id: 'title',
    accessorKey: 'title',
    header: () => <RecordTable.InlineHead label="Title" />,
    cell: ({ cell }) => {
      const [, setOpen] = useQueryState('configId');
      const setAccountDetail = useSetAtom(accountingConfigDetailAtom);
      <RecordTableInlineCell
        onClick={() => {
          setAccountDetail(cell.row.original);
          setOpen(cell.row.original._id);
        }}
      >
        {cell.getValue() as string}
      </RecordTableInlineCell>
    },
    size: 250,
  },
  {
    id: 'board',
    accessorKey: 'board',
    header: () => <RecordTable.InlineHead label="Board" />,
    cell: ({ cell }) => {
      return (
        <AccountTextField
          value={cell.getValue() as string}
          field="boardId"
          _id={cell.row.original._id}
        />
      );
    },
    size: 300,
  },
  {
    id: 'pipeline',
    accessorKey: 'pipeline',
    header: () => <RecordTable.InlineHead label="Pipeline" />,
    cell: ({ cell }) => {
      return (
        <AccountTextField
          value={cell.getValue() as string}
          field="pipelineId"
          _id={cell.row.original._id}
        />
      );
    },
    size: 300,
  },
  {
    id: 'stage',
    accessorKey: 'stage',
    header: () => <RecordTable.InlineHead label="Stage" />,
    cell: ({ cell }) => {
      return (
        <AccountTextField
          value={cell.row.original.subId ?? ''}
          field="stageId"
          _id={cell.row.original._id}
        />
      );
    },
    size: 300,
  },
];

