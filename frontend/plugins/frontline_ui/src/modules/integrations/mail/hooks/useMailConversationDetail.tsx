import { useMutation } from '@apollo/client';
import { toast } from 'erxes-ui';
import {
  MAIL_MESSAGE_RETRY_MUTATION,
  MAIL_SEND_MAIL_MUTATION,
  MAIL_SEND_REACTION_MUTATION,
} from '@/integrations/mail/graphql/mutations/mailMutations';
import { useTranslation } from 'react-i18next';
import type {
  MailDeliveryOutcome,
  MailSendMailVariables,
} from '@/integrations/mail/types/mailDelivery';

export const useDeliveryToast = () => {
  const { t } = useTranslation('frontline');

  return (outcome?: MailDeliveryOutcome | null) => {
    if (!outcome) {
      return toast({ title: t('error'), variant: 'destructive' });
    }
    if (outcome?.deliveryStatus === 'bounced') {
      return toast({
        title: t('email-bounced-for', {
          recipients: (outcome.bouncedRecipients ?? []).join(', '),
        }),
        variant: 'destructive',
      });
    }

    if (outcome?.deliveryStatus === 'failed') {
      return toast({
        title: t('email-not-delivered', {
          message: outcome.deliveryError ?? '',
        }),
        variant: 'destructive',
      });
    }

    return toast({ title: t('email-sent-successfully') });
  };
};

export const useMailSendMail = () => {
  const { t } = useTranslation('frontline');
  const showDeliveryOutcome = useDeliveryToast();
  const [sendMailMutation, { loading }] = useMutation<{
    mailSendMail: MailDeliveryOutcome | null;
  }>(MAIL_SEND_MAIL_MUTATION);

  const mailSendMail = (
    variables: MailSendMailVariables,
    onCompleted?: () => void,
  ) => {
    sendMailMutation({
      variables,
      onCompleted: (data) => {
        showDeliveryOutcome(data?.mailSendMail);
        if (
          data.mailSendMail?.deliveryStatus === 'sent' ||
          data.mailSendMail?.deliveryStatus === 'pending'
        ) {
          onCompleted?.();
        }
      },
      onError: (err) => {
        toast({
          title: t('failed-to-send-email', { message: err.message }),
          variant: 'destructive',
        });
      },
      refetchQueries: variables.conversationId
        ? ['mailConversationDetail', 'Conversations']
        : ['Conversations'],
    });
  };

  return { mailSendMail, loading };
};

export const useMailSendReaction = () => {
  const { t } = useTranslation('frontline');
  const showDeliveryOutcome = useDeliveryToast();
  const [sendReaction, { loading }] = useMutation<{
    mailSendReaction: MailDeliveryOutcome | null;
  }>(MAIL_SEND_REACTION_MUTATION);

  const react = (conversationId: string, messageId: string, emoji: string) => {
    sendReaction({
      variables: { conversationId, messageId, emoji },
      onCompleted: (data) => showDeliveryOutcome(data.mailSendReaction),
      onError: (error) =>
        toast({
          title: t('failed-to-send-email', { message: error.message }),
          variant: 'destructive',
        }),
      refetchQueries: ['mailConversationDetail', 'Conversations'],
    });
  };

  return { react, loading };
};

export const useMailMessageRetry = () => {
  const { t } = useTranslation('frontline');
  const showDeliveryOutcome = useDeliveryToast();
  const [retryMutation, { loading }] = useMutation<{
    mailMessageRetry: MailDeliveryOutcome | null;
  }>(MAIL_MESSAGE_RETRY_MUTATION);

  const mailMessageRetry = (_id: string) => {
    retryMutation({
      variables: { _id },
      onCompleted: (data) => {
        showDeliveryOutcome(data?.mailMessageRetry);
      },
      onError: (err) => {
        toast({
          title: t('failed-to-send-email', { message: err.message }),
          variant: 'destructive',
        });
      },
      refetchQueries: ['mailConversationDetail'],
    });
  };

  return { mailMessageRetry, loading };
};
