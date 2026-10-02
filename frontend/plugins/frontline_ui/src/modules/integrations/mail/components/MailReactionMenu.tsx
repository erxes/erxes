import { IconLoader, IconMoodSmile, IconSearch } from '@tabler/icons-react';
import { Button, Popover, Tooltip, cn } from 'erxes-ui';
import {
  EmojiPicker as EmojiPickerPrimitive,
  type EmojiPickerListCategoryHeaderProps,
  type EmojiPickerListEmojiProps,
  type EmojiPickerListRowProps,
} from 'frimousse';
import { useState } from 'react';
import { useMailSendReaction } from '@/integrations/mail/hooks/useMailConversationDetail';
import type { MailMessage } from '@/integrations/mail/types/mailThread';

const EmojiRow = ({ children, ...props }: EmojiPickerListRowProps) => (
  <div {...props} className="scroll-my-1 px-1">
    {children}
  </div>
);

const EmojiOption = ({ emoji, ...props }: EmojiPickerListEmojiProps) => (
  <button
    {...props}
    type="button"
    aria-label={`React with ${emoji.emoji}`}
    className="data-[active]:bg-accent flex size-7 items-center justify-center rounded-sm text-base"
  >
    {emoji.emoji}
  </button>
);

const EmojiCategory = ({
  category,
  ...props
}: EmojiPickerListCategoryHeaderProps) => (
  <div
    {...props}
    className="bg-background text-muted-foreground px-3 pb-2 pt-3.5 text-xs leading-none"
  >
    {category.label}
  </div>
);

const ActiveEmojiPreview = ({
  emoji,
}: {
  emoji?: { emoji: string; label: string };
}) =>
  emoji ? (
    <>
      <div className="flex size-7 flex-none items-center justify-center text-lg">
        {emoji.emoji}
      </div>
      <span className="text-secondary-foreground truncate text-xs">
        {emoji.label}
      </span>
    </>
  ) : (
    <span className="text-muted-foreground ml-1.5 flex h-7 items-center truncate text-xs">
      Select an emoji…
    </span>
  );

const MailEmojiPicker = ({
  onSelect,
}: {
  onSelect: (emoji: string) => void;
}) => (
  <EmojiPickerPrimitive.Root
    className="bg-popover text-popover-foreground isolate flex h-80 w-full flex-col overflow-hidden rounded-md"
    onEmojiSelect={({ emoji }) => onSelect(emoji)}
  >
    <div className="flex h-9 items-center gap-2 border-b px-3">
      <IconSearch className="size-4 shrink-0 opacity-50" />
      <EmojiPickerPrimitive.Search
        placeholder="Search emoji"
        className="h-9 w-full bg-transparent text-sm outline-none"
      />
    </div>
    <EmojiPickerPrimitive.Viewport className="relative min-h-0 flex-1 outline-none">
      <EmojiPickerPrimitive.Loading className="absolute inset-0 flex items-center justify-center text-muted-foreground">
        <IconLoader className="size-4 animate-spin" />
      </EmojiPickerPrimitive.Loading>
      <EmojiPickerPrimitive.Empty className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm">
        No emoji found.
      </EmojiPickerPrimitive.Empty>
      <EmojiPickerPrimitive.List
        className="select-none pb-1"
        components={{
          Row: EmojiRow,
          Emoji: EmojiOption,
          CategoryHeader: EmojiCategory,
        }}
      />
    </EmojiPickerPrimitive.Viewport>
    <div className="flex w-full min-w-0 items-center gap-1 border-t p-2">
      <EmojiPickerPrimitive.ActiveEmoji>
        {({ emoji }) => <ActiveEmojiPreview emoji={emoji} />}
      </EmojiPickerPrimitive.ActiveEmoji>
    </div>
  </EmojiPickerPrimitive.Root>
);

const getReactionUnavailableReason = ({
  mailData,
}: MailMessage): string | undefined => {
  if (mailData.reactionEmoji) return "You can't react to an emoji reaction";
  if (mailData.hasReplyTo)
    return "You can't react to a message with a reply-to address";
  if (mailData.type === 'SENT') return "You can't react to your own message";
  if (mailData.senderMismatch || !mailData.messageId)
    return 'This email cannot receive a reaction';
  return undefined;
};

export const MailReactionMenu = ({
  conversationId,
  message,
  compact = false,
}: {
  conversationId: string;
  message: MailMessage;
  compact?: boolean;
}) => {
  const [open, setOpen] = useState(false);
  const { react, loading } = useMailSendReaction();

  const reason = getReactionUnavailableReason(message);

  const reactionButton = (
    <Button
      type="button"
      variant="ghost"
      size={compact ? 'icon' : 'sm'}
      aria-label={reason ?? 'Add email reaction'}
      aria-disabled={Boolean(reason) || undefined}
      title={reason ? undefined : 'Add email reaction'}
      disabled={loading && !reason}
      className={cn(
        compact
          ? 'size-8 rounded-full'
          : 'h-7 rounded-full border border-border px-3',
        'aria-disabled:cursor-default aria-disabled:opacity-50 aria-disabled:hover:bg-transparent',
      )}
    >
      <IconMoodSmile className="size-4" />
      {!compact && <span>React</span>}
    </Button>
  );

  if (reason) {
    return (
      <Tooltip>
        <Tooltip.Trigger asChild>{reactionButton}</Tooltip.Trigger>
        <Tooltip.Content className="max-w-60">{reason}</Tooltip.Content>
      </Tooltip>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>{reactionButton}</Popover.Trigger>
      <Popover.Content align="start" className="w-80 overflow-hidden p-0">
        <MailEmojiPicker
          onSelect={(emoji) => {
            setOpen(false);
            react(conversationId, message._id, emoji);
          }}
        />
      </Popover.Content>
    </Popover>
  );
};
