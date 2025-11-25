import { IAutomationBot } from '@/automations/components/settings/components/bots/types/automationBots';
import { RenderPluginsComponentWrapper } from '@/automations/components/common/RenderPluginsComponentWrapper';

export const AutomationBotIntegrationContent = ({
  botIntegrationConstant,
}: {
  botIntegrationConstant: IAutomationBot;
}) => {
  return (
    <RenderPluginsComponentWrapper
      pluginName={botIntegrationConstant.pluginName}
      moduleName={botIntegrationConstant.moduleName}
      props={{
        componentType: 'automationBotsContent',
      }}
    />
  );
};
