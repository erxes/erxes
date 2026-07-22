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
import { channelLabelFromIntegration } from '@/inbox/conversations/utils/channelGroups';
import { CONVERSATION_COUNTS } from '@/inbox/conversations/graphql/queries/getConversationCounts';

type ChannelCounts = Record<string, number>;

// Open/new conversation count per Discord channel (each channel is its own
// integration), keyed by integration id, for the sidebar badges.
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

/**
 * Sidebar section listing the connected Discord servers, each expandable to its
 * own channels (mirroring the Operation plugin's "Your Teams" UI) — so channels
 * from different servers are never mixed into one flat list. Each channel is a
 * `discord-messenger` integration; selecting one filters the inbox to that
 * channel via the `integrationId` query param (the same param the inbox already
 * uses for an isolated single-channel view). Renders nothing when there are no
 * Discord channels, so non-Discord setups are unaffected.
 */
export const DiscordServersNav = () => {
  const { integrations, loading, pageInfo, handleFetchMore } = useIntegrations({
    variables: {
      kind: IntegrationType.DISCORD_MESSENGER,
      channelId: '',
      limit: INTEGRATIONS_PER_PAGE,
    },
    // Revalidate on every mount: the sidebar is unmounted while the user is on
    // the Settings route, so a delete there can't refetch this query's observer.
    // cache-first would then serve the removed channel from cache until a hard
    // reload; cache-and-network shows cached rows instantly but always refetches
    // so deleted/added channels reflect when returning to the inbox.
    fetchPolicy: 'cache-and-network',
  });

  // The sidebar must list *every* channel, not just the first page — a server
  // with more channels than INTEGRATIONS_PER_PAGE would otherwise be silently
  // truncated. Auto-advance through the remaining cursor pages until the last
  // one loads; each page merges into the list and the groups re-render. A ref
  // holds the cursor we've already requested so we never re-fire for the same
  // page: `fetchMore` doesn't flip `loading`, so this effect can run again
  // before the next page arrives, and without the guard that would fire a
  // duplicate fetch for the same cursor.
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
  // Scope to the inbox channels this user can access: a Discord integration is
  // bound to an inbox channel via its `channelId`, so it should only surface
  // here when that channel is one the user belongs to. This keeps the sidebar
  // consistent with the (channel-scoped) conversation list and makes a deleted
  // channel hide its Discord rows automatically — without deleting any bots.
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

    // integrationId → its server, from the backend's guild grouping.
    const serverByIntegration = new Map(
      servers.flatMap((server) =>
        server.integrationIds.map((id) => [id, server] as const),
      ),
    );

    const groups = new Map<string, ServerGroup>();
    for (const integration of activeIntegrations) {
      const server = serverByIntegration.get(integration._id);
      // Integrations the backend can't tie to a guild (e.g. a bot created
      // before servers were tracked, mid-refetch) still need a home — group
      // them under a generic bucket rather than dropping them.
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

  // Also wait for the first server grouping (cached results skip this), so
  // channels don't flash into a generic bucket and then regroup.
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
          // A lone server opens by default (nothing competes for space); with
          // several, only the one holding the current selection starts open so
          // a reload keeps the user's context.
          defaultOpen={
            serverGroups.length === 1 ||
            group.integrations.some((i) => i._id === integrationId)
          }
        />
      ))}
    </NavigationMenuGroup>
  );
};

// One server row + its channels, matching the Operation plugin's TeamItem
// (collapsible header with a rotating caret, indented children).
const DiscordServerItem = ({
  group,
  counts,
  defaultOpen,
}: {
  group: ServerGroup;
  counts: ChannelCounts;
  defaultOpen: boolean;
}) => {
  // Server-level badge so unread work stays visible while collapsed.
  const totalCount = group.integrations.reduce(
    (sum, integration) => sum + (counts[integration._id] || 0),
    0,
  );

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
              {group.integrations.map((integration) => (
                // skipcq: JS-0357
                <DiscordChannelItem
                  key={integration._id}
                  integration={integration}
                  count={counts[integration._id] || 0}
                />
              ))}
            </Sidebar.Menu>
          </Sidebar.GroupContent>
        </Collapsible.Content>
      </Sidebar.Group>
    </Collapsible>
  );
};

/** Sidebar row for one Discord channel integration, badged with its open count. */
const DiscordChannelItem = ({
  integration,
  count,
}: {
  integration: IIntegration;
  count: number;
}) => {
  const [integrationId, setIntegrationId] =
    useQueryState<string>('integrationId');

  const isActive = integrationId === integration._id;
  const label = channelLabelFromIntegration(integration);

  /** Toggle this channel as the active integration filter. */
  const handleClick = () => {
    setIntegrationId(isActive ? null : integration._id);
  };

  return (
    <Button
      variant={isActive ? 'secondary' : 'ghost'}
      className="justify-start relative overflow-hidden text-left w-full pl-6 pr-2 font-medium"
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
