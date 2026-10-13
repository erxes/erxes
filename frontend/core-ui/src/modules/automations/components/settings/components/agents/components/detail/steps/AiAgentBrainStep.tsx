import { AiAgentStepNotice } from '@/automations/components/settings/components/agents/components/detail/AiAgentStepNotice';
import { AiAgentModelSelect } from '@/automations/components/settings/components/agents/components/form/connection/AiAgentModelSelect';
import { AiAgentRuntimeForm } from '@/automations/components/settings/components/agents/components/form/AiAgentRuntimeForm';
import { AiAgentRuntimePresets } from '@/automations/components/settings/components/agents/components/form/AiAgentRuntimePresets';
import { Card } from 'erxes-ui';

export const AiAgentBrainStep = () => (
  <div className="grid gap-4">
    <AiAgentStepNotice step="brain" />
    <Card className="grid gap-5 p-4">
      <AiAgentModelSelect />
      <AiAgentRuntimePresets />
      <AiAgentRuntimeForm />
    </Card>
  </div>
);
