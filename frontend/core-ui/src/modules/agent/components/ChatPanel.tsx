import { IconX } from '@tabler/icons-react';
import { Button, Kbd, cn } from 'erxes-ui';
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAtomValue } from 'jotai';
import { currentUserState } from 'ui-modules';

import { useAgentsConnection } from '../hooks/useAgentsConnection';
import { useAgentsModels } from '../hooks/useAgentsModels';
import type { IUseAgentsChatResult } from '../hooks/useAgentsChat';
import { agentsFilesPart } from '../agentsFiles';
import { POSES } from '../bloub/engine/states';
import { BotBadge } from './BotBadge';
import { Composer } from './Composer';
import { modelSelectionValue, ModelPicker } from './ModelPicker';
import { MessageList } from './MessageList';
import { ThinkingPicker } from './ThinkingPicker';
import { AgentChatThreadContext } from '../states/agentChatContext';
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
  /** Transcript column width preset; defaults to 'standard'. */
  width?: AgentChatWidth;
  /** Empty-state layout: roomy left-aligned 'page' or compact 'panel'. */
  variant?: 'page' | 'panel';
  /** Composer page-context chip row (side panel only). */
  contextRow?: ReactNode;
}

/**
 * "Good morning, <name>?" — time-of-day greeting with the signed-in user's
 * first name when known, falling back to the generic prompt.
 */
const useGreeting = (): string => {
  const { t } = useTranslation('common', { keyPrefix: 'agent' });
  const currentUser = useAtomValue(currentUserState);
  const hour = new Date().getHours();

  const fallback = t('how-can-i-help', 'How can I help?');
  const firstName = currentUser?.details?.firstName?.trim();

  if (!firstName) {
    return fallback;
  }

  const greeting =
    hour < 12
      ? t('greeting-morning', 'Good morning')
      : hour < 18
        ? t('greeting-afternoon', 'Good afternoon')
        : t('greeting-evening', 'Good evening');

  return `${greeting}, ${firstName}`;
};

/**
 * Complete agents chat surface: transcript, approval prompts, composer,
 * and error feedback. The owning page or side panel holds the
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
  width = 'standard',
  variant = 'panel',
  contextRow,
}: IChatPanelProps) => {
  const { t } = useTranslation('common', { keyPrefix: 'agent' });
  const greeting = useGreeting();
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

  const handleRetryArtifact = useCallback(
    (title: string) => {
      sendMessage({
        text: `Please regenerate the incomplete artifact "${title}" as one complete artifact, including all content and the closing fence. Keep styles concise so it fits in one response.`,
      });
    },
    [sendMessage],
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
      size={variant === 'page' ? 'large' : 'default'}
      draftScope={threadId ?? 'new'}
      onSend={(text, files) => {
        if (files.length > 0) {
          void sendMessage({
            parts: [{ type: 'text', text }, agentsFilesPart(files)],
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

  const suggestionCards = (variant === 'page' ? (
    <div className="grid w-full gap-2 sm:grid-cols-2">
      {suggestions.map((suggestion) => {
        const Icon = suggestion.icon;

        return (
          <button
            key={suggestion.prompt}
            type="button"
            disabled={noConnection}
            onClick={() => sendMessage({ text: suggestion.prompt })}
            onPointerEnter={winkOnce}
            className="flex items-start gap-3 rounded-xl bg-muted/40 p-3 text-left transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-background text-muted-foreground">
              <Icon className="size-4" />
            </span>
            <span className="min-w-0">
              <span className="block text-xs text-muted-foreground">
                {t(`suggestion-categories.${suggestion.category}`)}
              </span>
              <span className="mt-0.5 block text-[13px] leading-snug">
                {suggestion.prompt}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  ) : (
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
            className="flex items-center gap-2.5 rounded-xl bg-muted/40 px-3 py-2.5 text-left text-[13px] transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Icon className="size-4 shrink-0 text-muted-foreground" />
            <span className="min-w-0 truncate">{suggestion.prompt}</span>
          </button>
        );
      })}
    </div>
  ));

  if (isEmpty) {
    return (
      <AgentChatThreadContext.Provider value={threadId}>
        <div
          className={cn(
            'flex h-full min-h-0 min-w-0 flex-1 flex-col',
            className,
          )}
        >
          {errorBanner}
          {connectionBanner}
          <div className="min-h-0 flex-1 overflow-y-auto">
            {variant === 'page' ? (
              <div className="mx-auto flex min-h-full w-full max-w-4xl flex-col items-start justify-center gap-5 px-4 py-8 sm:px-8">
                {heroBot(96)}
                <div className="flex flex-col gap-1.5">
                  <h2 className="text-2xl font-semibold tracking-tight">
                    {greeting}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {t(
                      'empty-subline',
                      'Ask about your contacts, deals and inbox, or tell me what to change.',
                    )}
                  </p>
                </div>
                <div className="w-full">{composer}</div>
                <p className="text-xs text-muted-foreground">
                  <Kbd variant="foreground">Enter</Kbd> {t('to-send', 'to send')} ·{' '}
                  <Kbd variant="foreground">Shift</Kbd>+<Kbd variant="foreground">Enter</Kbd>{' '}
                  {t('for-new-line', 'for a new line')}
                </p>
                <p className="pt-2 text-xs font-medium text-muted-foreground">
                  {t('try-asking', 'Try asking')}
                </p>
                {suggestionCards}
                <Link
                  to="/agent/capabilities"
                  className="pt-1 text-[13px] text-primary underline-offset-4 hover:underline"
                >
                  {t('see-capabilities', 'See what the agent can do →')}
                </Link>
              </div>
            ) : (
              <div className="mx-auto flex min-h-full w-full max-w-xl flex-col items-center justify-center gap-5 px-4 py-6 sm:gap-6 sm:py-8 sm:max-w-2xl">
                <div className="flex flex-col items-center gap-3 text-center sm:gap-4">
                  {heroBot(56)}
                  <div className="space-y-1">
                    <h2 className="text-base font-semibold md:text-lg">
                      {t('how-can-i-help', 'How can I help?')}
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      {t(
                        'ask-anything',
                        'Ask anything about your erxes workspace',
                      )}
                    </p>
                  </div>
                </div>
                <div className="w-full">{composer}</div>
                {suggestionCards}
              </div>
            )}
          </div>
        </div>
      </AgentChatThreadContext.Provider>
    );
  }

  return (
    <AgentChatThreadContext.Provider value={threadId}>
      <div
        className={cn('flex h-full min-h-0 min-w-0 flex-1 flex-col', className)}
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
          onRetryArtifact={handleRetryArtifact}
          onRetryTurn={retryLastTurn}
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
    </AgentChatThreadContext.Provider>
  );
};
