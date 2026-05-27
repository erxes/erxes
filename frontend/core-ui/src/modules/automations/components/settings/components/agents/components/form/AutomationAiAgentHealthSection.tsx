import { AUTOMATIONS_AI_AGENT_HEALTH } from '@/automations/components/settings/components/agents/graphql/automationsAiAgents';
import { useQuery } from '@apollo/client';
import {
  Alert,
  Badge,
  Button,
  Card,
  RelativeDateDisplay,
  Skeleton,
} from 'erxes-ui';

type THealthStatus = 'ok' | 'warning' | 'error' | 'skipped';

type TAiAgentHealthResponse = {
  automationsAiAgentHealth?: {
    ready: boolean;
    checkedAt: string;
    errors: string[];
    warnings: string[];
    checks?: Record<string, THealthStatus>;
  };
};

const HEALTH_LABELS: Record<string, string> = {
  schema: 'Schema',
  credentials: 'Credentials',
  files: 'Context Files',
  endpoint: 'Endpoint',
  model: 'Model Access',
};

const isValidDateValue = (value?: string) => {
  return !!value && !Number.isNaN(new Date(value).getTime());
};

const getStatusVariant = (status?: THealthStatus) => {
  if (status === 'ok') {
    return 'success';
  }

  if (status === 'warning') {
    return 'warning';
  }

  if (status === 'error') {
    return 'destructive';
  }

  return 'secondary';
};

const getSummaryVariant = (
  health?: TAiAgentHealthResponse['automationsAiAgentHealth'],
) => {
  if (health?.ready) {
    return 'default' as const;
  }

  if ((health?.errors?.length || 0) > 0) {
    return 'destructive' as const;
  }

  return 'warning' as const;
};

export const AutomationAiAgentHealthSection = ({
  agentId,
}: {
  agentId?: string;
}) => {
  const { data, loading, refetch } = useQuery<TAiAgentHealthResponse>(
    AUTOMATIONS_AI_AGENT_HEALTH,
    {
      variables: { agentId },
      skip: !agentId,
      notifyOnNetworkStatusChange: true,
    },
  );

  const health = data?.automationsAiAgentHealth;

  if (!agentId) {
    return (
      <Alert variant="warning">
        <Alert.Title>Save the agent first</Alert.Title>
        <Alert.Description>
          Health checks become available after the agent has been created and an
          ID exists in the workspace.
        </Alert.Description>
      </Alert>
    );
  }

  return (
    <div className="grid gap-4">
      <Card className="flex items-start justify-between gap-4 p-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-medium">Provider Health</h3>
            {health ? (
              <Badge variant={health.ready ? 'success' : 'destructive'}>
                {health.ready ? 'Ready' : 'Needs attention'}
              </Badge>
            ) : null}
          </div>
          <p className="text-sm text-muted-foreground">
            Validate schema, credentials, model access, and runtime context
            before wiring this agent into automation actions.
          </p>
          {health ? (
            <div className="text-xs text-muted-foreground">
              Last checked{' '}
              {isValidDateValue(health.checkedAt) ? (
                <RelativeDateDisplay.Value value={health.checkedAt} />
              ) : (
                'just now'
              )}
            </div>
          ) : null}
        </div>

        <Button
          variant="secondary"
          onClick={() => refetch()}
          disabled={loading}
        >
          {loading ? 'Checking...' : 'Run health check'}
        </Button>
      </Card>

      {loading && !health ? (
        <Card className="space-y-3 p-4">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </Card>
      ) : null}

      {health ? (
        <>
          <Alert variant={getSummaryVariant(health)}>
            <Alert.Title>
              {health.ready
                ? 'This agent is ready for provider calls.'
                : 'This agent still needs attention before execution.'}
            </Alert.Title>
            <Alert.Description>
              {(health.errors?.length || 0) > 0
                ? `${health.errors.length} error(s) found.`
                : `${health.warnings?.length || 0} warning(s) found.`}
            </Alert.Description>
          </Alert>

          <Card className="p-4">
            <div className="grid gap-3 md:grid-cols-2">
              {Object.entries(health.checks || {}).map(([key, status]) => (
                <div
                  key={key}
                  className="flex items-center justify-between rounded-md border bg-muted/20 px-3 py-2"
                >
                  <span className="text-sm font-medium">
                    {HEALTH_LABELS[key] || key}
                  </span>
                  <Badge variant={getStatusVariant(status)}>{status}</Badge>
                </div>
              ))}
            </div>
          </Card>

          {health.warnings?.length ? (
            <Card className="space-y-3 p-4">
              <h4 className="text-sm font-medium">Warnings</h4>
              <div className="space-y-2">
                {health.warnings.map((warning, index) => (
                  <Alert key={`${warning}-${index}`} variant="warning">
                    <Alert.Description>{warning}</Alert.Description>
                  </Alert>
                ))}
              </div>
            </Card>
          ) : null}

          {health.errors?.length ? (
            <Card className="space-y-3 p-4">
              <h4 className="text-sm font-medium">Errors</h4>
              <div className="space-y-2">
                {health.errors.map((error, index) => (
                  <Alert key={`${error}-${index}`} variant="destructive">
                    <Alert.Description>{error}</Alert.Description>
                  </Alert>
                ))}
              </div>
            </Card>
          ) : null}
        </>
      ) : null}
    </div>
  );
};
