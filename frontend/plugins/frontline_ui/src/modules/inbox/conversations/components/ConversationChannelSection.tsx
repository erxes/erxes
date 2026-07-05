import { IconChevronDown, IconMessageCircle } from '@tabler/icons-react';
import { cn } from 'erxes-ui';
import { useMemo, useState } from 'react';
import { IConversation } from '@/inbox/types/Conversation';
import { DiscordConversationChannel } from '@/integrations/discord/hooks/useDiscordSetup';

type ThreadMap = Map<string, DiscordConversationChannel>;
type RenderItem = (conversation: IConversation) => React.ReactNode;

/**
 * Renders a flat set of conversations as direct rows followed by a nested
 * "Threads" sub-section. Shared by the grouped channel section and the isolated
 * single-channel view so threads are surfaced consistently in both.
 */
export const ConversationThreadList = ({
  conversations,
  threadMap,
  renderItem,
}: {
  conversations: IConversation[];
  threadMap: ThreadMap;
  renderItem: RenderItem;
}) => {
  const { direct, threads } = useMemo(() => {
    const direct: IConversation[] = [];
    const threads: IConversation[] = [];
    for (const conversation of conversations) {
      (threadMap.get(conversation._id)?.isThread ? threads : direct).push(
        conversation,
      );
    }
    return { direct, threads };
  }, [conversations, threadMap]);

  return (
    <>
      {direct.map(renderItem)}
      {threads.length > 0 && (
        // skipcq: JS-0357
        <ThreadsSubsection
          conversations={threads}
          threadMap={threadMap}
          renderItem={renderItem}
        />
      )}
    </>
  );
};

/** Collapsible "Threads" block, sub-grouped by thread name, indented under its
 *  parent channel so a thread reads as a branch of the channel. */
const ThreadsSubsection = ({
  conversations,
  threadMap,
  renderItem,
}: {
  conversations: IConversation[];
  threadMap: ThreadMap;
  renderItem: RenderItem;
}) => {
  const [open, setOpen] = useState(true);

  const byThread = useMemo(() => {
    const map = new Map<string, IConversation[]>();
    for (const conversation of conversations) {
      const name = threadMap.get(conversation._id)?.channelName || 'thread';
      const list = map.get(name) ?? [];
      list.push(conversation);
      map.set(name, list);
    }
    return Array.from(map.entries());
  }, [conversations, threadMap]);

  return (
    <div className="ml-6 border-l border-border">
      <button
        type="button"
        className="flex w-full items-center gap-1 px-3 py-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground hover:text-foreground"
        onClick={() => setOpen((o) => !o)}
      >
        <IconChevronDown
          className={cn('size-3 transition-transform', !open && '-rotate-90')}
        />
        Threads
        <span className="ml-auto tabular-nums">{conversations.length}</span>
      </button>
      {open &&
        byThread.map(([name, items]) => (
          <div key={name}>
            <div className="flex items-center gap-1 px-3 pl-4 py-0.5 text-xs text-muted-foreground">
              <IconMessageCircle className="size-3 shrink-0" />
              <span className="truncate" title={`Thread: ${name}`}>
                {name}
              </span>
            </div>
            {items.map(renderItem)}
          </div>
        ))}
    </div>
  );
};
