import { MutationHookOptions, useMutation } from '@apollo/client';
import { WIDGETS_INSERT_MESSAGE_MUTATION } from '../graphql/mutations';
import { useAtom, useAtomValue } from 'jotai';
import {
  connectionAtom,
  conversationIdAtom,
  integrationIdAtom,
  operatorStatusAtom,
} from '../states';
import { useBotTyping } from './useBotTyping';

export const useInsertMessage = () => {
  const integrationId = useAtomValue(integrationIdAtom);
  const [connection] = useAtom(connectionAtom);
  const conversationId = useAtomValue(conversationIdAtom);
  const operatorStatus = useAtomValue(operatorStatusAtom);
  const { startBotTyping, stopBotTyping } = useBotTyping();
  const { widgetsMessengerConnect } = connection;
  const { messengerData } = widgetsMessengerConnect;
  const [insertMessage, { loading }] = useMutation(
    WIDGETS_INSERT_MESSAGE_MUTATION,
  );

  /**
   * Mirrors the bot gate in `widgetsInsertMessage`. The server publishes
   * `typing: true` before the mutation returns, so a conversation that is being
   * created by this very message has no subscription to receive it — the
   * indicator has to be started locally instead of waiting for the event.
   */
  const expectsBotReply =
    !!messengerData?.botCheck && operatorStatus !== 'operator';

  const handleInsertMessage = (
    options?: MutationHookOptions & { variables?: { payload?: string } },
  ) => {
    if (expectsBotReply) {
      startBotTyping();
    }

    return insertMessage({
      ...options,
      variables: {
        integrationId,
        conversationId: conversationId || undefined,
        ...options?.variables,
      },
      onError: (error) => {
        stopBotTyping();
        options?.onError?.(error);
      },
      refetchQueries: ['widgetsConversations', 'widgetsConversationDetail'],
    });
  };
  return {
    insertMessage: handleInsertMessage,
    loading,
  };
};
