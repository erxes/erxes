import { ScrollArea } from 'erxes-ui';
import { IntegrationCard } from '@/integrations/components/IntegrationCard';
import {
  DiscordLogo,
  GithubLogo,
} from '@/integrations/components/IntegrationIcons';
import {
  DISCORD_INTEGRATION_PATH,
  GITHUB_INTEGRATION_PATH,
} from '@/integrations/constants';
import { useDiscordConnections } from '@/integrations/discord/hooks/useDiscordIntegration';
import { useGithubConnection } from '@/integrations/github/hooks/useGithubConnection';

export const IntegrationsPage = () => {
  const github = useGithubConnection();
  const discord = useDiscordConnections();

  return (
    <ScrollArea>
      <div className="mx-auto flex h-full w-full max-w-3xl flex-col gap-8 px-8 py-5">
        <div className="flex flex-col gap-2 px-1">
          <h1 className="text-lg font-semibold">Integrations</h1>
          <span className="text-sm font-normal text-muted-foreground">
            Connect Operation with the tools your teams already use.
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
          <IntegrationCard
            to={GITHUB_INTEGRATION_PATH}
            icon={GithubLogo}
            name="GitHub"
            description="Sync GitHub issues with triages and tasks."
            count={github.data?.getGithubConnections?.length ?? 0}
            loading={github.loading && !github.data}
            failed={Boolean(github.error)}
          />
          <IntegrationCard
            to={DISCORD_INTEGRATION_PATH}
            icon={DiscordLogo}
            name="Discord"
            description="Post triage and task updates to Discord and let companies report issues from their own channels."
            count={discord.connections.length}
            loading={discord.loading && !discord.connections.length}
            failed={Boolean(discord.error)}
          />
        </div>
      </div>
    </ScrollArea>
  );
};
