import { useCallback, useState } from 'react';
import { IconBrandGithub } from '@tabler/icons-react';
import {
  Alert,
  Avatar,
  Badge,
  Button,
  Card,
  Spinner,
  useConfirm,
  useToast,
} from 'erxes-ui';
import { useGithubConnection } from '../hooks/useGithubConnection';
import {
  useDisconnectGithubTeam,
  useGithubConfigByTeam,
} from '../hooks/useGithubIntegration';
import { useGithubInstall } from '../hooks/useGithubInstall';
import { LinkRepoDialog } from './LinkRepoDialog';

export function TeamGithubSettings({ teamId }: { teamId: string }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { confirm } = useConfirm();
  const { toast } = useToast();
  const {
    data: connectionData,
    loading: connectionsLoading,
    error: connectionsError,
    refetchUntilNewConnection,
  } = useGithubConnection();
  const {
    config,
    configs,
    loading: configLoading,
    error: configError,
    refetch: refetchConfig,
  } = useGithubConfigByTeam(teamId);
  const connections = connectionData?.getGithubConnections ?? [];
  const currentConnection = connections.find(
    (connection) => connection.installationId === config?.installationId,
  );

  const handleInstallComplete = useCallback(() => {
    const knownInstallationIds = connections.map(
      (connection) => connection.installationId,
    );

    void refetchUntilNewConnection(knownInstallationIds)
      .then(({ added }) => {
        if (added) {
          setDialogOpen(true);
          return;
        }

        toast({
          title: 'No new GitHub organization detected',
          description:
            'Finish the GitHub installation, then try adding the organization again.',
          variant: 'warning',
        });
      })
      .catch((error: Error) =>
        toast({
          title: 'Could not refresh GitHub organizations',
          description: error.message,
          variant: 'destructive',
        }),
      );
  }, [connections, refetchUntilNewConnection, toast]);
  const { openGithubInstall } = useGithubInstall(handleInstallComplete);

  function refreshConfig() {
    void refetchConfig().catch((error: Error) =>
      toast({
        title: 'Could not refresh the GitHub repository',
        description: error.message,
        variant: 'destructive',
      }),
    );
  }

  const { disconnectTeam, disconnecting } = useDisconnectGithubTeam(
    () => {
      toast({ title: 'GitHub repository disconnected' });
      refreshConfig();
    },
    (error) =>
      toast({
        title: 'Could not disconnect GitHub repository',
        description: error.message,
        variant: 'destructive',
      }),
  );

  function handleConnect() {
    if (connections.length === 0) {
      openGithubInstall();
      return;
    }

    setDialogOpen(true);
  }

  function handleDisconnect() {
    confirm({
      message:
        'Disconnect this repository from the team? Other teams using the same GitHub organization will stay connected.',
    }).then(() => {
      disconnectTeam({ variables: { teamId } });
    });
  }

  function handleSaved() {
    refreshConfig();
  }

  if (connectionsLoading || configLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    );
  }

  if (connectionsError || configError) {
    return (
      <Alert variant="destructive">
        Failed to load the GitHub configuration. Please refresh and try again.
      </Alert>
    );
  }

  return (
    <>
      <Card>
        <Card.Header>
          <div className="flex items-center gap-2">
            <IconBrandGithub className="size-5" />
            <Card.Title>GitHub repository</Card.Title>
          </div>
          <Card.Description>
            Connect one GitHub repository to this team. Organization
            installations can be shared safely by other teams.
          </Card.Description>
        </Card.Header>
        <Card.Content>
          {config && currentConnection ? (
            <div className="flex items-center justify-between gap-4 rounded-lg border border-border bg-surface p-4">
              <div className="flex min-w-0 items-center gap-3">
                <Avatar size="xl">
                  <Avatar.Image
                    src={currentConnection.orgAvatarUrl}
                    alt={currentConnection.orgName}
                  />
                  <Avatar.Fallback>
                    {currentConnection.orgName[0]?.toUpperCase()}
                  </Avatar.Fallback>
                </Avatar>
                <div className="min-w-0 space-y-2">
                  <p className="truncate font-semibold">{config.repoName}</p>
                  <Badge variant="secondary">
                    {config.syncMode === 'twoWay'
                      ? 'Two-way sync'
                      : 'One-way sync'}
                  </Badge>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setDialogOpen(true)}
                >
                  Change
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={handleDisconnect}
                  disabled={disconnecting}
                >
                  {disconnecting ? <Spinner size="sm" /> : 'Disconnect'}
                </Button>
              </div>
            </div>
          ) : config ? (
            <div className="space-y-4">
              <Alert variant="destructive">
                This team’s GitHub organization is no longer available. Choose
                another organization and repository to restore synchronization.
              </Alert>
              <Button onClick={handleConnect}>Change connection</Button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4 py-8 text-center">
              <IconBrandGithub className="size-10 text-muted-foreground" />
              <div>
                <p className="font-medium">No repository connected</p>
                <p className="text-sm text-muted-foreground">
                  Connect a repository to synchronize GitHub issues with this
                  team’s tasks.
                </p>
              </div>
              <Button onClick={handleConnect}>
                {connections.length > 0
                  ? 'Connect GitHub repository'
                  : 'Connect GitHub organization'}
              </Button>
            </div>
          )}
        </Card.Content>
      </Card>

      <LinkRepoDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        teamId={teamId}
        connections={connections}
        currentConfig={config}
        linkedRepoNames={configs
          .filter((item) => item.teamId !== teamId)
          .map((item) => item.repoName)}
        onSaved={handleSaved}
        onInstallOrganization={openGithubInstall}
      />
    </>
  );
}
