import { useMutation } from '@apollo/client';
import { toast } from 'erxes-ui';
import { IMAP_SEND_MAIL_MUTATION } from '../graphql/mutations/imapMutations';
import { useTranslation } from 'react-i18next';

export interface ImapSendMailVariables {
  integrationId?: string;
  conversationId?: string;
  subject: string;
  body?: string;
  to: string[];
  cc?: string[];
  bcc?: string[];
  from: string;
  shouldResolve?: boolean;
  shouldOpen?: boolean;
  replyToMessageId?: string;
  references?: string[];
  attachments?: any[];
  customerId?: string;
}

export const useImapSendMail = () => {
  const { t } = useTranslation('frontline');
  const [sendMailMutation, { loading }] = useMutation(IMAP_SEND_MAIL_MUTATION);

  const imapSendMail = (
    variables: ImapSendMailVariables,
    onCompleted?: () => void,
  ) => {
    sendMailMutation({
      variables,
      onCompleted: () => {
        toast({ title: t('email-sent-successfully') });
        onCompleted?.();
      },
      onError: (err) => {
        toast({
          title: t('failed-to-send-email', { message: err.message }),
          variant: 'destructive',
        });
      },
      refetchQueries: ['imapConversationDetail', 'Conversations'],
    });
  };

  return { imapSendMail, loading };
};
