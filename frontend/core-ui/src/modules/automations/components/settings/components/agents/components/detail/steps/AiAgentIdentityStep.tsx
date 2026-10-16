import { AiAgentUsageCard } from '@/automations/components/settings/components/agents/components/AiAgentUsageCard';
import { AiAgentStepNotice } from '@/automations/components/settings/components/agents/components/detail/AiAgentStepNotice';
import { AiAgentGeneralForm } from '@/automations/components/settings/components/agents/components/form/AiAgentGeneralForm';
import { useAiAgentDetailContext } from '@/automations/components/settings/components/agents/context/AiAgentDetailContext';
import { Card } from 'erxes-ui';

export const AiAgentIdentityStep = () => {
  const { detail, isEditing } = useAiAgentDetailContext();

  return (
    <div className="grid gap-4">
      <AiAgentStepNotice step="identity" />
      <Card className="p-4">
        <AiAgentGeneralForm />
      </Card>
      {isEditing && <AiAgentUsageCard usage={detail?.usage} />}
    </div>
  );
};
