import { memo } from 'react';
import { IconAlertCircle, IconRefresh } from '@tabler/icons-react';
import { Tooltip } from 'erxes-ui';
import { Message } from '~/modules/chat/types';
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

// memo() so a streaming turn only re-renders the live bubble, not every prior
// message. The store keeps stable object references for unchanged messages, so
// shallow prop equality holds — provided callers pass stable callbacks and the
// per-message gating (regenerate/rate) is derived here from primitive flags
// rather than passed as freshly-built closures.
export const MessageBubble = memo(function MessageBubble({
  msg,
  isLast,
  chatLoading,
  ratingEnabled,
  onRegenerate,
  onRate,
}: {
  msg: Message;
  isLast: boolean;
  chatLoading: boolean;
  ratingEnabled: boolean;
  onRegenerate: () => void;
  onRate: (messageId: string, rating: 1 | -1) => void;
}) {
  if (msg.role === 'error') {
    return (
      <div className="flex justify-center ea-msg-in">
        <div className="flex items-center gap-2 text-xs text-destructive bg-destructive/8 border border-destructive/20 rounded-lg px-3 py-2 max-w-[80%]">
          <IconAlertCircle className="size-3.5 shrink-0" />
          <span>{msg.content}</span>
        </div>
      </div>
    );
  }

  if (msg.role === 'user') {
    const time = msg.timestamp.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
    const hasText = !!msg.content.trim();
    return (
      <div className="flex flex-col items-end gap-1.5 ea-msg-in">
        {msg.attachments && msg.attachments.length > 0 && (
          <MessageAttachments attachments={msg.attachments} />
        )}
        {hasText ? (
          <div className="max-w-[78%] bg-gradient-to-br from-primary to-primary/85 text-primary-foreground rounded-2xl rounded-br-md px-4 py-2.5 shadow-sm">
            <p className="text-sm whitespace-pre-wrap leading-relaxed">
              {msg.content}
            </p>
            <p className="text-[10px] mt-1 text-primary-foreground/60">
              {time}
            </p>
          </div>
        ) : (
          <p className="text-[10px] text-muted-foreground pr-1">{time}</p>
        )}
      </div>
    );
  }

  // assistant — chronological turn parts (thinking / tool calls), then the
  // (possibly still streaming) answer text
  const streaming = !!msg.streaming;
  const parts = msg.parts ?? [];
  // The footer below only renders when !streaming, so the streaming guard is
  // implicit here. Regenerate is offered on the last reply once the turn is
  // idle; rating needs a persisted id and the feature flag.
  const canRegenerate = isLast && !chatLoading;
  const handleRate =
    ratingEnabled && msg.id
      ? (rating: 1 | -1) => onRate(msg.id!, rating)
      : undefined;

  return (
    <div className="flex justify-start items-start gap-2.5 group ea-msg-in">
      <AgentAvatar live={streaming} />
      <div className="max-w-[82%] min-w-0 bg-muted rounded-2xl rounded-bl-md px-4 py-2.5">
        {parts.length > 0 && (
          <div className="mb-2 space-y-1">
            {parts.map((part, i) =>
              part.kind === 'thinking' ? (
                <ThinkingSection
                  key={i}
                  text={part.text}
                  live={streaming && !part.done && i === parts.length - 1}
                />
              ) : (
                <ToolCallRow
                  key={part.call.toolCallId ?? `tool-${i}`}
                  call={part.call}
                  streaming={streaming}
                />
              ),
            )}
          </div>
        )}
        {msg.content ? (
          streaming ? (
            <StreamingMarkdown content={msg.content} />
          ) : (
            <ChatMarkdown content={msg.content} />
          )
        ) : streaming && !parts.length ? (
          <div className="flex items-center gap-1.5 py-1">
            <span className="ea-typing-dot" />
            <span className="ea-typing-dot" />
            <span className="ea-typing-dot" />
          </div>
        ) : null}
        {streaming && msg.content && <span className="ea-caret" />}
        {!streaming && (
          <div className="flex items-center justify-between gap-2 mt-1.5">
            <p className="text-[10px] text-muted-foreground">
              {msg.timestamp.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
              {msg.interrupted && (
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
                <FeedbackButtons rating={msg.rating} onRate={handleRate} />
              )}
              <CopyButton text={msg.content} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
});
