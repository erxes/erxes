import { useMutation } from '@apollo/client';
import { toast } from 'erxes-ui';
import {
  MAIL_MESSAGE_RETRY_MUTATION,
  MAIL_SEND_MAIL_MUTATION,
} from '../graphql/mutations/mailMutations';
import { useTranslation } from 'react-i18next';

export type MailDeliveryStatus = 'pending' | 'sent' | 'bounced' | 'failed';

interface MailAttachmentInput {
  name?: string;
  url?: string;
  type?: string;
  size?: number;
  contentId?: string;
  disposition?: 'attachment' | 'inline';
}

interface MailSendMailVariables {
  integrationId?: string;
  conversationId?: string;
  subject: string;
  body?: string;
  to: string[];
  cc?: string[];
  bcc?: string[];
  shouldResolve?: boolean;
  shouldOpen?: boolean;
  replyToMessageId?: string;
  references?: string[];
  attachments?: MailAttachmentInput[];
  customerId?: string;
}

interface MailDeliveryOutcome {
  _id: string;
  deliveryStatus?: MailDeliveryStatus;
  deliveryError?: string;
  bouncedRecipients?: string[];
}

const useDeliveryToast = () => {
  const { t } = useTranslation('frontline');

  return (outcome?: MailDeliveryOutcome | null) => {
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
        onCompleted?.();
      },
      onError: (err) => {
        toast({
          title: t('failed-to-send-email', { message: err.message }),
          variant: 'destructive',
        });
      },
      refetchQueries: ['mailConversationDetail', 'Conversations'],
    });
  };

  return { mailSendMail, loading };
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
