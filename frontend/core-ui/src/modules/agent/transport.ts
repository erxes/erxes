import { DefaultChatTransport } from 'ai';
import { getAgentsApprovalDecision } from './approvalDecisions';
import type { ChatTransport, UIMessage, UIMessageChunk } from 'ai';

import {
  AGENTS_ANSWER_URL,
  AGENTS_APPROVE_URL,
  AGENTS_CHAT_RECONNECT_URL,
  AGENTS_CHAT_URL,
} from './api';
import type { IAgentsNavigationEntry } from './utils/navigationCatalog';

/** Header the backend stamps with the resolved thread id on every chat SSE. */
const THREAD_ID_HEADER = 'X-Agents-Thread-Id';

/** Model/thinking selection sent with every turn (empty provider = auto). */
export interface IAgentsRequestSelection {
  provider?: string;
  model?: string;
  thinkingLevel?: string;
}

/** Optional page context sent only on a normal chat turn. */
export interface IAgentsPageContext {
  path: string;
  record?: { type: string; id: string };
}

/**
 * The ask_user answer staged by the hook, plus the suspended tool call it
 * resolves. The tool call id scopes the transport's chunk filter to the
 * suspension replay so the resumed run's own tool results still reach the UI.
 */
export interface IPendingAnswer {
  answer: string | string[] | (string | string[])[];
  suspendedToolCallId?: string;
}

export interface IAgentsChatTransportOptions {
  /** Returns the currently active thread id, if any. */
  getThreadId: () => string | undefined;
  /** Returns the current model/thinking selection for the next turn. */
  getRequestSelection: () => IAgentsRequestSelection;
  /**
   * Returns the page context to send with the next normal send, if any.
   * The backend validates it strictly and silently drops invalid parts.
   */
  getPageContext?: () => IAgentsPageContext | undefined;
  /**
   * Returns the client's navigable page catalog for the next send — the
   * `findPages` tool's ranking input. Sent on every normal `/agents/chat`
   * turn; resumes keep the original run's RequestContext snapshot.
   */
  getNavigation?: () => IAgentsNavigationEntry[] | undefined;
  /** Called when the backend reports the thread id for this conversation. */
  onThreadId: (threadId: string) => void;
  /** Returns the currently active run id, if any. */
  getActiveRunId: () => string | undefined;
  /**
   * Called when the active run id changes: set on send, cleared on 204
   * reconnects and on non-ok normal-chat HTTP responses.
   */
  onActiveRunId: (runId: string | undefined) => void;
  /** Receives the SDK-assigned user message before request dispatch. */
  onPendingMessage?: (message: UIMessage) => void;
  /**
   * Returns the ask_user answer awaiting submission, if any. The transport
   * consumes it exactly once in `sendMessages` — which the hook triggers
   * right after staging — turning that one request into the
   * `POST /agents/answer` resume call. A batched multi-question card
   * answers positionally: element i answers question i (a string, or a
   * string array for that question's multi-select).
   */
  consumePendingAnswer: () => IPendingAnswer | undefined;
  /**
   * Reports the outcome of a reconnect attempt as soon as it is known:
   * `true` when the backend replayed an active run's stream (200),
   * `false` when it reported no active run (204). The hook uses this —
   * not a post-resume transcript comparison, which races React's
   * throttled message renders — to decide whether the stored transcript
   * needs one re-read (the run finished while the surface was away, so
   * its persisted reply is missing from the restored messages) or must
   * be left alone (the replay is streaming the reply in already).
   */
  onReconnectOutcome?: (reconnected: boolean) => void;
  /** Lets an optimistic edit restore its transcript when the server rejects it. */
  onChatResponse?: (accepted: boolean, editMessageId: string) => void;
}

const selectionToBody = (
  selection: IAgentsRequestSelection,
): Record<string, string> => {
  const body: Record<string, string> = {};

  if (selection.provider) {
    body.provider = selection.provider;
  }

  if (selection.model) {
    body.model = selection.model;
  }

  if (selection.thinkingLevel) {
    body.thinkingLevel = selection.thinkingLevel;
  }

  return body;
};

/**
 * Chat transport for erxes agents.
 *
 * Extends the AI SDK's `DefaultChatTransport` (the documented extension
 * point) instead of re-implementing SSE parsing or message state:
 *
 * - Normal sends go to `POST /agents/chat`; the hook pins the conversation
 *   by generating the thread id client-side and including it in the body
 *   (`threadId`) on every turn. The response header `X-Agents-Thread-Id` is
 *   captured through the transport's `fetch` middleware as advisory only —
 *   a cross-origin browser cannot read a custom header unless the gateway
 *   exposes it, so continuity must never depend on it.
 * - When the user answers the current Mastra tool approval, the SDK auto-sends
 *   without waiting on other input-available calls in that step. The request
 *   routes to `POST /agents/approve` with `{ threadId, toolCallId, approved, reason }`
 *   because the backend resumes the suspended Mastra run through its own
 *   endpoint instead of re-running the whole transcript.
 */
export class AgentsChatTransport
  extends DefaultChatTransport<UIMessage>
  implements ChatTransport<UIMessage>
{
  readonly resumeStreamIsReplay = true;

  private readonly onPendingMessage?: (message: UIMessage) => void;

  private readonly getThreadId: () => string | undefined;

  private readonly onThreadId: (threadId: string) => void;

  private readonly getRequestSelection: () => IAgentsRequestSelection;

  private readonly getPageContext?: () => IAgentsPageContext | undefined;

  private readonly getNavigation?: () => IAgentsNavigationEntry[] | undefined;

  private readonly getActiveRunId: () => string | undefined;

  private readonly onActiveRunId: (runId: string | undefined) => void;

  private readonly consumePendingAnswer: () => IPendingAnswer | undefined;

  private readonly onReconnectOutcome?: (reconnected: boolean) => void;

  constructor({
    getThreadId,
    getRequestSelection,
    getPageContext,
    getNavigation,
    onThreadId,
    getActiveRunId,
    onActiveRunId,
    onPendingMessage,
    consumePendingAnswer,
    onReconnectOutcome,
    onChatResponse,
  }: IAgentsChatTransportOptions) {
    super({
      api: AGENTS_CHAT_URL,
      credentials: 'include',
      body: () => {
        const body: Record<string, unknown> = selectionToBody(
          getRequestSelection(),
        );
        const threadId = getThreadId();

        if (threadId) {
          body.threadId = threadId;
        }

        const activeRunId = getActiveRunId();

        if (activeRunId) {
          body.runId = activeRunId;
        }

        const pageContext = getPageContext?.();

        if (pageContext) {
          body.pageContext = pageContext;
        }

        const navigation = getNavigation?.();

        if (navigation?.length) {
          body.navigation = navigation;
        }

        return body;
      },
      fetch: async (input, init) => {
        // A non-ok HTTP response (4xx/5xx) means no run ever started, so
        // drop the run id this send just stored — otherwise the error
        // banner would offer a reconnect for a run that never existed.
        // A rejected fetch (network failure/abort) preserves it so the
        // live run stays reconnectable.
        const response = await fetch(input, init);
        const request =
          typeof init?.body === 'string'
            ? (JSON.parse(init.body) as { editMessageId?: string })
            : undefined;
        if (request?.editMessageId) {
          onChatResponse?.(response.ok, request.editMessageId);
        }

        if (!response.ok) {
          onActiveRunId(undefined);
        }

        const threadId = response.headers.get(THREAD_ID_HEADER);

        if (threadId) {
          onThreadId(threadId);
        }

        return response;
      },
    });

    this.onPendingMessage = onPendingMessage;
    this.getThreadId = getThreadId;
    this.getRequestSelection = getRequestSelection;
    this.getPageContext = getPageContext;
    this.getNavigation = getNavigation;
    this.onThreadId = onThreadId;
    this.getActiveRunId = getActiveRunId;
    this.onActiveRunId = onActiveRunId;
    this.consumePendingAnswer = consumePendingAnswer;
    this.onReconnectOutcome = onReconnectOutcome;
  }

  async sendMessages(
    options: Parameters<ChatTransport<UIMessage>['sendMessages']>[0],
  ): Promise<ReadableStream<UIMessageChunk>> {
    // An ask_user answer travels as a normal send: the hook stages the answer
    // and sends a user message carrying it, and this branch reroutes that one
    // request to the answer resume endpoint. The send-side stream state keeps
    // the real transcript snapshot, so the resumed chunks apply cleanly —
    // the SDK's resume path would build an empty state and discard them.
    const pendingAnswer = this.consumePendingAnswer();

    if (pendingAnswer !== undefined) {
      return this.postAnswerResume(pendingAnswer, options.abortSignal);
    }

    const decision = getAgentsApprovalDecision(options.messages);

    if (!decision) {
      // Normal send: generate a fresh runId so the backend can track the
      // active run for reconnect. Approval/answer resumes keep the existing
      // run id (set by the original send or the prior resume).
      const message = [...options.messages]
        .reverse()
        .find((entry) => entry.role === 'user');
      if (message) this.onPendingMessage?.(message);
      this.onActiveRunId(crypto.randomUUID());

      return super.sendMessages(options);
    }

    const threadId = this.getThreadId();

    if (!threadId) {
      throw new Error(
        'Cannot resume an approval without an active agents thread.',
      );
    }

    const body: Record<string, unknown> = {
      threadId,
      approved: decision.approved,
      toolCallId: decision.toolCallId,
      // The resumed run continues on the same provider/model/thinking the
      // UI used for the suspended turn.
      ...selectionToBody(this.getRequestSelection()),
    };

    if (decision.reason) {
      body.reason = decision.reason;
    }

    const response = await fetch(AGENTS_APPROVE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(body),
      signal: options.abortSignal,
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || 'Failed to fetch the approval response.');
    }

    if (!response.body) {
      throw new Error('The response body is empty.');
    }

    return this.processResponseStream(response.body);
  }

  /**
   * POSTs the ask_user answer to the answer resume endpoint and returns the
   * resumed stream. The resumed run replays the suspension's resolution as
   * chunks tagged with the PREVIOUS turn's tool call id, which the send-side
   * streaming state cannot match (the SDK throws "must be preceded by a
   * tool-input-available" and discards the whole stream; the hook marks the
   * tool part answered locally instead). Only those replay chunks are
   * dropped — every other chunk, including the resumed run's own tool
   * inputs and outputs, flows through to the UI.
   */
  private async postAnswerResume(
    pendingAnswer: IPendingAnswer,
    abortSignal?: AbortSignal,
  ): Promise<ReadableStream<UIMessageChunk>> {
    const threadId = this.getThreadId();

    if (!threadId) {
      throw new Error('Cannot answer without an active agents thread.');
    }

    const body: Record<string, unknown> = {
      threadId,
      answer: pendingAnswer.answer,
      // The resumed run continues on the same provider/model/thinking the
      // UI used for the suspended turn.
      ...selectionToBody(this.getRequestSelection()),
    };

    const response = await fetch(AGENTS_ANSWER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(body),
      signal: abortSignal,
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || 'Failed to send the answer.');
    }

    if (!response.body) {
      throw new Error('The response body is empty.');
    }

    const suspendedToolCallId = pendingAnswer.suspendedToolCallId;

    return this.processResponseStream(response.body).pipeThrough(
      new TransformStream<UIMessageChunk, UIMessageChunk>({
        transform(chunk, controller) {
          if (
            suspendedToolCallId &&
            'toolCallId' in chunk &&
            chunk.toolCallId === suspendedToolCallId
          ) {
            return;
          }

          controller.enqueue(chunk);
        },
      }),
    );
  }

  /**
   * Reconnects to an active run's stream via the backend's native
   * `POST /agents/chat/reconnect` endpoint. The backend uses the durable
   * agent's `listActiveRuns` + `observe` over the shared Redis Streams bus,
   * so replay works across browser refreshes and API replicas/processes.
   *
   * Returns null on 204 (run no longer active) and clears the stale
   * active run id. Throws a readable error on non-2xx responses.
   */
  async reconnectToStream(options: {
    chatId: string;
    abortSignal?: AbortSignal;
  }): Promise<ReadableStream<UIMessageChunk> | null> {
    const threadId = this.getThreadId();
    const runId = this.getActiveRunId();

    if (!threadId || !runId) {
      return null;
    }

    const response = await fetch(AGENTS_CHAT_RECONNECT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ threadId, runId }),
      signal: options.abortSignal,
    });

    if (response.status === 204) {
      this.onActiveRunId(undefined);
      this.onReconnectOutcome?.(false);

      return null;
    }

    if (!response.ok) {
      const text = await response.text().catch(() => '');

      throw new Error(text || 'Failed to reconnect to the active stream.');
    }

    if (!response.body) {
      throw new Error('The reconnect response body is empty.');
    }

    this.onReconnectOutcome?.(true);

    return this.processResponseStream(response.body);
  }
}
