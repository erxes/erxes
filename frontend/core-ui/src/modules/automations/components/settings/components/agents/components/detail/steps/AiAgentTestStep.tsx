import { useAiAgentTestStep } from '@/automations/components/settings/components/agents/hooks/useAiAgentTestStep';
import { IconLoader2 } from '@tabler/icons-react';
import {
  Alert,
  Badge,
  Button,
  Card,
  RelativeDateDisplay,
  Skeleton,
} from 'erxes-ui';

export const AiAgentTestStep = () => {
  const {
    isEditing,
    health,
    loading,
    runCheck,
    hasCheckedAt,
    showSkeleton,
    checks,
  } = useAiAgentTestStep();

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
              {hasCheckedAt ? (
                <RelativeDateDisplay.Value value={health.checkedAt} />
              ) : (
                'just now'
              )}
            </p>
          )}
        </div>
        <Button variant="secondary" onClick={runCheck} disabled={loading}>
          {loading && <IconLoader2 className="size-4 animate-spin" />}
          {loading ? 'Checking…' : 'Run check'}
        </Button>
      </Card>

      {showSkeleton && (
        <Card className="space-y-3 p-4">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </Card>
      )}

      {health && (
        <>
          <Card className="grid gap-3 p-4 md:grid-cols-2">
            {checks.map(({ key, label, status, variant }) => (
              <div
                key={key}
                className="flex items-center justify-between rounded-md border bg-muted/20 px-3 py-2"
              >
                <span className="text-sm font-medium">{label}</span>
                <Badge variant={variant}>{status}</Badge>
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
