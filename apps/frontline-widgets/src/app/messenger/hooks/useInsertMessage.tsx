import { MutationHookOptions, useMutation } from '@apollo/client';
import { WIDGETS_INSERT_MESSAGE_MUTATION } from '../graphql/mutations';
import { useAtom, useAtomValue } from 'jotai';
import {
  connectionAtom,
  conversationIdAtom,
  integrationIdAtom,
  operatorStatusAtom,
} from '../states';
import { getLocalStorageItem } from '@libs/utils';
import { useBotTyping } from './useBotTyping';

export const useInsertMessage = () => {
  const integrationId = useAtomValue(integrationIdAtom);
  const [connection] = useAtom(connectionAtom);
  const conversationId = useAtomValue(conversationIdAtom);
  const operatorStatus = useAtomValue(operatorStatusAtom);
  const { startBotTyping, stopBotTyping } = useBotTyping();
  const { widgetsMessengerConnect } = connection;
  const { visitorId, messengerData } = widgetsMessengerConnect;
  const [insertMessage, { loading }] = useMutation(
    WIDGETS_INSERT_MESSAGE_MUTATION,
  );
  const customerId =
    widgetsMessengerConnect?.customerId || getLocalStorageItem('customerId');

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
        visitorId: visitorId || undefined,
        conversationId: conversationId || undefined,
        customerId: customerId || undefined,
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
