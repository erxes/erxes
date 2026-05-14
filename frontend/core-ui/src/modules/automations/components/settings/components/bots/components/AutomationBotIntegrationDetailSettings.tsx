import { AutomationBotIntegrationContent } from '@/automations/components/settings/components/bots/components/AutomationBotIntegrationContent';
import { AutomationBotIntegrationDetailHeader } from '@/automations/components/settings/components/bots/components/AutomationBotIntegrationDetailHeader';
import { useAutomationBotIntegrationDetail } from '@/automations/components/settings/components/bots/hooks/useAutomationBots';
import { IconRobotFace } from '@tabler/icons-react';

type Props = {
  botType: string;
};

export const AutomationBotDetailSettings = ({ botType }: Props) => {
  const { botIntegrationConstant, totalCount, loading, error } =
    useAutomationBotIntegrationDetail(botType);

  if (error || !botIntegrationConstant) {
    return (
      <div className="w-full flex flex-col gap-4 justify-center items-center text-accent-foreground">
        <IconRobotFace className="size-24" />
        <h4 className="font-bold">Something went wrong</h4>
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <AutomationBotIntegrationDetailHeader
        botIntegrationConstant={botIntegrationConstant}
      />
      <AutomationBotIntegrationContent
        botIntegrationConstant={botIntegrationConstant}
      />
    </div>
  );
};
