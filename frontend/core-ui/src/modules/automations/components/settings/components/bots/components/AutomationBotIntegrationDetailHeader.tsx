import { useAutomationBotTotalCount } from '@/automations/components/settings/components/bots/hooks/useAutomationBots';
import { IAutomationBot } from '@/automations/components/settings/components/bots/types/automationBots';
import { IconPlus } from '@tabler/icons-react';
import { Button, cn, getPluginAssetsUrl, Sheet, Spinner } from 'erxes-ui';

export const AutomationBotIntegrationDetailHeader = ({
  botIntegrationConstant,
}: {
  botIntegrationConstant: IAutomationBot;
}) => {
  const { name, label, logo, pluginName, totalCountQueryName } =
    botIntegrationConstant || {};

  const { loading, totalCount } =
    useAutomationBotTotalCount(totalCountQueryName);

  return (
    <div className="w-96">
      <div className="flex gap-2">
        <div
          className={cn(
            'size-8 rounded overflow-hidden shadow-sm bg-background',
          )}
        >
          <img
            src={getPluginAssetsUrl(pluginName, logo)}
            alt={name}
            className="w-full h-full object-contain p-1"
          />
        </div>
        <h6 className="font-semibold text-sm self-center">{label}</h6>
        <div className="text-xs text-muted-foreground font-mono ml-auto">
          {loading ? <Spinner /> : totalCount}
        </div>
      </div>
      <div className="text-sm text-muted-foreground font-medium py-2">
        {`Connect and manage ${label} bots`}
      </div>
    </div>
  );
};
