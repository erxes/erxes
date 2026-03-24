import {
  TAutomationTriggerComponent,
  getCoreAutomationTriggerComponent,
  isCoreAutomationTriggerType,
} from '@/automations/components/builder/nodes/triggers/coreAutomationTriggers';
import { RenderPluginsComponentWrapper } from '@/automations/components/common/RenderPluginsComponentWrapper';
import { splitAutomationNodeType } from 'ui-modules';

export const TriggerNodeConfigurationContent = ({
  type,
  config,
}: {
  type: string;
  config: any;
}) => {
  const [pluginName, moduleName] = splitAutomationNodeType(type || '');

  const isCoreTrigger = isCoreAutomationTriggerType(
    moduleName,
    TAutomationTriggerComponent.NodeContent,
  );

  if (isCoreTrigger) {
    const CoreTriggerComponent = getCoreAutomationTriggerComponent(
      moduleName,
      TAutomationTriggerComponent.NodeContent,
    );
    return (
      <div className="px-4 py-2">
        {CoreTriggerComponent ? (
          <CoreTriggerComponent config={config} />
        ) : (
          <></>
        )}
      </div>
    );
  }

  return (
    <div className="px-4 py-2">
      <RenderPluginsComponentWrapper
        pluginName={pluginName}
        moduleName={moduleName}
        props={{
          componentType: 'triggerConfigContent',
          type,
          config,
        }}
      />
    </div>
  );
};
