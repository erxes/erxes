import { useAiAgentDetailContext } from '@/automations/components/settings/components/agents/context/AiAgentDetailContext';
import { TAiAgentHealthCheckStatus } from '@/automations/components/settings/components/agents/hooks/useAiAgentHealth';
import { IconLoader2 } from '@tabler/icons-react';
import {
  Alert,
  Badge,
  Button,
  Card,
  RelativeDateDisplay,
  Skeleton,
} from 'erxes-ui';

const HEALTH_LABELS: Record<string, string> = {
  schema: 'Schema',
  credentials: 'Credentials',
  files: 'Context files',
  endpoint: 'Endpoint',
  model: 'Model access',
};

const CHECK_VARIANTS: Record<
  TAiAgentHealthCheckStatus,
  'success' | 'warning' | 'destructive' | 'secondary'
> = {
  ok: 'success',
  warning: 'warning',
  error: 'destructive',
  skipped: 'secondary',
};

const isValidDate = (value?: string) =>
  !!value && !Number.isNaN(new Date(value).getTime());

export const AiAgentTestStep = () => {
  const { isEditing, health: healthState } = useAiAgentDetailContext();
  const { health, loading, refetch } = healthState;

  if (!isEditing) {
    return (
      <Alert variant="warning">
        <Alert.Title>Save the agent first</Alert.Title>
        <Alert.Description>
          Checks run against the saved agent, so they become available once it
          has been created.
        </Alert.Description>
      </Alert>
    );
  }

  return (
    <div className="grid gap-4">
      <Card className="flex items-start justify-between gap-4 p-4">
        <div className="space-y-1">
          <h3 className="text-sm font-medium">Health check</h3>
          <p className="text-sm text-muted-foreground">
            Validates schema, credentials, model access, and context files with
            the provider.
          </p>
          {health && (
            <p className="text-xs text-muted-foreground">
              Last checked{' '}
              {isValidDate(health.checkedAt) ? (
                <RelativeDateDisplay.Value value={health.checkedAt} />
              ) : (
                'just now'
              )}
            </p>
          )}
        </div>
        <Button
          variant="secondary"
          onClick={() => void refetch()}
          disabled={loading}
        >
          {loading && <IconLoader2 className="size-4 animate-spin" />}
          {loading ? 'Checking…' : 'Run check'}
        </Button>
      </Card>

      {loading && !health && (
        <Card className="space-y-3 p-4">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </Card>
      )}

      {health && (
        <>
          <Card className="grid gap-3 p-4 md:grid-cols-2">
            {Object.entries(health.checks || {}).map(([key, status]) => (
              <div
                key={key}
                className="flex items-center justify-between rounded-md border bg-muted/20 px-3 py-2"
              >
                <span className="text-sm font-medium">
                  {HEALTH_LABELS[key] || key}
                </span>
                <Badge variant={CHECK_VARIANTS[status]}>{status}</Badge>
              </div>
            ))}
          </Card>

          {health.errors?.map((error, index) => (
            <Alert key={`error-${index}`} variant="destructive">
              <Alert.Description>{error}</Alert.Description>
            </Alert>
          ))}
          {health.warnings?.map((warning, index) => (
            <Alert key={`warning-${index}`} variant="warning">
              <Alert.Description>{warning}</Alert.Description>
            </Alert>
          ))}
        </>
      )}
    </div>
  );
};
