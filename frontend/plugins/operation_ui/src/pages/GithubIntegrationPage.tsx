import { useCallback } from 'react';
import {
  PageContainer,
  ScrollArea,
  Card,
  Button,
  Spinner,
  Alert,
  useToast,
} from 'erxes-ui';
import { EmptyState } from '../modules/integrations/github/components/EmptyState';
import { ConnectedOrgCard } from '../modules/integrations/github/components/ConnectedOrgCard';
import { useGithubConnection } from '../modules/integrations/github/hooks/useGithubConnection';
import { useGithubInstall } from '../modules/integrations/github/hooks/useGithubInstall';

export const GithubIntegrationPage = () => {
  const { toast } = useToast();
  const { data, loading, error, refetchUntilNewConnection } =
    useGithubConnection();

  const connections = data?.getGithubConnections ?? [];
  const isConnected = connections.length > 0;
  const handleInstallComplete = useCallback(() => {
    const knownInstallationIds = connections.map(
      (connection) => connection.installationId,
    );

    void refetchUntilNewConnection(knownInstallationIds)
      .then(({ added }) => {
        if (!added) {
          toast({
            title: 'No new GitHub organization detected',
            description:
              'Finish the GitHub installation, then try adding the organization again.',
            variant: 'warning',
          });
        }
      })
      .catch((refetchError: Error) =>
        toast({
          title: 'Could not refresh GitHub organizations',
          description: refetchError.message,
          variant: 'destructive',
        }),
      );
  }, [connections, refetchUntilNewConnection, toast]);
  const { openGithubInstall } = useGithubInstall(handleInstallComplete);

  return (
    <PageContainer>
      <ScrollArea>
        <div className="mx-auto max-w-2xl space-y-6 p-6">
          <div>
            <h1 className="text-xl font-semibold ">GitHub Integration</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Sync GitHub issues and pull requests with erxes tasks.
            </p>
          </div>

          <Card>
            <Card.Header className="flex flex-row items-center justify-between">
              <div>
                <Card.Title>Connected Organizations</Card.Title>
                <Card.Description>
                  GitHub organizations that have installed the erxes app.
                </Card.Description>
              </div>
              {isConnected && (
                <Button size="sm" onClick={openGithubInstall}>
                  + Add Another
                </Button>
              )}
            </Card.Header>

            <Card.Content>
              {loading && !data ? (
                <div className="flex justify-center py-12">
                  <Spinner />
                </div>
              ) : error ? (
                <Alert variant="destructive">
                  Failed to load connection status. Please refresh.
                </Alert>
              ) : isConnected ? (
                <div className="space-y-2">
                  {connections.map((connection) => (
                    <ConnectedOrgCard
                      key={connection.installationId}
                      org={connection}
                    />
                  ))}
                </div>
              ) : (
                <EmptyState onConnect={openGithubInstall} />
              )}
            </Card.Content>
          </Card>

          {isConnected && (
            <Card>
              <Card.Header>
                <Card.Title>App Permissions</Card.Title>
                <Card.Description>
                  What erxes can access in your GitHub organization.
                </Card.Description>
              </Card.Header>
              <Card.Content>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {[
                    { icon: '✓', label: 'Read and write Issues' },
                    { icon: '✓', label: 'Read Pull Requests' },
                    { icon: '✓', label: 'Read repository metadata' },
                    { icon: '✗', label: 'No access to code or secrets' },
                  ].map(({ icon, label }) => (
                    <li key={label} className="flex items-center gap-2">
                      <span
                        className={
                          icon === '✓'
                            ? 'text-success'
                            : 'text-muted-foreground'
                        }
                      >
                        {icon}
                      </span>
                      {label}
                    </li>
                  ))}
                </ul>
              </Card.Content>
            </Card>
          )}
        </div>
      </ScrollArea>
    </PageContainer>
  );
};
