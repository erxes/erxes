import { useEffect, useRef } from 'react';
import {
  PageContainer,
  ScrollArea,
  Card,
  Button,
  Spinner,
  Alert,
  useConfirm,
} from 'erxes-ui';
import { EmptyState } from '../modules/integrations/github/components/EmptyState';
import { ConnectedOrgCard } from '../modules/integrations/github/components/ConnectedOrgCard';
import { GithubIssuesSection } from '../modules/integrations/github/components/GithubIssuesSection';
import { useGithubConnection } from '../modules/integrations/github/hooks/useGithubConnection';

const GITHUB_APP_SLUG = 'erxes-operation-github';

function buildInstallUrl(): string {
  return `https://github.com/apps/${GITHUB_APP_SLUG}/installations/new`;
}

export const GithubIntegrationPage = () => {
  const { confirm } = useConfirm();
  const {
    data,
    loading,
    error,
    refetch,
    disconnectGithub,
    disconnecting,
    disconnectError,
  } = useGithubConnection();

  const connection = data?.getGithubConnection;
  const isConnected = connection?.isActive;
  const popupRef = useRef<Window | null>(null);

  function handleConnect() {
    if (popupRef.current && !popupRef.current.closed) {
      popupRef.current.focus();
      return;
    }

    const url = buildInstallUrl();
    const width = 1020;
    const height = 618;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    popupRef.current = window.open(
      url,
      'github-install',
      `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no,scrollbars=yes,resizable=yes`,
    );

    const timer = setInterval(() => {
      if (popupRef.current?.closed) {
        clearInterval(timer);
        refetch();
      }
    }, 1000);
  }

  useEffect(() => {
    function handleMessage(e: MessageEvent) {
      if (e.data?.type === 'github-install-complete') {
        if (popupRef.current && !popupRef.current.closed) {
          popupRef.current.close();
        }
        refetch();
      }
    }
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [refetch]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (!isConnected && !loading) {
      interval = setInterval(() => {
        refetch();
      }, 3000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isConnected, loading, refetch]);

  function handleDisconnect() {
    confirm({
      message: 'Are you sure you want to disconnect the GitHub integration?',
    }).then(() => {
      if (!connection?.installationId) return;
      disconnectGithub({
        variables: { installationId: connection.installationId },
      });
    });
  }

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

          {disconnectError && (
            <Alert variant="error">{disconnectError.message}</Alert>
          )}

          <Card>
            <Card.Header className="flex flex-row items-center justify-between">
              <div>
                <Card.Title>Connected Organizations</Card.Title>
                <Card.Description>
                  GitHub organizations that have installed the erxes app.
                </Card.Description>
              </div>
              {isConnected && (
                <Button size="sm" onClick={handleConnect}>
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
                <Alert variant="error">
                  Failed to load connection status. Please refresh.
                </Alert>
              ) : isConnected ? (
                <ConnectedOrgCard
                  org={connection}
                  onDisconnect={handleDisconnect}
                  disconnecting={disconnecting}
                />
              ) : (
                <EmptyState onConnect={handleConnect} />
              )}
            </Card.Content>
          </Card>

          {isConnected && (
            <GithubIssuesSection
              installationId={connection.installationId}
              orgName={connection.orgName}
            />
          )}

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
