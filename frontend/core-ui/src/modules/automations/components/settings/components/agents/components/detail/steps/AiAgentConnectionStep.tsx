import { AiAgentStepNotice } from '@/automations/components/settings/components/agents/components/detail/AiAgentStepNotice';
import { AiAgentConnectionForm } from '@/automations/components/settings/components/agents/components/form/connection/AiAgentConnectionForm';
import { useAiAgentDetailContext } from '@/automations/components/settings/components/agents/context/AiAgentDetailContext';
import { IconLoader2 } from '@tabler/icons-react';
import { Button, Card } from 'erxes-ui';

export const AiAgentConnectionStep = () => {
  const { detail, isEditing, health } = useAiAgentDetailContext();
  const connection = detail?.connection;
  const gatewayTokenMask =
    connection?.provider === 'cloudflare-ai-gateway'
      ? String(connection.config?.gatewayToken || '') || undefined
      : undefined;

  return (
    <div className="grid gap-4">
      <AiAgentStepNotice step="connection" />
      <Card className="p-4">
        <AiAgentConnectionForm
          existingApiKeyMask={connection?.config?.apiKey}
          existingGatewayTokenMask={gatewayTokenMask}
        />
      </Card>
      {isEditing && (
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            onClick={() => void health.refetch()}
            disabled={health.loading}
          >
            {health.loading && <IconLoader2 className="size-4 animate-spin" />}
            Test saved connection
          </Button>
          <span className="text-xs text-muted-foreground">
            Checks run against the saved agent. Save first after changing the
            key.
          </span>
        </div>
      )}
    </div>
  );
};
