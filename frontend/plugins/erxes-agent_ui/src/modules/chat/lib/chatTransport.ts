import { DefaultChatTransport } from 'ai';
import { REACT_APP_API_URL } from 'erxes-ui';
import { AgentUIMessage } from '~/modules/chat/types';
import { messageText } from '~/modules/chat/lib/uiParts';

// The chat stream endpoint, proxied through the gateway. The backend builds the
// turn from Mongo history + the new user message, so the transport sends erxes's
// own body fields (agentId / threadId / message / per-send options) rather than
// the default UIMessage array.
const STREAM_URL = `${REACT_APP_API_URL}/pl:erxes-agent/chat/stream`;

const lastUserText = (messages: AgentUIMessage[]): string => {
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].role === 'user') return messageText(messages[i]);
  }
  return '';
};

// One transport per (agent, thread): `agentId`/`threadId` are baked in; the
// per-send `body` (reasoningEffort / attachments / approvedOperations) is merged
// on top by `chat.sendMessage(_, { body })`.
export const createChatTransport = (
  mastraAgentId: string,
  threadId: string,
): DefaultChatTransport<AgentUIMessage> =>
  new DefaultChatTransport<AgentUIMessage>({
    api: STREAM_URL,
    credentials: 'include',
    prepareSendMessagesRequest: ({ messages, body }) => ({
      body: {
        agentId: mastraAgentId,
        threadId,
        message: lastUserText(messages),
        ...(body ?? {}),
      },
    }),
  });
