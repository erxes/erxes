import { useAutomationBotTotalCount } from '@/automations/components/settings/components/bots/hooks/useAutomationBots';
import { IAutomationBot } from '@/automations/components/settings/components/bots/types/automationBots';
import { Badge, getPluginAssetsUrl, Spinner } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const AutomationBotIntegrationDetailHeader = ({
  botIntegrationConstant,
}: Readonly<{
  botIntegrationConstant: IAutomationBot;
}>) => {
  const { t } = useTranslation('automations');
  const { name, label, logo, pluginName, totalCountQueryName } =
    botIntegrationConstant || {};

  const { loading, totalCount } =
    useAutomationBotTotalCount(totalCountQueryName);

  return (
    <div className="flex min-w-0 items-center justify-between gap-4">
      <div className="flex min-w-0 items-center gap-3">
        <div className="size-10 shrink-0 overflow-hidden rounded-lg border bg-background">
          <img
            src={getPluginAssetsUrl(pluginName, logo)}
            alt={name}
            className="w-full h-full object-contain p-1"
          />
        </div>
        <div className="min-w-0 space-y-1">
          <h2 className="truncate text-base font-semibold">{label}</h2>
          <p className="text-sm text-muted-foreground">
            {t('settings-bots-connect-manage', { label })}
          </p>
        </div>
      </div>
      <Badge variant="secondary" className="shrink-0 font-normal">
        {loading ? (
          <Spinner className="size-3" containerClassName="inline-flex" />
        ) : (
          `${totalCount} ${t('settings-bots')}`
        )}
      </Badge>
    </div>
  );
};
