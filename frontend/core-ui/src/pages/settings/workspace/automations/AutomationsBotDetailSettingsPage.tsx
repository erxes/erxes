import { AutomationBotIntegrationDetailLayout } from '@/automations/components/settings/components/bots/components/AutomationBotIntegrationDetailLayout';
import { AutomationBotDetailSettings } from '@/automations/components/settings/components/bots/components/AutomationBotIntegrationDetailSettings';
import { useParams } from 'react-router';

export const AutomationBotDetailSettingsPage = () => {
  const { type } = useParams();

  if (!type) {
    return null;
  }

  return (
    <AutomationBotIntegrationDetailLayout>
      <AutomationBotDetailSettings botType={type} />
    </AutomationBotIntegrationDetailLayout>
  );
};
