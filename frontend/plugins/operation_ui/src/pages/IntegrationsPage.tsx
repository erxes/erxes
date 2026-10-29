import { IconBrandDiscord, IconBrandGithub } from '@tabler/icons-react';
import { Badge, PageContainer, ScrollArea, Spinner } from 'erxes-ui';
import { IntegrationCard } from '@/integrations/components/IntegrationCard';
import {
  DISCORD_INTEGRATION_PATH,
  GITHUB_INTEGRATION_PATH,
} from '@/integrations/constants';
import { useDiscordConnections } from '@/integrations/discord/hooks/useDiscordIntegration';
import { useGithubConnection } from '@/integrations/github/hooks/useGithubConnection';

const ConnectionStatus = ({
  loading,
  failed,
  count,
  noun,
}: {
  loading: boolean;
  failed: boolean;
  count: number;
  noun: string;
}) => {
  if (loading) {
    return <Spinner size="sm" containerClassName="h-auto flex-none" />;
  }

  if (failed) {
    return <Badge variant="destructive">Status unavailable</Badge>;
  }

  return count > 0 ? (
    <Badge variant="success">
      {count} {noun}
      {count === 1 ? '' : 's'}
    </Badge>
  ) : (
    <Badge variant="secondary">Not connected</Badge>
  );
};

export const IntegrationsPage = () => {
  const github = useGithubConnection();
  const discord = useDiscordConnections();

  return (
    <PageContainer>
      <ScrollArea>
        <div className="mx-auto max-w-2xl space-y-6 p-6">
          <div>
            <h1 className="text-xl font-semibold">Integrations</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Connect Operation with the tools your teams already use.
            </p>
          </div>

          <div className="space-y-3">
            <IntegrationCard
              to={GITHUB_INTEGRATION_PATH}
              icon={IconBrandGithub}
              name="GitHub"
              description="Sync GitHub issues with triages and tasks."
              status={
                <ConnectionStatus
                  loading={github.loading && !github.data}
                  failed={Boolean(github.error)}
                  count={github.data?.getGithubConnections?.length ?? 0}
                  noun="organization"
                />
              }
            />
            <IntegrationCard
              to={DISCORD_INTEGRATION_PATH}
              icon={IconBrandDiscord}
              name="Discord"
              description="Post triage and task updates to Discord and mention assignees. Link your own Discord account here too."
              status={
                <ConnectionStatus
                  loading={discord.loading && !discord.connections.length}
                  failed={Boolean(discord.error)}
                  count={discord.connections.length}
                  noun="server"
                />
              }
            />
          </div>
        </div>
      </ScrollArea>
    </PageContainer>
  );
};
