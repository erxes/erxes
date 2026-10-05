import { useMutation } from '@apollo/client';
import { toast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { RETRY_TICKET_NOTE_MAIL } from '@/activity/graphql/mutations/retryTicketNoteMail';
import { INote } from '@/activity/types';

interface IRetryTicketNoteMailResponse {
  mailTicketNoteRetry: Pick<INote, '_id' | 'mailMessageId' | 'mailDelivery'>;
}

export const useRetryTicketNoteMail = () => {
  const { t } = useTranslation('frontline');
  const [retry, { loading }] = useMutation<IRetryTicketNoteMailResponse>(
    RETRY_TICKET_NOTE_MAIL,
  );

  const retryTicketNoteMail = (noteId: string) =>
    retry({
      variables: { noteId },
      onCompleted: ({ mailTicketNoteRetry }) => {
        const delivery = mailTicketNoteRetry?.mailDelivery;

        if (delivery?.status === 'sent') {
          toast({ title: t('email-delivery-resent', 'Email sent') });
          return;
        }

        if (delivery?.status === 'failed' || delivery?.status === 'bounced') {
          toast({
            title: t('email-delivery-failed', 'Not delivered'),
            description: delivery.error ?? undefined,
            variant: 'destructive',
          });
        }
      },
      onError: (error) =>
        toast({ title: error.message, variant: 'destructive' }),
    });

  return { retryTicketNoteMail, loading };
};
