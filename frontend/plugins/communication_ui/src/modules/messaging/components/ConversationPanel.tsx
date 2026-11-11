import { useState } from 'react';
import { format } from 'date-fns';
import {
  IconEye,
  IconMessageCircle,
  IconRefresh,
  IconUsersGroup,
} from '@tabler/icons-react';
import {
  Avatar,
  Badge,
  Button,
  Empty,
  ScrollArea,
  Skeleton,
  Tooltip,
} from 'erxes-ui';
import {
  useMessagingAdminConversation,
  useMessagingAdminMessages,
  useMessagingAdminParticipants,
} from '../hooks/useMessagingAdmin';
import type {
  AdminConversation,
  AdminMessage,
  AdminParticipant,
  SelectedConversation,
} from '../types';
import { conversationTitle, initials } from '../utils';
import { AccessState } from './AccessState';
import { MessageAttachment } from './MessageAttachment';

const formatTime = (value: string) => format(new Date(value), 'PPp');

const ConversationHeader = ({
  conversation,
  participants,
  onRefresh,
}: {
  conversation: AdminConversation;
  participants: AdminParticipant[];
  onRefresh: () => void;
}) => {
  const Icon =
    conversation.kind === 'GROUP' ? IconUsersGroup : IconMessageCircle;
  const title = conversationTitle({
    ...conversation,
    participants: participants
      .filter((row) => row.active)
      .map((row) => row.member),
  });
  return (
    <div className="flex flex-wrap items-center gap-3 border-b px-4 py-3">
      <Icon className="size-5 shrink-0 text-muted-foreground" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h2 className="truncate text-base font-semibold">{title}</h2>
          <Badge variant={conversation.kind === 'GROUP' ? 'info' : 'secondary'}>
            {conversation.kind}
          </Badge>
        </div>
        <div className="text-xs text-muted-foreground">
          {conversation.appId} · {conversation.memberCount} members ·{' '}
          {conversation.messageCount} messages · last activity{' '}
          {formatTime(conversation.lastActivityAt)}
        </div>
      </div>
      <Tooltip.Provider>
        <Tooltip>
          <Tooltip.Trigger asChild>
            <Badge variant="warning" className="gap-1">
              <IconEye className="size-3.5" />
              Not a participant
            </Badge>
          </Tooltip.Trigger>
          <Tooltip.Content className="max-w-xs">
            You are reading this conversation as an administrator. You are not a
            member, participants are not notified, and their read state does not
            change.
          </Tooltip.Content>
        </Tooltip>
      </Tooltip.Provider>
      <Button
        variant="ghost"
        size="icon"
        onClick={onRefresh}
        aria-label="Refresh conversation"
      >
        <IconRefresh />
      </Button>
    </div>
  );
};

const MessageItem = ({ message }: { message: AdminMessage }) => (
  <div className="flex gap-3 px-4 py-2">
    <Avatar size="lg" className="mt-0.5 shrink-0">
      <Avatar.Fallback>{initials(message.sender.displayName)}</Avatar.Fallback>
    </Avatar>
    <div className="min-w-0 flex-1">
      <div className="flex flex-wrap items-baseline gap-2">
        <span className="text-sm font-medium">
          {message.sender.displayName}
        </span>
        {message.sender.subject && (
          <span className="truncate text-xs text-muted-foreground">
            {message.sender.subject}
          </span>
        )}
        <time
          dateTime={message.createdAt}
          className="text-xs text-muted-foreground"
        >
          {formatTime(message.createdAt)}
        </time>
        <span className="text-xs text-muted-foreground">
          #{message.sequence}
        </span>
      </div>
      {message.text && (
        <p className="whitespace-pre-wrap break-words text-sm">
          {message.text}
        </p>
      )}
      {message.mentions.length > 0 && (
        <div className="mt-1 flex flex-wrap gap-1">
          {message.mentions.map((member) => (
            <Badge key={member.id} variant="secondary">
              @{member.displayName}
            </Badge>
          ))}
        </div>
      )}
      {message.attachments.map((attachment) => (
        <MessageAttachment key={attachment.id} attachment={attachment} />
      ))}
    </div>
  </div>
);

const MessageTimeline = ({ selected }: { selected: SelectedConversation }) => {
  const {
    messages,
    hasOlder,
    loading,
    loadingOlder,
    error,
    loadOlder,
    refetch,
  } = useMessagingAdminMessages(selected);

  if (error) return <AccessState error={error} onRetry={() => refetch()} />;
  if (loading) {
    return (
      <div className="flex flex-col gap-4 p-4">
        {Array.from({ length: 5 }, (_, index) => (
          <Skeleton key={index} className="h-14 w-full" />
        ))}
      </div>
    );
  }
  if (!messages.length) {
    return (
      <Empty className="py-12">
        <Empty.Header>
          <Empty.Media variant="icon">
            <IconMessageCircle />
          </Empty.Media>
          <Empty.Title>No messages</Empty.Title>
          <Empty.Description>
            This conversation has no messages yet.
          </Empty.Description>
        </Empty.Header>
      </Empty>
    );
  }
  return (
    <div className="flex flex-col py-2">
      {hasOlder && (
        <Button
          variant="ghost"
          className="mx-auto mb-2"
          disabled={loadingOlder}
          onClick={() => loadOlder()}
        >
          {loadingOlder ? 'Loading…' : 'Load older messages'}
        </Button>
      )}
      {messages.map((message) => (
        <MessageItem key={message.id} message={message} />
      ))}
    </div>
  );
};

const ParticipantList = ({
  kind,
  participants,
  loading,
}: {
  kind: AdminConversation['kind'];
  participants: AdminParticipant[];
  loading: boolean;
}) => {
  if (loading) {
    return (
      <div className="flex flex-col gap-2 p-3">
        {Array.from({ length: 3 }, (_, index) => (
          <Skeleton key={index} className="h-10 w-full" />
        ))}
      </div>
    );
  }
  if (!participants.length) {
    return (
      <p className="p-3 text-sm text-muted-foreground">No participants.</p>
    );
  }
  return (
    <ul className="flex flex-col gap-1 p-2">
      {participants.map((row) => (
        <li
          key={row.member.id}
          className="flex items-center gap-2 rounded-md px-2 py-1.5"
        >
          <Avatar className="shrink-0">
            <Avatar.Fallback>
              {initials(row.member.displayName)}
            </Avatar.Fallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="truncate text-sm font-medium">
                {row.member.displayName}
              </span>
              {kind === 'GROUP' && row.role !== 'MEMBER' && (
                <Badge variant="default">{row.role}</Badge>
              )}
              {!row.active && <Badge variant="secondary">Left</Badge>}
            </div>
            <div className="truncate text-xs text-muted-foreground">
              {row.member.subject ?? 'Unknown subject'} · read through #
              {row.lastReadSequence}
              {row.active && row.unreadCount > 0
                ? ` · ${row.unreadCount} unread`
                : ''}
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
};

export const ConversationPanel = ({
  selected,
}: {
  selected: SelectedConversation;
}) => {
  const { conversation, loading, error, refetch } =
    useMessagingAdminConversation(selected);
  const participantsQuery = useMessagingAdminParticipants(selected);
  // Remounting the timeline reloads its history from the first page.
  const [version, setVersion] = useState(0);
  const refresh = () => {
    refetch();
    participantsQuery.refetch();
    setVersion((current) => current + 1);
  };

  if (error) return <AccessState error={error} onRetry={() => refetch()} />;
  if (loading || !conversation) {
    return (
      <div className="flex flex-col gap-3 p-4">
        <Skeleton className="h-10 w-1/2" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }
  return (
    <div className="flex h-full min-h-0 flex-col">
      <ConversationHeader
        conversation={conversation}
        participants={participantsQuery.participants}
        onRefresh={refresh}
      />
      <div className="flex min-h-0 flex-1">
        <ScrollArea className="min-h-0 flex-1">
          <MessageTimeline
            key={selected.appKey + selected.id + version}
            selected={selected}
          />
        </ScrollArea>
        <aside className="hidden w-72 shrink-0 flex-col border-l lg:flex">
          <div className="border-b px-3 py-2 text-sm font-medium">
            {conversation.kind === 'GROUP' ? 'Group members' : 'Participants'}
          </div>
          <ScrollArea className="min-h-0 flex-1">
            {participantsQuery.error ? (
              <AccessState error={participantsQuery.error} />
            ) : (
              <ParticipantList
                kind={conversation.kind}
                participants={participantsQuery.participants}
                loading={participantsQuery.loading}
              />
            )}
          </ScrollArea>
        </aside>
      </div>
    </div>
  );
};
