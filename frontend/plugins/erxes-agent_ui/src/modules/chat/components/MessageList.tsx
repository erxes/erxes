import { RefObject } from 'react';
import { IconRobot } from '@tabler/icons-react';
import { Badge, Skeleton } from 'erxes-ui';
import { AgentUIMessage } from '~/modules/chat/types';
import { IChatAgent } from '~/modules/chat/hooks/useChatAgents';
import { MessageBubble } from '~/modules/chat/components/MessageBubble';
import { WaitingIndicator } from '~/modules/chat/components/Avatars';

export const MessageList = ({
  agent,
  messages,
  messagesLoading,
  chatLoading,
  attachmentsEnabled,
  ratingEnabled,
  boxRef,
  endRef,
  onScroll,
  onSuggestion,
  onRegenerate,
  onRate,
}: {
  agent: IChatAgent;
  messages: AgentUIMessage[];
  messagesLoading: boolean;
  chatLoading: boolean;
  attachmentsEnabled: boolean;
  ratingEnabled: boolean;
  boxRef: RefObject<HTMLDivElement>;
  endRef: RefObject<HTMLDivElement>;
  onScroll: () => void;
  onSuggestion: (text: string) => void;
  onRegenerate: () => void;
  onRate: (messageId: string, rating: 1 | -1) => void;
}) => {
  // Approve/deny replies are sent hidden — they continue a gated turn without a
  // visible user bubble.
  const visible = messages.filter(
    (m) => !(m.role === 'user' && m.metadata?.hidden),
  );
  const lastMsg = visible[visible.length - 1];

  return (
    <div ref={boxRef} onScroll={onScroll} className="flex-1 overflow-auto p-4">
      <div className="max-w-3xl mx-auto w-full space-y-4">
        {messagesLoading ? (
          <div className="p-2 space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-2/3 rounded-2xl" />
            ))}
          </div>
        ) : visible.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[55vh] text-center gap-2 ea-msg-in">
            <div className="relative mb-2">
              <div className="ea-orb absolute -inset-5 rounded-full" />
              <div className="relative size-16 rounded-2xl bg-gradient-to-br from-primary/20 via-primary/8 to-transparent border border-primary/20 flex items-center justify-center">
                <IconRobot className="size-8 text-primary" />
              </div>
            </div>
            <p className="text-lg font-semibold">{agent.name}</p>
            {agent.description && (
              <p className="text-sm text-muted-foreground max-w-sm">
                {agent.description}
              </p>
            )}
            <Badge variant="secondary" className="font-mono text-xs mt-1">
              {agent.provider} · {agent.model}
            </Badge>
            <div className="flex flex-wrap justify-center gap-2 mt-4 max-w-md">
              {[
                'What can you do?',
                'Summarize my open tickets',
                attachmentsEnabled
                  ? 'Read the file I attach and summarize it'
                  : 'List the latest customers',
              ].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => onSuggestion(s)}
                  className="ea-pop rounded-full border border-border bg-background px-3.5 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:border-primary/40 hover:bg-primary/4 transition-all hover:-translate-y-0.5"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {visible.map((msg, i) => (
              <MessageBubble
                key={msg.id}
                msg={msg}
                isLast={i === visible.length - 1}
                chatLoading={chatLoading}
                ratingEnabled={ratingEnabled}
                onRegenerate={onRegenerate}
                onRate={onRate}
              />
            ))}
            {chatLoading && lastMsg?.role !== 'assistant' && <WaitingIndicator />}
          </>
        )}
        <div ref={endRef} />
      </div>
    </div>
  );
};
