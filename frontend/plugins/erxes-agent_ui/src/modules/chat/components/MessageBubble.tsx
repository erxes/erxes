import { memo } from 'react';
import { IconRefresh } from '@tabler/icons-react';
import { Collapsible, Tooltip } from 'erxes-ui';
import { AgentUIMessage } from '~/modules/chat/types';
import { asToolPart, messageText } from '~/modules/chat/lib/uiParts';
import { AgentAvatar } from '~/modules/chat/components/Avatars';
import {
  ChatMarkdown,
  StreamingMarkdown,
} from '~/modules/chat/components/ChatMarkdown';
import { CopyButton } from '~/modules/chat/components/CopyButton';
import { FeedbackButtons } from '~/modules/chat/components/FeedbackButtons';
import { MessageAttachments } from '~/modules/chat/components/MessageAttachments';
import { ThinkingSection } from '~/modules/chat/components/ThinkingSection';
import { ToolCallRow } from '~/modules/chat/components/ToolCallRow';

type MessagePart = AgentUIMessage['parts'][number];

const formatTime = (iso?: string): string =>
  (iso ? new Date(iso) : new Date()).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

// All reasoning + tool-call parts collapsed into one "Show thinking process" row.
// Starts closed so the final response text is the first thing the user sees.
const ToolsSection = ({
  parts,
  streaming,
}: {
  parts: MessagePart[];
  streaming: boolean;
}) => {
  const toolCount = parts.filter((p) => !!asToolPart(p)).length;

  return (
    <Collapsible defaultOpen={false} className="mb-3">
      <Collapsible.TriggerButton className="h-auto w-auto py-0.5 text-xs gap-1.5 text-muted-foreground hover:text-foreground">
        <Collapsible.TriggerIcon className="size-3 shrink-0" />
        Show thinking process
        {toolCount > 0 && (
          <span className="opacity-50 font-mono">
            · {toolCount} tool{toolCount !== 1 ? 's' : ''}
          </span>
        )}
      </Collapsible.TriggerButton>
      <Collapsible.Content>
        <div className="mt-2 space-y-1">
          {parts.map((part, i) => {
            const tool = asToolPart(part);
            if (tool) {
              return (
                <ToolCallRow
                  key={tool.toolCallId ?? `tool-${i}`}
                  call={tool}
                  streaming={streaming}
                />
              );
            }
            if (part.type === 'reasoning') {
              return (
                <ThinkingSection
                  key={`reasoning-${i}`}
                  text={part.text}
                  live={streaming && part.state === 'streaming'}
                />
              );
            }
            return null;
          })}
        </div>
      </Collapsible.Content>
    </Collapsible>
  );
};

// memo() so a streaming turn only re-renders the live bubble, not every prior
// message — useChat keeps stable refs for settled messages, so shallow prop
// equality holds provided callers pass stable callbacks.
export const MessageBubble = memo(function MessageBubble({
  msg,
  isLast,
  chatLoading,
  ratingEnabled,
  onRegenerate,
  onRate,
}: {
  msg: AgentUIMessage;
  isLast: boolean;
  chatLoading: boolean;
  ratingEnabled: boolean;
  onRegenerate: () => void;
  onRate: (messageId: string, rating: 1 | -1) => void;
}) {
  const text = messageText(msg);

  if (msg.role === 'user') {
    const attachments = msg.metadata?.attachments;
    const time = formatTime(msg.metadata?.createdAt);
    const hasText = !!text.trim();
    return (
      <div className="flex flex-col items-end gap-1.5 ea-msg-in">
        {attachments && attachments.length > 0 && (
          <MessageAttachments attachments={attachments} />
        )}
        {hasText ? (
          <div className="max-w-[78%] bg-gradient-to-br from-primary to-primary/85 text-primary-foreground rounded-2xl rounded-br-md px-4 py-2.5 shadow-sm">
            <p className="text-sm whitespace-pre-wrap leading-relaxed">{text}</p>
            <p className="text-[10px] mt-1 text-primary-foreground/60">{time}</p>
          </div>
        ) : (
          <p className="text-[10px] text-muted-foreground pr-1">{time}</p>
        )}
      </div>
    );
  }

  // assistant — transparent bubble with subtle border + shadow.
  const streaming = isLast && chatLoading;
  const turnParts = msg.parts.filter(
    (p) => p.type === 'reasoning' || !!asToolPart(p),
  );
  const canRegenerate = isLast && !chatLoading;
  const messageId = msg.metadata?.messageId;
  const handleRate =
    ratingEnabled && messageId
      ? (rating: 1 | -1) => onRate(messageId, rating)
      : undefined;

  return (
    <div className="flex justify-start items-start gap-2.5 group ea-msg-in">
      <AgentAvatar live={streaming} />
      <div className="max-w-[82%] min-w-0 rounded-2xl rounded-bl-md px-4 py-2.5 shadow-sm">
        {turnParts.length > 0 && (
          <ToolsSection parts={turnParts} streaming={streaming} />
        )}
        {text ? (
          streaming ? (
            <StreamingMarkdown content={text} />
          ) : (
            <ChatMarkdown content={text} />
          )
        ) : streaming && !turnParts.length ? (
          <div className="flex items-center gap-1.5 py-1">
            <span className="ea-typing-dot" />
            <span className="ea-typing-dot" />
            <span className="ea-typing-dot" />
          </div>
        ) : null}
        {streaming && text && <span className="ea-caret" />}
        {!streaming && (
          <div className="flex items-center justify-between gap-2 mt-1.5">
            <p className="text-[10px] text-muted-foreground">
              {formatTime(msg.metadata?.createdAt)}
              {msg.metadata?.interrupted && (
                <span className="ml-1.5 text-amber-600 dark:text-amber-500">
                  · stopped
                </span>
              )}
            </p>
            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
              {canRegenerate && (
                <Tooltip.Provider>
                  <Tooltip>
                    <Tooltip.Trigger asChild>
                      <button
                        type="button"
                        onClick={onRegenerate}
                        className="size-6 flex items-center justify-center rounded hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-muted-foreground hover:text-foreground"
                      >
                        <IconRefresh className="size-3.5" />
                      </button>
                    </Tooltip.Trigger>
                    <Tooltip.Content>Regenerate</Tooltip.Content>
                  </Tooltip>
                </Tooltip.Provider>
              )}
              {handleRate && (
                <FeedbackButtons rating={msg.metadata?.rating} onRate={handleRate} />
              )}
              <CopyButton text={text} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
});
