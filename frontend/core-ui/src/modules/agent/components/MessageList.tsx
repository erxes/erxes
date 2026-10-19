import {
  AgentReferenceProvider,
  useAgentReferenceRegistry,
} from '../references/AgentReferenceScope';
import { buildAgentReferenceScopes } from '../references/referenceRegistry';
import { isTextUIPart, isToolUIPart, type UIMessage } from 'ai';
import { Button, ScrollArea, Skeleton, Tooltip, cn } from 'erxes-ui';
import {
  Fragment,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  IconArrowDown,
  IconCheck,
  IconCopy,
  IconRefresh,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

import { formatAskUserAnswers } from '../askUserAnswers';
import { getReplyCopyText } from '../artifacts/replyText';
import {
  hasVisibleParts,
  MessagePartRenderer,
  readMessageAskUserAnswerCard,
} from './MessagePart';
import { AgentWorkSteps } from './AgentWorkSteps';
import {
  agentMessageActivity,
  groupAgentWorkSteps,
} from '../utils/agentWorkSteps';
import { extractPageContext } from '../utils/pageContext';
import { getMessageText, isAgentsAnswerTurn } from '../utils/messages';
import {
  AGENT_CHAT_WIDTH_CLASSES,
  AGENT_CHAT_WIDTH_PADDING,
  type AgentChatWidth,
} from '../utils/chatWidth';
import { buildTranscriptRows } from '../utils/transcriptRows';
import { UserMessage } from './UserMessage';
import { AgentMessageIdentity } from './AgentMessageIdentity';

export interface IMessageListProps {
  messages: UIMessage[];
  /** Transcript column width preset; defaults to 'standard'. */
  width?: AgentChatWidth;
  status: string;
  loadingThread: boolean;
  approvalBusy: boolean;
  onApprovalRespond: (decision: {
    approvalId: string;
    approved: boolean;
    reason?: string;
  }) => void;
  answerBusy: boolean;
  onAnswer: (answer: string | string[] | (string | string[])[]) => void;
  onRetryTurn: () => void;
  onEditMessage: (messageId: string, text: string) => void;
  editingDisabled: boolean;
  error: string | undefined;
}

/** Show a timestamp divider only after gaps longer than this. */
const TIMESTAMP_GAP_MS = 10 * 60 * 1000;
/** Distance from the bottom (px) that still counts as "near bottom". */
const NEAR_BOTTOM_THRESHOLD = 120;

/**
 * Reads `metadata.createdAt` (present on history messages mapped from the
 * server) as an epoch-ms timestamp. Live-streamed messages carry no
 * metadata; those silently yield `null`.
 */
const getMessageCreatedAt = (message: UIMessage): number | null => {
  const { metadata } = message;

  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) {
    return null;
  }

  const { createdAt } = metadata as { createdAt?: unknown };

  if (typeof createdAt !== 'string') {
    return null;
  }

  const parsed = new Date(createdAt).getTime();

  return Number.isNaN(parsed) ? null : parsed;
};

const formatTimestamp = (timestamp: number): string =>
  new Date(timestamp).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

/**
 * User turns that render nothing in the transcript. The row builder skips
 * them entirely — always judging against the ORIGINAL previous message —
 * so the assistant turns they sit between merge into one row.
 */
const isHiddenTurn = (
  message: UIMessage,
  previousMessage: UIMessage | undefined,
): boolean => {
  if (message.role !== 'user') {
    return false;
  }

  // Ask_user answers display as the assistant's answered Q&A card — never
  // as a bubble of their own. The send marks them with
  // `metadata.agentsAnswer`.
  if (isAgentsAnswerTurn(message)) {
    return true;
  }

  // Answer turns from before the backend stopped storing them as
  // their own user message have no marker in history. The answered
  // Q&A card on the ask_user assistant message right above already
  // carries the answers, so hide a directly following bubble whose
  // text is exactly what those answers format back to.
  if (previousMessage && previousMessage.role === 'assistant') {
    const answerCard = readMessageAskUserAnswerCard(previousMessage);

    if (
      answerCard &&
      getMessageText(message) === formatAskUserAnswers(answerCard)
    ) {
      return true;
    }
  }

  // A bubble whose only content is the persisted `[Page context] …`
  // prefix has nothing left once the context is stripped.
  return extractPageContext(message.parts).parts.length === 0;
};

interface IMessageRowProps {
  message: UIMessage;
  previousMessage: UIMessage | undefined;
  /** True for the last message while a run is in flight. */
  isStreamingTail: boolean;
  /** Last assistant message in the transcript — gets Regenerate + always-visible actions. */
  isLastAssistant: boolean;
  /** Only the current response owns the transcript avatar. */
  showIdentity: boolean;
  onRetryTurn: () => void;
  approvalBusy: boolean;
  onApprovalRespond: (decision: {
    approvalId: string;
    approved: boolean;
    reason?: string;
  }) => void;
  answerBusy: boolean;
  onAnswer: (answer: string | string[] | (string | string[])[]) => void;
  editing: boolean;
  editingDisabled: boolean;
  onEditingChange: (messageId: string | null) => void;
  onEditMessage: (messageId: string, text: string) => void;
}

/**
 * One transcript row, memoized so settled rows do not re-render on each
 * streamed delta: the AI SDK keeps settled `UIMessage` object identities
 * stable across updates, and the row's remaining props (stable callbacks
 * from the surfaces above, the immutable previous message, and a streaming
 * flag that only changes on the tail) do not change either.
 */
const MessageRow = memo(
  ({
    message,
    previousMessage,
    isStreamingTail,
    isLastAssistant,
    showIdentity,
    onRetryTurn,
    approvalBusy,
    onApprovalRespond,
    answerBusy,
    onAnswer,
    editing,
    editingDisabled,
    onEditingChange,
    onEditMessage,
  }: IMessageRowProps) => {
    const { t } = useTranslation('common', { keyPrefix: 'agent' });
    const referenceRegistry = useAgentReferenceRegistry();
    const [copied, setCopied] = useState(false);

    const copyText = () => {
      const text = message.parts
        .filter(isTextUIPart)
        .map((part) => part.text)
        .join('\n');

      if (!text) {
        return;
      }

      void navigator.clipboard
        ?.writeText(
          message.role === 'assistant'
            ? getReplyCopyText(text, referenceRegistry)
            : text,
        )
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        })
        .catch(() => undefined);
    };

    const createdAt = getMessageCreatedAt(message);
    const previousCreatedAt = previousMessage
      ? getMessageCreatedAt(previousMessage)
      : null;
    const showTimestamp =
      createdAt !== null &&
      previousCreatedAt !== null &&
      createdAt - previousCreatedAt > TIMESTAMP_GAP_MS;

    // Tool calls already resolved (e.g. an answered ask_user): their
    // suspension cards must stop rendering even though the suspension
    // data part stays in the message.
    const answeredToolCallIds = new Set(
      message.parts
        .filter(isToolUIPart)
        .filter(
          (part) =>
            part.state === 'output-available' || part.state === 'output-error',
        )
        .map((part) => part.toolCallId),
    );
    const partProps = {
      approvalBusy,
      onApprovalRespond,
      answerBusy,
      onAnswer,
      answeredToolCallIds,
      isStreaming: isStreamingTail,
    };

    if (message.role === 'assistant') {
      const items = groupAgentWorkSteps(message.parts);
      const hasContent =
        items.some((item) => item.kind === 'work' && item.steps.length > 0) ||
        hasVisibleParts(message.parts, answeredToolCallIds);
      const hasText = message.parts.some(
        (part) => isTextUIPart(part) && part.text.trim().length > 0,
      );

      // Fully hide turns with nothing left to show: an assistant message
      // whose only parts are resolved cards (or other hidden tool state)
      // must not leave an empty row behind.
      if (!isStreamingTail && !hasContent) {
        return null;
      }

      return (
        <Fragment>
          {showTimestamp && createdAt !== null && (
            <div className="flex justify-center">
              <span className="text-[11px] text-muted-foreground">
                {formatTimestamp(createdAt)}
              </span>
            </div>
          )}
          <div className="group/assistant agent-message-enter flex w-full flex-col">
            {showIdentity && (
              <AgentMessageIdentity
                activity={
                  isStreamingTail
                    ? agentMessageActivity(message.parts)
                    : undefined
                }
                current
              />
            )}
            <div className="min-w-0 flex-1">
              {items.map((item, index) =>
                item.kind === 'work' ? (
                  <AgentWorkSteps
                    key={`work-${index}`}
                    steps={item.steps}
                    streaming={isStreamingTail && index === items.length - 1}
                  />
                ) : (
                  <MessagePartRenderer
                    key={item.index}
                    part={item.part}
                    role={message.role}
                    {...partProps}
                  />
                ),
              )}
            </div>
            {hasContent &&
              (hasText || (isLastAssistant && !isStreamingTail)) && (
                <div
                  className={cn(
                    'mt-1 flex items-center gap-0.5 transition-opacity',
                    isLastAssistant
                      ? 'opacity-100'
                      : 'opacity-100 sm:opacity-0 sm:group-hover/assistant:opacity-100 sm:group-focus-within/assistant:opacity-100',
                  )}
                >
                  {hasText && (
                    <Tooltip.Provider delayDuration={200}>
                      <Tooltip>
                        <Tooltip.Trigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-7"
                            aria-label={t('copy', 'Copy')}
                            onClick={copyText}
                          >
                            {copied ? (
                              <IconCheck className="size-3.5 text-primary" />
                            ) : (
                              <IconCopy className="size-3.5" />
                            )}
                          </Button>
                        </Tooltip.Trigger>
                        <Tooltip.Content>{t('copy', 'Copy')}</Tooltip.Content>
                      </Tooltip>
                    </Tooltip.Provider>
                  )}
                  {isLastAssistant && !isStreamingTail && (
                    <Tooltip.Provider delayDuration={200}>
                      <Tooltip>
                        <Tooltip.Trigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-7"
                            aria-label={t('regenerate', 'Regenerate')}
                            onClick={onRetryTurn}
                          >
                            <IconRefresh className="size-3.5" />
                          </Button>
                        </Tooltip.Trigger>
                        <Tooltip.Content>
                          {t('regenerate', 'Regenerate')}
                        </Tooltip.Content>
                      </Tooltip>
                    </Tooltip.Provider>
                  )}
                  {createdAt !== null && (
                    <span className="ml-1 text-[11px] text-muted-foreground">
                      {formatTimestamp(createdAt)}
                    </span>
                  )}
                </div>
              )}
          </div>
        </Fragment>
      );
    }

    // User turn: muted right-aligned bubble. The persisted `[Page context]`
    // prefix is stripped and not shown; attachments render above.
    const { parts } = extractPageContext(message.parts);

    return (
      <Fragment>
        {showTimestamp && createdAt !== null && (
          <div className="flex justify-center">
            <span className="text-[11px] text-muted-foreground">
              {formatTimestamp(createdAt)}
            </span>
          </div>
        )}
        <UserMessage
          message={message}
          editing={editing}
          disabled={editingDisabled}
          onEditingChange={onEditingChange}
          onEdit={onEditMessage}
        >
          {parts.map((part, partIndex) => (
            <MessagePartRenderer
              key={`${message.id}-${partIndex}`}
              part={part}
              role={message.role}
              {...partProps}
            />
          ))}
        </UserMessage>
      </Fragment>
    );
  },
);

const TranscriptSkeleton = ({ width }: { width: AgentChatWidth }) => (
  <div
    className={cn(
      'mx-auto w-full min-w-0 space-y-4 py-4 sm:py-6',
      AGENT_CHAT_WIDTH_CLASSES[width],
      AGENT_CHAT_WIDTH_PADDING[width],
    )}
  >
    {[0.4, 0.8, 0.55].map((width, index) => (
      <div
        key={index}
        className={cn('flex', index === 1 ? 'justify-end' : 'justify-start')}
      >
        <Skeleton
          className="h-16 rounded-2xl"
          style={{ width: `${width * 100}%` }}
        />
      </div>
    ))}
  </div>
);

/**
 * Scrollable transcript. Follows the inbox ScrollArea viewport pattern:
 * sticks to the bottom while new content streams in, and pauses
 * auto-scroll — showing a floating "scroll to bottom" button — as soon as
 * the user scrolls up.
 */
export const MessageList = ({
  messages,
  width = 'standard',
  status,
  loadingThread,
  approvalBusy,
  onApprovalRespond,
  answerBusy,
  onAnswer,
  onRetryTurn,
  onEditMessage,
  editingDisabled,
  error,
}: IMessageListProps) => {
  const { t } = useTranslation('common', { keyPrefix: 'agent' });
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const nearBottomRef = useRef(true);
  const [showScrollDown, setShowScrollDown] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const prevLoadingThreadRef = useRef(loadingThread);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);

  useEffect(() => {
    if (loadingThread) setEditingMessageId(null);
  }, [loadingThread]);

  const handleEditMessage = useCallback(
    (messageId: string, text: string) => {
      nearBottomRef.current = true;
      setShowScrollDown(false);
      onEditMessage(messageId, text);
    },
    [onEditMessage],
  );

  const lastMessagePartsLength =
    messages[messages.length - 1]?.parts.length ?? 0;

  const handleScroll = () => {
    const viewport = viewportRef.current;

    if (!viewport) {
      return;
    }

    const nearBottom =
      viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight <
      NEAR_BOTTOM_THRESHOLD;
    nearBottomRef.current = nearBottom;
    setShowScrollDown(!nearBottom);
  };

  const scrollToBottom = () => {
    const viewport = viewportRef.current;

    if (viewport) {
      viewport.scrollTop = viewport.scrollHeight;
      nearBottomRef.current = true;
      setShowScrollDown(false);
    }
  };

  useEffect(() => {
    const wasLoadingThread = prevLoadingThreadRef.current;
    prevLoadingThreadRef.current = loadingThread;

    // A new conversation clears the transcript: re-arm auto-scroll so the
    // first reply lands at the bottom.
    if (messages.length === 0) {
      nearBottomRef.current = true;
      setShowScrollDown(false);
      return;
    }

    if (loadingThread) {
      return;
    }

    // After openThread finishes loading history, always jump to the bottom
    // regardless of where the user had scrolled in the previous thread.
    const threadJustLoaded = wasLoadingThread && !loadingThread;

    if (threadJustLoaded) {
      nearBottomRef.current = true;
    }

    if (!nearBottomRef.current) {
      return;
    }

    const timer = setTimeout(() => {
      const viewport = viewportRef.current;

      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
      }
    }, 0);

    return () => clearTimeout(timer);
  }, [messages.length, lastMessagePartsLength, loadingThread]);

  // Artifact previews resize after load; follow only while the reader is
  // at the bottom.
  useEffect(() => {
    const content = contentRef.current;

    if (!content) {
      return;
    }

    let timer: ReturnType<typeof setTimeout>;
    const observer = new ResizeObserver(() => {
      clearTimeout(timer);

      if (!nearBottomRef.current) {
        return;
      }

      timer = setTimeout(() => {
        const viewport = viewportRef.current;

        if (viewport && nearBottomRef.current) {
          viewport.scrollTop = viewport.scrollHeight;
        }
      }, 0);
    });
    observer.observe(content);

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [loadingThread]);

  const lastAssistantIndex = messages.reduce(
    (last, message, index) => (message.role === 'assistant' ? index : last),
    -1,
  );

  const rows = useMemo(
    () => buildTranscriptRows(messages, isHiddenTurn),
    [messages],
  );
  const lastRow = rows[rows.length - 1];
  const inFlight = status === 'submitted' || status === 'streaming';
  const activeResponseRow =
    inFlight && lastRow?.message.role === 'assistant' ? lastRow.key : null;
  const showPendingResponse = inFlight && activeResponseRow === null;

  const referenceScopes = useMemo(
    () => buildAgentReferenceScopes(messages),
    [messages],
  );

  const transcript = useMemo(
    () =>
      rows.map((row) => (
        <AgentReferenceProvider
          key={row.key}
          registry={referenceScopes[row.lastIndex]}
        >
          <MessageRow
            key={row.key}
            message={row.message}
            previousMessage={row.previousMessage}
            isStreamingTail={row.key === activeResponseRow}
            isLastAssistant={row.lastIndex === lastAssistantIndex}
            showIdentity={
              row.lastIndex === lastAssistantIndex && !showPendingResponse
            }
            onRetryTurn={onRetryTurn}
            approvalBusy={approvalBusy}
            onApprovalRespond={onApprovalRespond}
            answerBusy={answerBusy}
            onAnswer={onAnswer}
            editing={row.message.id === editingMessageId}
            editingDisabled={editingDisabled}
            onEditingChange={setEditingMessageId}
            onEditMessage={handleEditMessage}
          />
        </AgentReferenceProvider>
      )),
    [
      rows,
      referenceScopes,
      lastAssistantIndex,
      activeResponseRow,
      showPendingResponse,
      onRetryTurn,
      approvalBusy,
      onApprovalRespond,
      answerBusy,
      onAnswer,
      editingMessageId,
      editingDisabled,
      handleEditMessage,
    ],
  );

  if (loadingThread) {
    return <TranscriptSkeleton width={width} />;
  }

  return (
    <div className="relative flex min-h-0 min-w-0 flex-1 flex-col">
      <ScrollArea.Root className="min-h-0 min-w-0 flex-1">
        <ScrollArea.Viewport
          ref={viewportRef}
          onScroll={handleScroll}
          // Radix's display:table wrapper otherwise grows to long tool labels.
          className="min-w-0 [&>div]:block! [&>div]:min-w-0"
        >
          <div
            ref={contentRef}
            className={cn(
              'mx-auto w-full min-w-0 space-y-3 py-4 sm:space-y-4 sm:py-5',
              AGENT_CHAT_WIDTH_CLASSES[width],
              AGENT_CHAT_WIDTH_PADDING[width],
            )}
          >
            {transcript}
            {showPendingResponse && (
              <div className="agent-message-enter">
                <AgentMessageIdentity
                  activity={t('working', 'Working…')}
                  current
                />
              </div>
            )}
            {error && status !== 'submitted' && status !== 'streaming' && (
              <div className="flex items-center gap-2 text-xs text-destructive">
                <span className="min-w-0 flex-1 break-words">{error}</span>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 shrink-0 text-xs"
                  onClick={onRetryTurn}
                >
                  {t('retry', 'Retry')}
                </Button>
              </div>
            )}
          </div>
        </ScrollArea.Viewport>
        <ScrollArea.Bar orientation="vertical" />
      </ScrollArea.Root>
      {showScrollDown && (
        <Button
          variant="outline"
          size="icon"
          className="absolute bottom-4 left-1/2 size-8 -translate-x-1/2 rounded-full shadow-md"
          onClick={scrollToBottom}
          aria-label={t('scroll-to-bottom', 'Scroll to bottom')}
        >
          <IconArrowDown className="size-4" />
        </Button>
      )}
    </div>
  );
};
