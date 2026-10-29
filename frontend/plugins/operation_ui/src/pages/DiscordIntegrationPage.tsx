import { useState } from 'react';
import { IconBrandDiscord } from '@tabler/icons-react';
import {
  Alert,
  Button,
  Card,
  PageContainer,
  ScrollArea,
  Spinner,
} from 'erxes-ui';
import { ConnectDiscordDialog } from '@/integrations/discord/components/ConnectDiscordDialog';
import { DiscordConnectionCard } from '@/integrations/discord/components/DiscordConnectionCard';
import { DISCORD_BOT_PERMISSIONS } from '@/integrations/discord/constants';
import { useDiscordConnections } from '@/integrations/discord/hooks/useDiscordIntegration';
import { MyDiscordAccountCard } from '@/integrations/discord/components/MyDiscordAccountCard';
import { IntegrationsBackLink } from '@/integrations/components/IntegrationsBackLink';

export const DiscordIntegrationPage = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { connections, configs, loading, error } = useDiscordConnections();
  const isConnected = connections.length > 0;

  return (
    <PageContainer>
      <ScrollArea>
        <div className="mx-auto max-w-2xl space-y-6 p-6">
          <div>
            <IntegrationsBackLink />
            <h1 className="text-xl font-semibold">Discord Integration</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Post triage and task updates from erxes to Discord channels.
            </p>
          </div>

          <MyDiscordAccountCard />

          <Card>
            <Card.Header className="flex flex-row items-center justify-between gap-4">
              <div>
                <Card.Title>Connected servers</Card.Title>
                <Card.Description>
                  Discord servers your bot can post to. Each team picks its
                  channel in Team settings → Discord.
                </Card.Description>
              </div>
              {isConnected && (
                <Button
                  size="sm"
                  className="shrink-0"
                  onClick={() => setDialogOpen(true)}
                >
                  + Connect server
                </Button>
              )}
            </Card.Header>

            <Card.Content>
              {loading && !isConnected ? (
                <div className="flex justify-center py-12">
                  <Spinner />
                </div>
              ) : error ? (
                <Alert variant="destructive">
                  Failed to load Discord servers. Please refresh.
                </Alert>
              ) : isConnected ? (
                <div className="space-y-2">
                  {connections.map((connection) => (
                    <DiscordConnectionCard
                      key={connection._id}
                      connection={connection}
                      linkedTeamCount={
                        configs.filter(
                          (config) => config.connectionId === connection._id,
                        ).length
                      }
                      onUpdateToken={() => setDialogOpen(true)}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-4 py-10 text-center">
                  <IconBrandDiscord className="size-16" />
                  <div>
                    <h3 className="font-semibold">No servers connected</h3>
                    <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                      Connect a Discord server to post new triages, assignments
                      and completed tasks to its channels.
                    </p>
                  </div>
                  <Button onClick={() => setDialogOpen(true)}>
                    Connect Discord server
                  </Button>
                </div>
              )}
            </Card.Content>
          </Card>

          <Card>
            <Card.Header>
              <Card.Title>Bot permissions</Card.Title>
              <Card.Description>
                What the bot needs in the channels it posts to.
              </Card.Description>
            </Card.Header>
            <Card.Content>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {DISCORD_BOT_PERMISSIONS.map((permission) => (
                  <li key={permission} className="flex items-center gap-2">
                    <span className="text-success">✓</span>
                    {permission}
                  </li>
                ))}
                <li className="flex items-center gap-2">
                  <span>✗</span>
                  No access to message content
                </li>
              </ul>
            </Card.Content>
          </Card>
        </div>
      </ScrollArea>

      <ConnectDiscordDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
      />
    </PageContainer>
  );
};
