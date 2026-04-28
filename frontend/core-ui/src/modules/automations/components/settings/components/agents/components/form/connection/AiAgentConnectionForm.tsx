import { AiAgentProviderSelect } from '@/automations/components/settings/components/agents/components/form/connection/AiAgentProviderSelect';
import { CloudflareAiGatewayConnectionForm } from '@/automations/components/settings/components/agents/components/form/connection/providers/cloudflareAiGateway/CloudflareAiGatewayConnectionForm';
import { OpenAiConnectionForm } from '@/automations/components/settings/components/agents/components/form/connection/providers/openai/OpenAiConnectionForm';
import { TAiAgentForm } from '@/automations/components/settings/components/agents/states/AiAgentFormSchema';
import { useFormContext } from 'react-hook-form';

export const AiAgentConnectionForm = ({
  existingApiKeyMask,
  existingGatewayTokenMask,
}: {
  existingApiKeyMask?: string;
  existingGatewayTokenMask?: string;
}) => {
  const { watch } = useFormContext<TAiAgentForm>();
  const provider = watch('connection.provider');

  return (
    <div className="grid gap-4">
      <AiAgentProviderSelect />

      {provider === 'openai' ? (
        <OpenAiConnectionForm existingApiKeyMask={existingApiKeyMask} />
      ) : (
        <CloudflareAiGatewayConnectionForm
          existingApiKeyMask={existingApiKeyMask}
          existingGatewayTokenMask={existingGatewayTokenMask}
        />
      )}
    </div>
  );
};

