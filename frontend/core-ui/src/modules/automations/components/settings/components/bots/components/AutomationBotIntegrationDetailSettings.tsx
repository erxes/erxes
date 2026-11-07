import { AutomationBotIntegrationContent } from '@/automations/components/settings/components/bots/components/AutomationBotIntegrationContent';
import { AutomationBotIntegrationDetailHeader } from '@/automations/components/settings/components/bots/components/AutomationBotIntegrationDetailHeader';
import { useAutomationBotIntegrationDetail } from '@/automations/components/settings/components/bots/hooks/useAutomationBots';
import { IconRobotFace } from '@tabler/icons-react';
import { Spinner } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { AutomationBotsHeader } from './AutomationBotsHeader';

type Props = Readonly<{
  botType: string;
}>;

export const AutomationBotDetailSettings = ({ botType }: Props) => {
  const { t } = useTranslation('automations');
  const { botIntegrationConstant, loading, error } =
    useAutomationBotIntegrationDetail(botType);

  if (loading || error || !botIntegrationConstant) {
    return (
      <div className="flex min-h-0 flex-1 flex-col">
        <AutomationBotsHeader />
        {loading ? (
          <Spinner />
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 text-accent-foreground">
            <IconRobotFace className="size-24" />
            <h4 className="font-bold">{t('sidebar-something-went-wrong')}</h4>
            <span>{error}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <AutomationBotIntegrationContent
        botIntegrationConstant={botIntegrationConstant}
        renderHeader={(actions) => (
          <AutomationBotsHeader label={botIntegrationConstant.label}>
            {actions}
          </AutomationBotsHeader>
        )}
        listHeader={
          <AutomationBotIntegrationDetailHeader
            botIntegrationConstant={botIntegrationConstant}
          />
        }
      />
    </div>
  );
};
