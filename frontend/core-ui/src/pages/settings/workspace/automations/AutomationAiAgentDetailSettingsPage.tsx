import { AutomationAiAgentDetail } from '@/automations/components/settings/components/agents/components/AutomationAiAgentDetail';
import { useAiAgentDetail } from '@/automations/components/settings/components/agents/hooks/useAiAgentDetail';

export const AutomationAiAgentDetailSettingsPage = () => {
  const { detail, handleSave } = useAiAgentDetail();

  return <AutomationAiAgentDetail detail={detail} handleSave={handleSave} />;
};
