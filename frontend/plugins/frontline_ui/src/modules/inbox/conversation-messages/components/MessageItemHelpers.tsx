import { cn } from 'erxes-ui';

const Img = ({
  alt,
  ...props
}: Omit<JSX.IntrinsicElements['img'], 'alt'> & { alt: string }) => (
  // skipcq: JS-W1015
  <img alt={alt} {...props} />
);

const REACTION_EMOJI: Record<string, string> = {
  love: '❤️',
  like: '👍',
  wow: '😮',
  haha: '😂',
  sad: '😢',
  angry: '😠',
};

export const MESSAGE_ACTION_BAR_CLASS =
  'pointer-events-none hidden translate-y-1 items-center rounded-xl border border-border/70 bg-background/95 p-1 opacity-0 shadow-[0_4px_14px_rgba(15,23,42,0.12)] backdrop-blur-md transition-[opacity,transform] duration-150 group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:translate-y-0 group-focus-within:opacity-100 has-[[data-state=open]]:pointer-events-auto has-[[data-state=open]]:translate-y-0 has-[[data-state=open]]:opacity-100 motion-reduce:transition-none md:flex [@media(pointer:coarse)]:hidden';

export const aggregateReactions = (
  reactions?: Array<{ senderId: string; emoji?: string; reaction?: string }>,
) => {
  const counts = new Map<string, number>();
  for (const reaction of reactions || []) {
    const label =
      reaction.emoji ||
      REACTION_EMOJI[reaction.reaction || ''] ||
      reaction.reaction ||
      '♥';
    counts.set(label, (counts.get(label) || 0) + 1);
  }
  return [...counts.entries()].map(([label, count]) => ({ label, count }));
};

export const ReactionLabel = ({ label }: { label: string }) => {
  const customEmoji = /^<(a?):[^:]+:(\d+)>$/.exec(label);
  if (!customEmoji) return <>{label}</>;
  const [, animated, id] = customEmoji;
  return (
    <Img
      src={`https://cdn.discordapp.com/emojis/${id}.${
        animated ? 'gif' : 'png'
      }`}
      alt="Custom emoji"
      className="inline-block size-4 object-contain"
    />
  );
};

export const DiscordEditedStatus = ({ edited }: { edited?: boolean }) => {
  if (!edited) {
    return null;
  }

  return <span className="text-muted-foreground/70">(edited)</span>;
};

export const getMessageBubbleClassName = ({
  userId,
  internal,
  fromBot,
  isBotMessage,
  separatePrevious,
  showAuthorName,
  showBotName,
  hasReply,
}: {
  userId?: string;
  internal?: boolean;
  fromBot?: boolean;
  isBotMessage?: boolean;
  separatePrevious: boolean;
  showAuthorName: boolean;
  showBotName: boolean;
  hasReply: boolean;
}) =>
  cn(
    'mt-1.5 block h-auto min-h-0 rounded-2xl border border-transparent px-3.5 py-2.5 text-left font-normal shadow-[0_1px_2px_rgba(15,23,42,0.06)] **:whitespace-pre-wrap space-y-1.5 overflow-x-hidden text-pretty wrap-break-word [&_a]:text-primary [&_a]:underline [&_img]:aspect-square [&_img]:object-cover [&_img]:rounded-xl',
    userId &&
      'rounded-br-md border-primary/10 bg-primary/10 hover:bg-primary/10',
    !userId &&
      'rounded-bl-md border-border/60 bg-background hover:bg-background',
    isBotMessage && 'border-border/60 bg-muted hover:bg-muted',
    internal && 'bg-warning/20 hover:bg-warning/5',
    fromBot && 'bg-primary/5 hover:bg-primary/5 border-l-2 border-primary',
    separatePrevious &&
      !hasReply &&
      (showAuthorName || showBotName ? 'mt-0' : 'mt-6'),
    hasReply && 'mt-0 rounded-t-md',
  );
