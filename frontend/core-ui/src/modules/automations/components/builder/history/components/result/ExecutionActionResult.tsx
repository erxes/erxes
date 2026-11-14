import { GenericActionResult } from '@/automations/components/builder/history/components/result/ActionResultShapeView';
import { ActionStatusResult } from '@/automations/components/builder/history/components/result/ActionStatusResult';
import { useExecutionActionResult } from '@/automations/components/builder/history/hooks/useExecutionActionResult';
import { RenderPluginsComponentWrapper } from '@/automations/components/common/RenderPluginsComponentWrapper';
import { useAutomationsRemoteModules } from '@/automations/utils/useAutomationsModules';
import {
  ActionResult,
  IAutomationHistory,
  IAutomationHistoryAction,
  splitAutomationNodeType,
} from 'ui-modules';
import { useTranslation } from 'react-i18next';

type ExecutionActionResultProps = {
  action: IAutomationHistoryAction;
  status: IAutomationHistory['status'];
};

const PluginActionResult = ({ action, status }: ExecutionActionResultProps) => {
  const [pluginName, moduleName] = splitAutomationNodeType(action.actionType);
  const { isEnabled } = useAutomationsRemoteModules(pluginName);

  if (!isEnabled) {
    return <GenericActionResult value={action.result} />;
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
 * Resolves an action's result renderer. The engine's outcome is drawn here for
 * every action; a success goes to the action's own component, then the owning
 * plugin, then the shape-based fallback. The raw payload is always last and
 * closed.
 */
export const ExecutionActionResult = ({
  action,
  status,
}: ExecutionActionResultProps) => {
  const { t } = useTranslation('automations');
  const { CoreActionResult, engineOutcome } = useExecutionActionResult(action);

  const renderContent = () => {
    if (engineOutcome) {
      return <ActionStatusResult view={engineOutcome} />;
    }

    if (CoreActionResult) {
      return (
        <CoreActionResult
          result={action.result}
          action={action}
          status={status}
        />
      );
    }

    return <PluginActionResult action={action} status={status} />;
  };

  return (
    <ActionResult>
      {renderContent()}
      <ActionResult.Raw value={action.result} label={t('history-result-raw')} />
    </ActionResult>
  );
};
