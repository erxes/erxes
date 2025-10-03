import { coreActionNames } from '@/automations/components/builder/nodes/actions/CoreActions';
import { SendEmail } from '@/automations/components/builder/nodes/actions/sendEmail/components/SendEmail';
import { RenderPluginsComponentWrapper } from '@/automations/utils/RenderPluginsComponentWrapper';
import { format, isValid } from 'date-fns';
import { isEnabled, RelativeDateDisplay, Table } from 'erxes-ui';
import {
  getAutomationTypes,
  IAutomationHistory,
  IAutomationHistoryAction,
  IAutomationsActionConfigConstants,
  IAutomationsTriggerConfigConstants,
} from 'ui-modules';

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
    return <SendEmail.ActionResult result={result} />;
  }

  const isCoreAction = coreActionNames.includes(action?.actionType);

  const [pluginName, moduleName] = getAutomationTypes(action?.actionType);

  if (!isCoreAction && isEnabled(pluginName) && moduleName) {
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
  constants,
  history,
}: {
  history: IAutomationHistory;
  constants: {
    triggersConst: IAutomationsTriggerConfigConstants[];
    actionsConst: IAutomationsActionConfigConstants[];
  };
}) => {
  const { actionsConst } = constants;
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
