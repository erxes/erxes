import { useEffect, useMemo, useRef } from 'react';
import { useQuery } from '@apollo/client';
import {
  IconBrandDiscord,
  IconCaretRightFilled,
  IconCheck,
} from '@tabler/icons-react';
import {
  Badge,
  Button,
  Collapsible,
  EnumCursorDirection,
  NavigationMenuGroup,
  Sidebar,
  Skeleton,
  TextOverflowTooltip,
  useQueryState,
} from 'erxes-ui';

import { IntegrationType } from '@/types/Integration';
import { IIntegration } from '@/integrations/types/Integration';
import {
  INTEGRATIONS_PER_PAGE,
  useIntegrations,
} from '@/integrations/hooks/useIntegrations';
import { useDiscordServers } from '@/integrations/discord/hooks/useDiscordSetup';
import { useGetMyChannels } from '@/channels/hooks/useGetMyChannels';
import {
  channelGroupFromIntegration,
  channelLabelFromIntegration,
} from '@/inbox/conversations/utils/channelGroups';
import { CONVERSATION_COUNTS } from '@/inbox/conversations/graphql/queries/getConversationCounts';

type ChannelCounts = Record<string, number>;

const useDiscordChannelCounts = () => {
  const { data, loading } = useQuery<{
    conversationCounts: { byIntegrations?: ChannelCounts };
  }>(CONVERSATION_COUNTS, {
    variables: { only: 'byIntegrations' },
    fetchPolicy: 'cache-and-network',
  });

  return { counts: data?.conversationCounts?.byIntegrations ?? {}, loading };
};

type ServerGroup = {
  guildId: string;
  name: string;
  integrations: IIntegration[];
};

export const DiscordServersNav = () => {
  const { integrations, loading, pageInfo, handleFetchMore } = useIntegrations({
    variables: {
      kind: IntegrationType.DISCORD_MESSENGER,
      channelId: '',
      limit: INTEGRATIONS_PER_PAGE,
    },
    fetchPolicy: 'cache-and-network',
  });

  const fetchedCursorRef = useRef<string | null>(null);
  useEffect(() => {
    if (!pageInfo?.hasNextPage) return;
    const cursor = pageInfo.endCursor;
    if (fetchedCursorRef.current === cursor) return;
    fetchedCursorRef.current = cursor;
    handleFetchMore({ direction: EnumCursorDirection.FORWARD });
  }, [pageInfo?.hasNextPage, pageInfo?.endCursor, handleFetchMore]);
  const { servers, loading: serversLoading } = useDiscordServers();
  const { counts } = useDiscordChannelCounts();
  const { channels } = useGetMyChannels();
  const [integrationId] = useQueryState<string>('integrationId');

  const serverGroups = useMemo(() => {
    const myChannelIds = new Set(
      (channels || []).map((channel) => channel._id),
    );

    const activeIntegrations = (integrations || []).filter(
      (integration) =>
        integration.isActive &&
        Boolean(integration.channelId) &&
        myChannelIds.has(integration.channelId),
    );

    const serverByIntegration = new Map(
      servers.flatMap((server) =>
        server.integrationIds.map((id) => [id, server] as const),
      ),
    );

    const groups = new Map<string, ServerGroup>();
    for (const integration of activeIntegrations) {
      const server = serverByIntegration.get(integration._id);
      const guildId = server?.guildId ?? 'unknown';
      const group = groups.get(guildId) ?? {
        guildId,
        name: server?.name || (server ? `Server ${server.guildId}` : 'Discord'),
        integrations: [],
      };
      group.integrations.push(integration);
      groups.set(guildId, group);
    }

    return [...groups.values()];
  }, [integrations, servers, channels]);

  if (loading || (serversLoading && !servers.length)) {
    return (
      <NavigationMenuGroup name="Discord Servers">
        <div className="flex flex-col gap-1">
          <Skeleton className="w-32 h-4 mt-1" />
          <Skeleton className="w-28 h-4 mt-1" />
        </div>
      </NavigationMenuGroup>
    );
  }

  if (!serverGroups.length) {
    return null;
  }

  return (
    <NavigationMenuGroup name="Discord Servers">
      {serverGroups.map((group) => (
        // skipcq: JS-0357
        <DiscordServerItem
          key={group.guildId}
          group={group}
          counts={counts}
          defaultOpen={
            serverGroups.length === 1 ||
            group.integrations.some((i) => i._id === integrationId)
          }
        />
      ))}
    </NavigationMenuGroup>
  );
};

const DiscordServerItem = ({
  group,
  counts,
  defaultOpen,
}: {
  group: ServerGroup;
  counts: ChannelCounts;
  defaultOpen: boolean;
}) => {
  const totalCount = group.integrations.reduce(
    (sum, integration) => sum + (counts[integration._id] || 0),
    0,
  );

  const { categories, ungrouped } = useMemo(() => {
    const byGroup = new Map<string, IIntegration[]>();
    const loose: IIntegration[] = [];
    for (const integration of group.integrations) {
      if ((integration.name || '').includes(' - #')) {
        const key = channelGroupFromIntegration(integration);
        byGroup.set(key, [...(byGroup.get(key) ?? []), integration]);
      } else {
        loose.push(integration);
      }
    }
    return {
      categories: [...byGroup.entries()]
        .map(([name, integrations]) => ({ name, integrations }))
        .sort((a, b) => a.name.localeCompare(b.name)),
      ungrouped: loose,
    };
  }, [group.integrations]);

  return (
    // skipcq: JS-0415
    <Collapsible className="group/collapsible" defaultOpen={defaultOpen}>
      <Sidebar.Group className="p-0">
        <Collapsible.Trigger asChild>
          <div className="w-full flex items-center hover:cursor-pointer">
            <Button
              variant="ghost"
              className="px-2 flex min-w-0 justify-start flex-auto"
            >
              <IconBrandDiscord className="text-accent-foreground shrink-0 size-4" />
              <TextOverflowTooltip
                className="font-sans font-semibold normal-case flex-1 min-w-0 text-left"
                value={group.name}
              />
              {totalCount > 0 && (
                <Badge className="text-xs min-w-5 px-1 justify-center shrink-0">
                  {totalCount}
                </Badge>
              )}
              <span className="ml-auto shrink-0">
                <IconCaretRightFilled className="size-3 transition-transform group-data-[state=open]/collapsible:rotate-90 text-accent-foreground" />
              </span>
            </Button>
          </div>
        </Collapsible.Trigger>
        <Collapsible.Content className="pt-1">
          <Sidebar.GroupContent>
            <Sidebar.Menu>
              {ungrouped.map((integration) => (
                // skipcq: JS-0357
                <DiscordChannelItem
                  key={integration._id}
                  integration={integration}
                  count={counts[integration._id] || 0}
                />
              ))}
              {categories.map((category) => (
                // skipcq: JS-0357
                <DiscordCategoryItem
                  key={category.name}
                  name={category.name}
                  integrations={category.integrations}
                  counts={counts}
                />
              ))}
            </Sidebar.Menu>
          </Sidebar.GroupContent>
        </Collapsible.Content>
      </Sidebar.Group>
    </Collapsible>
  );
};

const DiscordCategoryItem = ({
  name,
  integrations,
  counts,
}: {
  name: string;
  integrations: IIntegration[];
  counts: ChannelCounts;
}) => {
  const totalCount = integrations.reduce(
    (sum, integration) => sum + (counts[integration._id] || 0),
    0,
  );

  return (
    <Collapsible className="group/category" defaultOpen>
      <Collapsible.Trigger asChild>
        <Button
          variant="ghost"
          className="w-full flex min-w-0 justify-start pl-6 pr-2 font-medium"
        >
          <span className="shrink-0">
            <IconCaretRightFilled className="size-3 transition-transform group-data-[state=open]/category:rotate-90 text-accent-foreground" />
          </span>
          <TextOverflowTooltip
            className="font-semibold normal-case flex-1 min-w-0 text-left"
            value={name}
          />
          {totalCount > 0 && (
            <Badge className="text-xs min-w-5 px-1 justify-center shrink-0">
              {totalCount}
            </Badge>
          )}
        </Button>
      </Collapsible.Trigger>
      <Collapsible.Content>
        <Sidebar.Menu>
          {integrations.map((integration) => (
            // skipcq: JS-0357
            <DiscordChannelItem
              key={integration._id}
              integration={integration}
              count={counts[integration._id] || 0}
              nested
            />
          ))}
        </Sidebar.Menu>
      </Collapsible.Content>
    </Collapsible>
  );
};

const DiscordChannelItem = ({
  integration,
  count,
  nested = false,
}: {
  integration: IIntegration;
  count: number;
  nested?: boolean;
}) => {
  const [integrationId, setIntegrationId] =
    useQueryState<string>('integrationId');

  const isActive = integrationId === integration._id;
  const label = channelLabelFromIntegration(integration);

  const handleClick = () => {
    setIntegrationId(isActive ? null : integration._id);
  };

  return (
    <Button
      variant={isActive ? 'secondary' : 'ghost'}
      className={`justify-start relative overflow-hidden text-left w-full pr-2 font-medium ${
        nested ? 'pl-10' : 'pl-6'
      }`}
      onClick={handleClick}
    >
      {isActive ? (
        <IconCheck className="size-3.5 shrink-0" />
      ) : (
        <IconBrandDiscord className="size-3.5 text-accent-foreground shrink-0" />
      )}
      <TextOverflowTooltip value={label} />
      {count > 0 && (
        <Badge className="ml-auto text-xs min-w-5 px-1 justify-center">
          {count}
        </Badge>
      )}
    </Button>
  );
};
