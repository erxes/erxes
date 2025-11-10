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
import { useAutomationExecutionDetail } from '../hooks/useAutomationExecutionDetail';

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
    return result.error;
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
    return <AutomationSendEmailActionResult result={result} />;
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

  return JSON.stringify(result);
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
            <Table.Head className="!w-36">Time</Table.Head>
            <Table.Head className="!w-64">Action Type</Table.Head>
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
                  <Table.Cell className="overflow-x-auto">
                    <ExecutionActionResult action={action} status={status} />
                  </Table.Cell>
                </Table.Row>
                {list.length - 1 > index && (
                  <tr>
                    <td colSpan={3} className="text-center py-2">
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
