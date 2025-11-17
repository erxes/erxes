import { MutationHookOptions, useMutation } from '@apollo/client';
import { WIDGETS_INSERT_MESSAGE_MUTATION } from '../graphql/mutations';
import { useAtom, useAtomValue } from 'jotai';
import {
  connectionAtom,
  conversationIdAtom,
  integrationIdAtom,
} from '../states';
import { getLocalStorageItem } from '@libs/utils';

export const useInsertMessage = () => {
  const integrationId = useAtomValue(integrationIdAtom);
  const [connection] = useAtom(connectionAtom);
  const conversationId = useAtomValue(conversationIdAtom);
  const { widgetsMessengerConnect } = connection;
  const { visitorId } = widgetsMessengerConnect;
  const [insertMessage, { loading }] = useMutation(
    WIDGETS_INSERT_MESSAGE_MUTATION,
  );
  const customerId =
    widgetsMessengerConnect?.customerId || getLocalStorageItem('customerId');
  const handleInsertMessage = (options?: MutationHookOptions) => {
    return insertMessage({
      ...options,
      variables: {
        integrationId,
        visitorId: visitorId || undefined,
        conversationId: conversationId || undefined,
        customerId: customerId || undefined,
        ...options?.variables,
      },
      refetchQueries: ['widgetsConversations', 'widgetsConversationDetail'],
    });
  };
  return {
    insertMessage: handleInsertMessage,
    loading,
  };
};
