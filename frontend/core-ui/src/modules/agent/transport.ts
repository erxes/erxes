import { DefaultChatTransport } from 'ai';

import { AGENTS_CHAT_URL } from './api';
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
}

/**
 * The AI SDK's HTTP transport pointed at `POST /agents/chat`. The Chat id is
 * the thread id, and only the newest message is sent because Mastra memory
 * loads the history. A user message starts a run; an assistant message
 * carries approval decisions or, with `body.resume`, ask_user answers.
 * Reconnect uses the default `GET /agents/chat/:threadId/stream`.
 */
export class AgentsChatTransport extends DefaultChatTransport<AgentsUIMessage> {
  /** The reconnect route replays the run from its first chunk. */
  readonly resumeStreamIsReplay = true;

  constructor({
    getRequestSelection,
    getPageContext,
    getNavigation,
  }: IAgentsChatTransportOptions) {
    super({
      api: AGENTS_CHAT_URL,
      credentials: 'include',
      prepareSendMessagesRequest: ({ id, messages, body }) => {
        const message = messages.at(-1);
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
