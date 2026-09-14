import { useApolloClient, useMutation } from '@apollo/client';
import { useCallback, useRef } from 'react';
import { toast } from 'erxes-ui';
import { VIBER_MESSAGE_REFETCH, VIBER_SEND } from '../graphql';
import type { ViberDelivery, ViberReply } from '../types';
import { viberDeliveryLabel } from '../validation';

export const useViberSend = (): {
  send: (input: ViberReply) => Promise<boolean>;
  loading: boolean;
} => {
  const client = useApolloClient();
  const requests = useRef(new Map<string, string>());
  const inFlight = useRef(false);
  const [mutate, { loading }] = useMutation<
    {
      viberSendMessage: {
        _id: string;
        viberDelivery?: ViberDelivery | null;
      } | null;
    },
    ViberReply & { requestId: string }
  >(VIBER_SEND, { errorPolicy: 'all' });

  const send = useCallback(
    async (input: ViberReply): Promise<boolean> => {
      if (inFlight.current) return false;
      inFlight.current = true;
      const requestId =
        requests.current.get(input.conversationId) || crypto.randomUUID();
      requests.current.set(input.conversationId, requestId);
      try {
        const result = await mutate({ variables: { ...input, requestId } });
        const message = result.data?.viberSendMessage;
        if (!message?._id)
          throw new Error(
            result.errors?.[0]?.message ||
              'The send result could not be confirmed. Retry this draft to check the same request; do not create a second copy.',
          );
        requests.current.delete(input.conversationId);
        const accepted = message.viberDelivery?.state === 'sent';
        toast({
          title: viberDeliveryLabel(message.viberDelivery),
          description: accepted
            ? undefined
            : 'The reply is saved in the conversation. Check its delivery status there.',
          variant: accepted ? 'default' : 'destructive',
        });
        return true;
      } catch (error) {
        toast({
          title: 'Viber reply not confirmed',
          description:
            error instanceof Error
              ? error.message
              : 'Check the conversation before trying again.',
          variant: 'destructive',
        });
        return false;
      } finally {
        try {
          await client.refetchQueries({ include: VIBER_MESSAGE_REFETCH });
        } catch {
          toast({
            title: 'Could not refresh conversation',
            description:
              'The reply may already be saved. Check its delivery status before sending another copy.',
            variant: 'destructive',
          });
        }
        inFlight.current = false;
      }
    },
    [client, mutate],
  );
  return { send, loading };
};
