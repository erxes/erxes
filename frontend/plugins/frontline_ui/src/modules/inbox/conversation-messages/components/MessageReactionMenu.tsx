import { Button, DropdownMenu, Spinner, cn } from 'erxes-ui';
import { IconMoodSmile } from '@tabler/icons-react';
import {
  REACTION_EMOJI,
  type Reaction,
} from '@/inbox/conversation-messages/constants/messageActions';
import { useMessageReaction } from '@/inbox/conversation-messages/hooks/useMessageReaction';
import { ActionButton } from '@/inbox/conversation-messages/components/MessageActionButton';

export function ReactionMenu({
  conversationId,
  messageId,
  disabled,
  disabledReason,
  selectedReaction,
  reactions,
}: Readonly<{
  conversationId: string;
  messageId: string;
  disabled: boolean;
  disabledReason: string;
  selectedReaction?: string;
  reactions: readonly Reaction[];
}>) {
  const { toggleReaction, loading } = useMessageReaction();

  const handleReaction = async (reaction: Reaction) => {
    const remove = selectedReaction === reaction;
    await toggleReaction({ conversationId, messageId, reaction, remove });
  };

  if (reactions.length === 1) {
    const reaction = reactions[0];
    const selected = selectedReaction === reaction;

    let reactionLabel = 'Add love reaction';
    if (disabled) {
      reactionLabel = disabledReason;
    } else if (selected) {
      reactionLabel = 'Remove love reaction';
    }

    return (
      <ActionButton
        label={reactionLabel}
        disabled={disabled || loading}
        onClick={() => {
          handleReaction(reaction);
        }}
      >
        {loading ? (
          <Spinner size="sm" />
        ) : (
          <span
            className={cn(
              'text-base leading-none grayscale transition-all',
              selected && 'scale-110 grayscale-0',
            )}
          >
            {REACTION_EMOJI[reaction]}
          </span>
        )}
      </ActionButton>
    );
  }

  if (disabled) {
    return (
      <ActionButton label={disabledReason} disabled onClick={() => undefined}>
        <IconMoodSmile className="size-4" />
      </ActionButton>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenu.Trigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Add reaction"
          disabled={loading}
          className="size-8 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground data-[state=open]:bg-muted data-[state=open]:text-foreground"
        >
          {loading ? (
            <Spinner size="sm" />
          ) : (
            <IconMoodSmile className="size-4" />
          )}
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content className="flex min-w-0 gap-0.5 p-1">
        {reactions.map((reaction) => (
          <DropdownMenu.Item
            key={reaction}
            aria-label={`React with ${reaction}`}
            className="p-1.5 text-lg"
            onClick={() => {
              handleReaction(reaction);
            }}
          >
            <span
              className={
                selectedReaction === reaction
                  ? 'rounded bg-accent ring-1 ring-primary'
                  : undefined
              }
            >
              {REACTION_EMOJI[reaction]}
            </span>
          </DropdownMenu.Item>
        ))}
      </DropdownMenu.Content>
    </DropdownMenu>
  );
}
