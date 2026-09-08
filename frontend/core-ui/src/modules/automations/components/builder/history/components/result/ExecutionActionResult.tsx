import {
  getCoreAutomationActionComponent,
  isCoreAutomationActionType,
} from '@/automations/components/builder/nodes/actions/coreAutomationActions';
import { TAutomationActionComponent } from '@/automations/components/builder/nodes/types/coreAutomationActionTypes';
import { RenderPluginsComponentWrapper } from '@/automations/components/common/RenderPluginsComponentWrapper';
import { useAutomationsRemoteModules } from '@/automations/utils/useAutomationsModules';
import { getActionResultErrorText } from '@/automations/utils/automationHistoryUtils/executionResultPreview';
import {
  ActionResult,
  IAutomationHistory,
  IAutomationHistoryAction,
  splitAutomationNodeType,
} from 'ui-modules';

type ExecutionActionResultProps = {
  action: IAutomationHistoryAction;
  status: IAutomationHistory['status'];
};

const PluginActionResult = ({ action, status }: ExecutionActionResultProps) => {
  const [pluginName, moduleName] = splitAutomationNodeType(action.actionType);
  const { isEnabled } = useAutomationsRemoteModules(pluginName);

  if (!isEnabled) {
    return <ActionResult.Json value={action.result} />;
  }

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
};

/**
 * Resolves an action's result renderer: the action's own component first, then
 * the owning plugin, then the raw payload. The history views never special-case
 * an action type themselves.
 */
export const ExecutionActionResult = ({
  action,
  status,
}: ExecutionActionResultProps) => {
  const CoreActionResult = isCoreAutomationActionType(
    action.actionType,
    TAutomationActionComponent.ActionResult,
  )
    ? getCoreAutomationActionComponent(
        action.actionType,
        TAutomationActionComponent.ActionResult,
      )
    : null;

  // A failure is presented the same way whatever the action type: an action's
  // own renderer only knows how to lay out a successful payload, and reading
  // one as a result would style the error as a success.
  if (action.result?.error) {
    return (
      <ActionResult>
        <ActionResult.Status status="error">
          {getActionResultErrorText(action.result.error)}
        </ActionResult.Status>
        {action.result.result ? (
          <ActionResult.Body title="Failure details">
            <ActionResult.Json value={action.result.result} />
          </ActionResult.Body>
        ) : null}
      </ActionResult>
    );
  }

  if (CoreActionResult) {
    return (
      <ActionResult>
        <CoreActionResult
          result={action.result}
          action={action}
          status={status}
        />
      </ActionResult>
    );
  }

  return (
    <ActionResult>
      <PluginActionResult action={action} status={status} />
    </ActionResult>
  );
};
