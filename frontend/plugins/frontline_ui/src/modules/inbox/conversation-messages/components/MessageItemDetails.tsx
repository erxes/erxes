import { RelativeDateDisplay, Sheet, cn } from 'erxes-ui';
import { ReactionLabel } from '@/inbox/conversation-messages/components/MessageItemHelpers';
import { MessageActions } from '@/inbox/conversation-messages/components/MessageActions';
import { aggregateReactions } from '@/inbox/conversation-messages/utils/message';
import { useMessageReaction } from '@/inbox/conversation-messages/hooks/useMessageReaction';
import type { IMessage, IMessageReplyTo } from '@/inbox/types/Conversation';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { IntegrationType } from '@/types/Integration';
import { IconMicrophone, IconPin } from '@tabler/icons-react';

export const VoiceMessageLabel = () => (
  <div className="mt-1 flex items-center gap-1 text-xs font-medium text-muted-foreground">
    <IconMicrophone className="size-3.5" /> Voice message
  </div>
);

export const MessagePinnedIndicator = ({ userId }: { userId?: string }) => (
  <span
    aria-label="Pinned message"
    title="Pinned message"
    className={cn(
      'absolute -top-2 z-20 inline-flex size-6 items-center justify-center rounded-full border border-border bg-background text-muted-foreground shadow-md',
      userId ? '-right-2' : '-left-2',
    )}
  >
    <IconPin className="size-3.5" />
  </span>
);

export const MessageForwardedIndicator = () => (
  <div className="mt-2 block w-full max-w-full rounded-t-xl border border-b-0 border-border/60 bg-muted/45 px-3.5 py-2 text-left text-xs text-muted-foreground">
    <div className="font-medium text-foreground">↪ Forwarded</div>
  </div>
);

export const DeletedMessage = ({
  createdAt,
  integrationKind,
  separatePrevious,
  separateNext,
  showAuthorName,
  showBotName,
}: {
  createdAt: string;
  integrationKind?: string;
  separatePrevious: boolean;
  separateNext: boolean;
  showAuthorName: boolean;
  showBotName: boolean;
}) => {
  const { t } = useTranslation('frontline');

  return (
    <div
      className={cn(
        'mt-2 rounded-md border border-dashed px-3 py-2 text-sm italic text-muted-foreground',
        separatePrevious && (showAuthorName || showBotName ? 'mt-0' : 'mt-8'),
      )}
    >
      {integrationKind === IntegrationType.DISCORD_MESSENGER
        ? t('message-deleted-on-discord', 'Message deleted on Discord')
        : t('message-deleted', 'Message deleted')}
      {separateNext && (
        <div className="mt-1 text-xs not-italic">
          <RelativeDateDisplay value={createdAt}>
            <RelativeDateDisplay.Value value={createdAt} />
          </RelativeDateDisplay>
        </div>
      )}
    </div>
  );
};

export const MessageReactions = ({
  reactions,
  loading,
  providerMessageId,
  ownReactionKey,
  conversationId,
  toggleReaction,
}: {
  reactions: ReturnType<typeof aggregateReactions>;
  loading: boolean;
  providerMessageId?: string;
  ownReactionKey?: string;
  conversationId: string;
  toggleReaction: ReturnType<typeof useMessageReaction>['toggleReaction'];
}) => (
  <div className="mt-1 flex flex-wrap gap-1">
    {reactions.map((reaction) => (
      <button
        type="button"
        key={reaction.label}
        className="inline-flex h-7 items-center gap-0.5 rounded-full border border-border/70 bg-background px-2 text-xs shadow-xs transition-colors hover:bg-muted disabled:cursor-wait"
        disabled={loading || !providerMessageId}
        aria-label={`${
          ownReactionKey === reaction.reaction ? 'Remove' : 'Add'
        } ${reaction.reaction} reaction`}
        onClick={() => {
          if (!providerMessageId) return;
          toggleReaction({
            conversationId,
            messageId: providerMessageId,
            reaction: reaction.reaction,
            remove: ownReactionKey === reaction.reaction,
          });
        }}
      >
        <ReactionLabel label={reaction.label} />
        {reaction.count > 1 && (
          <span className="ml-1 text-muted-foreground">{reaction.count}</span>
        )}
      </button>
    ))}
  </div>
);

export const MessageReplyPreview = ({
  replyTo,
}: {
  replyTo: IMessageReplyTo;
}) => (
  <button
    type="button"
    onClick={() => {
      if (!replyTo.messageId) return;
      const target =
        document.querySelector<HTMLElement>(
          `[data-provider-message-id="${CSS.escape(replyTo.messageId)}"]`,
        ) ||
        document.getElementById(`conversation-message-${replyTo.messageId}`);
      target?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      target?.animate(
        [
          { backgroundColor: 'transparent' },
          { backgroundColor: 'hsl(var(--accent))' },
          { backgroundColor: 'transparent' },
        ],
        { duration: 900 },
      );
      if (!target) {
        window.dispatchEvent(
          new CustomEvent('frontline:jump-to-message', {
            detail: replyTo.messageId,
          }),
        );
      }
    }}
    className="mt-2 block w-full max-w-full rounded-t-xl border border-b-0 border-border/60 bg-muted/45 px-3.5 py-2 text-left text-xs text-muted-foreground transition-colors hover:bg-muted/70"
  >
    <div className="font-medium text-foreground">
      {replyTo.authorName
        ? `Replying to ${replyTo.authorName}`
        : 'Replying to a message'}
    </div>
    <div className="truncate">{replyTo.content || replyTo.messageId}</div>
  </button>
);

export const MessageMobileActions = ({
  open,
  onOpenChange,
  message,
  additionalActions,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  message: IMessage;
  additionalActions?: ReactNode;
}) => (
  <Sheet open={open} onOpenChange={onOpenChange}>
    <Sheet.View
      side="bottom"
      className="rounded-t-2xl rounded-b-none bg-background px-4 pt-3 pb-[calc(1rem+env(safe-area-inset-bottom))] [@media(hover:hover)]:hidden"
    >
      <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-border" />
      <div className="mb-3 text-sm font-semibold">Message actions</div>
      <div className="flex min-h-12 items-center justify-center gap-1 rounded-xl border bg-muted/35 p-2">
        <MessageActions
          message={message}
          additionalActions={additionalActions}
        />
      </div>
    </Sheet.View>
  </Sheet>
);
