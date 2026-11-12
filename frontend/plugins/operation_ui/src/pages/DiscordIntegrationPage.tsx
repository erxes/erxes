import { useMemo, useState } from 'react';
import { IconPlus } from '@tabler/icons-react';
import { Badge, Button, Tabs } from 'erxes-ui';
import { DiscordLogo } from '@/integrations/components/IntegrationIcons';
import { IntegrationIntro } from '@/integrations/components/IntegrationIntro';
import { IntegrationsBackLink } from '@/integrations/components/IntegrationsBackLink';
import { ConnectDiscordSheet } from '@/integrations/discord/components/ConnectDiscordSheet';
import { DiscordCustomerChannelsTable } from '@/integrations/discord/components/DiscordCustomerChannelsTable';
import { DiscordMemberLinkingBar } from '@/integrations/discord/components/DiscordMemberLinkingBar';
import { DiscordServersTable } from '@/integrations/discord/components/DiscordServersTable';
import { MyDiscordAccountCard } from '@/integrations/discord/components/MyDiscordAccountCard';
import { useDiscordCustomerChannels } from '@/integrations/discord/hooks/useDiscordCommands';
import { useDiscordConnections } from '@/integrations/discord/hooks/useDiscordIntegration';
import { TDiscordServerRow } from '@/integrations/discord/types';

const TabCount = ({ count }: Readonly<{ count: number }>) =>
  count ? (
    <Badge variant="secondary" className="ml-1.5 text-xs">
      {count}
    </Badge>
  ) : null;

export const DiscordIntegrationPage = () => {
  const [tab, setTab] = useState('servers');
  const [connectOpen, setConnectOpen] = useState(false);
  const { connections, configs, loading, error } = useDiscordConnections();
  const {
    customerChannels,
    loading: channelsLoading,
    error: channelsError,
  } = useDiscordCustomerChannels();

  const servers = useMemo<TDiscordServerRow[]>(
    () =>
      connections.map((connection) => ({
        ...connection,
        teamCount: new Set(
          configs
            .filter((config) => config.connectionId === connection._id)
            .map((config) => config.teamId),
        ).size,
        customerChannelCount: customerChannels.filter(
          (channel) => channel.connectionId === connection._id,
        ).length,
      })),
    [configs, connections, customerChannels],
  );

  const addBotButton = (
    <Button onClick={() => setConnectOpen(true)}>
      <IconPlus />
      Add Discord bot
    </Button>
  );

  return (
    <div className="mx-auto flex min-h-0 w-full max-w-5xl flex-1 flex-col gap-6 overflow-hidden p-5">
      <div>
        <IntegrationsBackLink />
      </div>

      <IntegrationIntro
        icon={DiscordLogo}
        name="Discord"
        description="Post triage and task updates to Discord and let companies report issues from their own channels."
      />

      <div>{addBotButton}</div>

      <Tabs
        value={tab}
        onValueChange={setTab}
        className="flex min-h-0 flex-1 flex-col gap-4"
      >
        <Tabs.List className="w-full justify-start">
          <Tabs.Trigger value="servers">
            Servers
            <TabCount count={connections.length} />
          </Tabs.Trigger>
          <Tabs.Trigger value="customer-channels">
            Customer channels
            <TabCount count={customerChannels.length} />
          </Tabs.Trigger>
          <Tabs.Trigger value="account">My account</Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content
          value="servers"
          className="flex min-h-0 flex-1 flex-col gap-3"
        >
          {connections.length ? (
            <DiscordMemberLinkingBar connections={connections} />
          ) : null}
          <DiscordServersTable
            servers={servers}
            loading={loading}
            failed={Boolean(error)}
            addAction={addBotButton}
          />
        </Tabs.Content>

        <Tabs.Content
          value="customer-channels"
          className="flex min-h-0 flex-1 flex-col"
        >
          <DiscordCustomerChannelsTable
            connections={connections}
            configs={configs}
            customerChannels={customerChannels}
            loading={channelsLoading || loading}
            failed={Boolean(channelsError)}
          />
        </Tabs.Content>

        <Tabs.Content value="account">
          <MyDiscordAccountCard />
        </Tabs.Content>
      </Tabs>

      <ConnectDiscordSheet open={connectOpen} onOpenChange={setConnectOpen} />
    </div>
  );
};
