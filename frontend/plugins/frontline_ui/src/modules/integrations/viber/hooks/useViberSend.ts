import { useApolloClient, useMutation } from '@apollo/client';
import { useCallback, useRef, useState } from 'react';
import { toast } from 'erxes-ui';
import { VIBER_MESSAGE_REFETCH, VIBER_SEND } from '../graphql';
import type { ViberDelivery, ViberReply } from '../types';
import { viberDeliveryLabel } from '../validation';
import { useTranslation } from 'react-i18next';

type SendRequest = ViberReply & { requestId: string };

export const useViberSend = (): {
  send: (input: ViberReply) => Promise<boolean>;
  recover: () => Promise<boolean>;
  unconfirmed: boolean;
  loading: boolean;
} => {
  const client = useApolloClient();
  const { t } = useTranslation('frontline');
  const pending = useRef<SendRequest | null>(null);
  const inFlight = useRef(false);
  const [loading, setLoading] = useState(false);
  const [unconfirmed, setUnconfirmed] = useState(false);
  const [mutate] = useMutation<
    {
      viberSendMessage: {
        _id: string;
        viberDelivery?: ViberDelivery | null;
      } | null;
    },
    SendRequest
  >(VIBER_SEND, { errorPolicy: 'all' });

  const submit = useCallback(
    async (request: SendRequest, recovering: boolean): Promise<boolean> => {
      if (inFlight.current) return false;
      inFlight.current = true;
      setLoading(true);
      try {
        const result = await mutate({ variables: request });
        const message = result.data?.viberSendMessage;
        if (!message?._id) {
          // A failed recovery cannot prove the original request never saved.
          if (
            !recovering &&
            result.errors?.some(
              (error) => error.extensions?.code === 'VIBER_SEND_NOT_SAVED',
            )
          ) {
            pending.current = null;
          }
          throw new Error(
            result.errors?.[0]?.message ||
              t('viber-confirm-failed', {
                defaultValue:
                  'Delivery could not be confirmed. Check the original message before sending another.',
              }),
          );
        }
        pending.current = null;
        const accepted = message.viberDelivery?.state === 'sent';
        toast({
          title: accepted
            ? t('message-sent')
            : viberDeliveryLabel(message.viberDelivery, t),
          description: accepted
            ? undefined
            : t('viber-message-saved', {
                defaultValue:
                  'Message saved. Check its delivery status in the conversation.',
              }),
          variant: accepted ? 'default' : 'destructive',
        });
        return true;
      } catch (error) {
        toast({
          title: pending.current
            ? t('viber-confirm-title', {
                defaultValue: 'Unable to confirm delivery',
              })
            : t('viber-send-failed', {
                defaultValue: 'Unable to send message',
              }),
          description:
            error instanceof Error
              ? error.message
              : t('viber-check-conversation', {
                  defaultValue: 'Check the conversation before trying again.',
                }),
          variant: 'destructive',
        });
        return false;
      } finally {
        setUnconfirmed(Boolean(pending.current));
        try {
          await client.refetchQueries({ include: VIBER_MESSAGE_REFETCH });
        } catch {
          toast({
            title: t('viber-refresh-failed', {
              defaultValue: 'Unable to refresh conversation',
            }),
            description: t('viber-check-delivery', {
              defaultValue: 'Check delivery before sending this message again.',
            }),
            variant: 'destructive',
          });
        }
        inFlight.current = false;
        setLoading(false);
      }
    },
    [client, mutate, t],
  );

  const send = useCallback(
    async (input: ViberReply): Promise<boolean> => {
      if (inFlight.current || pending.current) return false;
      // Snapshot the whole request, not just its ID. Draft edits must never change
      // the payload used to recover an uncertain result.
      const request = {
        ...structuredClone(input),
        requestId: crypto.randomUUID(),
      };
      pending.current = request;
      return submit(request, false);
    },
    [submit],
  );

  const recover = useCallback(async (): Promise<boolean> => {
    if (!pending.current) return false;
    return submit(pending.current, true);
  }, [submit]);

  return { send, recover, unconfirmed, loading };
};
