import { IconX } from '@tabler/icons-react';
import { Button, cn } from 'erxes-ui';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { useAgentsConnection } from '../hooks/useAgentsConnection';
import { useAgentsModels } from '../hooks/useAgentsModels';
import type { IUseAgentsChatResult } from '../hooks/useAgentsChat';
import { agentsFilesPart } from '../agentsFiles';
import { pageSelectionsPart } from '../pageSelections';
import { POSES } from '../bloub/engine/states';
import { BotBadge } from './BotBadge';
import { Composer } from './Composer';
import { modelSelectionValue, ModelPicker } from './ModelPicker';
import { MessageList } from './MessageList';
import { ThinkingPicker } from './ThinkingPicker';
import {
  AGENT_CHAT_WIDTH_CLASSES,
  AGENT_CHAT_WIDTH_PADDING,
  type AgentChatWidth,
} from '../utils/chatWidth';
import { useAgentSuggestions } from '../constants/agentSuggestions';

/** Extracts a readable message from a transport error (JSON or plain). */
const describeError = (error: Error): string => {
  try {
    const parsed = JSON.parse(error.message) as { error?: string };
    if (typeof parsed.error === 'string' && parsed.error) {
      return parsed.error;
    }
  } catch {
    // Not a JSON body; use the raw message.
  }

  return error.message || 'Something went wrong.';
};

export interface IChatPanelProps {
  chat: IUseAgentsChatResult;
  /** Optional class for the panel root. */
  className?: string;
  /** Transcript column width; defaults to the full panel width. */
  width?: AgentChatWidth;
  /** Composer page-context chip row (side panel only). */
  contextRow?: ReactNode;
}

/**
 * Complete agents chat surface: transcript, approval prompts, composer,
 * and error feedback. The side panel holds the
 * `useAgentsChat` hook so it can also drive thread controls from the same
 * instance.
 *
 * Two layouts share one composer: the empty state centers the hero +
 * suggestions + composer; a conversation fills the panel with the
 * transcript and docks the composer below. When no BYOK connection is
 * configured the composer is disabled behind an inline settings banner.
 */
export const ChatPanel = ({
  chat,
  className,
  width = 'full',
  contextRow,
}: IChatPanelProps) => {
  const { t } = useTranslation('common', { keyPrefix: 'agent' });
  const suggestions = useAgentSuggestions();
  const {
    messages,
    status,
    error,
    loadingThread,
    threadId,
    sendMessage,
    addToolApprovalResponse,
    stop,
    clearError,
    answerBusy,
    submitAnswer,
    canReconnect,
    resumeStream,
    retryLastTurn,
  } = chat;

  const { connections, loading: connectionsLoading } = useAgentsConnection();
  const models = useAgentsModels();

  // The server default (Auto) runs the first configured provider's stored
  // model; showing it keeps the default from being hidden.
  const autoModel = connections[0]?.model;

  const isStreaming = status === 'submitted' || status === 'streaming';
  const isEmpty = messages.length === 0 && !loadingThread;
  const noConnection = !connectionsLoading && connections.length === 0;

  // Hovering a suggestion card makes the hero bot wink once — re-armed
  // through restartKey so a second hover replays it while still winking.
  const [winking, setWinking] = useState(false);
  const [winkKey, setWinkKey] = useState(0);
  const winkTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const winkOnce = useCallback(() => {
    // Re-arm only mid-wink: entering wink the state change already
    // carries the transition, a reset here would kill the fade.
    setWinking((already) => {
      if (already) {
        setWinkKey((key) => key + 1);
      }
      return true;
    });
    if (winkTimer.current) {
      clearTimeout(winkTimer.current);
    }
    winkTimer.current = setTimeout(() => setWinking(false), 1600);
  }, []);

  useEffect(
    () => () => {
      if (winkTimer.current) {
        clearTimeout(winkTimer.current);
      }
    },
    [],
  );

  const heroBot = (size: number) => (
    <BotBadge
      size={size}
      state={winking ? 'wink' : 'idle'}
      follow
      restartKey={winkKey}
      aria-label={t('nav-label', 'AI Agent')}
    />
  );

  // Stable identity so the memoized transcript rows skip re-renders while
  // the streaming tail updates.
  const handleApprovalRespond = useCallback(
    ({
      approvalId,
      approved,
      reason,
    }: {
      approvalId: string;
      approved: boolean;
      reason?: string;
    }) => addToolApprovalResponse({ id: approvalId, approved, reason }),
    [addToolApprovalResponse],
  );

  const errorBanner = error ? (
    <div className="flex items-start gap-2 border-b border-destructive/30 bg-destructive/10 px-3 py-2 text-[13px] text-destructive sm:text-sm">
      <BotBadge
        size={20}
        state="exclaim"
        frozenAt={POSES.exclaim}
        className="mt-0.5"
      />
      <p className="min-w-0 flex-1 break-words">{describeError(error)}</p>
      {canReconnect ? (
        <Button
          variant="ghost"
          size="sm"
          className="h-7 shrink-0 text-xs"
          onClick={() => void resumeStream()}
        >
          {t('reconnect', 'Reconnect')}
        </Button>
      ) : (
        <Button
          variant="ghost"
          size="sm"
          className="h-7 shrink-0 text-xs"
          onClick={retryLastTurn}
        >
          {t('retry', 'Retry')}
        </Button>
      )}
      <Button
        variant="ghost"
        size="icon"
        className="size-6 shrink-0"
        onClick={clearError}
        aria-label={t('dismiss-error', 'Dismiss error')}
      >
        <IconX className="size-3.5" />
      </Button>
    </div>
  ) : null;

  const connectionBanner = noConnection ? (
    <div className="flex items-center gap-2 border-b bg-muted/40 px-3 py-2 text-[13px]">
      <BotBadge size={28} state="sleep" frozenAt={POSES.sleep} />
      <p className="min-w-0 flex-1 text-muted-foreground">
        {t(
          'no-connection',
          'Connect an AI provider before chatting. Keys stay on your account.',
        )}
      </p>
      <Button variant="outline" size="sm" className="h-7 shrink-0" asChild>
        <Link to="/settings/agent">{t('set-up', 'Set up')}</Link>
      </Button>
    </div>
  ) : null;

  const pickers = (
    <>
      <ModelPicker
        models={models}
        value={modelSelectionValue(chat.modelProvider, chat.modelId)}
        autoModel={autoModel}
        defaultModels={connections}
        onChange={(value) => {
          if (!value) {
            chat.selectModel('', '');
            return;
          }

          const separatorIndex = value.indexOf('|');

          if (separatorIndex === -1) {
            return;
          }

          chat.selectModel(
            value.slice(0, separatorIndex),
            value.slice(separatorIndex + 1),
          );
        }}
      />
      <ThinkingPicker
        value={chat.thinkingLevel}
        onChange={chat.selectThinkingLevel}
      />
    </>
  );

  const composer = (
    <Composer
      status={status}
      disabled={loadingThread || noConnection}
      draftScope={threadId ?? 'new'}
      onSend={(text, files, selections = []) => {
        if (files.length > 0 || selections.length > 0) {
          void sendMessage({
            parts: [
              { type: 'text', text },
              ...(files.length ? [agentsFilesPart(files)] : []),
              ...(selections.length ? [pageSelectionsPart(selections)] : []),
            ],
          });
          return;
        }

        void sendMessage({ text });
      }}
      onStop={stop}
      pickers={pickers}
      contextRow={contextRow}
    />
  );

  const suggestionCards = (
    <div className="flex w-full flex-col gap-2">
      {suggestions.map((suggestion) => {
        const Icon = suggestion.icon;

        return (
          <button
            key={suggestion.prompt}
            type="button"
            disabled={noConnection}
            onClick={() => sendMessage({ text: suggestion.prompt })}
            onPointerEnter={winkOnce}
            onFocus={winkOnce}
            className="flex items-center gap-2.5 rounded-xl bg-muted/40 px-3 py-2.5 text-left text-[13px] transition-[background-color,transform] duration-200 hover:bg-muted motion-safe:hover:translate-x-1 motion-safe:active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Icon className="size-4 shrink-0 text-muted-foreground" />
            <span className="min-w-0 truncate">{suggestion.prompt}</span>
          </button>
        );
      })}
    </div>
  );

  if (isEmpty) {
    return (
      <div
        key={threadId ?? 'new-chat'}
        className={cn(
          'agent-session-enter flex h-full min-h-0 min-w-0 flex-1 flex-col',
          className,
        )}
      >
        {errorBanner}
        {connectionBanner}
        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto flex min-h-full w-full max-w-xl flex-col items-center justify-center gap-5 px-4 py-6 sm:gap-6 sm:py-8 sm:max-w-2xl">
            <div className="flex flex-col items-center gap-3 text-center sm:gap-4">
              {heroBot(72)}
              <div className="space-y-1">
                <h2 className="text-base font-semibold md:text-lg">
                  {t('how-can-i-help', 'How can I help?')}
                </h2>
                <p className="text-xs text-muted-foreground">
                  {t('ask-anything', 'Ask anything about your erxes workspace')}
                </p>
              </div>
            </div>
            <div className="w-full">{composer}</div>
            {suggestionCards}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      key={threadId ?? 'new-chat'}
      className={cn(
        'agent-session-enter flex h-full min-h-0 min-w-0 flex-1 flex-col',
        className,
      )}
    >
      {errorBanner}
      {connectionBanner}
      <MessageList
        messages={messages}
        width={width}
        status={status}
        loadingThread={loadingThread}
        approvalBusy={isStreaming}
        onApprovalRespond={handleApprovalRespond}
        answerBusy={answerBusy || isStreaming}
        onAnswer={submitAnswer}
        onRetryTurn={retryLastTurn}
        onEditMessage={chat.editMessage}
        editingDisabled={
          isStreaming ||
          loadingThread ||
          answerBusy ||
          canReconnect ||
          noConnection
        }
        error={error ? describeError(error) : undefined}
      />
      {/* `pb` keeps the composer clear of the iOS home indicator without
            adding dead space on every other device. */}
      <div className="bg-background/80 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-1 backdrop-blur">
        <div
          className={cn(
            'mx-auto w-full',
            AGENT_CHAT_WIDTH_CLASSES[width],
            AGENT_CHAT_WIDTH_PADDING[width],
          )}
        >
          {composer}
        </div>
      </div>
    </div>
  );
};
