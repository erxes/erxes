import { useEffect, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { useDebounce } from 'use-debounce';
import {
  IconMessageCircle,
  IconSearch,
  IconUsersGroup,
} from '@tabler/icons-react';
import {
  Badge,
  Button,
  Empty,
  Input,
  ScrollArea,
  Select,
  Skeleton,
  Tabs,
  cn,
} from 'erxes-ui';
import {
  useMessagingAdminApps,
  useMessagingAdminConversations,
} from '../hooks/useMessagingAdmin';
import type {
  AdminConversationItem,
  MessagingKind,
  SelectedConversation,
} from '../types';
import { conversationTitle } from '../utils';
import { AccessState } from './AccessState';

const ALL_APPS = 'all';

type Props = {
  kind: MessagingKind;
  onKindChange: (kind: MessagingKind) => void;
  appKey: string | null;
  onAppKeyChange: (appKey: string | null) => void;
  search: string;
  onSearchChange: (search: string) => void;
  selected: SelectedConversation | null;
  onSelect: (conversation: SelectedConversation) => void;
};

const ConversationRow = ({
  conversation,
  active,
  onSelect,
}: {
  conversation: AdminConversationItem;
  active: boolean;
  onSelect: () => void;
}) => (
  <button
    type="button"
    onClick={onSelect}
    aria-current={active}
    className={cn(
      'flex w-full flex-col gap-1 rounded-md px-3 py-2 text-left transition-colors hover:bg-accent',
      active && 'bg-accent',
    )}
  >
    <div className="flex items-center gap-2">
      {conversation.kind === 'GROUP' ? (
        <IconUsersGroup className="size-4 shrink-0 text-muted-foreground" />
      ) : (
        <IconMessageCircle className="size-4 shrink-0 text-muted-foreground" />
      )}
      <span className="min-w-0 flex-1 truncate text-sm font-medium">
        {conversationTitle(conversation)}
      </span>
      <span className="shrink-0 text-xs text-muted-foreground">
        {formatDistanceToNow(new Date(conversation.lastActivityAt), {
          addSuffix: true,
        })}
      </span>
    </div>
    <div className="flex items-center gap-2 pl-6 text-xs text-muted-foreground">
      <Badge variant={conversation.kind === 'GROUP' ? 'info' : 'secondary'}>
        {conversation.kind}
      </Badge>
      <span className="truncate">{conversation.appId}</span>
      <span>·</span>
      <span>{conversation.memberCount} members</span>
      <span>·</span>
      <span>{conversation.messageCount} messages</span>
    </div>
  </button>
);

export const ConversationList = ({
  kind,
  onKindChange,
  appKey,
  onAppKeyChange,
  search,
  onSearchChange,
  selected,
  onSelect,
}: Props) => {
  const [draft, setDraft] = useState(search);
  const [debounced] = useDebounce(draft, 300);
  const { apps } = useMessagingAdminApps();
  const {
    conversations,
    hasMore,
    loading,
    loadingMore,
    error,
    loadMore,
    refetch,
  } = useMessagingAdminConversations({ appKey, kind, search });

  useEffect(() => {
    if (debounced.trim() !== search) onSearchChange(debounced.trim());
  }, [debounced, search, onSearchChange]);

  const renderBody = () => {
    if (error) return <AccessState error={error} onRetry={() => refetch()} />;
    if (loading) {
      return (
        <div className="flex flex-col gap-2 p-3">
          {Array.from({ length: 6 }, (_, index) => (
            <Skeleton key={index} className="h-12 w-full" />
          ))}
        </div>
      );
    }
    if (!conversations.length) {
      return (
        <Empty className="py-12">
          <Empty.Header>
            <Empty.Media variant="icon">
              {kind === 'GROUP' ? <IconUsersGroup /> : <IconMessageCircle />}
            </Empty.Media>
            <Empty.Title>No conversations</Empty.Title>
            <Empty.Description>
              {search
                ? 'No conversation matches this search.'
                : `There are no ${kind.toLowerCase()} conversations yet.`}
            </Empty.Description>
          </Empty.Header>
        </Empty>
      );
    }
    return (
      <div className="flex flex-col gap-1 p-2">
        {conversations.map((conversation) => (
          <ConversationRow
            key={conversation.appKey + conversation.id}
            conversation={conversation}
            active={
              selected?.id === conversation.id &&
              selected.appKey === conversation.appKey
            }
            onSelect={() =>
              onSelect({ appKey: conversation.appKey, id: conversation.id })
            }
          />
        ))}
        {hasMore && (
          <Button
            variant="ghost"
            className="mt-1"
            disabled={loadingMore}
            onClick={() => loadMore()}
          >
            {loadingMore ? 'Loading…' : 'Load more'}
          </Button>
        )}
      </div>
    );
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex flex-col gap-2 border-b p-3">
        <Tabs
          value={kind}
          onValueChange={(value) =>
            onKindChange(value === 'GROUP' ? 'GROUP' : 'DIRECT')
          }
        >
          <Tabs.List className="w-full">
            <Tabs.Trigger value="DIRECT" className="flex-1">
              Direct
            </Tabs.Trigger>
            <Tabs.Trigger value="GROUP" className="flex-1">
              Group
            </Tabs.Trigger>
          </Tabs.List>
        </Tabs>
        <div className="relative">
          <IconSearch className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            maxLength={100}
            placeholder="Search by group name or member"
            className="pl-8"
            aria-label="Search conversations"
          />
        </div>
        <Select
          value={appKey ?? ALL_APPS}
          onValueChange={(value) =>
            onAppKeyChange(value === ALL_APPS ? null : value)
          }
        >
          <Select.Trigger aria-label="Filter by app">
            <Select.Value placeholder="All apps" />
          </Select.Trigger>
          <Select.Content>
            <Select.Item value={ALL_APPS}>All apps</Select.Item>
            {apps.map((app) => (
              <Select.Item key={app.key} value={app.key}>
                {app.appId}
                {apps.some(
                  (other) =>
                    other.appId === app.appId && other.tenant !== app.tenant,
                )
                  ? ` (${app.tenant})`
                  : ''}
              </Select.Item>
            ))}
          </Select.Content>
        </Select>
      </div>
      <ScrollArea className="min-h-0 flex-1">{renderBody()}</ScrollArea>
    </div>
  );
};
