import { DefaultChatTransport } from 'ai';

import { AGENTS_CHAT_URL } from './api';
import { AGENTS_STREAM_STALL_MS, watchAgentsStream } from './streamHealth';
import { withoutResentPageContext } from './utils/pageContext';
import type { IAgentsNavigationEntry } from './utils/navigationCatalog';
import type { AgentsUIMessage } from './types';

/** Model/thinking selection sent with every turn (empty provider = auto). */
export interface IAgentsRequestSelection {
  provider?: string;
  model?: string;
  thinkingLevel?: string;
}

/** Optional page context sent only on a user turn. */
export interface IAgentsPageContext {
  path: string;
  record?: { type: string; id: string };
}

export interface IAgentsChatTransportOptions {
  /** Returns the current model/thinking selection for the next turn. */
  getRequestSelection: () => IAgentsRequestSelection;
  /** Returns the page the user is on, sent with each user turn. */
  getPageContext?: () => IAgentsPageContext | undefined;
  /** Returns the client's page catalog, the `findPages` tool's input. */
  getNavigation?: () => IAgentsNavigationEntry[] | undefined;
  /** Called with the thread id before each chat request goes out. */
  onRequest?: (threadId: string) => void;
  /** Silence after which a stream counts as lost (`AGENTS_STREAM_STALL_MS`). */
  stallTimeoutMs?: number;
}

/**
 * The AI SDK's HTTP transport pointed at `POST /agents/chat`. The Chat id is
 * the thread id, and only the newest message is sent because Mastra memory
 * loads the history. A user message starts a run; an assistant message
 * carries approval decisions or, with `body.resume`, ask_user answers.
 * Reconnect uses the default `GET /agents/chat/:threadId/stream`. Both
 * fail with `AgentsStreamStalledError` when the server goes silent.
 */
export class AgentsChatTransport extends DefaultChatTransport<AgentsUIMessage> {
  /** The reconnect route replays the run from its first chunk. */
  readonly resumeStreamIsReplay = true;

  constructor({
    getRequestSelection,
    getPageContext,
    getNavigation,
    onRequest,
    stallTimeoutMs = AGENTS_STREAM_STALL_MS,
  }: IAgentsChatTransportOptions) {
    super({
      api: AGENTS_CHAT_URL,
      credentials: 'include',
      fetch: async (input, init) => {
        const response = await fetch(input, init);

        // A reconnect to a finished run answers 204, which cannot carry a
        // body, so only real streams are rewrapped.
        if (response.status !== 200 || !response.body) return response;

        return new Response(watchAgentsStream(response.body, stallTimeoutMs), {
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
        });
      },
      prepareSendMessagesRequest: ({ id, messages, body }) => {
        // A restored user turn keeps its stored page context line; the
        // server prepends the current one, so drop the old on a resend.
        const message = withoutResentPageContext(messages).at(-1);
        onRequest?.(id);
        const { provider, model, thinkingLevel } = getRequestSelection();

        return {
          body: {
            provider: provider || undefined,
            model: model || undefined,
            thinkingLevel: thinkingLevel || undefined,
            ...(message?.role === 'user' && {
              pageContext: getPageContext?.(),
              navigation: getNavigation?.(),
            }),
            ...body,
            threadId: id,
            messages: message ? [message] : [],
          },
        };
      },
    });
  }
}
