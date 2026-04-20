import { ColumnDef } from '@tanstack/table-core';
import { RecordTable, RecordTableInlineCell, useQueryState } from 'erxes-ui';
import { useSetAtom } from 'jotai';
import { BoardSelect, PipelineSelect, StageSelect } from 'ui-modules';
import { ACCOUNTING_SETTINGS_CODES } from '../constants/settingsRoutes';
import { useAccountingConfigs } from '../hooks/useAccountingConfigs';
import { accountingConfigDetailAtom } from '../states/accountingConfigState';
import { IConfig } from '../types/Config';
import { EditAccountingConfig } from './EditAccountingConfig';

export const SettingSyncDealReturnTable = () => {
  const { configs } = useAccountingConfigs({
    variables: { code: ACCOUNTING_SETTINGS_CODES.SYNC_DEAL_RETURN },
  });
  return (
    <RecordTable.Provider
      columns={columns}
      data={configs || []}
      stickyColumns={['more', 'checkbox', 'code']}
    >
      <RecordTable>
        <RecordTable.Header />
        <RecordTable.Body>
          <RecordTable.RowList />
        </RecordTable.Body>
      </RecordTable>
      <EditAccountingConfig code={ACCOUNTING_SETTINGS_CODES.SYNC_DEAL_RETURN} />
    </RecordTable.Provider>
  );
};

const LinkCell = ({ row, renderVal }: { row: any; renderVal: string }) => {
  const [, setOpen] = useQueryState('configId', { defaultValue: '' });
  const setAccountDetail = useSetAtom(accountingConfigDetailAtom);
  return (
    <RecordTableInlineCell
      onClick={() => {
        setAccountDetail(row.original.value);
        setOpen(row.original._id);
      }}
    >
      {renderVal}
    </RecordTableInlineCell>
  );
};

export const columns: ColumnDef<IConfig>[] = [
  RecordTable.checkboxColumn as ColumnDef<IConfig>,
  {
    id: 'code',
    accessorKey: 'code',
    header: () => <RecordTable.InlineHead label="Code" />,
    cell: ({ cell }) => {
      return <LinkCell row={cell.row} renderVal={cell.row.original?.code} />;
    },
    size: 250,
  },
  {
    id: 'title',
    accessorKey: 'title',
    header: () => <RecordTable.InlineHead label="Title" />,
    cell: ({ cell }) => {
      return (
        <LinkCell row={cell.row} renderVal={cell.row.original?.value?.title} />
      );
    },
  },
  {
    id: 'board',
    accessorKey: 'board',
    header: () => <RecordTable.InlineHead label="Board" />,
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          <BoardSelect boardId={cell.row.original.value?.boardId} />
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
          <PipelineSelect pipelineId={cell.row.original.value?.pipelineId} />
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
          <StageSelect
            pipelineId={cell.row.original.value?.pipelineId}
            stageId={cell.row.original.value?.stageId}
          />
        </RecordTableInlineCell>
      );
    },
  },
];
