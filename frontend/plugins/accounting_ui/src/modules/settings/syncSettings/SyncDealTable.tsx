import { ColumnDef } from '@tanstack/table-core';
import {
  RecordTable,
  RecordTableInlineCell,
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
          {cell.row.original.code}
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
      return (<RecordTableInlineCell
        onClick={() => {
          setAccountDetail(cell.row.original.value);
          setOpen(cell.row.original._id);
        }}
      >
        {cell.row.original.value?.title || 'Undefined title'}
      </RecordTableInlineCell>)
    },
  },
  {
    id: 'board',
    accessorKey: 'board',
    header: () => <RecordTable.InlineHead label="Board" />,
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          {cell.row.original.value?.boardId}
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'pipeline',
    accessorKey: 'pipeline',
    header: () => <RecordTable.InlineHead label="Pipeline" />,
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          {cell.row.original.value?.pipelineId}
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'stage',
    accessorKey: 'stage',
    header: () => <RecordTable.InlineHead label="Stage" />,
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          {cell.row.original.value?.stageId}
        </RecordTableInlineCell>
      );
    },
  },
];

