import {
  AutomationHistoryPopoverValue,
  stringifyAutomationHistoryValue,
} from '@/automations/components/builder/history/components/AutomationHistoryPopoverValue';
import { useAutomationHistoryResult } from '@/automations/components/builder/history/hooks/useAutomationHistoryResult';
import {
  getCoreAutomationActionComponent,
  isCoreAutomationActionType,
} from '@/automations/components/builder/nodes/actions/coreAutomationActions';
import { AutomationSendEmailActionResult } from '@/automations/components/builder/nodes/actions/sendEmail/components/SendEmailActionResult';
import { TAutomationActionComponent } from '@/automations/components/builder/nodes/types/coreAutomationActionTypes';
import { RenderPluginsComponentWrapper } from '@/automations/components/common/RenderPluginsComponentWrapper';
import { useAutomationsRemoteModules } from '@/automations/utils/useAutomationsModules';
import { IconArrowDown, IconRefresh } from '@tabler/icons-react';
import { type ColumnDef } from '@tanstack/table-core';
import {
  Button,
  RecordTable,
  RecordTableInlineCell,
  RelativeDateDisplay,
} from 'erxes-ui';
import { type ComponentProps } from 'react';
import { useTranslation } from 'react-i18next';
import {
  IAutomationHistory,
  IAutomationHistoryAction,
  splitAutomationNodeType,
} from 'ui-modules';

type AutomationHistoryActionTableRow = IAutomationHistoryAction & {
  _id: string;
  actionTypeLabel: string;
  createdAtValue: string;
  executionStatus: IAutomationHistory['status'];
};

const getHistoryResultErrorText = (value: unknown) => {
  const text = stringifyAutomationHistoryValue(value);

  return text || 'Action failed';
};

const formatExecutionDuration = (durationMs?: number) => {
  if (typeof durationMs !== 'number' || durationMs < 0) {
    return 'N/A';
  }

  if (durationMs < 1000) {
    return `${durationMs} ms`;
  }

  if (durationMs < 60_000) {
    return `${(durationMs / 1000).toFixed(durationMs < 10_000 ? 2 : 1)} s`;
  }

  const minutes = Math.floor(durationMs / 60_000);
  const seconds = ((durationMs % 60_000) / 1000).toFixed(1);

  return `${minutes}m ${seconds}s`;
};

const getSetPropertyResultSummary = (result: any) => {
  if (result?.target && Array.isArray(result?.changes)) {
    const fields = result.changes
      .map((change: any) => change.fieldLabel || change.field)
      .filter(Boolean)
      .join(', ');

    return fields
      ? `Updated ${result.target.count} ${result.target.label}: ${fields}`
      : `Updated ${result.target.count} ${result.target.label}`;
  }

  if (typeof result?.summary === 'string') {
    return result.summary;
  }

  const resultList = result?.result || [];
  const errors = resultList.map((r: any) => r.error || '').join(', ');

  return `Update for ${resultList.length} ${result.module}: ${
    result.fields || ''
  }, (${errors})`;
};

const formatSetPropertyValue = (value: unknown, emptyLabel: string) => {
  if (value === undefined || value === null || value === '') {
    return emptyLabel;
  }

  return stringifyAutomationHistoryValue(value);
};

const getSetPropertyStatusClassName = (status?: string) => {
  if (status === 'failed') {
    return 'text-destructive';
  }

  if (status === 'skipped') {
    return 'text-muted-foreground';
  }

  return 'text-green-500';
};

const SetPropertyActionResult = ({ result }: { result: any }) => {
  const { t } = useTranslation('automations');

  if (!Array.isArray(result?.changes)) {
    return getSetPropertyResultSummary(result);
  }

  const target = result.target || {};
  const targetLabel = target.label || result.module || t('property-type');
  const targetCount = target.count ?? result.changes.length;

  return (
    <div className="min-w-[420px] max-w-[560px] space-y-3 text-sm">
      <div>
        <div className="font-medium">
          {t('set-property-updated-target', {
            count: targetCount,
            target: targetLabel,
          })}
        </div>
        <div className="text-xs text-muted-foreground">
          {t('set-property-change-count', {
            count: result.changes.length,
          })}
        </div>
      </div>
      <div className="divide-y divide-border">
        {result.changes.map((change: any, index: number) => (
          <div key={`${change.field}-${index}`} className="py-2 first:pt-0">
            <div className="flex items-center justify-between gap-4">
              <span className="font-medium">
                {change.fieldLabel || change.field}
              </span>
              <span
                className={`text-xs font-medium ${getSetPropertyStatusClassName(
                  change.status,
                )}`}
              >
                {t(`set-property-status-${change.status || 'updated'}`)}
              </span>
            </div>

            <div className="mt-1 grid grid-cols-[56px_1fr] gap-x-2 gap-y-1 text-xs">
              <span className="text-muted-foreground">{t('value')}</span>
              <span className="break-words font-medium">
                {formatSetPropertyValue(
                  change.value,
                  t('set-property-empty-value'),
                )}
              </span>
              {change.placeholder && (
                <>
                  <span className="text-muted-foreground">
                    {t('set-property-from')}
                  </span>
                  <span className="break-all font-mono text-muted-foreground">
                    {change.placeholder}
                  </span>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const getExecutionActionResultPreview = (
  action: IAutomationHistoryAction,
): string => {
  if (action.actionType === 'delay') {
    const { value, type } = action?.actionConfig || {};
    return `Delaying for: ${value} ${type}s`;
  }

  if (!action.result) {
    return 'Result has not been recorded yet';
  }

  const { result } = action;

  if (result.error) {
    return getHistoryResultErrorText(result.error);
  }

  if (action.actionType === 'setProperty') {
    return getSetPropertyResultSummary(result);
  }

  if (action.actionType === 'if') {
    return `Condition: ${result.condition}`;
  }

  if (action.actionType === 'sendEmail') {
    return result?.response?.error
      ? getHistoryResultErrorText(result.response.error)
      : 'Sent successfully';
  }

  if (action.actionType === 'outgoingWebhook') {
    if (result?.error?.message) {
      const attemptCount =
        result?.meta?.attemptCount || result?.error?.attemptCount;
      return attemptCount
        ? `${result.error.message} (${attemptCount} attempts)`
        : result.error.message;
    }

    if (result?.response?.status) {
      const statusText = result?.response?.statusText
        ? ` ${result.response.statusText}`
        : '';
      return `${result.response.status}${statusText}`;
    }
  }

  if (action.actionType === 'aiAgent') {
    if (result.type === 'generateText') {
      return result.text || 'Generated text';
    }

    if (result.type === 'splitTopic') {
      return result.topicId
        ? `Matched topic: ${result.topicId}`
        : 'No matching topic';
    }

    if (result.type === 'classification') {
      return stringifyAutomationHistoryValue(result.attributes || {});
    }
  }

  return stringifyAutomationHistoryValue(result);
};

export const ExecutionActionResult = ({
  action,
  status,
}: {
  action: IAutomationHistoryAction;
  status: IAutomationHistory['status'];
}) => {
  if (action.actionType === 'delay') {
    const { value, type } = action?.actionConfig || {};
    return `Delaying for: ${value} ${type}s`;
  }

  if (!action.result) {
    return 'Result has not been recorded yet';
  }

  const { result } = action;

  if (result.error) {
    return (
      <pre className="font-mono text-xs whitespace-pre-wrap break-words">
        {getHistoryResultErrorText(result.error)}
      </pre>
    );
  }

  if (action.actionType === 'setProperty') {
    return <SetPropertyActionResult result={result} />;
  }

  if (action.actionType === 'if') {
    return `Condition: ${result.condition}`;
  }

  if (action.actionType === 'sendEmail') {
    return (
      <AutomationSendEmailActionResult
        result={result}
        action={action}
        status={status}
      />
    );
  }

  const isCoreAction = isCoreAutomationActionType(
    action?.actionType,
    TAutomationActionComponent.ActionResult,
  );

  if (isCoreAction) {
    const CoreActionComponent = getCoreAutomationActionComponent(
      action?.actionType,
      TAutomationActionComponent.ActionResult,
    );

    if (CoreActionComponent) {
      return (
        <CoreActionComponent
          result={action.result}
          action={action}
          status={status}
        />
      );
    }
  }

  const [pluginName, moduleName] = splitAutomationNodeType(action?.actionType);
  const { isEnabled } = useAutomationsRemoteModules(pluginName);

  if (!isCoreAction && isEnabled) {
    return (
      <RenderPluginsComponentWrapper
        pluginName={pluginName}
        moduleName={moduleName}
        props={{
          componentType: 'historyActionResult',
          result: action.result,
          action,
          status,
        }}
      />
    );
  }

  return (
    <pre className="font-mono text-xs whitespace-pre-wrap break-words">
      {stringifyAutomationHistoryValue(result)}
    </pre>
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
          <AutomationHistoryPopoverValue
            className="h-10"
            preview={getExecutionActionResultPreview(row.original)}
            content={
              <ExecutionActionResult
                action={row.original}
                status={row.original.executionStatus}
              />
            }
          />
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
  const { list, status, refetch, loading } = useAutomationHistoryResult();
  const { t } = useTranslation('automations');
  const tableList = list.map((action, index) => ({
    ...action,
    _id: action.actionId || `${action.actionType}-${index}`,
    executionStatus: status,
  }));

  return (
    <div className="flex h-full min-h-0 flex-col px-4">
      <div className="flex justify-end py-2">
        <Button variant="ghost" disabled={loading} onClick={() => refetch()}>
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
                      isLast={props.original === tableList[tableList.length - 1]}
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
