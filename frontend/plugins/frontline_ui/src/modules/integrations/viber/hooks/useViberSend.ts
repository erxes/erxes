import { useApolloClient, useMutation } from '@apollo/client';
import { useCallback, useRef } from 'react';
import { toast } from 'erxes-ui';
import { VIBER_MESSAGE_REFETCH, VIBER_SEND } from '../graphql';
import type { ViberDelivery, ViberReply } from '../types';
import { viberDeliveryLabel } from '../validation';
import { useTranslation } from 'react-i18next';

export const useViberSend = (): {
  send: (input: ViberReply) => Promise<boolean>;
  loading: boolean;
} => {
  const client = useApolloClient();
  const { t } = useTranslation('frontline');
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
              'Delivery could not be confirmed. Try again to check this message before sending a new one.',
          );
        requests.current.delete(input.conversationId);
        const accepted = message.viberDelivery?.state === 'sent';
        toast({
          title: accepted
            ? t('message-sent')
            : viberDeliveryLabel(message.viberDelivery),
          description: accepted
            ? undefined
            : 'Message saved. Check its delivery status in the conversation.',
          variant: accepted ? 'default' : 'destructive',
        });
        return true;
      } catch (error) {
        toast({
          title: 'Unable to confirm delivery',
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
            title: 'Unable to refresh conversation',
            description: 'Check delivery before sending this message again.',
            variant: 'destructive',
          });
        }
        inFlight.current = false;
      }
    },
    [client, mutate, t],
  );
  return { send, loading };
};
