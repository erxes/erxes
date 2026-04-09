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
import { Button, RelativeDateDisplay, Table } from 'erxes-ui';
import {
  IAutomationHistory,
  IAutomationHistoryAction,
  splitAutomationNodeType,
} from 'ui-modules';

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
    const resultList = result?.result || [];
    const errors = resultList.map((r: any) => r.error || '').join(', ');

    return `Update for ${resultList.length} ${result.module}: ${
      result.fields || ''
    }, (${errors})`;
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
    const resultList = result?.result || [];
    const errors = resultList.map((r: any) => r.error || '').join(', ');

    return `Update for ${resultList.length} ${result.module}: ${
      result.fields || ''
    }, (${errors})`;
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

export const AutomationHistoryByTable = () => {
  const { list, status, refetch, loading } = useAutomationHistoryResult();
  return (
    <div className="px-4">
      <Button variant="ghost" disabled={loading} onClick={() => refetch()}>
        Reload <IconRefresh />
      </Button>
      <Table>
        <Table.Header className="[&_th]:w-40">
          <Table.Row>
            <Table.Head className="w-36!">Time</Table.Head>
            <Table.Head className="w-64!">Action Type</Table.Head>
            <Table.Head className="w-28!">Duration</Table.Head>
            <Table.Head>Results</Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {list.map(({ actionTypeLabel, createdAtValue, ...action }, index) => {
            return (
              <>
                <Table.Row key={index}>
                  <Table.Cell>
                    <RelativeDateDisplay.Value value={createdAtValue} />
                  </Table.Cell>
                  <Table.Cell>{actionTypeLabel}</Table.Cell>
                  <Table.Cell>
                    {formatExecutionDuration(action.durationMs)}
                  </Table.Cell>
                  <Table.Cell className="p-0">
                    <AutomationHistoryPopoverValue
                      className="h-10"
                      preview={getExecutionActionResultPreview(action)}
                      content={
                        <ExecutionActionResult
                          action={action}
                          status={status}
                        />
                      }
                    />
                  </Table.Cell>
                </Table.Row>
                {list.length - 1 > index && (
                  <tr>
                    <td colSpan={4} className="text-center py-2">
                      <div className="flex items-center justify-center">
                        <IconArrowDown />
                      </div>
                    </td>
                  </tr>
                )}
              </>
            );
          })}
        </Table.Body>
      </Table>
    </div>
  );
};
