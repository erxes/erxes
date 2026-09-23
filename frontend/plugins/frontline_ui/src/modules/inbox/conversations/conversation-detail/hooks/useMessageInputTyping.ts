import type { MessageInputTypingResult } from '@/inbox/conversations/conversation-detail/types/messageInput';
import { useCallback } from 'react';
import { useThrottledCallback } from 'use-debounce';
import { useMutation } from '@apollo/client';
import { CONVERSATION_AGENT_TYPING } from '@/inbox/conversations/conversation-detail/graphql/mutations/conversationAgentTyping';

export const useMessageInputTyping = (
  conversationId: string,
  isDiscord: boolean,
  isInternalNote: boolean,
): MessageInputTypingResult => {
  const [notifyAgentTyping] = useMutation(CONVERSATION_AGENT_TYPING);
  const pingAgentTyping = useThrottledCallback(
    () => {
      if (isDiscord && !isInternalNote && conversationId) {
        notifyAgentTyping({
          variables: { conversationId, typing: true },
        }).catch(() => undefined);
      }
    },
    10000,
    { leading: true, trailing: false },
  );
  const stopAgentTyping = useCallback(() => {
    pingAgentTyping.cancel();
    if (isDiscord && conversationId) {
      notifyAgentTyping({
        variables: { conversationId, typing: false },
      }).catch(() => undefined);
    }
  }, [isDiscord, conversationId, notifyAgentTyping, pingAgentTyping]);

  return { pingAgentTyping, stopAgentTyping };
};
