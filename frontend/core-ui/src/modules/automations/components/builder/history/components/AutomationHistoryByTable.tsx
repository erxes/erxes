import { isCoreAutomationActionType } from '@/automations/components/builder/nodes/actions/coreAutomationActions';
import { AutomationSendEmailActionResult } from '@/automations/components/builder/nodes/actions/sendEmail/components/SendEmailActionResult';
import { useAutomation } from '@/automations/context/AutomationProvider';
import { RenderPluginsComponentWrapper } from '@/automations/components/common/RenderPluginsComponentWrapper';
import { format, isValid } from 'date-fns';
import { RelativeDateDisplay, Table } from 'erxes-ui';
import {
  splitAutomationNodeType,
  IAutomationHistory,
  IAutomationHistoryAction,
} from 'ui-modules';
import { useAutomationsRemoteModules } from '@/automations/utils/useAutomationsModules';
import { TAutomationActionComponent } from '@/automations/components/builder/nodes/types/coreAutomationActionTypes';

export const ExecutionActionResult = ({
  action,
}: {
  action: IAutomationHistoryAction;
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
        }}
      />
    );
  }

  return JSON.stringify(result);
};

export const AutomationHistoryByTable = ({
  history,
}: {
  history: IAutomationHistory;
}) => {
  const { actionsConst } = useAutomation();
  const { actions = [] } = history;

  return (
    <div className="px-4">
      <Table>
        <Table.Header className="[&_th]:w-40">
          <Table.Row>
            <Table.Head className="!w-36">Time</Table.Head>
            <Table.Head className="!w-64">Action Type</Table.Head>
            <Table.Head>Results</Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {[...actions]
            .sort(
              (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime(),
            )
            .map((action, index) => {
              const date = action.createdAt ? new Date(action.createdAt) : '';
              const createdAt = isValid(date)
                ? format(date, 'yyyy-MM-dd HH:mm:ss')
                : 'N/A';

              return (
                <Table.Row key={index}>
                  <Table.Cell>
                    <RelativeDateDisplay.Value value={createdAt} />
                  </Table.Cell>
                  <Table.Cell>
                    {actionsConst.find(({ type }) => type === action.actionType)
                      ?.label ||
                      action.actionType ||
                      'Empty'}
                  </Table.Cell>
                  <Table.Cell className="overflow-x-auto">
                    <ExecutionActionResult action={action} />
                  </Table.Cell>
                </Table.Row>
              );
            })}
        </Table.Body>
      </Table>
    </div>
  );
};
