import { IAutomationBot } from '@/automations/components/settings/components/bots/types/automationBots';
import { RenderPluginsComponentWrapper } from '@/automations/components/common/RenderPluginsComponentWrapper';
import { type ReactNode } from 'react';

export const AutomationBotIntegrationContent = ({
  botIntegrationConstant,
  renderHeader,
  listHeader,
}: Readonly<{
  botIntegrationConstant: IAutomationBot;
  renderHeader: (actions: ReactNode) => ReactNode;
  listHeader: ReactNode;
}>) => {
  return (
    <RenderPluginsComponentWrapper
      pluginName={botIntegrationConstant.pluginName}
      moduleName={botIntegrationConstant.moduleName}
      props={{
        componentType: 'automationBotsContent',
        renderHeader,
        listHeader,
      }}
    />
  );
};
