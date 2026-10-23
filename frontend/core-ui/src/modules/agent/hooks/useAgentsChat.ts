import { APICallError, isToolUIPart } from 'ai';
import { hasAgentsApprovalDecision } from '../approvalDecisions';
import { Chat, useChat } from '@ai-sdk/react';
import { useApolloClient, useLazyQuery, useMutation } from '@apollo/client';
import { useSetAtom } from 'jotai';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { AGENTS_THREAD_DETAIL, AGENTS_THREAD_STOP } from '../graphql/threads';
import type {
  IAgentsThreadDetailData,
  IAgentsThreadRemoveVariables,
  IAgentsThreadStopData,
} from '../graphql/threads';
import {
  evictThreadDetail,
  readCachedThreadDetail,
  rememberThreadDetail,
} from '../utils/threadDetailCache';
import type { IAskUserAnswer } from '../components/AskUserPrompt';
import { extractPageContext } from '../utils/pageContext';
import { withAgentMentionsParts } from '../agentMentions';
import { isAgentsStreamStalled } from '../streamHealth';
import { useNavigationCatalog } from './useNavigationCatalog';
import { agentNavigationCatalogState } from '../states/agentNavigationCatalogState';
import type { IAgentsPageContext, IAgentsRequestSelection } from '../transport';
import { AgentsChatTransport } from '../transport';
import { withUserDisplayText } from '../utils/messages';
import type { AgentsUIMessage } from '../types';

/** Thinking depth selectable per turn in the chat UI, shallowest first. */
export type IAgentsThinkingLevel =
  'off' | 'minimal' | 'low' | 'medium' | 'high' | 'xhigh' | 'max';

const DEFAULT_THINKING_LEVEL: IAgentsThinkingLevel = 'high';

/** Storage namespace; `page` is retained only for compatibility with old sessions. */
export type IAgentsSessionScope = 'page' | 'panel';

/** The Assistant uses the panel namespace for its selected conversation. */
const SELECTED_THREAD_STORAGE_KEY = (scope: IAgentsSessionScope): string =>
  `agents-selected-thread:${scope}`;

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

/** The ask_user call the last assistant message is suspended on, if any. */
const findAskUserSuspension = (message: AgentsUIMessage | undefined) => {
  if (message?.role !== 'assistant') return undefined;

  for (const part of message.parts) {
    if (
      part.type === 'data-tool-call-suspended' &&
      part.data.toolName === 'askUser' &&
      !part.data.resumed &&
      part.data.runId &&
      part.data.toolCallId
    ) {
      return { runId: part.data.runId, toolCallId: part.data.toolCallId };
    }
  }

  return undefined;
};

/**
 * True when the last assistant message waits on the user: an unanswered
 * ask_user or an approval-requested tool part.
 */
export const messageHasPendingSuspension = (
  message: AgentsUIMessage | undefined,
): boolean =>
  findAskUserSuspension(message) !== undefined ||
  (message?.role === 'assistant' &&
    message.parts.some(
      (part) => isToolUIPart(part) && part.state === 'approval-requested',
    ));

type IUseChat = ReturnType<typeof useChat<AgentsUIMessage>>;

export interface IUseAgentsChatResult {
  messages: AgentsUIMessage[];
  status: IUseChat['status'];
  error: Error | undefined;
  /** The open thread, or undefined for a conversation nobody wrote in yet. */
  threadId: string | undefined;
  loadingThread: boolean;
  sendMessage: IUseChat['sendMessage'];
  addToolApprovalResponse: IUseChat['addToolApprovalResponse'];
  stop: IUseChat['stop'];
  clearError: IUseChat['clearError'];
  /** Starts a fresh conversation; other threads keep streaming. */
  startNewConversation: () => Promise<void>;
  /** Shows a thread: its live Chat, or its stored messages plus any running run. */
  openThread: (threadId: string) => Promise<void>;
  /** Current model/thinking selection; empty provider means server default. */
  modelProvider: string;
  modelId: string;
  thinkingLevel: IAgentsThinkingLevel;
  /** Picks the provider/model the next turns run on ('' = auto). */
  selectModel: (provider: string, model: string) => void;
  selectThinkingLevel: (level: IAgentsThinkingLevel) => void;
  /** Resumes the suspended ask_user call with one answer per question. */
  submitAnswer: (answers: IAskUserAnswer[]) => void;
  /** Reloads the thread from the server and reattaches to its running run. */
  resumeStream: () => Promise<void>;
  /** Sets the page context sent with the next user turn (panel only). */
  setPageContext: (context: IAgentsPageContext | undefined) => void;
  /** Re-sends the last request after a stream error. */
  retryLastTurn: () => void;
  /** Replaces a user turn and continues from that exact point in stored history. */
  editMessage: (messageId: string, text: string) => void;
}

/**
 * Agents chat state: one AI SDK `Chat` per thread, keyed by the thread id.
 * The server owns runs, so this hook holds no run ids:
 *
 * - a send, an approval and an ask_user answer all go through the Chat to
 *   `POST /agents/chat`; the server tells them apart by the last message,
 * - Mastra suspends a run at one tool call and leaves the step's other calls
 *   input-available, so `hasAgentsApprovalDecision` resends after each
 *   decision instead of the SDK's all-calls-answered helper,
 * - switching threads keeps the old Chat streaming in the background,
 * - opening a thread, including after a refresh, loads its stored messages
 *   and calls `resumeStream()`, which reattaches to a running run or gets 204,
 * - a recently visited thread opens from the Apollo cache at once and is
 *   revalidated in the background; a request or a finished run evicts it,
 * - a stalled stream (`AGENTS_STREAM_STALL_MS` of silence) reconnects once.
 */
export const useAgentsChat = (options?: {
  sessionScope?: IAgentsSessionScope;
}): IUseAgentsChatResult => {
  const sessionScope = options?.sessionScope ?? 'panel';
  // Start in the thread-loading state when this surface has a stored
  // selection so a browser refresh restores the thread instead of
  // flashing the empty state.
  const [loadingThread, setLoadingThread] = useState<boolean>(
    () => readSelectedThreadId(sessionScope) !== undefined,
  );
  const [modelProvider, setModelProvider] = useState('');
  const [modelId, setModelId] = useState('');
  const [thinkingLevel, setThinkingLevel] = useState<IAgentsThinkingLevel>(
    DEFAULT_THINKING_LEVEL,
  );

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

  // Recently visited transcripts stay in the Apollo cache (at most
  // `AGENTS_THREAD_DETAIL_CACHE_LIMIT`); this hook evicts only its own entries.
  const client = useApolloClient();
  const { cache } = client;

  const transport = useMemo(
    () =>
      new AgentsChatTransport({
        getRequestSelection: () => selectionRef.current,
        getPageContext: () => pageContextRef.current,
        getNavigation: () => navigationRef.current,
        // Any request changes the stored transcript: drop the cached copy.
        onRequest: (threadId) => evictThreadDetail(cache, threadId),
      }),
    [cache],
  );

  const chatsRef = useRef(new Map<string, Chat<AgentsUIMessage>>());
  const createChat = useCallback(
    (id: string, messages: AgentsUIMessage[] = []) => {
      const created = new Chat<AgentsUIMessage>({
        id,
        messages,
        transport,
        sendAutomaticallyWhen: hasAgentsApprovalDecision,
        // A copy cached while the run streamed is outdated once it ends.
        onFinish: () => evictThreadDetail(cache, id),
      });
      chatsRef.current.set(id, created);
      return created;
    },
    [transport, cache],
  );
  const [chat, setChat] = useState(() => createChat(crypto.randomUUID()));
  useEffect(() => {
    const chats = chatsRef.current;
    return () => chats.forEach((entry) => void entry.stop());
  }, []);

  const {
    messages,
    status,
    error,
    sendMessage: sdkSendMessage,
    clearError,
    stop: detach,
    addToolApprovalResponse,
    regenerate,
  } = useChat<AgentsUIMessage>({ chat, throttle: 50 });

  // `useChat`'s stop only detaches this tab's stream, so the server run is
  // stopped too; otherwise it keeps going and its planned writes still land.
  const [stopThread] = useMutation<
    IAgentsThreadStopData,
    IAgentsThreadRemoveVariables
  >(AGENTS_THREAD_STOP);
  const stop = useCallback(async () => {
    await Promise.all([
      detach(),
      stopThread({ variables: { threadId: chat.id } }),
    ]);
  }, [chat, detach, stopThread]);

  const sendMessage = useCallback<IUseChat['sendMessage']>(
    (...args) => {
      writeSelectedThreadId(sessionScope, chat.id);
      return sdkSendMessage(...args);
    },
    [chat, sdkSendMessage, sessionScope],
  );

  const editMessage = useCallback(
    (messageId: string, text: string) => {
      const message = chat.messages.find((entry) => entry.id === messageId);
      if (
        !text.trim() ||
        message?.role !== 'user' ||
        (chat.status !== 'ready' && chat.status !== 'error')
      )
        return;

      const { context, parts } = extractPageContext(message.parts);
      const snapshot = chat.messages;
      clearError();
      void sendMessage(
        {
          messageId,
          // Keep attachments; the SDK replaces this exact turn and drops its tail.
          // The edited text decides which records stay mentioned.
          parts: withAgentMentionsParts(
            [
              ...parts.filter((part) => part.type !== 'text'),
              { type: 'text', text: text.trim() },
            ],
            text.trim(),
          ),
          metadata: message.metadata,
        },
        { body: { editMessageId: messageId, pageContext: context } },
      ).then(() => {
        // The server rejected the edit and kept its history, so show it again.
        if (APICallError.isInstance(chat.error)) chat.messages = snapshot;
      });
    },
    [chat, sendMessage, clearError],
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

  // Continues the suspended assistant message; the answers ride in the body
  // and the run's tool result fills in the answered card.
  const submitAnswer = useCallback(
    (answers: IAskUserAnswer[]) => {
      const suspension = findAskUserSuspension(chat.lastMessage);
      if (!suspension || chat.status !== 'ready') return;
      void chat.sendMessage(undefined, {
        body: { resume: { ...suspension, answers } },
      });
    },
    [chat],
  );

  const [loadThreadDetail] =
    useLazyQuery<IAgentsThreadDetailData>(AGENTS_THREAD_DETAIL);

  // Leaving a thread re-reads it into the cache when missing, so returning
  // to it is instant.
  const chatRef = useRef(chat);
  chatRef.current = chat;
  const prefetchLeftThread = useCallback(
    (nextThreadId?: string) => {
      const { id, messages: left } = chatRef.current;
      if (!left.length || id === nextThreadId) return;
      if (readCachedThreadDetail(cache, id)) return;
      client
        .query<IAgentsThreadDetailData>({
          query: AGENTS_THREAD_DETAIL,
          variables: { threadId: id },
          fetchPolicy: 'network-only',
        })
        .then(({ data }) => {
          if (data?.agentsThreadDetail) rememberThreadDetail(cache, id);
        })
        .catch(() => undefined);
    },
    [cache, client],
  );

  const startNewConversation = useCallback(async () => {
    prefetchLeftThread();
    ++threadSelectionRef.current;
    setLoadingThread(false);
    writeSelectedThreadId(sessionScope, undefined);
    setChat(createChat(crypto.randomUUID()));
  }, [createChat, prefetchLeftThread, sessionScope]);

  const openThread = useCallback(
    async (nextThreadId: string) => {
      const selection = ++threadSelectionRef.current;
      writeSelectedThreadId(sessionScope, nextThreadId);
      prefetchLeftThread(nextThreadId);

      const live = chatsRef.current.get(nextThreadId);
      if (live?.status === 'submitted' || live?.status === 'streaming') {
        setLoadingThread(false);
        setChat(live);
        return;
      }

      // Stale-while-revalidate: a cached transcript renders at once and the
      // network copy replaces it below if it differs and nothing streams.
      const cached = readCachedThreadDetail(cache, nextThreadId);
      const fetchDetail = async () => {
        const { data } = await loadThreadDetail({
          variables: { threadId: nextThreadId },
          fetchPolicy: 'network-only',
          nextFetchPolicy: 'cache-only',
        });
        if (data?.agentsThreadDetail) rememberThreadDetail(cache, nextThreadId);
        return data?.agentsThreadDetail;
      };

      setLoadingThread(!cached);
      try {
        const detail = cached ?? (await fetchDetail());
        if (selection !== threadSelectionRef.current) return;

        if (!detail) {
          throw new Error('Thread not found.');
        }
        rememberThreadDetail(cache, nextThreadId);

        const opened = createChat(
          nextThreadId,
          withUserDisplayText(detail.messages),
        );
        setChat(opened);
        void opened.resumeStream();

        if (cached) {
          void fetchDetail()
            .then((fresh) => {
              if (
                fresh &&
                opened.status === 'ready' &&
                JSON.stringify(fresh.messages) !==
                  JSON.stringify(cached.messages)
              ) {
                opened.messages = withUserDisplayText(fresh.messages);
              }
            })
            .catch(() => undefined);
        }
      } finally {
        if (selection === threadSelectionRef.current) setLoadingThread(false);
      }
    },
    [cache, createChat, loadThreadDetail, prefetchLeftThread, sessionScope],
  );

  // Restore this surface's selected thread once on mount so a browser
  // refresh reopens the same conversation. A failed restore (stale,
  // foreign, or deleted thread) drops the stored selection.
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
      });
    } else {
      setLoadingThread(false);
    }
  }, [openThread, sessionScope]);

  const resumeStream = useCallback(
    () => openThread(chat.id),
    [chat, openThread],
  );

  // A stalled stream is a lost connection, not a verdict on the run: ask the
  // server once per thread whether it still runs. The reconnect replays the
  // reply, finds it finished, or reports the restart. Bytes arriving again
  // re-arm it.
  const autoReconnectedRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (status === 'streaming') {
      autoReconnectedRef.current = undefined;
      return;
    }

    if (
      status !== 'error' ||
      !isAgentsStreamStalled(error) ||
      autoReconnectedRef.current === chat.id
    ) {
      return;
    }

    autoReconnectedRef.current = chat.id;
    void resumeStream();
  }, [chat, status, error, resumeStream]);

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
    threadId: messages.length ? chat.id : undefined,
    loadingThread,
    sendMessage,
    addToolApprovalResponse,
    stop,
    clearError,
    startNewConversation,
    openThread,
    submitAnswer,
    resumeStream,
    setPageContext,
    retryLastTurn,
    editMessage,
  };
};
