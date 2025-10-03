import { RenderPluginsComponentWrapper } from '@/automations/utils/RenderPluginsComponentWrapper';
import { getAutomationTypes } from 'ui-modules';

export const TriggerNodeConfigurationContent = ({
  type,
  config,
}: {
  type: string;
  config: any;
}) => {
  const [pluginName, moduleName] = getAutomationTypes(type || '');

  return (
    <RenderPluginsComponentWrapper
      pluginName={pluginName}
      moduleName={moduleName}
      props={{
        componentType: 'triggerConfigContent',
        type,
        config,
      }}
    />
  );
};
