import { useState } from 'react';
import { IconBrandDiscord, IconPlus } from '@tabler/icons-react';
import { Alert, Button, Card, Spinner } from 'erxes-ui';
import { useGithubConfigByTeam } from '@/integrations/github/hooks/useGithubIntegration';
import {
  useDiscordConfigsByTeam,
  useDiscordConnections,
} from '../hooks/useDiscordIntegration';
import { IDiscordConfig } from '../types';
import { ConnectDiscordSheet } from './ConnectDiscordSheet';
import { TeamDiscordChannelCard } from './TeamDiscordChannelCard';
import { TeamDiscordMembers } from './TeamDiscordMembers';
import { TeamDiscordSheet } from './TeamDiscordSheet';

export function TeamDiscordSettings({ teamId }: Readonly<{ teamId: string }>) {
  const [configSheetOpen, setConfigSheetOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState<IDiscordConfig | null>(
    null,
  );
  const [connectSheetOpen, setConnectSheetOpen] = useState(false);
  const {
    connections,
    loading: connectionsLoading,
    error: connectionsError,
  } = useDiscordConnections();
  const {
    configs,
    loading: configsLoading,
    error: configsError,
    refetch: refetchConfigs,
  } = useDiscordConfigsByTeam(teamId);
  const { config: githubConfig } = useGithubConfigByTeam(teamId);

  function openConfigSheet(config: IDiscordConfig | null) {
    setEditingConfig(config);
    setConfigSheetOpen(true);
  }

  function handleAddChannel() {
    if (connections.length === 0) {
      setConnectSheetOpen(true);
      return;
    }

    openConfigSheet(null);
  }

  function renderChannels() {
    if (configs.length) {
      return (
        <div className="space-y-3">
          {configs.map((config) => (
            <TeamDiscordChannelCard
              key={config._id}
              teamId={teamId}
              config={config}
              connection={connections.find(
                (connection) => connection._id === config.connectionId,
              )}
              onEdit={() => openConfigSheet(config)}
              onRefresh={refetchConfigs}
            />
          ))}
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center gap-4 py-8 text-center">
        <IconBrandDiscord className="size-10 text-muted-foreground" />
        <div>
          <p className="font-medium">No Discord channel connected</p>
          <p className="text-sm text-muted-foreground">
            Choose a channel to post new triages, accepted and declined triages,
            assignments, completed tasks and merged pull requests.
          </p>
        </div>
        <Button onClick={handleAddChannel}>
          {connections.length > 0
            ? 'Choose a Discord channel'
            : 'Connect a Discord server'}
        </Button>
      </div>
    );
  }

  if (connectionsLoading || configsLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    );
  }

  if (connectionsError || configsError) {
    return (
      <Alert variant="destructive">
        <Alert.Description>
          Failed to load the Discord configuration. Please refresh and try
          again.
        </Alert.Description>
      </Alert>
    );
  }

  return (
    <>
      <Card>
        <Card.Header>
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <IconBrandDiscord className="size-5" />
                <Card.Title>Discord channels</Card.Title>
              </div>
              <Card.Description>
                Post this team’s updates to one or more Discord channels, each
                with its own events.
              </Card.Description>
            </div>
            {configs.length ? (
              <Button size="sm" variant="secondary" onClick={handleAddChannel}>
                <IconPlus />
                Add channel
              </Button>
            ) : null}
          </div>
        </Card.Header>
        <Card.Content>{renderChannels()}</Card.Content>
      </Card>

      <TeamDiscordMembers teamId={teamId} />

      <TeamDiscordSheet
        open={configSheetOpen}
        onOpenChange={setConfigSheetOpen}
        teamId={teamId}
        connections={connections}
        currentConfig={editingConfig}
        takenChannelIds={configs
          .filter((config) => config._id !== editingConfig?._id)
          .map((config) => config.channelId)}
        githubRepoName={githubConfig?.repoName}
      />

      <ConnectDiscordSheet
        open={connectSheetOpen}
        onOpenChange={setConnectSheetOpen}
        onConnected={() => openConfigSheet(null)}
      />
    </>
  );
}
