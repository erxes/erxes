import { AiAgentDetailSheetContent } from '@/automations/components/settings/components/agents/components/AiAgentDetailSheetContent';
import { AutomationSettingsPath } from '@/types/paths/AutomationPath';
import { useNavigate, useParams, useSearchParams } from 'react-router';

/**
 * The agent editor opened over the agents list. It is routed, so links from
 * approvals still land on it; closing returns to the list.
 */
export const AutomationAiAgentDetailSheet = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Back to the list with its filters; the step belongs to the sheet only.
  const close = () => {
    const params = new URLSearchParams(searchParams);
    params.delete('tab');
    const query = params.toString();
    navigate(`${AutomationSettingsPath.Agents}${query ? `?${query}` : ''}`);
  };

  const handleCreated = (agentId: string) => {
    const query = searchParams.toString();
    navigate(
      `${AutomationSettingsPath.Agents}/${agentId}${query ? `?${query}` : ''}`,
      { replace: true },
    );
  };

  return (
    <AiAgentDetailSheetContent
      agentId={id}
      onClose={close}
      onCreated={handleCreated}
      persistStepInUrl
    />
  );
};
