import { useAutomationExecutionSelection } from '@/automations/components/builder/history/context/AutomationExecutionSelectionContext';
import { useAutomationHistoryResult } from '@/automations/components/builder/history/hooks/useAutomationHistoryResult';
import { formatExecutionDuration } from '@/automations/utils/automationHistoryUtils/executionFormat';
import { getActionResultPreview } from '@/automations/utils/automationHistoryUtils/getActionResultPreview';
import {
  IconAlertTriangle,
  IconArrowDown,
  IconRefresh,
} from '@tabler/icons-react';
import { type ColumnDef } from '@tanstack/table-core';
import {
  Button,
  RecordTable,
  RecordTableInlineCell,
  RelativeDateDisplay,
  cn,
} from 'erxes-ui';
import { type ComponentProps } from 'react';
import { useTranslation } from 'react-i18next';
import { IAutomationHistory, IAutomationHistoryAction } from 'ui-modules';

type AutomationHistoryActionTableRow = IAutomationHistoryAction & {
  _id: string;
  actionTypeLabel: string;
  createdAtValue: string;
  executionStatus: IAutomationHistory['status'];
};

const ActionResultCell = ({
  action,
}: {
  action: AutomationHistoryActionTableRow;
}) => {
  const { selectedActionId, selectAction } = useAutomationExecutionSelection();

  return (
    <Button
      variant="ghost"
      onClick={() => selectAction(action.actionId)}
      className={cn(
        'h-10 w-full justify-start overflow-hidden rounded-none px-2 text-left font-normal',
        selectedActionId === action.actionId && 'bg-accent text-foreground',
      )}
    >
      <span className="block w-full truncate">
        {getActionResultPreview(action)}
      </span>
    </Button>
  );
};

const automationHistoryActionColumns: ColumnDef<AutomationHistoryActionTableRow>[] =
  [
    {
      id: 'createdAtValue',
      accessorKey: 'createdAtValue',
      header: () => <RecordTable.InlineHead label="Time" />,
      cell: ({ cell }) => (
        <RecordTableInlineCell>
          <RelativeDateDisplay.Value value={cell.getValue<string>()} />
        </RecordTableInlineCell>
      ),
      size: 144,
    },
    {
      id: 'actionTypeLabel',
      accessorKey: 'actionTypeLabel',
      header: () => <RecordTable.InlineHead label="Action Type" />,
      cell: ({ cell }) => (
        <RecordTableInlineCell>{cell.getValue<string>()}</RecordTableInlineCell>
      ),
      size: 256,
    },
    {
      id: 'durationMs',
      accessorKey: 'durationMs',
      header: () => <RecordTable.InlineHead label="Duration" />,
      cell: ({ row }) => (
        <RecordTableInlineCell>
          {formatExecutionDuration(row.original.durationMs)}
        </RecordTableInlineCell>
      ),
      size: 112,
    },
    {
      id: 'result',
      header: () => <RecordTable.InlineHead label="Results" />,
      cell: ({ row }) => (
        <RecordTableInlineCell className="p-0">
          <ActionResultCell action={row.original} />
        </RecordTableInlineCell>
      ),
      size: 560,
    },
  ];

const AutomationHistoryActionRow = ({
  isLast,
  ...props
}: ComponentProps<typeof RecordTable.Row> & { isLast: boolean }) => {
  return (
    <>
      <RecordTable.Row {...props} />
      {!isLast && (
        <tr>
          <td colSpan={automationHistoryActionColumns.length} className="py-2">
            <div className="flex items-center justify-center text-muted-foreground">
              <IconArrowDown />
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

export const AutomationHistoryByTable = () => {
  const { list, status, executionError, refetch, loading } =
    useAutomationHistoryResult();
  const { t } = useTranslation('automations');
  const tableList = list.map((action, index) => ({
    ...action,
    _id: action.actionId || `${action.actionType}-${index}`,
    executionStatus: status,
  }));

  return (
    <div className="flex h-full min-h-0 flex-col px-4">
      <div className="flex items-center justify-between gap-3 py-2">
        {executionError ? (
          <p className="flex min-w-0 items-center gap-2 text-xs text-destructive">
            <IconAlertTriangle className="size-4 shrink-0" />
            <span className="truncate" title={executionError}>
              {executionError}
            </span>
          </p>
        ) : (
          <span />
        )}
        <Button
          variant="ghost"
          disabled={loading}
          className="shrink-0"
          onClick={() => refetch()}
        >
          Reload <IconRefresh />
        </Button>
      </div>
      <RecordTable.Provider
        columns={automationHistoryActionColumns}
        data={tableList}
        className="min-h-0 flex-1"
      >
        <RecordTable.Scroll>
          <RecordTable>
            <RecordTable.Header />
            <RecordTable.Body>
              {loading && tableList.length === 0 ? (
                <RecordTable.RowSkeleton rows={8} />
              ) : (
                <RecordTable.RowList
                  Row={(props) => (
                    <AutomationHistoryActionRow
                      {...props}
                      isLast={
                        props.original === tableList[tableList.length - 1]
                      }
                    />
                  )}
                />
              )}
              {!loading && tableList.length === 0 && (
                <tr>
                  <td
                    colSpan={automationHistoryActionColumns.length}
                    className="py-10 text-center text-sm text-muted-foreground"
                  >
                    {t('no-results')}
                  </td>
                </tr>
              )}
            </RecordTable.Body>
          </RecordTable>
        </RecordTable.Scroll>
      </RecordTable.Provider>
    </div>
  );
};
