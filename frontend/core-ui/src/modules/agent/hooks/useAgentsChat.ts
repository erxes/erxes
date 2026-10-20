import { isToolUIPart } from 'ai';
import { hasAgentsApprovalDecision } from '../approvalDecisions';
import type { UIMessage } from 'ai';
import { Chat, useChat } from '@ai-sdk/react';
import { useLazyQuery } from '@apollo/client';
import { useSetAtom } from 'jotai';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { AGENTS_THREAD_DETAIL } from '../graphql/threads';
import type { IAgentsThreadDetailData } from '../graphql/threads';
import {
  buildAskUserResult,
  readAskUserQuestionsFromInput,
} from '../askUserAnswers';
import type { IAskUserQuestionEntry } from '../components/AskUserPrompt';
import { mapStoredMessagesToUIMessages } from '../mapStoredMessages';
import { extractPageContext } from '../utils/pageContext';
import { useNavigationCatalog } from './useNavigationCatalog';
import { agentNavigationCatalogState } from '../states/agentNavigationCatalogState';
import type {
  IAgentsPageContext,
  IAgentsRequestSelection,
  IPendingAnswer,
} from '../transport';
import { AgentsChatTransport } from '../transport';
import {
  decodeInFlightTurn,
  encodeInFlightTurn,
  restoreInFlightTurn,
  type IInFlightTurn,
} from '../inFlightPrompt';

/** Thinking depth selectable per turn in the chat UI. */
export type IAgentsThinkingLevel =
  | 'off'
  | 'minimal'
  | 'low'
  | 'medium'
  | 'high';

const DEFAULT_THINKING_LEVEL: IAgentsThinkingLevel = 'high';

/** Storage namespace; `page` is retained only for compatibility with old sessions. */
export type IAgentsSessionScope = 'page' | 'panel';

/**
 * The Assistant uses the panel namespace for its selected conversation.
 * Legacy storage namespaces do not affect per-thread durable run entries.
 */
const SELECTED_THREAD_STORAGE_KEY = (scope: IAgentsSessionScope): string =>
  `agents-selected-thread:${scope}`;

/**
 * Persist a thread's durable run so Assistant can resume it after a refresh.
 * The key remains independent of the selected-thread storage namespace.
 */
const ACTIVE_RUN_STORAGE_KEY = (threadId: string): string =>
  `agents-active-run:${threadId}`;

/**
 * sessionStorage key persisting a thread's in-flight prompt (the newest
 * user message of the active run). During request startup, memory may
 * not have saved the input yet, so a mid-run refresh can restore
 * an empty transcript — the user's prompt bubble disappears while the
 * reply still streams in via reconnect replay. The prompt is stored when
 * a send starts and cleared when its run id is cleared (clean completion
 * or terminal error); on restore it is synthesized back ONLY while the
 * stored transcript does not yet contain the run's own messages, so it
 * reconciles away once the real persisted messages arrive.
 */
const IN_FLIGHT_PROMPT_STORAGE_KEY = (threadId: string): string =>
  `agents-in-flight-prompt:${threadId}`;

const readSelectedThreadId = (
  scope: IAgentsSessionScope,
): string | undefined => {
  try {
    return (
      sessionStorage.getItem(SELECTED_THREAD_STORAGE_KEY(scope)) || undefined
    );
  } catch {
    return undefined;
  }
};

const writeSelectedThreadId = (
  scope: IAgentsSessionScope,
  threadId: string | undefined,
): void => {
  try {
    const key = SELECTED_THREAD_STORAGE_KEY(scope);

    if (threadId) {
      sessionStorage.setItem(key, threadId);
    } else {
      sessionStorage.removeItem(key);
    }
  } catch {
    // sessionStorage may be unavailable; ignore silently.
  }
};

const readStoredActiveRunId = (threadId: string): string | undefined => {
  try {
    const current =
      sessionStorage.getItem(ACTIVE_RUN_STORAGE_KEY(threadId)) || undefined;

    if (current) {
      return current;
    }

    // Backward compatibility: runs started before the run entry became
    // cross-surface stored it scope-suffixed. Reading them back keeps a
    // pre-upgrade run resumable after a refresh (its in-flight prompt
    // cannot be synthesized — the old code never stored it — but the
    // working state and reply replay, and the persisted messages appear
    // once the run finishes).
    for (const legacyScope of ['page', 'widget'] as const) {
      const legacy = sessionStorage.getItem(
        `agents-active-run:${legacyScope}:${threadId}`,
      );

      if (legacy) {
        // Migrate to the shared entry and drop the legacy one.
        sessionStorage.setItem(ACTIVE_RUN_STORAGE_KEY(threadId), legacy);
        sessionStorage.removeItem(
          `agents-active-run:${legacyScope}:${threadId}`,
        );

        return legacy;
      }
    }

    return undefined;
  } catch {
    return undefined;
  }
};

const writeStoredActiveRunId = (
  threadId: string,
  runId: string | undefined,
): void => {
  try {
    const key = ACTIVE_RUN_STORAGE_KEY(threadId);

    if (runId) {
      sessionStorage.setItem(key, runId);
    } else {
      sessionStorage.removeItem(key);
      // The prompt's lifetime is the run's: clearing the run entry also
      // clears the in-flight prompt (by then either the run's messages
      // are persisted, or the run is gone for good).
      sessionStorage.removeItem(IN_FLIGHT_PROMPT_STORAGE_KEY(threadId));
    }
  } catch {
    // sessionStorage may be unavailable; ignore silently.
  }
};

const readInFlightPrompt = (threadId: string): IInFlightTurn | undefined => {
  try {
    const raw = sessionStorage.getItem(IN_FLIGHT_PROMPT_STORAGE_KEY(threadId));
    return raw ? decodeInFlightTurn(raw) : undefined;
  } catch {
    return undefined;
  }
};

/**
 * Finds the suspended ask_user tool call in an assistant message: the
 * `data-tool-call-suspended` data part carries the tool call id that the
 * message's tool part is keyed by, plus the questions being asked.
 */
const findAskUserSuspension = (
  message: UIMessage | undefined,
): { toolCallId: string; questions: IAskUserQuestionEntry[] } | null => {
  if (!message || message.role !== 'assistant') {
    return null;
  }

  for (const part of message.parts) {
    const typed = part as {
      type: string;
      data?: {
        toolName?: string;
        toolCallId?: string;
        suspendPayload?: unknown;
      };
    };

    if (
      typed.type === 'data-tool-call-suspended' &&
      typed.data?.toolName === 'askUser' &&
      typed.data.toolCallId
    ) {
      return {
        toolCallId: typed.data.toolCallId,
        questions: readAskUserQuestionsFromInput(typed.data.suspendPayload),
      };
    }
  }

  return null;
};

/**
 * True when the last assistant message carries a pending suspension that
 * has not yet been decided: an unresolved ask_user (data-tool-call-suspended
 * marker present) or an approval-requested tool part. Approval-responded
 * parts are already decided and do not count.
 */
export const messageHasPendingSuspension = (
  message: UIMessage | undefined,
): boolean => {
  if (!message || message.role !== 'assistant') {
    return false;
  }

  for (const part of message.parts) {
    const typed = part as { type: string; data?: { toolName?: string } };

    if (
      typed.type === 'data-tool-call-suspended' &&
      typed.data?.toolName === 'askUser'
    ) {
      return true;
    }

    if (isToolUIPart(part) && part.state === 'approval-requested') {
      return true;
    }
  }

  return false;
};

export interface IUseAgentsChatResult {
  messages: UIMessage[];
  status: ReturnType<typeof useChat<UIMessage>>['status'];
  error: Error | undefined;
  threadId: string | undefined;
  loadingThread: boolean;
  sendMessage: ReturnType<typeof useChat<UIMessage>>['sendMessage'];
  addToolApprovalResponse: ReturnType<
    typeof useChat<UIMessage>
  >['addToolApprovalResponse'];
  stop: ReturnType<typeof useChat<UIMessage>>['stop'];
  clearError: ReturnType<typeof useChat<UIMessage>>['clearError'];
  /** Starts a fresh conversation, dropping the local transcript and thread. */
  startNewConversation: () => Promise<void>;
  /** Loads an existing thread's stored messages into the chat. */
  openThread: (threadId: string) => Promise<void>;
  /** Current model/thinking selection; empty provider means server default. */
  modelProvider: string;
  modelId: string;
  thinkingLevel: IAgentsThinkingLevel;
  /** Picks the provider/model the next turns run on ('' = auto). */
  selectModel: (provider: string, model: string) => void;
  selectThinkingLevel: (level: IAgentsThinkingLevel) => void;
  /** True while an ask_user answer is being submitted and resumed. */
  answerBusy: boolean;
  /**
   * Submits the answer(s) to the thread's suspended ask_user question(s):
   * a bare string (or string array for one multi-select question) for a
   * single-question card, or one entry per question positionally for a
   * batched card.
   */
  submitAnswer: (answer: string | string[] | (string | string[])[]) => void;
  /** True when there is an active run id that can be reconnected. */
  canReconnect: boolean;
  /** Resumes streaming from the active run via the backend reconnect endpoint. */
  resumeStream: () => Promise<void>;
  /** Sets the page context sent with the next normal send (panel only). */
  setPageContext: (context: IAgentsPageContext | undefined) => void;
  /** Re-sends the last request after a stream error, when one exists. */
  retryLastTurn: () => void;
  /** Replaces a user turn and continues from that exact point in stored history. */
  editMessage: (messageId: string, text: string) => void;
}

/**
 * Agents chat state built on the AI SDK's `useChat` with a custom
 * `AgentsChatTransport`. The framework owns message state, streaming, and
 * tool-approval handling; this hook only adds:
 *
 * - thread continuity: the thread id is generated client-side on the first
 *   send (`crypto.randomUUID()`) and pinned to every subsequent turn in the
 *   request body. The backend accepts client-supplied ids (auto-creating
 *   unknown ones, 403 for foreign threads). The `X-Agents-Thread-Id`
 *   response header is still captured when readable, but a cross-origin
 *   caller cannot read it unless the gateway exposes it, so it must never
 *   be the sole carrier of the id,
 * - automatic resend after an approval decision via the SDK's
 *   `sendAutomaticallyWhen` callback for Mastra's per-call suspension. The
 *   transport routes the answered call to the backend's `/agents/approve` endpoint,
 * - active run id tracking for reconnect: generated per normal send,
 *   persisted per thread in sessionStorage (one shared entry per thread
 *   — a durable run belongs to the thread, not the surface), cleared on
 *   clean completion and on terminal errors (via `onFinish`), retained
 *   only on abort, disconnect, or a pending approval/ask_user suspension
 *   so reconnectable streams can resume under the same run,
 * - session restore: the selected thread id persists in the panel's
 *   `sessionScope`, so a browser refresh reopens
 *   the same conversation through `openThread` (which resumes a stored
 *   live run, and re-reads the thread once after a non-replayed resume
 *   so a run that finished during the reload still shows its reply)
 */
export const useAgentsChat = (options?: {
  sessionScope?: IAgentsSessionScope;
}): IUseAgentsChatResult => {
  const sessionScope = options?.sessionScope ?? 'panel';
  const [threadId, setThreadId] = useState<string | undefined>();
  // Start in the thread-loading state when this surface has a stored
  // selection so a browser refresh restores the thread instead of
  // flashing the empty state.
  const [loadingThread, setLoadingThread] = useState<boolean>(
    () => readSelectedThreadId(sessionScope) !== undefined,
  );
  const [modelProvider, setModelProvider] = useState('');
  const [modelId, setModelId] = useState('');
  const [thinkingLevel, setThinkingLevel] =
    useState<IAgentsThinkingLevel>(DEFAULT_THINKING_LEVEL);
  const [answerBusy, setAnswerBusy] = useState(false);
  const [canReconnect, setCanReconnect] = useState(false);

  const threadIdRef = useRef<string | undefined>(undefined);
  const threadSelectionRef = useRef(0);
  const selectionRef = useRef<IAgentsRequestSelection>({
    thinkingLevel: DEFAULT_THINKING_LEVEL,
  });
  const pageContextRef = useRef<IAgentsPageContext | undefined>(undefined);
  const navigation = useNavigationCatalog();
  const navigationRef = useRef(navigation);
  navigationRef.current = navigation;
  const setNavigationCatalog = useSetAtom(agentNavigationCatalogState);
  // Share the catalog with every reference chip in this chat's messages.
  useEffect(() => {
    setNavigationCatalog(navigation);
  }, [navigation, setNavigationCatalog]);
  const activeRunIdRef = useRef<string | undefined>(undefined);
  /**
   * The ask_user answer awaiting submission, with the suspended tool call it
   * resolves. Set by `submitAnswer`, read exactly once by the transport's
   * send path (which turns it into the `POST /agents/answer` resume request
   * and scopes its chunk filter to that tool call), and cleared on read so a
   * later send never replays it.
   */
  const pendingAnswerRef = useRef<IPendingAnswer | undefined>(undefined);
  const pendingEditRef = useRef<
    { messages: UIMessage[]; selection: number; messageId: string } | undefined
  >(undefined);
  const restoreEditRef = useRef<(messages: UIMessage[]) => void>(
    () => undefined,
  );

  /**
   * The most recent reconnect outcome, reported synchronously by the
   * transport (`true` = the backend replayed an active run, `false` = 204
   * no active run). Read after `sdkResumeStream()` settles to decide
   * whether the restored transcript is missing the finished reply and
   * needs one re-read — comparing messages would race React's throttled
   * renders, so the transport's report is the deterministic seam.
   */
  const reconnectOutcomeRef = useRef<boolean | undefined>(undefined);

  /** Generates the conversation's thread id on first use. */
  const ensureThreadId = useCallback(() => {
    if (!threadIdRef.current) {
      threadIdRef.current = crypto.randomUUID();
      setThreadId(threadIdRef.current);
      writeSelectedThreadId(sessionScope, threadIdRef.current);
    }
  }, [sessionScope]);

  const setActiveRunId = useCallback((runId: string | undefined) => {
    activeRunIdRef.current = runId;
    setCanReconnect(runId !== undefined);

    if (threadIdRef.current) {
      writeStoredActiveRunId(threadIdRef.current, runId);
    }
  }, []);

  const transport = useMemo(
    () =>
      new AgentsChatTransport({
        getThreadId: () => threadIdRef.current,
        getRequestSelection: () => selectionRef.current,
        getPageContext: () => pageContextRef.current,
        getNavigation: () => navigationRef.current,
        onThreadId: (nextThreadId) => {
          threadIdRef.current = nextThreadId;
          setThreadId(nextThreadId);
          // The backend echoes the resolved thread id when the gateway
          // exposes the header; pin it as this surface's selection so a
          // server-assigned id survives a refresh like a client-made one.
          writeSelectedThreadId(sessionScope, nextThreadId);
        },
        getActiveRunId: () => activeRunIdRef.current,
        onActiveRunId: setActiveRunId,
        onPendingMessage: (message) => {
          if (!threadIdRef.current) return;
          try {
            sessionStorage.setItem(
              IN_FLIGHT_PROMPT_STORAGE_KEY(threadIdRef.current),
              encodeInFlightTurn(message),
            );
          } catch {
            /* Storage is best effort; the server owns history. */
          }
        },
        onReconnectOutcome: (reconnected) => {
          reconnectOutcomeRef.current = reconnected;
        },
        onChatResponse: (accepted, messageId) => {
          const edit = pendingEditRef.current;
          if (edit?.messageId !== messageId) return;
          pendingEditRef.current = undefined;
          if (
            !accepted &&
            edit &&
            edit.selection === threadSelectionRef.current
          ) {
            restoreEditRef.current(edit.messages);
          }
        },
        consumePendingAnswer: () => {
          const answer = pendingAnswerRef.current;
          pendingAnswerRef.current = undefined;
          return answer;
        },
      }),
    [setActiveRunId, sessionScope],
  );

  // Own the native Chat instance so the full-replay transport contract is
  // preserved. useChat's internal transport wrapper forwards only methods.
  const sdkChat = useMemo(
    () =>
      new Chat<UIMessage>({
        transport,
        sendAutomaticallyWhen: hasAgentsApprovalDecision,
        onFinish: ({ message, isAbort, isDisconnect }) => {
          if (
            !isAbort &&
            !isDisconnect &&
            !messageHasPendingSuspension(message)
          ) {
            setActiveRunId(undefined);
          }
        },
      }),
    [transport, setActiveRunId],
  );
  useEffect(
    () => () => {
      void sdkChat.stop();
    },
    [sdkChat],
  );
  const {
    messages,
    status,
    error,
    sendMessage: sdkSendMessage,
    setMessages,
    clearError,
    stop,
    addToolApprovalResponse,
    resumeStream: sdkResumeStream,
    regenerate,
  } = useChat<UIMessage>({ chat: sdkChat, throttle: 50 });

  // The SDK methods above are bound to a stable internal chat instance, so
  // they keep their identity across renders; the mutable values below are
  // mirrored into refs so the callbacks returned by this hook can depend on
  // the stable methods alone and stay referentially stable while messages
  // stream (the memoized transcript rows rely on that).
  const messagesRef = useRef(messages);
  messagesRef.current = messages;
  restoreEditRef.current = setMessages;
  const statusRef = useRef(status);
  statusRef.current = status;

  /**
   * Sends a turn after guaranteeing the conversation has a thread id, so the
   * very first request already carries one and every later turn pins the same
   * thread in the body. The newest user text is also persisted as the
   * thread's pending message is captured by the transport after the SDK
   * assigns its id, so restoration uses identity rather than prompt text.
   */
  const sendMessage = useCallback(
    (...args: Parameters<typeof sdkSendMessage>) => {
      ensureThreadId();

      const first: Parameters<typeof sdkSendMessage>[0] = args[0];
      if (
        typeof first !== 'object' ||
        !first ||
        !('messageId' in first) ||
        !first.messageId
      ) {
        pendingEditRef.current = undefined;
      }
      return sdkSendMessage(...args);
    },
    [sdkSendMessage, ensureThreadId],
  );

  const editMessage = useCallback(
    (messageId: string, text: string) => {
      const message = messagesRef.current.find(
        (entry) => entry.id === messageId,
      );
      if (
        !text.trim() ||
        !message ||
        message.role !== 'user' ||
        (statusRef.current !== 'ready' && statusRef.current !== 'error') ||
        activeRunIdRef.current
      )
        return;

      const { context, parts } = extractPageContext(message.parts);
      // Keep attachments; the SDK replaces this exact turn and drops its tail.
      pendingEditRef.current = {
        messages: messagesRef.current,
        selection: threadSelectionRef.current,
        messageId,
      };
      clearError();
      void sendMessage(
        {
          messageId,
          parts: [
            ...parts.filter((part) => part.type !== 'text'),
            { type: 'text', text: text.trim() },
          ],
          metadata: message.metadata,
        },
        {
          body: { editMessageId: messageId, pageContext: context },
        },
      ).catch(() => {
        // Provider/transport failures surface through the chat's error banner.
      });
    },
    [sendMessage, clearError],
  );

  const selectModel = useCallback((nextProvider: string, nextModel: string) => {
    selectionRef.current = {
      ...selectionRef.current,
      provider: nextProvider,
      model: nextModel,
    };
    setModelProvider(nextProvider);
    setModelId(nextModel);
  }, []);

  const selectThinkingLevel = useCallback((level: IAgentsThinkingLevel) => {
    selectionRef.current = { ...selectionRef.current, thinkingLevel: level };
    setThinkingLevel(level);
  }, []);

  const setPageContext = useCallback(
    (context: IAgentsPageContext | undefined) => {
      pageContextRef.current = context;
    },
    [],
  );

  /**
   * Submits the answer to a suspended ask_user question: resolve the
   * suspended tool part locally, stage the answer (with its tool call id) on
   * the transport, then send a user message carrying the answer. The
   * transport reroutes that one request to `POST /agents/answer`, whose
   * resumed stream is processed by the send-side state machine — the SDK's
   * own resume path cannot apply it (it builds an empty streaming state, so
   * the resumed suspension replay finds no matching tool part and the whole
   * stream is discarded).
   *
   * The user message only carries the request through the send pipeline: it
   * is marked with `metadata.agentsAnswer` so the transcript never renders
   * it as a bubble — the answer displays as the assistant's answered Q&A
   * card instead. The tool part is patched to the exact result the backend's
   * ask_user tool persists, so the card renders identically live and after
   * a reload.
   */
  const submitAnswer = useCallback(
    (answer: string | string[] | (string | string[])[]) => {
      if (statusRef.current !== 'ready') {
        return;
      }

      setAnswerBusy(true);

      const answerText =
        typeof answer === 'string'
          ? answer
          : answer
              .map((part) => (Array.isArray(part) ? part.join(', ') : part))
              .join(' · ');
      const currentMessages = messagesRef.current;
      const lastMessage = currentMessages[currentMessages.length - 1];
      const suspension = findAskUserSuspension(lastMessage);

      pendingAnswerRef.current = {
        answer,
        suspendedToolCallId: suspension?.toolCallId,
      };

      if (lastMessage && suspension) {
        const resolved =
          suspension.questions.length > 0
            ? buildAskUserResult(suspension.questions, answer)
            : {
                content: `User answered: ${answerText}`,
                isError: false as const,
              };

        // The spread over the tool-part union loses its discriminants, so the
        // patched array needs one explicit narrowing cast.
        const patchedParts = lastMessage.parts.map((part) => {
          if (isToolUIPart(part) && part.toolCallId === suspension.toolCallId) {
            return {
              ...part,
              state: 'output-available' as const,
              output: resolved,
            };
          }

          return part;
        }) as UIMessage['parts'];

        setMessages([
          ...currentMessages.slice(0, -1),
          { ...lastMessage, parts: patchedParts },
        ]);
      }

      void sdkSendMessage({
        text: answerText,
        metadata: { agentsAnswer: true },
      }).finally(() => setAnswerBusy(false));
    },
    [sdkSendMessage, setMessages],
  );

  const [loadThreadDetail] =
    useLazyQuery<IAgentsThreadDetailData>(AGENTS_THREAD_DETAIL);

  const startNewConversation = useCallback(async () => {
    const selection = ++threadSelectionRef.current;
    // Stop consuming the old thread before replacing shared SDK message
    // state. Await the abort so in-flight chunks from the previous thread
    // cannot land after the transcript is cleared. The durable run can
    // continue server-side and its session entry stays available if the
    // user opens that thread again.
    await stop();
    if (selection !== threadSelectionRef.current) return;
    setLoadingThread(false);

    // Clear the active run id reactively and in the ref, and drop this
    // surface's selected-thread pointer — but do NOT touch the old
    // thread's stored run entry so opening it later can still restore a
    // recoverable run. The new thread has no stored entry yet.
    activeRunIdRef.current = undefined;
    setCanReconnect(false);
    threadIdRef.current = undefined;
    pendingAnswerRef.current = undefined;
    writeSelectedThreadId(sessionScope, undefined);
    setThreadId(undefined);
    setMessages([]);
    clearError();
  }, [setMessages, clearError, stop, sessionScope]);

  const openThread = useCallback(
    async (nextThreadId: string) => {
      const selection = ++threadSelectionRef.current;
      setLoadingThread(true);

      try {
        // Prevent chunks from the previously selected thread from being
        // applied after this hook replaces the shared SDK transcript.
        await stop();
        if (selection !== threadSelectionRef.current) return;

        const result = await loadThreadDetail({
          variables: { threadId: nextThreadId },
          fetchPolicy: 'network-only',
        });
        if (selection !== threadSelectionRef.current) return;
        const detail = result.data?.agentsThreadDetail;

        if (!detail) {
          throw new Error('Thread not found.');
        }

        threadIdRef.current = nextThreadId;
        setThreadId(nextThreadId);
        writeSelectedThreadId(sessionScope, nextThreadId);
        const mappedMessages = mapStoredMessagesToUIMessages(detail.messages);

        // Restore any stored active run id for this thread via the
        // setter so canReconnect updates reactively.
        const storedRunId = readStoredActiveRunId(nextThreadId);

        const lastAssistant = [...mappedMessages]
          .reverse()
          .find((message) => message.role === 'assistant');
        const replay =
          Boolean(storedRunId) && !messageHasPendingSuspension(lastAssistant);
        const restoreMessages = storedRunId
          ? restoreInFlightTurn(
              mappedMessages,
              readInFlightPrompt(nextThreadId),
              nextThreadId,
              replay,
            )
          : mappedMessages;
        setMessages(restoreMessages);
        clearError();
        setActiveRunId(storedRunId);

        if (storedRunId && !messageHasPendingSuspension(lastAssistant)) {
          // Reset the transport-reported outcome before the attempt, then
          // read it once the resume settles: `true` means the backend
          // replayed the live run (the reply is streaming into the
          // transcript — do NOT re-read, that would race the run's memory
          // persistence and could wipe it); `false`/absent means no active
          // run was found (204), i.e. the run finished while this surface
          // was away and the restored transcript — fetched BEFORE the final
          // message was persisted — is missing the reply. Re-read the
          // thread once so the finished response appears without a manual
          // refresh; skip when the user already moved on (thread switch,
          // new conversation, or a new in-flight turn).
          reconnectOutcomeRef.current = undefined;

          void sdkResumeStream()
            .then(() => {
              if (reconnectOutcomeRef.current === true) {
                return;
              }

              // Skip when the user already moved on (thread switch, new
              // conversation, or a new in-flight turn — a fresh send sets
              // a new active run id synchronously in the transport, so the
              // ref check is race-free here; `statusRef` is NOT safe at
              // this point because React may not have re-rendered the
              // status change yet).
              if (
                selection !== threadSelectionRef.current ||
                threadIdRef.current !== nextThreadId ||
                activeRunIdRef.current
              ) {
                return;
              }

              // Re-read the thread once so the finished response appears
              // without a manual refresh. The 204 can land in the window
              // where the workflow snapshot already turned terminal but
              // Mastra's async memory write has not flushed yet, so a
              // read that returns nothing new retries a few times,
              // spaced 500ms — bounded, never a polling loop. The
              // baseline is the STORED message count (`mappedMessages`),
              // never the restore count: the restore may include a
              // synthesized in-flight prompt bubble that the stored set
              // does not have yet.
              const readOnce = async (): Promise<number> => {
                const refetch = await loadThreadDetail({
                  variables: { threadId: nextThreadId },
                  fetchPolicy: 'network-only',
                });
                const refetchedMessages =
                  refetch.data?.agentsThreadDetail?.messages;

                if (
                  !refetchedMessages ||
                  selection !== threadSelectionRef.current ||
                  threadIdRef.current !== nextThreadId ||
                  activeRunIdRef.current ||
                  statusRef.current !== 'ready'
                ) {
                  return mappedMessages.length;
                }

                setMessages(mapStoredMessagesToUIMessages(refetchedMessages));

                return refetchedMessages.length;
              };

              const storedCount = mappedMessages.length;

              const attempt = async (): Promise<void> => {
                try {
                  const count = await readOnce();

                  if (
                    count > storedCount ||
                    selection !== threadSelectionRef.current ||
                    threadIdRef.current !== nextThreadId ||
                    activeRunIdRef.current
                  ) {
                    return;
                  }

                  // Bounded retry: the run's memory flush can lag the
                  // terminal snapshot (the 204) by a moment, so re-read a
                  // few times, spaced 500ms, stopping as soon as the
                  // persisted reply lands. Never an open polling loop.
                  for (let tries = 0; tries < 4; tries += 1) {
                    await new Promise((resolve) => setTimeout(resolve, 500));

                    if (
                      selection !== threadSelectionRef.current ||
                      threadIdRef.current !== nextThreadId ||
                      activeRunIdRef.current
                    ) {
                      return;
                    }

                    const next = await readOnce();

                    if (next > storedCount) {
                      return;
                    }
                  }
                } catch {
                  // A failed re-read keeps the restored transcript; the
                  // user can still refresh manually.
                }
              };

              void attempt();
            })
            .catch(() => {
              // Resume errors surface through the chat error banner; keep
              // the restored transcript as-is.
            });
        }
      } finally {
        if (selection === threadSelectionRef.current) setLoadingThread(false);
      }
    },
    [
      setMessages,
      clearError,
      loadThreadDetail,
      sdkResumeStream,
      setActiveRunId,
      stop,
      sessionScope,
    ],
  );

  // Restore this surface's selected thread once on mount so a browser
  // refresh reopens the same conversation (and resumes its live run when
  // one is stored and not suspended — see `openThread`). The ref guard
  // keeps re-mounts from reloading it twice. A failed restore (stale,
  // foreign, or deleted session thread) clears only this surface's
  // selected pointer and that thread's run entry and resets local state
  // to a clean empty conversation; explicit `openThread` calls still
  // reject to their caller.
  const restoredRef = useRef(false);

  useEffect(() => {
    if (restoredRef.current) {
      return;
    }

    restoredRef.current = true;

    const selected = readSelectedThreadId(sessionScope);

    if (selected) {
      openThread(selected).catch(() => {
        writeSelectedThreadId(sessionScope, undefined);
        writeStoredActiveRunId(selected, undefined);
        activeRunIdRef.current = undefined;
        setCanReconnect(false);
        threadIdRef.current = undefined;
        pendingAnswerRef.current = undefined;
        setThreadId(undefined);
        setMessages([]);
        clearError();
      });
    } else {
      setLoadingThread(false);
    }
  }, [openThread, sessionScope, setMessages, clearError]);

  const resumeStream = useCallback(async () => {
    if (threadIdRef.current) await openThread(threadIdRef.current);
  }, [openThread]);

  const retryLastTurn = useCallback(() => {
    void regenerate().catch(() => {
      // Failures surface through the chat error state.
    });
  }, [regenerate]);

  return {
    modelProvider,
    modelId,
    thinkingLevel,
    selectModel,
    selectThinkingLevel,
    messages,
    status,
    error,
    threadId,
    loadingThread,
    sendMessage,
    addToolApprovalResponse,
    stop,
    clearError,
    startNewConversation,
    openThread,
    answerBusy,
    submitAnswer,
    canReconnect,
    resumeStream,
    setPageContext,
    retryLastTurn,
    editMessage,
  };
};
